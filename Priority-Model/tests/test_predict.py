"""
tests/test_predict.py
=====================
Tests for the runtime entry point.

Why these tests matter
----------------------
Three things get pinned here. First, the **response contract** — exact keys and
exact Python types — because a frontend will be written against it and an
``int64`` where an ``int`` was promised breaks JSON serialisation at the worst
possible moment. Second, the **integration seam**: the severity model is
stubbed rather than called, so these tests pass whether or not stage 1 is
installed, and a stage-1 outage cannot make stage 2 look broken. Third, the
**ML-vs-rules agreement**, which is the check that decides whether the ML
scoring mode is safe to switch on.
"""

from __future__ import annotations

from datetime import date, timedelta

from src import config, severity_client
from src.predict import predict_priority, predict_priority_batch
from src.utils import ModelNotTrainedError, SeverityModelUnavailableError, ValidationError

BASE = date(2026, 1, 1)
REQUIRED_KEYS = {
    "predicted_severity",
    "severity_score",
    "asset_impact_score",
    "traffic_score",
    "due_date_score",
    "priority_score",
    "priority_class",
}


def _expect_raises(exc_type, fn, *args, **kwargs):
    try:
        fn(*args, **kwargs)
    except exc_type:
        return
    raise AssertionError(f"Expected {exc_type.__name__}")


class _StubSeverityModel:
    """Stand-in for stage 1, so these tests never depend on it being installed."""

    def __init__(self, severity: str = "Critical", confidence: float = 0.91):
        self.severity = severity
        self.confidence = confidence
        self.calls: list[str] = []

    def __call__(self, text: str) -> dict:
        self.calls.append(text)
        return {"severity": self.severity, "score": config.SEVERITY_SCORES[self.severity],
                "confidence": self.confidence}


def _with_stub(stub: _StubSeverityModel):
    """Install the stub as the severity function, returning a restore callable."""
    original = severity_client._SEVERITY_FN
    severity_client._SEVERITY_FN = stub
    return lambda: setattr(severity_client, "_SEVERITY_FN", original)


# --------------------------------------------------------------------------- #
# Response contract
# --------------------------------------------------------------------------- #
def test_response_has_exactly_the_documented_keys():
    result = predict_priority("High", "High", BASE + timedelta(days=1),
                              severity="Critical", request_date=BASE)
    assert set(result) == REQUIRED_KEYS


def test_response_values_are_plain_json_serialisable_types():
    import json

    result = predict_priority("Medium", "Low", BASE + timedelta(days=10),
                              severity="Moderate", request_date=BASE)
    assert type(result["predicted_severity"]) is str
    assert type(result["priority_class"]) is str
    for field in ("severity_score", "asset_impact_score", "traffic_score",
                  "due_date_score", "priority_score"):
        assert type(result[field]) is int, field
    json.dumps(result)  # must not raise


def test_component_scores_sum_to_the_priority_score():
    result = predict_priority("Medium", "High", BASE + timedelta(days=9),
                              severity="Major", request_date=BASE)
    assert result["priority_score"] == (
        result["asset_impact_score"] + result["severity_score"]
        + result["traffic_score"] + result["due_date_score"]
    )


def test_worked_example_end_to_end():
    """High / Major / High / 3-7 days = 86 -> Critical, as in the specification."""
    result = predict_priority("High", "High", BASE + timedelta(days=5),
                              severity="Major", request_date=BASE)
    assert result["priority_score"] == 86
    assert result["priority_class"] == "Critical"


def test_details_mode_adds_diagnostics_without_dropping_required_keys():
    result = predict_priority("Low", "Low", BASE + timedelta(days=30),
                              severity="Minor", request_date=BASE, return_details=True)
    assert REQUIRED_KEYS.issubset(result)
    assert result["due_date_bucket"] == "More than 14 days"
    assert result["days_until_due"] == 30
    assert result["agrees_with_rules"] is True


# --------------------------------------------------------------------------- #
# Severity integration seam
# --------------------------------------------------------------------------- #
def test_reason_description_is_sent_to_the_severity_model():
    stub = _StubSeverityModel("Major")
    restore = _with_stub(stub)
    try:
        result = predict_priority("High", "Medium", BASE, request_date=BASE,
                                  reason_description="Signal failure causing delays")
        assert stub.calls == ["Signal failure causing delays"]
        assert result["predicted_severity"] == "Major"
        assert result["severity_score"] == 18
    finally:
        restore()


def test_supplied_severity_bypasses_the_severity_model():
    stub = _StubSeverityModel("Critical")
    restore = _with_stub(stub)
    try:
        result = predict_priority("Low", "Low", BASE, severity="Minor", request_date=BASE)
        assert stub.calls == []  # the NLP model must not be called
        assert result["predicted_severity"] == "Minor"
    finally:
        restore()


def test_severity_confidence_is_passed_through():
    restore = _with_stub(_StubSeverityModel("Moderate", confidence=0.77))
    try:
        result = predict_priority("High", "High", BASE, request_date=BASE,
                                  reason_description="Loose fittings found",
                                  return_details=True)
        assert result["severity_confidence"] == 0.77
        assert result["severity_source"] == "nlp_model"
    finally:
        restore()


def test_a_severity_label_the_priority_model_does_not_know_is_rejected():
    """A stage-1 change that adds a new label must fail loudly here."""
    restore = _with_stub(_StubSeverityModel.__new__(_StubSeverityModel))
    try:
        severity_client._SEVERITY_FN = lambda text: {"severity": "Catastrophic"}
        _expect_raises(ValidationError, predict_priority, "High", "High", BASE,
                       reason_description="anything", request_date=BASE)
    finally:
        restore()


def test_a_broken_severity_model_surfaces_as_a_service_error():
    restore = _with_stub(_StubSeverityModel.__new__(_StubSeverityModel))
    try:
        def boom(text):
            raise RuntimeError("model file corrupt")

        severity_client._SEVERITY_FN = boom
        _expect_raises(SeverityModelUnavailableError, predict_priority, "High", "High",
                       BASE, reason_description="anything", request_date=BASE)
    finally:
        restore()


# --------------------------------------------------------------------------- #
# Input validation at the entry point
# --------------------------------------------------------------------------- #
def test_invalid_factor_levels_are_rejected():
    _expect_raises(ValidationError, predict_priority, "Extreme", "High", BASE,
                   severity="Major", request_date=BASE)
    _expect_raises(ValidationError, predict_priority, "High", "Nonexistent", BASE,
                   severity="Major", request_date=BASE)


def test_invalid_dates_are_rejected():
    _expect_raises(ValidationError, predict_priority, "High", "High", "not-a-date",
                   severity="Major", request_date=BASE)


def test_missing_both_reason_and_severity_is_rejected():
    _expect_raises(ValidationError, predict_priority, "High", "High", BASE,
                   request_date=BASE)


def test_an_invalid_scoring_mode_is_rejected():
    _expect_raises(ValidationError, predict_priority, "High", "High", BASE,
                   severity="Major", request_date=BASE, scoring_mode="magic")


# --------------------------------------------------------------------------- #
# Batch scoring
# --------------------------------------------------------------------------- #
def test_batch_scoring_returns_one_result_per_request():
    requests = [
        {"asset_impact": "High", "traffic": "High",
         "due_date": BASE, "severity": "Critical", "request_date": BASE},
        {"asset_impact": "Low", "traffic": "Low",
         "due_date": BASE + timedelta(days=30), "severity": "Minor", "request_date": BASE},
    ]
    results = predict_priority_batch(requests)
    assert len(results) == 2
    assert results[0]["priority_class"] == "Critical"
    assert results[1]["priority_class"] == "Normal"


def test_one_bad_row_does_not_sink_the_whole_batch():
    requests = [
        {"asset_impact": "High", "traffic": "High",
         "due_date": BASE, "severity": "Critical", "request_date": BASE},
        {"asset_impact": "Invalid", "traffic": "High",
         "due_date": BASE, "severity": "Major", "request_date": BASE},
    ]
    results = predict_priority_batch(requests)
    assert results[0]["priority_class"] == "Critical"
    assert results[1]["error_type"] == "ValidationError"
    assert results[1]["index"] == 1


# --------------------------------------------------------------------------- #
# ML scoring mode
# --------------------------------------------------------------------------- #
def test_ml_mode_reproduces_the_rules_on_every_possible_input():
    """
    The decisive test for whether ML mode is safe to enable.

    There are only 180 possible inputs, so correctness is checked by exhaustion
    rather than inferred from a sample. Skips cleanly if no model is trained
    yet, since ML mode is not the default.
    """
    from src import rules

    try:
        disagreements = []
        for combo in rules.enumerate_all_combinations():
            days = {"Overdue or Today": 0, "1-2 days": 2, "3-7 days": 5,
                    "8-14 days": 10, "More than 14 days": 30}[combo["due_date_bucket"]]
            result = predict_priority(
                combo["asset_impact"], combo["traffic"],
                BASE + timedelta(days=days), severity=combo["reason_severity"],
                request_date=BASE, scoring_mode="ml", return_details=True,
            )
            if not result["agrees_with_rules"]:
                disagreements.append((combo, result["priority_class"]))
        assert not disagreements, (
            f"{len(disagreements)} of 180 inputs disagree with the rules; "
            f"leave SCORING_MODE on 'rules'. First: {disagreements[0]}"
        )
    except ModelNotTrainedError:
        print("      (skipped: no trained model — run `python -m src.train`)")


if __name__ == "__main__":
    import sys

    sys.path.insert(0, str(__import__("pathlib").Path(__file__).resolve().parent))
    from _runner import run_module

    raise SystemExit(run_module(sys.modules[__name__]))
