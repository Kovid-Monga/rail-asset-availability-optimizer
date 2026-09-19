"""
tests/test_rules.py
===================
Tests for the deterministic rule engine.

Why these tests matter most
---------------------------
``rules.py`` is what actually decides maintenance priorities in the default
configuration. Every boundary in the specification is pinned here, because
off-by-one errors at band edges are both the easiest mistake to make and the
hardest to notice: a request scoring exactly 80 must be Critical, not Urgent,
and nothing but a test will tell you when someone changes ``>=`` to ``>``.
"""

from __future__ import annotations

from datetime import date, timedelta

from src import config, rules
from src.utils import ConfigurationError, ValidationError

BASE = date(2026, 1, 1)


def _expect_raises(exc_type, fn, *args, **kwargs):
    try:
        fn(*args, **kwargs)
    except exc_type:
        return
    raise AssertionError(f"Expected {exc_type.__name__} from {fn.__name__}")


# --------------------------------------------------------------------------- #
# Factor lookups
# --------------------------------------------------------------------------- #
def test_asset_impact_scores_match_the_specification():
    assert rules.asset_impact_score("High") == 30
    assert rules.asset_impact_score("Medium") == 20
    assert rules.asset_impact_score("Low") == 10


def test_severity_scores_match_the_specification():
    assert rules.severity_score("Critical") == 25
    assert rules.severity_score("Major") == 18
    assert rules.severity_score("Moderate") == 12
    assert rules.severity_score("Minor") == 5


def test_traffic_scores_match_the_specification():
    assert rules.traffic_score("High") == 25
    assert rules.traffic_score("Medium") == 15
    assert rules.traffic_score("Low") == 5


def test_factor_lookups_are_case_insensitive():
    assert rules.asset_impact_score("high") == rules.asset_impact_score("  HIGH ")


def test_unknown_factor_levels_are_rejected():
    _expect_raises(ValidationError, rules.asset_impact_score, "Extreme")
    _expect_raises(ValidationError, rules.severity_score, "Catastrophic")
    _expect_raises(ValidationError, rules.traffic_score, "")


# --------------------------------------------------------------------------- #
# Due-date bucketing — every boundary in the spec
# --------------------------------------------------------------------------- #
def test_due_date_buckets_at_every_boundary():
    cases = {
        -30: "Overdue or Today",
        -1: "Overdue or Today",
        0: "Overdue or Today",
        1: "1-2 days",
        2: "1-2 days",
        3: "3-7 days",
        7: "3-7 days",
        8: "8-14 days",
        14: "8-14 days",
        15: "More than 14 days",
        400: "More than 14 days",
    }
    for days, expected in cases.items():
        assert rules.due_date_bucket(days) == expected, f"{days} days"


def test_due_date_scores_at_every_boundary():
    expected = {0: 20, 2: 17, 7: 13, 14: 9, 15: 5}
    for days, score in expected.items():
        assert config.DUE_DATE_SCORES[rules.due_date_bucket(days)] == score


def test_days_until_due_is_measured_from_the_request_date():
    assert rules.days_until_due(BASE + timedelta(days=5), BASE) == 5
    assert rules.days_until_due(BASE - timedelta(days=3), BASE) == -3


def test_overdue_requests_score_maximum_urgency():
    score, bucket, days = rules.due_date_score(BASE - timedelta(days=10), BASE)
    assert (score, bucket, days) == (20, "Overdue or Today", -10)


def test_due_date_accepts_strings_and_date_objects_alike():
    from_string = rules.due_date_score("2026-01-06", "2026-01-01")
    from_object = rules.due_date_score(date(2026, 1, 6), date(2026, 1, 1))
    assert from_string == from_object


# --------------------------------------------------------------------------- #
# Classification — every band edge
# --------------------------------------------------------------------------- #
def test_classification_at_every_band_edge():
    cases = {
        0: "Normal", 34: "Normal",
        35: "Moderate", 59: "Moderate",
        60: "Urgent", 79: "Urgent",
        80: "Critical", 100: "Critical",
    }
    for score, expected in cases.items():
        assert rules.classify_score(score) == expected, f"score {score}"


def test_scores_outside_zero_to_hundred_are_rejected():
    _expect_raises(ValidationError, rules.classify_score, -1)
    _expect_raises(ValidationError, rules.classify_score, 101)
    _expect_raises(ValidationError, rules.classify_score, "80")


# --------------------------------------------------------------------------- #
# Full computation
# --------------------------------------------------------------------------- #
def test_worked_example_from_the_specification():
    """High asset + Major severity + High traffic + 3-7 days = 86 -> Critical."""
    result = rules.compute_priority(
        asset_impact="High", reason_severity="Major", traffic="High",
        due_date=BASE + timedelta(days=5), request_date=BASE,
    )
    assert result["asset_impact_score"] == 30
    assert result["severity_score"] == 18
    assert result["traffic_score"] == 25
    assert result["due_date_score"] == 13
    assert result["priority_score"] == 86
    assert result["priority_class"] == "Critical"


def test_priority_score_is_always_the_sum_of_its_components():
    for combo in rules.enumerate_all_combinations():
        assert combo["priority_score"] == (
            combo["asset_impact_score"] + combo["severity_score"]
            + combo["traffic_score"] + combo["due_date_score"]
        )


def test_maximum_and_minimum_achievable_scores():
    worst = rules.compute_priority("High", "Critical", "High", BASE, BASE)
    assert worst["priority_score"] == 100 and worst["priority_class"] == "Critical"

    least = rules.compute_priority(
        "Low", "Minor", "Low", BASE + timedelta(days=60), BASE
    )
    assert least["priority_score"] == 25 and least["priority_class"] == "Normal"


# --------------------------------------------------------------------------- #
# Configuration integrity
# --------------------------------------------------------------------------- #
def test_rule_self_check_passes_on_the_shipped_configuration():
    health = rules.self_check()
    assert health["n_combinations"] == 180
    assert health["max_achievable_score"] == 100
    assert health["unreachable_classes"] == []


def test_self_check_catches_weights_that_do_not_sum_to_one_hundred():
    """A typo in a factor weight must fail loudly, not produce quiet nonsense."""
    original = dict(config.TRAFFIC_SCORES)
    try:
        config.TRAFFIC_SCORES["High"] = 40
        _expect_raises(ConfigurationError, rules.self_check)
    finally:
        config.TRAFFIC_SCORES.clear()
        config.TRAFFIC_SCORES.update(original)


def test_enumeration_covers_the_entire_input_space():
    combos = rules.enumerate_all_combinations()
    assert len(combos) == 180
    assert len({tuple(c[f] for f in config.CATEGORICAL_FEATURES) for c in combos}) == 180


if __name__ == "__main__":
    import sys

    sys.path.insert(0, str(__import__("pathlib").Path(__file__).resolve().parent))
    from _runner import run_module

    raise SystemExit(run_module(sys.modules[__name__]))
