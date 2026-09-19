"""
utils.py
========
Cross-cutting helpers that every other module needs: logging, filesystem
handling, joblib/JSON persistence, dataset loading + validation, and the
project's exception types.

Why this file exists
--------------------
Loading a CSV "properly" means checking the columns exist, dropping blank rows,
rejecting unknown labels and warning about classes too small to learn from.
That logic belongs in exactly one place. If it lived in train.py, then
evaluate.py would quietly accept a malformed file and you would only find out
from a confusing stack trace three steps later.
"""

from __future__ import annotations

import json
import logging
import random
import sys
from datetime import datetime
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd

from src import config


# --------------------------------------------------------------------------- #
# Exceptions
# --------------------------------------------------------------------------- #
class MaintenanceMLError(Exception):
    """Base class so callers can catch everything this project raises."""


class DatasetError(MaintenanceMLError):
    """The dataset is missing, malformed, or unusable for training."""


class ModelNotTrainedError(MaintenanceMLError):
    """Prediction was requested before train.py produced any artefacts."""


class InvalidInputError(MaintenanceMLError):
    """The caller passed something that is not usable text."""


# --------------------------------------------------------------------------- #
# Logging
# --------------------------------------------------------------------------- #
_LOGGING_CONFIGURED = False


def get_logger(name: str) -> logging.Logger:
    """Return a module logger, configuring the root handler exactly once."""
    global _LOGGING_CONFIGURED
    if not _LOGGING_CONFIGURED:
        # stderr, not stdout: `python -m src.predict --text "..." > out.json`
        # must produce a clean JSON file, not JSON mixed with log lines.
        handler = logging.StreamHandler(sys.stderr)
        handler.setFormatter(
            logging.Formatter(config.LOG_FORMAT, datefmt=config.LOG_DATE_FORMAT)
        )
        root = logging.getLogger()
        root.handlers.clear()
        root.addHandler(handler)
        root.setLevel(config.LOG_LEVEL)
        _LOGGING_CONFIGURED = True
    return logging.getLogger(name)


logger = get_logger(__name__)


# --------------------------------------------------------------------------- #
# Misc helpers
# --------------------------------------------------------------------------- #
def set_seed(seed: int = config.RANDOM_SEED) -> None:
    """Make a training run reproducible (Python + NumPy sources of randomness)."""
    random.seed(seed)
    np.random.seed(seed)


def timestamp() -> str:
    """UTC-free local timestamp used for archive folder names."""
    return datetime.now().strftime("%Y%m%d_%H%M%S")


def ensure_dirs(*paths: Path) -> None:
    """Create directories if absent. Safe to call repeatedly."""
    for path in paths:
        Path(path).mkdir(parents=True, exist_ok=True)


def severity_to_score(severity: str) -> int:
    """
    Map a severity label to its Reason Severity points (out of 25).

    Raises
    ------
    InvalidInputError
        If the label is not one of the four configured severities.
    """
    try:
        return config.SEVERITY_SCORES[severity]
    except KeyError as exc:
        raise InvalidInputError(
            f"Unknown severity {severity!r}. Expected one of "
            f"{config.SEVERITY_LEVELS}."
        ) from exc


# --------------------------------------------------------------------------- #
# Persistence
# --------------------------------------------------------------------------- #
def save_joblib(obj: Any, path: Path) -> None:
    """Serialise an object with joblib, creating parent folders as needed."""
    path = Path(path)
    ensure_dirs(path.parent)
    try:
        joblib.dump(obj, path)
    except Exception as exc:  # disk full, permissions, unpicklable object...
        raise MaintenanceMLError(f"Could not write {path}: {exc}") from exc
    logger.debug("Saved %s", path)


def load_joblib(path: Path) -> Any:
    """
    Load a joblib artefact.

    Raises
    ------
    ModelNotTrainedError
        If the file does not exist — almost always because train.py has not
        been run yet, so the message says so explicitly.
    """
    path = Path(path)
    if not path.exists():
        raise ModelNotTrainedError(
            f"Missing artefact {path}. Train the model first:\n"
            f"    python -m src.train"
        )
    try:
        return joblib.load(path)
    except Exception as exc:
        raise MaintenanceMLError(
            f"Could not load {path} ({exc}). The file may be corrupt or was "
            f"written by an incompatible scikit-learn version — retrain to fix."
        ) from exc


def save_json(obj: Any, path: Path) -> None:
    """Write UTF-8 JSON with stable indentation (diff-friendly in git)."""
    path = Path(path)
    ensure_dirs(path.parent)
    with path.open("w", encoding="utf-8") as fh:
        json.dump(obj, fh, indent=2, ensure_ascii=False, default=str)
    logger.debug("Saved %s", path)


def load_json(path: Path) -> Any:
    path = Path(path)
    if not path.exists():
        raise MaintenanceMLError(f"Missing JSON file {path}.")
    with path.open(encoding="utf-8") as fh:
        return json.load(fh)


# --------------------------------------------------------------------------- #
# Dataset loading + validation
# --------------------------------------------------------------------------- #
def load_dataset(
    path: Path | str | None = None,
    *,
    require_labels: bool = True,
) -> pd.DataFrame:
    """
    Load and validate a maintenance-remark dataset.

    Expected CSV schema (header row required)::

        reason_description,severity
        "Track fracture detected",Critical
        "Signal failure causing delays",Major

    Parameters
    ----------
    path
        CSV file. Defaults to ``config.DEFAULT_DATASET``.
    require_labels
        Set False to load an unlabelled file for batch prediction.

    Returns
    -------
    pandas.DataFrame
        Cleaned frame with the configured text (and label) columns only.

    Raises
    ------
    DatasetError
        Missing file, missing columns, no usable rows, or unknown labels.
    """
    path = Path(path) if path is not None else config.DEFAULT_DATASET

    if not path.exists():
        raise DatasetError(
            f"Dataset not found: {path}\n"
            f"Place your CSV in {config.RAW_DATA_DIR} and pass --data <file>, "
            f"or update config.DEFAULT_DATASET."
        )

    try:
        df = pd.read_csv(path)
    except Exception as exc:
        raise DatasetError(f"Could not parse {path} as CSV: {exc}") from exc

    # --- column presence ---------------------------------------------------
    required = [config.TEXT_COLUMN] + ([config.LABEL_COLUMN] if require_labels else [])
    missing = [c for c in required if c not in df.columns]
    if missing:
        raise DatasetError(
            f"{path} is missing required column(s) {missing}. "
            f"Found: {list(df.columns)}. Rename your columns, or change "
            f"TEXT_COLUMN / LABEL_COLUMN in src/config.py."
        )

    n_raw = len(df)
    df = df[required].copy()

    # --- text hygiene ------------------------------------------------------
    df[config.TEXT_COLUMN] = df[config.TEXT_COLUMN].astype("string").str.strip()
    df = df[df[config.TEXT_COLUMN].notna() & (df[config.TEXT_COLUMN] != "")]

    if require_labels:
        # Normalise label casing so "critical" and "CRITICAL" both work.
        canonical = {lvl.lower(): lvl for lvl in config.SEVERITY_LEVELS}
        df[config.LABEL_COLUMN] = (
            df[config.LABEL_COLUMN].astype("string").str.strip().str.lower().map(canonical)
        )
        unknown = df[config.LABEL_COLUMN].isna().sum()
        if unknown:
            logger.warning(
                "Dropping %d row(s) with a severity outside %s.",
                unknown,
                config.SEVERITY_LEVELS,
            )
            df = df[df[config.LABEL_COLUMN].notna()]

        # Exact duplicate remarks bias both training and the hold-out score.
        before = len(df)
        df = df.drop_duplicates(subset=[config.TEXT_COLUMN, config.LABEL_COLUMN])
        if before - len(df):
            logger.warning("Dropped %d exact duplicate row(s).", before - len(df))

    df = df.reset_index(drop=True)
    # Convert pandas "string" dtype back to plain object so downstream sklearn
    # and joblib behave identically across pandas versions.
    df[config.TEXT_COLUMN] = df[config.TEXT_COLUMN].astype(str)
    if require_labels:
        df[config.LABEL_COLUMN] = df[config.LABEL_COLUMN].astype(str)

    if df.empty:
        raise DatasetError(f"No usable rows left in {path} after validation.")

    logger.info("Loaded %s: %d usable row(s) of %d.", path.name, len(df), n_raw)

    if require_labels:
        counts = df[config.LABEL_COLUMN].value_counts()
        logger.info("Class distribution: %s", counts.to_dict())

        absent = set(config.SEVERITY_LEVELS) - set(counts.index)
        if absent:
            logger.warning(
                "No training examples for %s — the model can never predict "
                "those classes.",
                sorted(absent),
            )
        tiny = counts[counts < config.MIN_SAMPLES_PER_CLASS_FOR_SPLIT]
        if not tiny.empty:
            logger.warning(
                "Very few examples for %s. Metrics for these classes will be "
                "unreliable; collect more labelled remarks.",
                tiny.to_dict(),
            )

    return df


def smallest_class_count(labels) -> int:
    """Number of examples in the rarest class — drives CV-fold selection."""
    return int(pd.Series(labels).value_counts().min())
