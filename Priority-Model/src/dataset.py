"""
dataset.py
==========
Builds the training dataset and validates any dataset you supply.

Why this file exists
--------------------
Your brief said "use the provided dataset for training", but no dataset was
attached. Rather than stub the pipeline out, this module generates one from the
business rules so the whole thing runs end to end today, and validates a real
file identically once you have one. ``train.py --data yourfile.csv`` switches
between the two with no other change.

What the generator does
-----------------------
Samples input combinations using the rough frequency weights in
``config.SAMPLING_WEIGHTS`` (so the set is not uniform, which would be
unrealistic), then guarantees that all 180 possible combinations appear at
least once. Labels come from ``rules.py``, so the training data and the
specification cannot drift apart.

What you should know about that data
------------------------------------
It is generated *from* the rules, so a model trained on it can at best
rediscover the rules. It is a correctness harness and a working demonstration,
not evidence that an ML layer adds value. See the README.

Expected schema for a real file
-------------------------------
    asset_impact,reason_severity,traffic,due_date_bucket,priority_score,priority_class
    High,Critical,High,Overdue or Today,100,Critical

``priority_score`` is optional. If ``priority_class`` is absent it is derived
from the score. ``due_date_bucket`` may be replaced by ``days_until_due``,
which is bucketed automatically — real request logs usually store the raw day
count, not the band.
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd

from src import config, rules
from src.utils import DatasetError, ensure_dirs, get_logger

logger = get_logger(__name__)


# --------------------------------------------------------------------------- #
# Generation
# --------------------------------------------------------------------------- #
def generate_dataset(
    n_rows: int = config.GENERATED_ROWS,
    *,
    seed: int = config.RANDOM_SEED,
    full_coverage: bool = config.GUARANTEE_FULL_COVERAGE,
) -> pd.DataFrame:
    """
    Build a labelled dataset from the business rules.

    Parameters
    ----------
    n_rows
        Number of sampled rows before coverage rows are added.
    seed
        Reproducibility.
    full_coverage
        Append one row per missing combination so every one of the 180 inputs
        is represented. Without this, rare combinations (the four that produce
        a Normal class, for instance) can be absent entirely and the model
        simply never learns them.
    """
    rng = np.random.default_rng(seed)

    def draw(field: str) -> np.ndarray:
        weights = config.SAMPLING_WEIGHTS[field]
        options = list(weights)
        probabilities = np.array([weights[o] for o in options], dtype=float)
        probabilities /= probabilities.sum()
        return rng.choice(options, size=n_rows, p=probabilities)

    frame = pd.DataFrame({field: draw(field) for field in config.CATEGORICAL_FEATURES})

    if full_coverage:
        all_combos = pd.DataFrame(rules.enumerate_all_combinations())[
            config.CATEGORICAL_FEATURES
        ]
        present = set(map(tuple, frame[config.CATEGORICAL_FEATURES].to_numpy()))
        missing = all_combos[
            ~all_combos.apply(lambda r: tuple(r) in present, axis=1)
        ]
        if len(missing):
            logger.info(
                "Adding %d combination(s) the sampler did not draw, so all %d "
                "inputs are represented.", len(missing), len(all_combos),
            )
            frame = pd.concat([frame, missing], ignore_index=True)

    frame = _apply_rule_labels(frame)
    frame = frame.sample(frac=1.0, random_state=seed).reset_index(drop=True)

    logger.info(
        "Generated %d row(s); class distribution: %s",
        len(frame), frame[config.TARGET_CLASS_COLUMN].value_counts().to_dict(),
    )
    return frame


def _apply_rule_labels(frame: pd.DataFrame) -> pd.DataFrame:
    """Attach component scores, the total and the class using rules.py."""
    frame = frame.copy()
    frame["asset_impact_score"] = frame["asset_impact"].map(config.ASSET_IMPACT_SCORES)
    frame["severity_score"] = frame["reason_severity"].map(config.SEVERITY_SCORES)
    frame["traffic_score"] = frame["traffic"].map(config.TRAFFIC_SCORES)
    frame["due_date_score"] = frame["due_date_bucket"].map(config.DUE_DATE_SCORES)
    frame[config.TARGET_SCORE_COLUMN] = (
        frame["asset_impact_score"]
        + frame["severity_score"]
        + frame["traffic_score"]
        + frame["due_date_score"]
    )
    frame[config.TARGET_CLASS_COLUMN] = frame[config.TARGET_SCORE_COLUMN].map(
        rules.classify_score
    )
    return frame


def write_generated_dataset(path: Path | None = None, **kwargs) -> Path:
    """Generate and save a dataset, returning the path it was written to."""
    path = Path(path) if path else config.DEFAULT_DATASET
    ensure_dirs(path.parent)
    generate_dataset(**kwargs).to_csv(path, index=False)
    logger.info("Wrote the generated dataset to %s", path)
    return path


def write_lookup_table(path: Path | None = None) -> Path:
    """
    Write all 180 combinations to CSV.

    Useful in its own right: it is the complete specification of the priority
    model in a form operations staff can review without reading any code.
    """
    path = Path(path) if path else config.REPORTS_DIR / "rule_lookup_table.csv"
    ensure_dirs(path.parent)
    pd.DataFrame(rules.enumerate_all_combinations()).to_csv(path, index=False)
    logger.info("Wrote the full rule lookup table to %s", path)
    return path


# --------------------------------------------------------------------------- #
# Loading and validation
# --------------------------------------------------------------------------- #
def load_dataset(path: Path | str | None = None) -> pd.DataFrame:
    """
    Load and validate a priority dataset.

    Generates the default dataset on first run if it does not exist yet, so a
    fresh clone trains without any setup step.

    Raises
    ------
    DatasetError
        Missing columns, unknown category values, or no usable rows.
    """
    path = Path(path) if path is not None else config.DEFAULT_DATASET

    if not path.exists():
        if path == config.DEFAULT_DATASET:
            logger.info("No dataset at %s yet — generating one from the rules.", path)
            write_generated_dataset(path)
        else:
            raise DatasetError(
                f"Dataset not found: {path}\nPlace your CSV in "
                f"{config.RAW_DATA_DIR} and pass --data <file>."
            )

    try:
        frame = pd.read_csv(path)
    except Exception as exc:
        raise DatasetError(f"Could not parse {path} as CSV: {exc}") from exc

    n_raw = len(frame)

    # -- derive due_date_bucket from raw day counts if needed ---------------
    if "due_date_bucket" not in frame.columns and "days_until_due" in frame.columns:
        logger.info("Deriving due_date_bucket from days_until_due.")
        frame["due_date_bucket"] = frame["days_until_due"].map(rules.due_date_bucket)

    missing = [c for c in config.CATEGORICAL_FEATURES if c not in frame.columns]
    if missing:
        raise DatasetError(
            f"{path} is missing required column(s) {missing}. Found: "
            f"{list(frame.columns)}. Expected: {config.CATEGORICAL_FEATURES} plus "
            f"'{config.TARGET_CLASS_COLUMN}' or '{config.TARGET_SCORE_COLUMN}'."
        )

    # -- normalise categorical casing ---------------------------------------
    for field, levels in config.FEATURE_LEVELS.items():
        lookup = {level.lower(): level for level in levels}
        normalised = frame[field].astype(str).str.strip().str.lower().map(lookup)
        bad = normalised.isna().sum()
        if bad:
            examples = frame.loc[normalised.isna(), field].unique()[:5].tolist()
            logger.warning(
                "Dropping %d row(s) with an unrecognised %s value, e.g. %s. "
                "Accepted: %s", bad, field, examples, levels,
            )
        frame[field] = normalised
    frame = frame.dropna(subset=config.CATEGORICAL_FEATURES)

    # -- targets ------------------------------------------------------------
    has_score = config.TARGET_SCORE_COLUMN in frame.columns
    has_class = config.TARGET_CLASS_COLUMN in frame.columns

    if not has_score and not has_class:
        raise DatasetError(
            f"{path} has neither '{config.TARGET_SCORE_COLUMN}' nor "
            f"'{config.TARGET_CLASS_COLUMN}'. One of them is required as the "
            f"training target."
        )

    if not has_class:
        logger.info("Deriving %s from %s.", config.TARGET_CLASS_COLUMN, config.TARGET_SCORE_COLUMN)
        frame[config.TARGET_CLASS_COLUMN] = frame[config.TARGET_SCORE_COLUMN].map(
            rules.classify_score
        )
    else:
        lookup = {c.lower(): c for c in config.PRIORITY_CLASSES}
        frame[config.TARGET_CLASS_COLUMN] = (
            frame[config.TARGET_CLASS_COLUMN].astype(str).str.strip().str.lower().map(lookup)
        )
        bad = frame[config.TARGET_CLASS_COLUMN].isna().sum()
        if bad:
            logger.warning("Dropping %d row(s) with an unknown priority_class.", bad)
            frame = frame.dropna(subset=[config.TARGET_CLASS_COLUMN])

    if frame.empty:
        raise DatasetError(f"No usable rows left in {path} after validation.")

    frame = frame.reset_index(drop=True)
    logger.info("Loaded %s: %d usable row(s) of %d.", path.name, len(frame), n_raw)

    _report_rule_agreement(frame, path)
    return frame


def _report_rule_agreement(frame: pd.DataFrame, path: Path) -> None:
    """
    Compare the file's labels against what the rules would produce.

    On generated data this is 100% by construction. On a *real* dataset it is
    the single most informative number in the whole project: it tells you
    whether your recorded priorities actually follow the documented rules. If
    agreement is high, you do not need a model. If it is low, the gap is
    exactly what an ML layer could learn — and worth investigating before you
    train on it, because it might just be inconsistent data entry.
    """
    expected = frame.apply(
        lambda row: rules.classify_score(
            config.ASSET_IMPACT_SCORES[row["asset_impact"]]
            + config.SEVERITY_SCORES[row["reason_severity"]]
            + config.TRAFFIC_SCORES[row["traffic"]]
            + config.DUE_DATE_SCORES[row["due_date_bucket"]]
        ),
        axis=1,
    )
    agreement = float((expected == frame[config.TARGET_CLASS_COLUMN]).mean())
    logger.info("Labels in %s agree with the business rules %.1f%% of the time.",
                path.name, agreement * 100)
    if agreement < 0.99:
        logger.warning(
            "%.1f%% of rows are labelled differently from what the rules give. "
            "That gap is the only thing an ML model can add here — inspect it "
            "before training, in case it is data-entry noise rather than "
            "genuine business exceptions.", (1 - agreement) * 100,
        )


def _main() -> None:
    import argparse

    parser = argparse.ArgumentParser(description="Generate or inspect the priority dataset.")
    parser.add_argument("--generate", action="store_true", help="Write a fresh generated dataset.")
    parser.add_argument("--rows", type=int, default=config.GENERATED_ROWS)
    parser.add_argument("--lookup-table", action="store_true",
                        help="Write all 180 rule combinations to reports/.")
    args = parser.parse_args()

    if args.generate:
        write_generated_dataset(n_rows=args.rows)
    if args.lookup_table:
        write_lookup_table()
    if not args.generate and not args.lookup_table:
        frame = load_dataset()
        print(frame.head(10).to_string(index=False))
        print(f"\n{len(frame)} rows")
        print(frame[config.TARGET_CLASS_COLUMN].value_counts().to_string())


if __name__ == "__main__":
    _main()
