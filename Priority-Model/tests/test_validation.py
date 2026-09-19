"""
tests/test_validation.py
========================
Tests for the validation layer in ``utils.py``.

Why these tests matter
----------------------
This code sits at the API boundary, so it is the first thing a malformed
request meets. Two behaviours are pinned here that are easy to regress:
canonical casing on the way out (so nothing downstream has to lower-case
anything), and the refusal to guess at ambiguous dates. A date parser that
silently reads "03-04-2026" as either 3 April or 4 March produces a wrong
urgency score with no error anywhere.
"""

from __future__ import annotations

from datetime import date, datetime

from src import config
from src.utils import ValidationError, parse_date, validate_choice, validate_text


def _expect_raises(exc_type, fn, *args, **kwargs):
    try:
        fn(*args, **kwargs)
    except exc_type:
        return
    raise AssertionError(f"Expected {exc_type.__name__}")


# --------------------------------------------------------------------------- #
# validate_choice
# --------------------------------------------------------------------------- #
def test_validate_choice_returns_canonical_casing():
    for supplied in ("High", "high", "HIGH", "  HiGh  "):
        assert validate_choice(supplied, config.ASSET_IMPACT_SCORES, "asset_impact") == "High"


def test_validate_choice_rejects_unknown_values():
    _expect_raises(ValidationError, validate_choice, "Severe",
                   config.ASSET_IMPACT_SCORES, "asset_impact")


def test_validate_choice_rejects_non_strings_and_blanks():
    for bad in (None, 42, [], "", "   "):
        _expect_raises(ValidationError, validate_choice, bad,
                       config.TRAFFIC_SCORES, "traffic")


def test_validation_error_names_the_accepted_values():
    """An API returning 400 should tell the caller what would have worked."""
    try:
        validate_choice("Severe", config.ASSET_IMPACT_SCORES, "asset_impact")
    except ValidationError as exc:
        message = str(exc)
        assert "asset_impact" in message
        assert all(level in message for level in config.ASSET_IMPACT_SCORES)
        return
    raise AssertionError("Expected ValidationError")


def test_validation_errors_carry_an_http_status():
    """The web layer maps exception types to status codes without guessing."""
    try:
        validate_choice("nope", config.TRAFFIC_SCORES, "traffic")
    except ValidationError as exc:
        assert exc.http_status == 400
        return
    raise AssertionError("Expected ValidationError")


# --------------------------------------------------------------------------- #
# validate_text
# --------------------------------------------------------------------------- #
def test_validate_text_strips_and_accepts_normal_input():
    assert validate_text("  Track fracture detected  ", "reason_description") == \
        "Track fracture detected"


def test_validate_text_rejects_empty_and_non_strings():
    for bad in ("", "    ", None, 3.14):
        _expect_raises(ValidationError, validate_text, bad, "reason_description")


def test_validate_text_enforces_a_length_limit():
    _expect_raises(ValidationError, validate_text,
                   "x" * (config.MAX_REASON_DESCRIPTION_CHARS + 1), "reason_description")


# --------------------------------------------------------------------------- #
# parse_date
# --------------------------------------------------------------------------- #
def test_parse_date_accepts_iso_strings():
    assert parse_date("2026-03-04") == date(2026, 3, 4)


def test_parse_date_accepts_iso_datetimes():
    assert parse_date("2026-03-04T14:30:00") == date(2026, 3, 4)


def test_parse_date_accepts_date_and_datetime_objects():
    assert parse_date(date(2026, 3, 4)) == date(2026, 3, 4)
    assert parse_date(datetime(2026, 3, 4, 9, 0)) == date(2026, 3, 4)


def test_parse_date_reads_day_first_for_dashed_and_slashed_formats():
    """The configured formats are day-first; US month-first is not accepted."""
    assert parse_date("04-03-2026") == date(2026, 3, 4)
    assert parse_date("04/03/2026") == date(2026, 3, 4)


def test_parse_date_rejects_unparseable_values():
    for bad in ("not a date", "2026-13-45", "", None, 20260304):
        _expect_raises(ValidationError, parse_date, bad)


def test_parse_date_error_lists_the_accepted_formats():
    try:
        parse_date("March 4th 2026")
    except ValidationError as exc:
        assert "%Y-%m-%d" in str(exc)
        return
    raise AssertionError("Expected ValidationError")


if __name__ == "__main__":
    import sys

    sys.path.insert(0, str(__import__("pathlib").Path(__file__).resolve().parent))
    from _runner import run_module

    raise SystemExit(run_module(sys.modules[__name__]))
