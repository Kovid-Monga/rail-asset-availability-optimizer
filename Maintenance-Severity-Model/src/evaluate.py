"""
evaluate.py
===========
Everything that turns predictions into evidence: classification reports,
confusion matrices (PNG + CSV), per-class metrics and a machine-readable
metrics JSON.

Why this file exists
--------------------
Two separate consumers need it. ``train.py`` calls it at the end of a run to
document the model it just produced. You call it directly, weeks later, to
check whether the deployed model still performs on a fresh batch of labelled
remarks — which is how you decide it is time to retrain. Keeping the reporting
code out of train.py means monitoring does not require re-running training.

    python -m src.evaluate --data data/raw/new_labelled_remarks.csv
"""

from __future__ import annotations

import argparse
from pathlib import Path

import matplotlib

matplotlib.use("Agg")  # headless: this is a backend service, there is no display
import matplotlib.pyplot as plt  # noqa: E402
import numpy as np  # noqa: E402
import pandas as pd  # noqa: E402
from sklearn.metrics import (  # noqa: E402
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_recall_fscore_support,
)

from src import config  # noqa: E402
from src.utils import ensure_dirs, get_logger, save_json, timestamp  # noqa: E402

logger = get_logger(__name__)


# --------------------------------------------------------------------------- #
# Metrics
# --------------------------------------------------------------------------- #
def compute_metrics(
    y_true: list[str] | np.ndarray,
    y_pred: list[str] | np.ndarray,
    labels: list[str] | None = None,
) -> dict:
    """
    Compute headline and per-class metrics.

    ``f1_weighted`` is the model-selection metric required by the spec; macro
    F1 is reported alongside it because it exposes a model that is doing well
    overall while failing on the rare Critical class — which is the failure
    mode that actually matters in a safety context.
    """
    labels = labels or [
        lvl for lvl in config.SEVERITY_LEVELS if lvl in set(y_true) | set(y_pred)
    ]

    precision, recall, f1, support = precision_recall_fscore_support(
        y_true, y_pred, labels=labels, zero_division=0
    )

    return {
        "accuracy": float(accuracy_score(y_true, y_pred)),
        "f1_weighted": float(f1_score(y_true, y_pred, average="weighted", zero_division=0)),
        "f1_macro": float(f1_score(y_true, y_pred, average="macro", zero_division=0)),
        "n_samples": int(len(y_true)),
        "per_class": {
            label: {
                "precision": float(p),
                "recall": float(r),
                "f1": float(f),
                "support": int(s),
            }
            for label, p, r, f, s in zip(
                labels,
                np.atleast_1d(precision),
                np.atleast_1d(recall),
                np.atleast_1d(f1),
                np.atleast_1d(support if support is not None else np.array([], dtype=int)),
            )
        },
    }


def text_report(
    y_true, y_pred, labels: list[str] | None = None, digits: int = 3
) -> str:
    """Human-readable sklearn classification report."""
    labels = labels or [
        lvl for lvl in config.SEVERITY_LEVELS if lvl in set(y_true) | set(y_pred)
    ]
    report = classification_report(
        y_true,
        y_pred,
        labels=labels,
        digits=digits,
        zero_division=0,
        output_dict=False,
    )
    if not isinstance(report, str):
        raise TypeError("classification_report returned a non-text report")
    return report


def confusion_frame(y_true, y_pred, labels: list[str] | None = None) -> pd.DataFrame:
    """Confusion matrix as a labelled DataFrame (rows = true, cols = predicted)."""
    labels = labels or [
        lvl for lvl in config.SEVERITY_LEVELS if lvl in set(y_true) | set(y_pred)
    ]
    matrix = confusion_matrix(y_true, y_pred, labels=labels)
    return pd.DataFrame(
        matrix,
        index=pd.Index(labels, name="true"),
        columns=pd.Index(labels, name="predicted"),
    )


# --------------------------------------------------------------------------- #
# Plotting
# --------------------------------------------------------------------------- #
def plot_confusion_matrix(
    cm: pd.DataFrame,
    output_path: Path,
    title: str = "Severity confusion matrix",
    normalize: bool = False,
) -> Path:
    """
    Render a confusion matrix to PNG.

    Uses matplotlib directly rather than seaborn so the only plotting
    dependency is one already required by scikit-learn users.
    """
    ensure_dirs(output_path.parent)

    data = cm.to_numpy(dtype=float)
    if normalize:
        row_sums = data.sum(axis=1, keepdims=True)
        # Avoid 0/0 for a class with no test examples.
        data = np.divide(data, row_sums, out=np.zeros_like(data), where=row_sums != 0)

    fig, ax = plt.subplots(figsize=(6.0, 5.0), dpi=150)
    im = ax.imshow(data, cmap="Blues", vmin=0, vmax=data.max() if data.max() else 1)

    ax.set_xticks(range(len(cm.columns)), cm.columns, rotation=30, ha="right")
    ax.set_yticks(range(len(cm.index)), cm.index)
    ax.set_xlabel("Predicted severity")
    ax.set_ylabel("True severity")
    ax.set_title(title)

    threshold = data.max() / 2 if data.max() else 0.5
    for i in range(data.shape[0]):
        for j in range(data.shape[1]):
            value = f"{data[i, j]:.2f}" if normalize else f"{int(data[i, j])}"
            ax.text(
                j,
                i,
                value,
                ha="center",
                va="center",
                color="white" if data[i, j] > threshold else "black",
                fontsize=10,
            )

    fig.colorbar(im, ax=ax, shrink=0.8)
    fig.tight_layout()
    fig.savefig(output_path)
    plt.close(fig)

    logger.info("Confusion matrix -> %s", output_path)
    return output_path


# --------------------------------------------------------------------------- #
# Report bundle
# --------------------------------------------------------------------------- #
def save_reports(
    y_true,
    y_pred,
    *,
    prefix: str = "holdout",
    reports_dir: Path | None = None,
    labels: list[str] | None = None,
    extra: dict | None = None,
) -> dict:
    """
    Write the full evidence bundle for one evaluation and return its metrics.

    Produces, under ``reports/``:
      * ``<prefix>_classification_report.txt``
      * ``<prefix>_confusion_matrix.csv``
      * ``<prefix>_confusion_matrix.png``
      * ``<prefix>_confusion_matrix_normalized.png``
      * ``<prefix>_metrics.json``
    """
    reports_dir = reports_dir or config.REPORTS_DIR
    ensure_dirs(reports_dir)

    metrics = compute_metrics(y_true, y_pred, labels=labels)
    if extra:
        metrics.update(extra)

    report_txt = text_report(y_true, y_pred, labels=labels)
    (reports_dir / f"{prefix}_classification_report.txt").write_text(
        f"{prefix} classification report — generated {timestamp()}\n\n{report_txt}\n",
        encoding="utf-8",
    )

    cm = confusion_frame(y_true, y_pred, labels=labels)
    cm.to_csv(reports_dir / f"{prefix}_confusion_matrix.csv")
    plot_confusion_matrix(
        cm,
        reports_dir / f"{prefix}_confusion_matrix.png",
        title=f"Severity confusion matrix ({prefix})",
    )
    plot_confusion_matrix(
        cm,
        reports_dir / f"{prefix}_confusion_matrix_normalized.png",
        title=f"Severity confusion matrix — row-normalised ({prefix})",
        normalize=True,
    )

    save_json(metrics, reports_dir / f"{prefix}_metrics.json")

    logger.info(
        "%s — accuracy %.3f | weighted F1 %.3f | macro F1 %.3f (n=%d)",
        prefix,
        metrics["accuracy"],
        metrics["f1_weighted"],
        metrics["f1_macro"],
        metrics["n_samples"],
    )
    print(f"\n=== {prefix} classification report ===\n{report_txt}")
    print(f"=== {prefix} confusion matrix (rows = true) ===\n{cm}\n")

    return metrics


# --------------------------------------------------------------------------- #
# CLI: score a saved model against a labelled CSV
# --------------------------------------------------------------------------- #
def evaluate_saved_model(data_path: Path | None = None, prefix: str = "evaluation") -> dict:
    """Load the persisted artefacts and score them on a labelled dataset."""
    # Imported here rather than at module scope to avoid a circular import
    # (predict.py does not import evaluate.py, but train.py imports both).
    from src.predict import SeverityPredictor
    from src.utils import load_dataset

    df = load_dataset(data_path)
    predictor = SeverityPredictor()

    y_true = df[config.LABEL_COLUMN].tolist()
    y_pred = [r["severity"] for r in predictor.predict_batch(df[config.TEXT_COLUMN].tolist())]

    return save_reports(
        y_true,
        y_pred,
        prefix=prefix,
        extra={
            "evaluated_at": timestamp(),
            "dataset": str(data_path or config.DEFAULT_DATASET),
            "model_name": predictor.metadata.get("model_name"),
        },
    )


def _main() -> None:
    parser = argparse.ArgumentParser(
        description="Evaluate the saved severity model on a labelled CSV."
    )
    parser.add_argument(
        "--data",
        type=Path,
        default=None,
        help=f"Labelled CSV (default: {config.DEFAULT_DATASET}).",
    )
    parser.add_argument(
        "--prefix", default="evaluation", help="Filename prefix for the reports."
    )
    args = parser.parse_args()

    evaluate_saved_model(args.data, prefix=args.prefix)


if __name__ == "__main__":
    _main()
