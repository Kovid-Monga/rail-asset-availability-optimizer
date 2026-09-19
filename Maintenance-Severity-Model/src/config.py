"""
config.py
=========
Single source of truth for every tunable knob in the project.

Why this file exists
--------------------
Nothing else in the codebase hard-codes a path, a column name, a label or a
hyper-parameter. When you receive the real dataset you change values *here*
(or pass CLI flags) and the rest of the pipeline follows. That is what makes
"swap the sample data for the real data" a configuration change rather than a
code change.
"""

from __future__ import annotations

from pathlib import Path

# --------------------------------------------------------------------------- #
# Paths
# --------------------------------------------------------------------------- #
# PROJECT_ROOT is resolved from this file's location, so the project works no
# matter which directory you launch it from.
PROJECT_ROOT: Path = Path(__file__).resolve().parents[1]

DATA_DIR: Path = PROJECT_ROOT / "data"
RAW_DATA_DIR: Path = DATA_DIR / "raw"          # drop the real dataset here
MODELS_DIR: Path = PROJECT_ROOT / "models"     # serialised artefacts
ARCHIVE_DIR: Path = MODELS_DIR / "archive"     # timestamped previous models
REPORTS_DIR: Path = PROJECT_ROOT / "reports"   # metrics, plots, run logs

# Dataset used when --data is not supplied. Point this at the real file once
# you have it (or just pass --data on the command line).
DEFAULT_DATASET: Path = DATA_DIR / "sample_severity_dataset.csv"

# Serialised artefacts (all written by src/train.py).
MODEL_PATH: Path = MODELS_DIR / "model.joblib"
VECTORIZER_PATH: Path = MODELS_DIR / "vectorizer.joblib"
LABEL_ENCODER_PATH: Path = MODELS_DIR / "label_encoder.joblib"
METADATA_PATH: Path = MODELS_DIR / "metadata.json"

# --------------------------------------------------------------------------- #
# Dataset schema
# --------------------------------------------------------------------------- #
TEXT_COLUMN: str = "reason_description"
LABEL_COLUMN: str = "severity"

# Severity label -> Reason Severity points (out of 25) from the priority spec.
# The predictor returns both, so the caller never has to maintain this mapping.
SEVERITY_SCORES: dict[str, int] = {
    "Critical": 25,
    "Major": 18,
    "Moderate": 12,
    "Minor": 5,
}
SEVERITY_LEVELS: list[str] = list(SEVERITY_SCORES)

# --------------------------------------------------------------------------- #
# Reproducibility / splitting
# --------------------------------------------------------------------------- #
RANDOM_SEED: int = 42
TEST_SIZE: float = 0.20
CV_FOLDS: int = 5
SELECTION_METRIC: str = "f1_weighted"  # requirement: pick best by weighted F1

# On a small dataset the cross-validation fold scores are noisy enough that a
# heavier model can "win" by luck — observed on the bundled sample data, where
# Random Forest beat Logistic Regression by 0.008 F1 with a fold-to-fold spread
# of 0.108 and then scored far worse on the hold-out set. The one-standard-error
# rule is the standard remedy: among models whose mean score is within one
# standard error of the best, take the simplest. Set to False to always take the
# raw top scorer.
USE_ONE_SE_RULE: bool = True

# Simplest first. Used only to break the ties described above.
MODEL_COMPLEXITY_ORDER: list[str] = [
    "logistic_regression",
    "random_forest",
    "xgboost",
]

# A stratified hold-out split needs at least 1/TEST_SIZE examples of the rarest
# class. Below this we skip the split and select purely on cross-validation.
MIN_SAMPLES_PER_CLASS_FOR_SPLIT: int = 5

# --------------------------------------------------------------------------- #
# Feature extraction (TF-IDF)
# --------------------------------------------------------------------------- #
# Text is already cleaned/lemmatised by preprocess.py before it reaches the
# vectorizer, so TF-IDF does no tokenising magic of its own beyond whitespace.
TFIDF_PARAMS: dict = {
    "ngram_range": (1, 2),   # unigrams + bigrams ("rail fracture", "false clear")
    "min_df": 1,             # raise to 2-3 on a large real dataset
    "max_df": 0.90,          # drop terms present in >90% of documents
    "sublinear_tf": True,    # 1 + log(tf); dampens long-remark bias
    "max_features": 20_000,
    "strip_accents": "unicode",
}

# --------------------------------------------------------------------------- #
# Candidate models
# --------------------------------------------------------------------------- #
# Constructed in train.py; kept here as plain dicts so config.py stays free of
# heavy imports and can be read by anyone without running sklearn.
LOGISTIC_REGRESSION_PARAMS: dict = {
    "C": 5.0,
    "max_iter": 2000,
    "class_weight": "balanced",   # protects the rare Critical class
    # lbfgs handles the multinomial (4-class) case natively. Do NOT switch to
    # liblinear: scikit-learn >= 1.5 rejects it for n_classes >= 3.
    "solver": "lbfgs",
}

RANDOM_FOREST_PARAMS: dict = {
    "n_estimators": 400,
    "max_depth": None,
    "min_samples_leaf": 1,
    "class_weight": "balanced_subsample",
    "n_jobs": -1,
}

XGBOOST_PARAMS: dict = {
    "n_estimators": 300,
    "max_depth": 5,
    "learning_rate": 0.15,
    "subsample": 0.9,
    "colsample_bytree": 0.9,
    "objective": "multi:softprob",
    "eval_metric": "mlogloss",
    "tree_method": "hist",
    "n_jobs": -1,
}

# --------------------------------------------------------------------------- #
# Probability calibration (optional)
# --------------------------------------------------------------------------- #
# Raw predict_proba values are *not* calibrated probabilities. Turning this on
# wraps the winning model in CalibratedClassifierCV so that "confidence: 0.94"
# actually means something close to "right 94% of the time". It needs a decent
# amount of data per class, so it is off by default and guarded at runtime.
CALIBRATE_PROBABILITIES: bool = False
MIN_SAMPLES_PER_CLASS_FOR_CALIBRATION: int = 30

# Predictions below this confidence are flagged for human review rather than
# being trusted blindly by the downstream priority calculator.
LOW_CONFIDENCE_THRESHOLD: float = 0.50

# --------------------------------------------------------------------------- #
# Logging
# --------------------------------------------------------------------------- #
LOG_LEVEL: str = "INFO"
LOG_FORMAT: str = "%(asctime)s | %(levelname)-8s | %(name)-18s | %(message)s"
LOG_DATE_FORMAT: str = "%Y-%m-%d %H:%M:%S"
