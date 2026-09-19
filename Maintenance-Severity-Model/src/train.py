"""
train.py
========
The whole training pipeline, end to end:

    load CSV -> clean text -> split -> fit TF-IDF -> cross-validate candidates
    -> pick the best by weighted F1 -> refit -> evaluate on hold-out
    -> archive the previous model -> save new artefacts + metadata + reports

Why this file exists
--------------------
This is the one command you run when new labelled data arrives. It takes a
``--data`` path and nothing else, so retraining on the real dataset is:

    python -m src.train --data data/raw/maintenance_remarks.csv

No code changes, no notebook, no manual model selection. Everything it writes
is versioned into ``models/archive/<timestamp>/`` first, so a bad retrain is
always reversible.
"""

from __future__ import annotations

import argparse
import platform
import shutil
import sys
from pathlib import Path
from typing import Any, cast

import numpy as np
import sklearn
from sklearn.base import BaseEstimator
from sklearn.calibration import CalibratedClassifierCV
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split
from sklearn.preprocessing import LabelEncoder

from src import config
from src.evaluate import save_reports
from src.preprocess import DEFAULT_CLEANER, clean_corpus
from src.utils import (
    DatasetError,
    ensure_dirs,
    get_logger,
    load_dataset,
    save_joblib,
    save_json,
    set_seed,
    smallest_class_count,
    timestamp,
)

logger = get_logger(__name__)

# --------------------------------------------------------------------------- #
# Optional XGBoost
# --------------------------------------------------------------------------- #
# XGBoost is an optional dependency by design: it is a large wheel and often
# unavailable on locked-down servers. The pipeline degrades to LR + RF instead
# of failing at import time.
try:
    from xgboost import XGBClassifier

    XGBOOST_AVAILABLE = True
except ImportError:  # pragma: no cover - environment dependent
    XGBClassifier = None
    XGBOOST_AVAILABLE = False
    logger.info("xgboost not installed — comparing Logistic Regression and Random Forest only.")


# --------------------------------------------------------------------------- #
# Components
# --------------------------------------------------------------------------- #
def build_vectorizer() -> TfidfVectorizer:
    """
    Build the TF-IDF vectorizer.

    ``preprocessor``/``tokenizer`` are left at their defaults on purpose: text
    arriving here is already cleaned by preprocess.py, so the vectorizer holds
    no reference to a project function. That keeps ``vectorizer.joblib``
    loadable from any script without importing this package.
    """
    return TfidfVectorizer(**config.TFIDF_PARAMS)


def get_candidate_models(n_classes: int) -> dict[str, BaseEstimator]:
    """Instantiate every candidate classifier that is available in this env."""
    models: dict[str, BaseEstimator] = {
        "logistic_regression": LogisticRegression(
            random_state=config.RANDOM_SEED, **config.LOGISTIC_REGRESSION_PARAMS
        ),
        "random_forest": RandomForestClassifier(
            random_state=config.RANDOM_SEED, **config.RANDOM_FOREST_PARAMS
        ),
    }

    if XGBOOST_AVAILABLE:
        if XGBClassifier is None:
            raise RuntimeError("XGBOOST_AVAILABLE is true but XGBClassifier is unavailable")
        params = dict(config.XGBOOST_PARAMS)
        if n_classes <= 2:
            # multi:softprob is invalid for two classes.
            params["objective"] = "binary:logistic"
            params["eval_metric"] = "logloss"
        models["xgboost"] = XGBClassifier(
            random_state=config.RANDOM_SEED, num_class=None, **params
        )

    return models


def _cv_folds(y: np.ndarray) -> int:
    """
    Choose a fold count that every class can support.

    StratifiedKFold needs at least ``n_splits`` members of the rarest class.
    On a small sample dataset that means silently dropping from 5 folds to 3
    or 2 rather than crashing.
    """
    rarest = smallest_class_count(y)
    folds = min(config.CV_FOLDS, rarest)
    if folds < config.CV_FOLDS:
        logger.warning(
            "Reducing cross-validation to %d fold(s): the rarest class has "
            "only %d example(s).",
            max(folds, 0),
            rarest,
        )
    return folds


# --------------------------------------------------------------------------- #
# Model comparison
# --------------------------------------------------------------------------- #
def compare_models(X, y: np.ndarray, models: dict[str, BaseEstimator]) -> dict[str, dict]:
    """
    Cross-validate every candidate and return their scores.

    Selection uses cross-validation on the *training* split rather than the
    hold-out set. Picking a winner by hold-out score would leak the test set
    into model selection and inflate the number you eventually report.
    """
    folds = _cv_folds(y)
    results: dict[str, dict] = {}

    if folds < 2:
        logger.warning(
            "Not enough data per class for cross-validation. Falling back to "
            "training-set scores — treat model selection as provisional."
        )

    for name, model in models.items():
        try:
            if folds >= 2:
                cv = StratifiedKFold(
                    n_splits=folds, shuffle=True, random_state=config.RANDOM_SEED
                )
                scores = cross_val_score(
                    model, X, y, cv=cv, scoring=config.SELECTION_METRIC, n_jobs=1
                )
                results[name] = {
                    "cv_folds": folds,
                    "mean_f1_weighted": float(np.mean(scores)),
                    "std_f1_weighted": float(np.std(scores)),
                    "fold_scores": [float(s) for s in scores],
                }
                logger.info(
                    "%-20s CV weighted F1 = %.4f (+/- %.4f)",
                    name,
                    results[name]["mean_f1_weighted"],
                    results[name]["std_f1_weighted"],
                )
            else:
                from sklearn.metrics import f1_score
                
                fitted_model = cast(LogisticRegression, model)
                fitted_model.fit(X, y)
                score = f1_score(
                    y, fitted_model.predict(X), average="weighted", zero_division=0
                )
                results[name] = {
                    "cv_folds": 0,
                    "mean_f1_weighted": float(score),
                    "std_f1_weighted": 0.0,
                    "fold_scores": [],
                    "note": "training-set score, not cross-validated",
                }
                logger.info("%-20s train weighted F1 = %.4f", name, score)

        except Exception as exc:
            # One broken candidate must not abort the whole run.
            logger.error("Skipping %s — it failed during evaluation: %s", name, exc)
            results[name] = {"error": str(exc), "mean_f1_weighted": float("-inf")}

    return results


def select_best(results: dict[str, dict]) -> str:
    """
    Pick the winning model by weighted F1, with one-standard-error tie-breaking.

    The raw argmax is the letter of the requirement, but on small datasets it
    selects on noise. When ``config.USE_ONE_SE_RULE`` is on, any model whose
    mean score is within one standard error of the top score is considered
    statistically tied, and the simplest of those is chosen. That is the
    textbook one-SE rule and it is why a stable linear model is preferred over
    a marginally-higher-scoring forest.
    """
    usable = {k: v for k, v in results.items() if "error" not in v}
    if not usable:
        raise DatasetError(
            "Every candidate model failed to train. Check the dataset: you "
            "likely have too few rows or only one severity class."
        )

    top = max(usable, key=lambda k: usable[k]["mean_f1_weighted"])
    top_score = usable[top]["mean_f1_weighted"]

    if not config.USE_ONE_SE_RULE:
        logger.info("Selected %s (weighted F1 = %.4f).", top, top_score)
        return top

    folds = usable[top].get("cv_folds", 0)
    std = usable[top].get("std_f1_weighted", 0.0)
    standard_error = (std / np.sqrt(folds)) if folds > 1 else 0.0
    threshold = top_score - standard_error

    tied = [k for k, v in usable.items() if v["mean_f1_weighted"] >= threshold]
    # Order by declared complexity; anything unlisted sorts last.
    tied.sort(
        key=lambda k: (
            config.MODEL_COMPLEXITY_ORDER.index(k)
            if k in config.MODEL_COMPLEXITY_ORDER
            else len(config.MODEL_COMPLEXITY_ORDER)
        )
    )
    best = tied[0]

    if best != top:
        logger.info(
            "One-SE rule: %s (%.4f) is within 1 SE (%.4f) of top scorer %s "
            "(%.4f) and is simpler — selecting it.",
            best,
            usable[best]["mean_f1_weighted"],
            standard_error,
            top,
            top_score,
        )
    logger.info(
        "Selected %s (weighted F1 = %.4f).", best, usable[best]["mean_f1_weighted"]
    )
    return best


def _maybe_calibrate(model, X, y: np.ndarray):
    """
    Optionally wrap the winner in CalibratedClassifierCV.

    Guarded twice — by the config flag and by a minimum class count — because
    calibration on a handful of examples produces worse probabilities than the
    uncalibrated model it replaces.
    """
    if not config.CALIBRATE_PROBABILITIES:
        return model, False

    rarest = smallest_class_count(y)
    if rarest < config.MIN_SAMPLES_PER_CLASS_FOR_CALIBRATION:
        logger.warning(
            "Skipping probability calibration: rarest class has %d example(s), "
            "need >= %d.",
            rarest,
            config.MIN_SAMPLES_PER_CLASS_FOR_CALIBRATION,
        )
        return model, False

    folds = min(3, rarest)
    logger.info("Calibrating probabilities with %d-fold CV.", folds)
    return CalibratedClassifierCV(model, cv=folds, method="sigmoid"), True


# --------------------------------------------------------------------------- #
# Archiving
# --------------------------------------------------------------------------- #
def archive_current_model() -> Path | None:
    """
    Copy the existing artefacts into ``models/archive/<timestamp>/``.

    Retraining overwrites model.joblib in place. Without this, a retrain on a
    bad batch of labels would destroy the only working model you had.
    """
    artefacts = [
        config.MODEL_PATH,
        config.VECTORIZER_PATH,
        config.LABEL_ENCODER_PATH,
        config.METADATA_PATH,
    ]
    existing = [p for p in artefacts if p.exists()]
    if not existing:
        return None

    destination = config.ARCHIVE_DIR / timestamp()
    ensure_dirs(destination)
    for path in existing:
        shutil.copy2(path, destination / path.name)
    logger.info("Archived the previous model to %s", destination)
    return destination


# --------------------------------------------------------------------------- #
# Main training routine
# --------------------------------------------------------------------------- #
def train(
    data_path: Path | str | None = None,
    *,
    test_size: float = config.TEST_SIZE,
    archive: bool = True,
    only_models: list[str] | None = None,
) -> dict:
    """
    Run the full pipeline and persist the winning model.

    Parameters
    ----------
    data_path
        Labelled CSV with ``reason_description`` and ``severity`` columns.
    test_size
        Hold-out fraction. Set to 0 to train on everything (do this only once
        you are happy with the cross-validation numbers and want the final
        production model to see all available data).
    archive
        Copy the previous artefacts to ``models/archive/`` before overwriting.
    only_models
        Restrict the comparison, e.g. ``["logistic_regression"]``.

    Returns
    -------
    dict
        The metadata written to ``models/metadata.json``.
    """
    set_seed()
    ensure_dirs(config.MODELS_DIR, config.REPORTS_DIR, config.ARCHIVE_DIR)

    # ---- 1. Load and validate ------------------------------------------- #
    df = load_dataset(data_path)
    if df[config.LABEL_COLUMN].nunique() < 2:
        raise DatasetError(
            "Need at least two distinct severity classes to train a classifier; "
            f"found {df[config.LABEL_COLUMN].unique().tolist()}."
        )

    # ---- 2. Clean text --------------------------------------------------- #
    logger.info("Cleaning %d remark(s) with %r", len(df), DEFAULT_CLEANER)
    texts = clean_corpus(df[config.TEXT_COLUMN].tolist())
    empty = sum(1 for t in texts if not t)
    if empty:
        logger.warning(
            "%d remark(s) reduced to an empty string after cleaning — they "
            "contained only stopwords, digits or punctuation.",
            empty,
        )

    # ---- 3. Encode labels ------------------------------------------------ #
    # A single LabelEncoder for all candidates keeps XGBoost (which needs
    # integer targets) interchangeable with the sklearn models.
    label_encoder = LabelEncoder()
    y = label_encoder.fit_transform(df[config.LABEL_COLUMN].tolist())
    class_names = list(label_encoder.classes_)

    # ---- 4. Split -------------------------------------------------------- #
    rarest = smallest_class_count(y)
    can_split = test_size > 0 and rarest >= config.MIN_SAMPLES_PER_CLASS_FOR_SPLIT

    if can_split:
        X_train_text, X_test_text, y_train, y_test = train_test_split(
            texts,
            y,
            test_size=test_size,
            random_state=config.RANDOM_SEED,
            stratify=y,
        )
        logger.info("Split: %d train / %d hold-out.", len(X_train_text), len(X_test_text))
    else:
        if test_size > 0:
            logger.warning(
                "Skipping the hold-out split: rarest class has %d example(s), "
                "need >= %d. Cross-validation scores are the only honest "
                "estimate on a dataset this small.",
                rarest,
                config.MIN_SAMPLES_PER_CLASS_FOR_SPLIT,
            )
        X_train_text, y_train = texts, y
        X_test_text, y_test = [], np.array([])

    # ---- 5. Fit TF-IDF on the training split only ------------------------ #
    # Fitting on the full corpus would leak hold-out vocabulary and IDF
    # statistics into training.
    vectorizer = build_vectorizer()
    X_train = vectorizer.fit_transform(X_train_text)
    logger.info(
        "TF-IDF matrix: %d x %d (%d features).",
        X_train.shape[0],
        X_train.shape[1],
        len(vectorizer.vocabulary_),
    )

    # ---- 6. Compare candidates ------------------------------------------ #
    models = get_candidate_models(n_classes=len(class_names))
    if only_models:
        unknown = set(only_models) - set(models)
        if unknown:
            logger.warning("Ignoring unknown model name(s): %s", sorted(unknown))
        models = {k: v for k, v in models.items() if k in only_models}
        if not models:
            raise DatasetError(f"No usable models left after filtering by {only_models}.")

    comparison = compare_models(X_train, cast(np.ndarray, y_train), models)
    best_name = select_best(comparison)

    # ---- 7. Refit the winner on the full training split ------------------ #
    best_model, calibrated = _maybe_calibrate(
        models[best_name], X_train, cast(np.ndarray, y_train)
    )
    cast(Any, best_model).fit(X_train, y_train)

    # ---- 8. Hold-out evaluation ------------------------------------------ #
    holdout_metrics: dict | None = None
    if can_split:
        X_test = vectorizer.transform(X_test_text)
        y_pred = cast(Any, best_model).predict(X_test)
        holdout_metrics = save_reports(
            label_encoder.inverse_transform(y_test),
            label_encoder.inverse_transform(y_pred),
            prefix="holdout",
            labels=class_names,
            extra={"model_name": best_name, "trained_at": timestamp()},
        )
    else:
        logger.info("No hold-out set — see reports/model_comparison.json for CV scores.")

    # ---- 9. Persist ------------------------------------------------------ #
    archived_to = archive_current_model() if archive else None

    save_joblib(best_model, config.MODEL_PATH)
    save_joblib(vectorizer, config.VECTORIZER_PATH)
    save_joblib(label_encoder, config.LABEL_ENCODER_PATH)

    metadata = {
        "model_name": best_name,
        "calibrated": calibrated,
        "trained_at": timestamp(),
        "dataset": str(Path(data_path) if data_path else config.DEFAULT_DATASET),
        "n_rows": int(len(df)),
        "n_train": int(len(X_train_text)),
        "n_holdout": int(len(X_test_text)),
        "classes": class_names,
        "severity_scores": config.SEVERITY_SCORES,
        "class_distribution": df[config.LABEL_COLUMN].value_counts().to_dict(),
        "n_features": int(len(vectorizer.vocabulary_)),
        "tfidf_params": {k: list(v) if isinstance(v, tuple) else v
                         for k, v in config.TFIDF_PARAMS.items()},
        "selection_metric": config.SELECTION_METRIC,
        "model_comparison": comparison,
        "holdout_metrics": holdout_metrics,
        "archived_previous_to": str(archived_to) if archived_to else None,
        "versions": {
            "python": sys.version.split()[0],
            "platform": platform.platform(),
            "scikit_learn": sklearn.__version__,
            "numpy": np.__version__,
            "xgboost_available": XGBOOST_AVAILABLE,
        },
    }
    save_json(metadata, config.METADATA_PATH)
    save_json(comparison, config.REPORTS_DIR / "model_comparison.json")

    logger.info("Training complete. Artefacts written to %s", config.MODELS_DIR)
    return metadata


# --------------------------------------------------------------------------- #
# CLI
# --------------------------------------------------------------------------- #
def _main() -> None:
    parser = argparse.ArgumentParser(
        description="Train the maintenance-remark severity classifier.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "--data",
        type=Path,
        default=None,
        help=f"Labelled CSV (default: {config.DEFAULT_DATASET}).",
    )
    parser.add_argument("--test-size", type=float, default=config.TEST_SIZE)
    parser.add_argument(
        "--no-archive",
        action="store_true",
        help="Do not copy the previous model into models/archive/.",
    )
    parser.add_argument(
        "--models",
        nargs="+",
        default=None,
        metavar="NAME",
        help="Restrict candidates: logistic_regression random_forest xgboost.",
    )
    args = parser.parse_args()

    try:
        train(
            args.data,
            test_size=args.test_size,
            archive=not args.no_archive,
            only_models=args.models,
        )
    except Exception as exc:
        logger.error("Training failed: %s", exc)
        raise SystemExit(1) from exc


if __name__ == "__main__":
    _main()
