"""
evaluate.py
===========
Metrics and reports: accuracy, precision, recall, F1, confusion matrix, plus
two diagnostics specific to this project.

Why this file exists
--------------------
Separate from ``train.py`` because it has a second job beyond documenting a
training run: scoring the deployed model against a fresh batch of data months
later, which is how you notice drift. Monitoring should not require rerunning
training.

The two project-specific diagnostics matter more than the standard metrics:

``rule_agreement``
    How often the model's predicted class matches the arithmetic rules. On
    rule-generated data anything below 100% is a model defect, full stop.
    On real data it is the measure of what the model has actually learned
    beyond the rules.

``linear_weight_recovery``
    Fits a plain linear regression of one-hot features against
    ``priority_score``. Because the score is literally a weighted sum of
    one-hot indicators, the recovered coefficients should reproduce the
    business weights to within floating-point error. If they do not, the
    dataset does not encode the documented rules — which is a data problem
    worth catching before any of the classification metrics are believed.
"""

from __future__ import annotations

import argparse
from pathlib import Path

import matplotlib

matplotlib.use("Agg")  # headless service, no display
import matplotlib.pyplot as plt  # noqa: E402
import numpy as np  # noqa: E402
import pandas as pd  # noqa: E402
from sklearn.linear_model import LinearRegression  # noqa: E402
from sklearn.metrics import (  # noqa: E402
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_recall_fscore_support,
    precision_score,
    recall_score,
)
from sklearn.preprocessing import OneHotEncoder  # noqa: E402

from src import config, rules  # noqa: E402
from src.utils import ensure_dirs, get_logger, save_json, timestamp  # noqa: E402

logger = get_logger(__name__)


# --------------------------------------------------------------------------- #
# Core metrics
# --------------------------------------------------------------------------- #
def compute_metrics(y_true, y_pred, labels: list[str] | None = None) -> dict:
    """
    Every metric the brief asks for, plus macro variants.

    Macro averages are reported alongside the weighted ones because the class
    distribution here is severely skewed — only 4 of the 180 possible inputs
    produce a Normal priority. A weighted F1 of 0.99 is compatible with never
    predicting Normal correctly at all; the macro figure exposes that.
    """
    labels = labels or [
        c for c in config.PRIORITY_CLASSES if c in set(y_true) | set(y_pred)
    ]
    precision, recall, f1, support = precision_recall_fscore_support(
        y_true, y_pred, labels=labels, zero_division=0
    )

    return {
        "accuracy": float(accuracy_score(y_true, y_pred)),
        "precision_weighted": float(
            precision_score(y_true, y_pred, average="weighted", zero_division=0)
        ),
        "recall_weighted": float(
            recall_score(y_true, y_pred, average="weighted", zero_division=0)
        ),
        "f1_weighted": float(f1_score(y_true, y_pred, average="weighted", zero_division=0)),
        "precision_macro": float(
            precision_score(y_true, y_pred, average="macro", zero_division=0)
        ),
        "recall_macro": float(
            recall_score(y_true, y_pred, average="macro", zero_division=0)
        ),
        "f1_macro": float(f1_score(y_true, y_pred, average="macro", zero_division=0)),
        "n_samples": int(len(y_true)),
        "per_class": {
            label: {
                "precision": float(p),
                "recall": float(r),
                "f1": float(f),
                "support": int(s),
            }
            for label, p, r, f, s in zip(labels, precision, recall, f1, support)
        },
    }


def text_report(y_true, y_pred, labels: list[str] | None = None) -> str:
    labels = labels or [
        c for c in config.PRIORITY_CLASSES if c in set(y_true) | set(y_pred)
    ]
    return classification_report(y_true, y_pred, labels=labels, digits=3, zero_division=0)


def confusion_frame(y_true, y_pred, labels: list[str] | None = None) -> pd.DataFrame:
    labels = labels or [
        c for c in config.PRIORITY_CLASSES if c in set(y_true) | set(y_pred)
    ]
    return pd.DataFrame(
        confusion_matrix(y_true, y_pred, labels=labels),
        index=pd.Index(labels, name="true"),
        columns=pd.Index(labels, name="predicted"),
    )


def plot_confusion_matrix(
    cm: pd.DataFrame, output_path: Path, title: str, normalize: bool = False
) -> Path:
    """Render a confusion matrix to PNG using matplotlib only."""
    ensure_dirs(output_path.parent)
    data = cm.to_numpy(dtype=float)
    if normalize:
        totals = data.sum(axis=1, keepdims=True)
        data = np.divide(data, totals, out=np.zeros_like(data), where=totals != 0)

    fig, ax = plt.subplots(figsize=(6.0, 5.0), dpi=150)
    im = ax.imshow(data, cmap="Blues", vmin=0, vmax=data.max() if data.max() else 1)
    ax.set_xticks(range(len(cm.columns)), cm.columns, rotation=30, ha="right")
    ax.set_yticks(range(len(cm.index)), cm.index)
    ax.set_xlabel("Predicted priority")
    ax.set_ylabel("True priority")
    ax.set_title(title)

    threshold = data.max() / 2 if data.max() else 0.5
    for i in range(data.shape[0]):
        for j in range(data.shape[1]):
            text = f"{data[i, j]:.2f}" if normalize else f"{int(data[i, j])}"
            ax.text(j, i, text, ha="center", va="center",
                    color="white" if data[i, j] > threshold else "black", fontsize=10)

    fig.colorbar(im, ax=ax, shrink=0.8)
    fig.tight_layout()
    fig.savefig(output_path)
    plt.close(fig)
    logger.info("Confusion matrix -> %s", output_path)
    return output_path


# --------------------------------------------------------------------------- #
# Project-specific diagnostics
# --------------------------------------------------------------------------- #
def rule_agreement(frame: pd.DataFrame, y_pred) -> dict:
    """
    Compare model predictions against the deterministic rules row by row.

    Returns the agreement rate and up to 20 disagreeing rows, so a defect is
    immediately inspectable rather than just a number that looks slightly off.
    """
    expected = [
        rules.classify_score(
            config.ASSET_IMPACT_SCORES[row.asset_impact]
            + config.SEVERITY_SCORES[row.reason_severity]
            + config.TRAFFIC_SCORES[row.traffic]
            + config.DUE_DATE_SCORES[row.due_date_bucket]
        )
        for row in frame.itertuples()
    ]
    predictions = list(y_pred)
    matches = [e == p for e, p in zip(expected, predictions)]
    rate = float(np.mean(matches)) if matches else 0.0

    disagreements = [
        {
            **{f: getattr(row, f) for f in config.CATEGORICAL_FEATURES},
            "rule_class": expected[i],
            "model_class": predictions[i],
        }
        for i, row in enumerate(frame.itertuples())
        if not matches[i]
    ]

    logger.info("Model agrees with the business rules on %.2f%% of rows.", rate * 100)
    if rate < 1.0:
        logger.warning(
            "%d row(s) where the model disagrees with the arithmetic. On "
            "rule-derived data every one of these is a model defect.",
            len(disagreements),
        )
    return {
        "agreement_rate": rate,
        "n_disagreements": len(disagreements),
        "examples": disagreements[:20],
    }


def linear_weight_recovery(frame: pd.DataFrame) -> dict:
    """
    Check that the dataset really encodes the documented business weights.

    The priority score is a linear function of one-hot indicators, so an
    ordinary least-squares fit must recover the weights exactly. Coefficients
    within a one-hot group are only identified up to an additive constant, so
    the comparison is done on *differences from the group minimum*, which are
    identified.

    ``max_absolute_error`` should be ~1e-9. Anything larger means the labels do
    not follow the rules — treat every other metric in the report as suspect
    until that is explained.
    """
    encoder = OneHotEncoder(
        categories=[config.FEATURE_LEVELS[f] for f in config.CATEGORICAL_FEATURES],
        handle_unknown="ignore",
        sparse_output=False,
    )
    X = encoder.fit_transform(frame[config.CATEGORICAL_FEATURES])
    y = frame[config.TARGET_SCORE_COLUMN].to_numpy(dtype=float)

    model = LinearRegression().fit(X, y)
    coefficients = model.coef_

    expected_tables = [
        config.ASSET_IMPACT_SCORES,
        config.SEVERITY_SCORES,
        config.TRAFFIC_SCORES,
        config.DUE_DATE_SCORES,
    ]

    recovered: dict[str, dict[str, float]] = {}
    errors: list[float] = []
    offset = 0
    for field, table in zip(config.CATEGORICAL_FEATURES, expected_tables):
        levels = config.FEATURE_LEVELS[field]
        group = coefficients[offset : offset + len(levels)]
        offset += len(levels)

        # Identified quantity: each level's weight relative to the group's lowest.
        relative_fit = group - group.min()
        expected = np.array([table[level] for level in levels], dtype=float)
        relative_expected = expected - expected.min()

        recovered[field] = {
            level: {
                "expected_relative": float(re),
                "recovered_relative": round(float(rf), 6),
            }
            for level, re, rf in zip(levels, relative_expected, relative_fit)
        }
        errors.extend(np.abs(relative_fit - relative_expected).tolist())

    max_error = float(max(errors)) if errors else 0.0
    r_squared = float(model.score(X, y))

    result = {
        "max_absolute_error": max_error,
        "r_squared": r_squared,
        "weights_recovered_exactly": bool(max_error < 1e-6),
        "recovered_weights": recovered,
    }

    if result["weights_recovered_exactly"]:
        logger.info(
            "Linear recovery check passed: the dataset reproduces the documented "
            "weights exactly (R^2 = %.6f, max error = %.2e).", r_squared, max_error,
        )
    else:
        logger.warning(
            "Linear recovery check FAILED: max weight error %.4f, R^2 %.4f. The "
            "dataset does not follow the documented business rules.",
            max_error, r_squared,
        )
    return result


# --------------------------------------------------------------------------- #
# Report bundle
# --------------------------------------------------------------------------- #
def save_reports(
    y_true,
    y_pred,
    *,
    prefix: str = "holdout",
    frame: pd.DataFrame | None = None,
    reports_dir: Path | None = None,
    extra: dict | None = None,
) -> dict:
    """
    Write the full evidence bundle and return the metrics.

    Produces ``<prefix>_classification_report.txt``,
    ``<prefix>_confusion_matrix.csv`` / ``.png`` / ``_normalized.png`` and
    ``<prefix>_metrics.json`` under ``reports/``.
    """
    reports_dir = reports_dir or config.REPORTS_DIR
    ensure_dirs(reports_dir)

    metrics = compute_metrics(y_true, y_pred)
    if frame is not None:
        metrics["rule_agreement"] = rule_agreement(frame, y_pred)
    if extra:
        metrics.update(extra)

    report = text_report(y_true, y_pred)
    (reports_dir / f"{prefix}_classification_report.txt").write_text(
        f"{prefix} classification report — generated {timestamp()}\n\n{report}\n",
        encoding="utf-8",
    )

    cm = confusion_frame(y_true, y_pred)
    cm.to_csv(reports_dir / f"{prefix}_confusion_matrix.csv")
    plot_confusion_matrix(cm, reports_dir / f"{prefix}_confusion_matrix.png",
                          f"Priority confusion matrix ({prefix})")
    plot_confusion_matrix(cm, reports_dir / f"{prefix}_confusion_matrix_normalized.png",
                          f"Priority confusion matrix — row-normalised ({prefix})",
                          normalize=True)
    save_json(metrics, reports_dir / f"{prefix}_metrics.json")

    logger.info(
        "%s — accuracy %.4f | precision %.4f | recall %.4f | F1 %.4f (macro F1 %.4f, n=%d)",
        prefix, metrics["accuracy"], metrics["precision_weighted"],
        metrics["recall_weighted"], metrics["f1_weighted"], metrics["f1_macro"],
        metrics["n_samples"],
    )
    print(f"\n=== {prefix} classification report ===\n{report}")
    print(f"=== {prefix} confusion matrix (rows = true) ===\n{cm}\n")
    return metrics


# --------------------------------------------------------------------------- #
# CLI
# --------------------------------------------------------------------------- #
def evaluate_saved_model(data_path: Path | None = None, prefix: str = "evaluation") -> dict:
    """Score the persisted pipeline against a labelled dataset."""
    from src.dataset import load_dataset
    from src.predict import get_pipeline

    frame = load_dataset(data_path)
    pipeline = get_pipeline()

    y_true = frame[config.TARGET_CLASS_COLUMN].tolist()
    y_pred = list(pipeline.predict(frame[config.CATEGORICAL_FEATURES]))

    return save_reports(
        y_true, y_pred, prefix=prefix, frame=frame,
        extra={"evaluated_at": timestamp(), "dataset": str(data_path or config.DEFAULT_DATASET)},
    )


def _main() -> None:
    parser = argparse.ArgumentParser(description="Evaluate the saved priority model.")
    parser.add_argument("--data", type=Path, default=None)
    parser.add_argument("--prefix", default="evaluation")
    args = parser.parse_args()
    evaluate_saved_model(args.data, prefix=args.prefix)


if __name__ == "__main__":
    _main()
