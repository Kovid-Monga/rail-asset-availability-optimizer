"""
config.py
=========
Single source of truth for paths, business-rule constants, feature definitions,
model hyper-parameters and integration settings.

Why this file exists
--------------------
The business rules in this file are the *specification*, not an implementation
detail. When operations decides that Traffic is worth 30 points instead of 25,
exactly one line changes here and the rule engine, the training-data generator,
the validators and the reports all follow. Nothing else in the codebase
hard-codes a weight, a threshold or a label.

Environment overrides
---------------------
Anything a deployment needs to change without editing code reads from an
environment variable first:

    PRIORITY_SEVERITY_MODEL_PATH   path to the stage-1 severity project
    PRIORITY_SCORING_MODE          "rules" (default) or "ml"
    PRIORITY_LOG_LEVEL             DEBUG / INFO / WARNING / ERROR
"""

from __future__ import annotations

import os
from pathlib import Path

# --------------------------------------------------------------------------- #
# Paths
# --------------------------------------------------------------------------- #
PROJECT_ROOT: Path = Path(__file__).resolve().parents[1]

DATA_DIR: Path = PROJECT_ROOT / "data"
RAW_DATA_DIR: Path = DATA_DIR / "raw"
MODELS_DIR: Path = PROJECT_ROOT / "models"
ARCHIVE_DIR: Path = MODELS_DIR / "archive"
LOGS_DIR: Path = PROJECT_ROOT / "logs"
REPORTS_DIR: Path = PROJECT_ROOT / "reports"

DEFAULT_DATASET: Path = DATA_DIR / "priority_training_data.csv"

MODEL_PATH: Path = MODELS_DIR / "priority_model.joblib"
METADATA_PATH: Path = MODELS_DIR / "metadata.json"

APP_LOG_PATH: Path = LOGS_DIR / "app.log"
AUDIT_LOG_PATH: Path = LOGS_DIR / "predictions.jsonl"

# --------------------------------------------------------------------------- #
# Business rules — the specification
# --------------------------------------------------------------------------- #
ASSET_IMPACT_SCORES: dict[str, int] = {"High": 30, "Medium": 20, "Low": 10}

SEVERITY_SCORES: dict[str, int] = {
    "Critical": 25,
    "Major": 18,
    "Moderate": 12,
    "Minor": 5,
}

TRAFFIC_SCORES: dict[str, int] = {"High": 25, "Medium": 15, "Low": 5}

# Due-date urgency. Each entry is (inclusive upper bound in days, label, score);
# days are counted as due_date - request_date, so negatives mean overdue.
# The final bound is None, meaning "everything above the previous bound".
DUE_DATE_BUCKETS: list[tuple[int | None, str, int]] = [
    (0, "Overdue or Today", 20),
    (2, "1-2 days", 17),
    (7, "3-7 days", 13),
    (14, "8-14 days", 9),
    (None, "More than 14 days", 5),
]
DUE_DATE_LABELS: list[str] = [label for _, label, _ in DUE_DATE_BUCKETS]
DUE_DATE_SCORES: dict[str, int] = {label: score for _, label, score in DUE_DATE_BUCKETS}

# Final classification bands, as (inclusive min, inclusive max, label).
PRIORITY_BANDS: list[tuple[int, int, str]] = [
    (80, 100, "Critical"),
    (60, 79, "Urgent"),
    (35, 59, "Moderate"),
    (0, 34, "Normal"),
]
PRIORITY_CLASSES: list[str] = ["Normal", "Moderate", "Urgent", "Critical"]  # ascending

MIN_POSSIBLE_SCORE: int = 0
MAX_POSSIBLE_SCORE: int = 100

# --------------------------------------------------------------------------- #
# Feature specification for the ML model
# --------------------------------------------------------------------------- #
# The model consumes the four *categorical* factors, not the raw text. The
# reason description is stage 1's input; by the time a request reaches this
# stage it has already been reduced to a severity label.
CATEGORICAL_FEATURES: list[str] = [
    "asset_impact",
    "reason_severity",
    "traffic",
    "due_date_bucket",
]
TARGET_CLASS_COLUMN: str = "priority_class"
TARGET_SCORE_COLUMN: str = "priority_score"

FEATURE_LEVELS: dict[str, list[str]] = {
    "asset_impact": list(ASSET_IMPACT_SCORES),
    "reason_severity": list(SEVERITY_SCORES),
    "traffic": list(TRAFFIC_SCORES),
    "due_date_bucket": DUE_DATE_LABELS,
}

# --------------------------------------------------------------------------- #
# Scoring mode
# --------------------------------------------------------------------------- #
# "rules" — priority_score and priority_class both come from the arithmetic.
#           Exact, auditable, and the correct default (see README).
# "ml"    — priority_class comes from the trained classifier; the score is still
#           computed arithmetically because it is defined as a sum.
SCORING_MODE: str = os.getenv("PRIORITY_SCORING_MODE", "rules").strip().lower()

# In "ml" mode, log loudly whenever the model disagrees with the rules. A
# disagreement is either a model defect or an un-modelled business exception,
# and both are worth seeing in production.
WARN_ON_RULE_DISAGREEMENT: bool = True

# --------------------------------------------------------------------------- #
# Training-data generation
# --------------------------------------------------------------------------- #
# Used only until a real dataset is supplied via --data.
GENERATED_ROWS: int = 5000
GUARANTEE_FULL_COVERAGE: bool = True  # include all 180 combinations at least once

# Rough real-world frequencies, used to weight the sampler so the generated set
# is not uniform. Tune these to your actual request mix, or ignore them
# entirely once you have real data.
SAMPLING_WEIGHTS: dict[str, dict[str, float]] = {
    "asset_impact": {"High": 0.25, "Medium": 0.45, "Low": 0.30},
    "reason_severity": {"Critical": 0.10, "Major": 0.25, "Moderate": 0.35, "Minor": 0.30},
    "traffic": {"High": 0.30, "Medium": 0.40, "Low": 0.30},
    "due_date_bucket": {
        "Overdue or Today": 0.15,
        "1-2 days": 0.15,
        "3-7 days": 0.25,
        "8-14 days": 0.20,
        "More than 14 days": 0.25,
    },
}

# --------------------------------------------------------------------------- #
# Model training
# --------------------------------------------------------------------------- #
RANDOM_SEED: int = 42
TEST_SIZE: float = 0.20
CV_FOLDS: int = 5
SELECTION_METRIC: str = "f1_weighted"

# Same one-standard-error tie-break as the stage-1 severity project: among
# models statistically tied with the best, prefer the simplest.
USE_ONE_SE_RULE: bool = True
MODEL_COMPLEXITY_ORDER: list[str] = [
    "decision_tree",
    "logistic_regression",
    "random_forest",
]

DECISION_TREE_PARAMS: dict = {
    # The rule set is a lookup table, so a shallow tree can represent it
    # exactly — and unlike the others it can be exported as readable rules.
    "max_depth": 12,
    "class_weight": "balanced",
}
LOGISTIC_REGRESSION_PARAMS: dict = {
    "C": 10.0,
    "max_iter": 2000,
    "class_weight": "balanced",
    "solver": "lbfgs",
}
RANDOM_FOREST_PARAMS: dict = {
    "n_estimators": 300,
    "max_depth": None,
    "class_weight": "balanced_subsample",
    "n_jobs": -1,
}

# --------------------------------------------------------------------------- #
# Stage-1 severity model integration
# --------------------------------------------------------------------------- #
# Path to the stage-1 project root (the folder containing its own src/).
# Left as None, severity_client.py searches the candidates below.
SEVERITY_MODEL_PATH: Path | None = (
    Path(os.environ["PRIORITY_SEVERITY_MODEL_PATH"]).expanduser()
    if os.getenv("PRIORITY_SEVERITY_MODEL_PATH")
    else None
)

SEVERITY_MODEL_SEARCH_PATHS: list[Path] = [
    PROJECT_ROOT.parent / "maintenance-severity-model",
    PROJECT_ROOT.parent / "severity-model",
    PROJECT_ROOT / "maintenance-severity-model",
]

SEVERITY_MODEL_MODULE: str = "src.predict"
SEVERITY_MODEL_FUNCTION: str = "predict_severity"

# Deliberately no keyword-based fallback classifier. If the severity model is
# unavailable the call fails loudly. Silently substituting a guess would put a
# wrong severity into a safety-relevant priority score, which is worse than an
# error the caller can handle. Callers who already know the severity pass it
# directly via predict_priority(..., severity="Critical").

# --------------------------------------------------------------------------- #
# Validation
# --------------------------------------------------------------------------- #
# Date formats tried in order. %m-%d-%Y is intentionally absent: with %d-%m-%Y
# also present, "03-04-2026" would parse under both and silently pick one.
DATE_FORMATS: list[str] = ["%Y-%m-%d", "%d-%m-%Y", "%d/%m/%Y", "%Y/%m/%d"]

# A due date this far out is almost always a typo. Warned about, not rejected.
MAX_REASONABLE_DAYS: int = 3650

MAX_REASON_DESCRIPTION_CHARS: int = 5000

# --------------------------------------------------------------------------- #
# Logging
# --------------------------------------------------------------------------- #
LOG_LEVEL: str = os.getenv("PRIORITY_LOG_LEVEL", "INFO").upper()
LOG_FORMAT: str = "%(asctime)s | %(levelname)-8s | %(name)-22s | %(message)s"
LOG_DATE_FORMAT: str = "%Y-%m-%d %H:%M:%S"
LOG_FILE_MAX_BYTES: int = 5 * 1024 * 1024
LOG_FILE_BACKUP_COUNT: int = 3

# Append every prediction to logs/predictions.jsonl. In a regulated or
# safety-relevant setting you want to be able to answer "why did request #4712
# get priority Critical on 3 March" months later.
ENABLE_AUDIT_LOG: bool = True
