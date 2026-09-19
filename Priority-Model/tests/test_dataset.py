"""
tests/test_dataset.py
=====================
Tests for dataset generation and the loader's schema handling.

Why these tests matter
----------------------
The loader is what your real dataset will hit first. These tests pin the
flexibility it is supposed to have — deriving ``due_date_bucket`` from raw day
counts, deriving ``priority_class`` from a score, tolerating mixed casing — and
the strictness it is supposed to keep: a missing required column is an error
with a useful message, not a ``KeyError`` three functions later.
"""

from __future__ import annotations

import tempfile
from pathlib import Path

import pandas as pd

from src import config, rules
from src.dataset import generate_dataset, load_dataset
from src.utils import DatasetError


def _expect_raises(exc_type, fn, *args, **kwargs):
    try:
        fn(*args, **kwargs)
    except exc_type:
        return
    raise AssertionError(f"Expected {exc_type.__name__}")


def _write_csv(rows: list[dict]) -> Path:
    path = Path(tempfile.mkdtemp()) / "data.csv"
    pd.DataFrame(rows).to_csv(path, index=False)
    return path


# --------------------------------------------------------------------------- #
# Generation
# --------------------------------------------------------------------------- #
def test_generated_data_covers_every_possible_combination():
    """
    Without full coverage the sampler can miss rare inputs entirely — the four
    combinations that produce a Normal class are drawn less than 1% of the time.
    """
    frame = generate_dataset(n_rows=300, full_coverage=True)
    combos = set(map(tuple, frame[config.CATEGORICAL_FEATURES].to_numpy()))
    assert len(combos) == 180


def test_generated_labels_always_match_the_rules():
    frame = generate_dataset(n_rows=500)
    for row in frame.itertuples():
        expected = (
            config.ASSET_IMPACT_SCORES[row.asset_impact]
            + config.SEVERITY_SCORES[row.reason_severity]
            + config.TRAFFIC_SCORES[row.traffic]
            + config.DUE_DATE_SCORES[row.due_date_bucket]
        )
        assert row.priority_score == expected
        assert row.priority_class == rules.classify_score(expected)


def test_generation_is_reproducible():
    a = generate_dataset(n_rows=200, seed=7)
    b = generate_dataset(n_rows=200, seed=7)
    assert a.equals(b)


def test_all_four_priority_classes_appear_in_generated_data():
    frame = generate_dataset(n_rows=1000)
    assert set(frame[config.TARGET_CLASS_COLUMN]) == set(config.PRIORITY_CLASSES)


# --------------------------------------------------------------------------- #
# Loading and schema flexibility
# --------------------------------------------------------------------------- #
def test_loader_derives_the_class_from_a_score_column():
    path = _write_csv([
        {"asset_impact": "High", "reason_severity": "Critical", "traffic": "High",
         "due_date_bucket": "Overdue or Today", "priority_score": 100},
    ])
    frame = load_dataset(path)
    assert frame[config.TARGET_CLASS_COLUMN].iloc[0] == "Critical"


def test_loader_derives_the_bucket_from_raw_day_counts():
    """Real request logs store a due date or a day count, not a band label."""
    path = _write_csv([
        {"asset_impact": "Low", "reason_severity": "Minor", "traffic": "Low",
         "days_until_due": 20, "priority_class": "Normal"},
        {"asset_impact": "High", "reason_severity": "Critical", "traffic": "High",
         "days_until_due": -2, "priority_class": "Critical"},
    ])
    frame = load_dataset(path)
    assert frame["due_date_bucket"].tolist() == ["More than 14 days", "Overdue or Today"]


def test_loader_normalises_mixed_casing():
    path = _write_csv([
        {"asset_impact": "HIGH", "reason_severity": "critical", "traffic": " High ",
         "due_date_bucket": "Overdue or Today", "priority_class": "CRITICAL"},
    ])
    row = load_dataset(path).iloc[0]
    assert row["asset_impact"] == "High"
    assert row["reason_severity"] == "Critical"
    assert row[config.TARGET_CLASS_COLUMN] == "Critical"


def test_loader_drops_rows_with_unrecognised_category_values():
    path = _write_csv([
        {"asset_impact": "High", "reason_severity": "Critical", "traffic": "High",
         "due_date_bucket": "Overdue or Today", "priority_class": "Critical"},
        {"asset_impact": "Extreme", "reason_severity": "Critical", "traffic": "High",
         "due_date_bucket": "Overdue or Today", "priority_class": "Critical"},
    ])
    assert len(load_dataset(path)) == 1


# --------------------------------------------------------------------------- #
# Loader strictness
# --------------------------------------------------------------------------- #
def test_missing_feature_column_is_an_error_naming_what_is_needed():
    path = _write_csv([{"asset_impact": "High", "priority_class": "Critical"}])
    try:
        load_dataset(path)
    except DatasetError as exc:
        assert "reason_severity" in str(exc)
        return
    raise AssertionError("Expected DatasetError")


def test_missing_both_target_columns_is_an_error():
    path = _write_csv([
        {"asset_impact": "High", "reason_severity": "Critical", "traffic": "High",
         "due_date_bucket": "Overdue or Today"},
    ])
    _expect_raises(DatasetError, load_dataset, path)


def test_a_file_with_no_usable_rows_is_an_error():
    path = _write_csv([
        {"asset_impact": "Nope", "reason_severity": "Nope", "traffic": "Nope",
         "due_date_bucket": "Nope", "priority_class": "Critical"},
    ])
    _expect_raises(DatasetError, load_dataset, path)


def test_a_missing_file_is_an_error_pointing_at_the_data_folder():
    try:
        load_dataset(Path("/tmp/definitely-not-here-4718.csv"))
    except DatasetError as exc:
        assert "not found" in str(exc).lower()
        return
    raise AssertionError("Expected DatasetError")


if __name__ == "__main__":
    import sys

    sys.path.insert(0, str(__import__("pathlib").Path(__file__).resolve().parent))
    from _runner import run_module

    raise SystemExit(run_module(sys.modules[__name__]))
