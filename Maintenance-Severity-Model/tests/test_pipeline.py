from __future__ import annotations

import sys
from typing import Any, cast
from pathlib import Path

# Allow `python tests/test_pipeline.py` from the project root.
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import src.config as config  # noqa: E402
from src.preprocess import DEFAULT_CLEANER, clean_text  # noqa: E402
from src.utils import InvalidInputError, load_dataset  # noqa: E402


# --------------------------------------------------------------------------- #
# Preprocessing
# --------------------------------------------------------------------------- #
def test_cleaning_lowercases_and_strips_punctuation():
    out = clean_text("Track FRACTURE detected at KM 42/3!!")
    assert out == out.lower()
    assert not any(ch in out for ch in "!/0123456789")


def test_negations_survive_stopword_removal():
    """'not locking' and 'locking' must not collapse to the same features."""
    assert "not" in clean_text("Points not locking at the station").split()


def test_cleaning_is_deterministic():
    text = "Repeated point machine failure causing delays"
    assert clean_text(text) == clean_text(text)


def test_cleaner_rejects_non_strings():
    for bad in (None, 42, ["a"]):
        try:
            # These invalid values are intentional: the test verifies runtime validation.
            cast(Any, DEFAULT_CLEANER).clean(bad)
        except InvalidInputError:
            continue
        raise AssertionError(f"Expected InvalidInputError for {bad!r}")


def test_junk_input_cleans_to_empty_string_not_a_crash():
    assert clean_text("!!! ### 123") == ""


# --------------------------------------------------------------------------- #
# Dataset contract
# --------------------------------------------------------------------------- #
def test_sample_dataset_loads_with_expected_schema():
    df = load_dataset()
    assert list(df.columns) == [config.TEXT_COLUMN, config.LABEL_COLUMN]
    assert len(df) > 0
    assert set(df[config.LABEL_COLUMN]).issubset(set(config.SEVERITY_LEVELS))


# --------------------------------------------------------------------------- #
# Inference contract (requires a trained model — run src.train first)
# --------------------------------------------------------------------------- #
def test_predict_returns_the_documented_shape():
    from src.predict import predict_severity

    result = predict_severity("Track fracture detected causing immediate safety risk")

    assert set(result) == {"severity", "score", "confidence"}
    # Plain Python types, not numpy scalars — downstream JSON must not break.
    assert type(result["severity"]) is str
    assert type(result["score"]) is int
    assert type(result["confidence"]) is float
    assert result["severity"] in config.SEVERITY_LEVELS
    assert 0.0 <= result["confidence"] <= 1.0


def test_score_always_matches_the_severity_mapping():
    from src.predict import predict_batch

    samples = [
        "Rail fracture with traffic suspended immediately",
        "Signal failure causing repeated delays to trains",
        "Loose fittings noticed during routine inspection",
        "Scheduled preventive lubrication of points",
    ]
    for result in predict_batch(samples):
        assert result["score"] == config.SEVERITY_SCORES[result["severity"]]


def test_batch_and_single_prediction_agree():
    """Guards against a vectoriser or cleaning mismatch between the two paths."""
    from src.predict import predict_batch, predict_severity

    text = "Point machine not locking trains held at home signal"
    assert predict_severity(text) == predict_batch([text])[0]


def test_predict_rejects_empty_input():
    from src.predict import predict_severity

    for bad in ("", "   ", None, 7):
        try:
            predict_severity(cast(Any, bad))
        except InvalidInputError:
            continue
        raise AssertionError(f"Expected InvalidInputError for {bad!r}")


def test_empty_batch_returns_empty_list():
    from src.predict import predict_batch

    assert predict_batch([]) == []


# --------------------------------------------------------------------------- #
# Plain-stdlib runner so the suite works without pytest installed
# --------------------------------------------------------------------------- #
def _run_all() -> int:
    tests = [
        (name, fn)
        for name, fn in sorted(globals().items())
        if name.startswith("test_") and callable(fn)
    ]
    failures = 0
    for name, fn in tests:
        try:
            fn()
            print(f"PASS  {name}")
        except Exception as exc:
            failures += 1
            print(f"FAIL  {name}: {type(exc).__name__}: {exc}")

    print(f"\n{len(tests) - failures}/{len(tests)} passed")
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(_run_all())
