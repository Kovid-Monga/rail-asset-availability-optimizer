"""
train.py
========
Builds, compares and persists the priority classification pipeline.

    self-check rules -> load data -> split -> cross-validate candidates
    -> select -> refit -> evaluate -> archive previous -> save artefacts

Why this file exists
--------------------
One command, run when the data changes::

    python -m src.train --data data/raw/real_priorities.csv

Everything is packaged as a single ``sklearn.pipeline.Pipeline`` containing the
preprocessing and the classifier together. That is the point of using Pipeline
rather than a bare estimator: the one-hot encoder is fitted on training data
only and travels with the model, so the transform applied at inference is
provably the same one applied during training. A separately-pickled encoder
eventually gets out of sync with its model, and nothing warns you when it does.

Read the README before interpreting the accuracy figure — on rule-derived data,
100% is the expected result and does not mean what it usually means.
"""

from __future__ import annotations

import argparse
import platform
import shutil
import sys
from pathlib import Path

import numpy as np
import sklearn
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder
from sklearn.tree import DecisionTreeClassifier, export_text

from src import config, rules
from src.dataset import load_dataset, write_lookup_table
from src.evaluate import linear_weight_recovery, save_reports
from src.utils import (
    DatasetError,
    ensure_dirs,
    get_logger,
    save_joblib,
    save_json,
    timestamp,
)

logger = get_logger(__name__)


# --------------------------------------------------------------------------- #
# Pipeline construction
# --------------------------------------------------------------------------- #
def build_preprocessor() -> ColumnTransformer:
    """
    One-hot encode the four categorical factors.

    ``categories`` is pinned to the levels declared in ``config.FEATURE_LEVELS``
    rather than inferred from the training data. That guarantees a stable column
    order and, more importantly, means a level that happens to be absent from a
    particular training file still gets its own column instead of silently
    disappearing from the feature space.

    ``handle_unknown="ignore"`` keeps inference alive if a genuinely new level
    ever appears: it encodes as all-zeros rather than raising. The validation
    layer in ``predict.py`` rejects unknown levels before they get this far, so
    this is a second line of defence, not the primary one.
    """
    return ColumnTransformer(
        transformers=[
            (
                "categorical",
                OneHotEncoder(
                    categories=[
                        config.FEATURE_LEVELS[f] for f in config.CATEGORICAL_FEATURES
                    ],
                    handle_unknown="ignore",
                    sparse_output=False,
                ),
                config.CATEGORICAL_FEATURES,
            )
        ],
        remainder="drop",
        verbose_feature_names_out=False,
    )


def get_candidate_models() -> dict[str, object]:
    """
    The candidate classifiers.

    A decision tree leads the list deliberately. The target function is a
    threshold over a sum of table lookups, which a tree can represent exactly,
    and unlike the alternatives its learned logic can be exported as readable
    rules and diffed against the specification. When a model has to justify a
    maintenance priority to an operations team, that matters.
    """
    return {
        "decision_tree": DecisionTreeClassifier(
            random_state=config.RANDOM_SEED, **config.DECISION_TREE_PARAMS
        ),
        "logistic_regression": LogisticRegression(
            random_state=config.RANDOM_SEED, **config.LOGISTIC_REGRESSION_PARAMS
        ),
        "random_forest": RandomForestClassifier(
            random_state=config.RANDOM_SEED, **config.RANDOM_FOREST_PARAMS
        ),
    }


def build_pipeline(model) -> Pipeline:
    """Preprocessing plus classifier as one serialisable object."""
    return Pipeline([("preprocess", build_preprocessor()), ("classifier", model)])


# --------------------------------------------------------------------------- #
# Model comparison
# --------------------------------------------------------------------------- #
def _cv_folds(y) -> int:
    """Fold count the rarest class can support."""
    import pandas as pd

    rarest = int(pd.Series(y).value_counts().min())
    folds = min(config.CV_FOLDS, rarest)
    if folds < config.CV_FOLDS:
        logger.warning(
            "Reducing cross-validation to %d fold(s): the rarest class has only "
            "%d example(s).", folds, rarest,
        )
    return folds


def compare_models(X, y, models: dict[str, object]) -> dict[str, dict]:
    """
    Cross-validate each candidate on the training split.

    Selection happens on cross-validation, never on the hold-out set — using
    the hold-out to choose a model and then to report its score makes the
    reported score optimistic.
    """
    folds = _cv_folds(y)
    results: dict[str, dict] = {}

    for name, model in models.items():
        try:
            if folds >= 2:
                cv = StratifiedKFold(
                    n_splits=folds, shuffle=True, random_state=config.RANDOM_SEED
                )
                scores = cross_val_score(
                    build_pipeline(model), X, y, cv=cv,
                    scoring=config.SELECTION_METRIC, n_jobs=1,
                )
                results[name] = {
                    "cv_folds": folds,
                    "mean_f1_weighted": float(np.mean(scores)),
                    "std_f1_weighted": float(np.std(scores)),
                    "fold_scores": [float(s) for s in scores],
                }
                logger.info(
                    "%-20s CV weighted F1 = %.4f (+/- %.4f)",
                    name, results[name]["mean_f1_weighted"],
                    results[name]["std_f1_weighted"],
                )
            else:
                from sklearn.metrics import f1_score

                pipeline = build_pipeline(model).fit(X, y)
                score = f1_score(y, pipeline.predict(X), average="weighted", zero_division=0)
                results[name] = {
                    "cv_folds": 0,
                    "mean_f1_weighted": float(score),
                    "std_f1_weighted": 0.0,
                    "fold_scores": [],
                    "note": "training-set score, not cross-validated",
                }
                logger.info("%-20s train weighted F1 = %.4f", name, score)
        except Exception as exc:  # noqa: BLE001 - one bad candidate must not abort the run
            logger.error("Skipping %s — it failed during evaluation: %s", name, exc)
            results[name] = {"error": str(exc), "mean_f1_weighted": float("-inf")}

    return results


def select_best(results: dict[str, dict]) -> str:
    """
    Highest weighted F1, with one-standard-error tie-breaking.

    Among candidates within one standard error of the top score, the simplest
    wins. Cross-validation scores are noisy; without this, a marginal and
    meaningless difference can hand production to a 300-tree forest over a
    decision tree that encodes the same logic and can be read by a human.
    """
    usable = {k: v for k, v in results.items() if "error" not in v}
    if not usable:
        raise DatasetError(
            "Every candidate model failed to train. Check the dataset: too few "
            "rows, or only one priority class present."
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
            "One-SE rule: %s (%.4f) is within 1 SE (%.4f) of top scorer %s (%.4f) "
            "and is simpler — selecting it.",
            best, usable[best]["mean_f1_weighted"], standard_error, top, top_score,
        )
    logger.info("Selected %s (weighted F1 = %.4f).", best, usable[best]["mean_f1_weighted"])
    return best


# --------------------------------------------------------------------------- #
# Archiving
# --------------------------------------------------------------------------- #
def archive_current_model() -> Path | None:
    """Copy existing artefacts to ``models/archive/<timestamp>/`` before overwriting."""
    existing = [p for p in (config.MODEL_PATH, config.METADATA_PATH) if p.exists()]
    if not existing:
        return None
    destination = config.ARCHIVE_DIR / timestamp()
    ensure_dirs(destination)
    for path in existing:
        shutil.copy2(path, destination / path.name)
    logger.info("Archived the previous model to %s", destination)
    return destination


# --------------------------------------------------------------------------- #
# Main routine
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

    Returns the metadata written to ``models/metadata.json``.
    """
    ensure_dirs(config.MODELS_DIR, config.REPORTS_DIR, config.LOGS_DIR, config.ARCHIVE_DIR)

    # ---- 0. Verify the rules are self-consistent before trusting anything - #
    rule_health = rules.self_check()
    logger.info(
        "Rule self-check: %d combinations, scores %d-%d, class counts %s",
        rule_health["n_combinations"], rule_health["min_achievable_score"],
        rule_health["max_achievable_score"], rule_health["class_counts"],
    )
    write_lookup_table()

    # ---- 1. Data --------------------------------------------------------- #
    frame = load_dataset(data_path)
    if frame[config.TARGET_CLASS_COLUMN].nunique() < 2:
        raise DatasetError(
            "Need at least two distinct priority classes to train a classifier; "
            f"found {frame[config.TARGET_CLASS_COLUMN].unique().tolist()}."
        )

    # ---- 2. Sanity-check that the labels follow the documented weights ---- #
    recovery = None
    if config.TARGET_SCORE_COLUMN in frame.columns:
        recovery = linear_weight_recovery(frame)
        save_json(recovery, config.REPORTS_DIR / "linear_weight_recovery.json")

    X = frame[config.CATEGORICAL_FEATURES]
    y = frame[config.TARGET_CLASS_COLUMN]

    # ---- 3. Split -------------------------------------------------------- #
    import pandas as pd

    rarest = int(pd.Series(y).value_counts().min())
    can_split = test_size > 0 and rarest >= 2 and rarest / len(y) * test_size * len(y) >= 1

    if can_split:
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=config.RANDOM_SEED, stratify=y
        )
        logger.info("Split: %d train / %d hold-out.", len(X_train), len(X_test))
    else:
        logger.warning("Dataset too small to stratify — training on everything.")
        X_train, y_train = X, y
        X_test, y_test = X.iloc[0:0], y.iloc[0:0]

    # ---- 4. Compare and select ------------------------------------------- #
    models = get_candidate_models()
    if only_models:
        unknown = set(only_models) - set(models)
        if unknown:
            logger.warning("Ignoring unknown model name(s): %s", sorted(unknown))
        models = {k: v for k, v in models.items() if k in only_models}
        if not models:
            raise DatasetError(f"No usable models left after filtering by {only_models}.")

    comparison = compare_models(X_train, y_train, models)
    best_name = select_best(comparison)

    # ---- 5. Refit on the full training split ----------------------------- #
    pipeline = build_pipeline(models[best_name]).fit(X_train, y_train)

    # ---- 6. Hold-out evaluation ------------------------------------------ #
    holdout_metrics = None
    if len(X_test):
        y_pred = pipeline.predict(X_test)
        holdout_metrics = save_reports(
            y_test.tolist(), list(y_pred), prefix="holdout", frame=X_test,
            extra={"model_name": best_name, "trained_at": timestamp()},
        )

    # ---- 7. Exhaustive check against every possible input ---------------- #
    # Cheap and conclusive: there are only 180 inputs, so rather than inferring
    # correctness from a sample, check the entire domain.
    exhaustive = pd.DataFrame(rules.enumerate_all_combinations())
    exhaustive_pred = pipeline.predict(exhaustive[config.CATEGORICAL_FEATURES])
    exhaustive_metrics = save_reports(
        exhaustive[config.TARGET_CLASS_COLUMN].tolist(),
        list(exhaustive_pred),
        prefix="exhaustive_all_combinations",
        frame=exhaustive,
        extra={
            "note": "every one of the 180 possible inputs, scored against the rules",
            "model_name": best_name,
        },
    )

    # ---- 8. Export the tree's logic if that is what won ------------------- #
    if best_name == "decision_tree":
        try:
            feature_names = list(
                pipeline.named_steps["preprocess"].get_feature_names_out()
            )
            tree_text = export_text(
                pipeline.named_steps["classifier"], feature_names=feature_names
            )
            (config.REPORTS_DIR / "decision_tree_rules.txt").write_text(
                tree_text, encoding="utf-8"
            )
            logger.info("Exported the learned tree to reports/decision_tree_rules.txt")
        except Exception as exc:  # noqa: BLE001 - nice-to-have, never fatal
            logger.warning("Could not export the tree: %s", exc)

    # ---- 9. Persist ------------------------------------------------------ #
    archived_to = archive_current_model() if archive else None
    save_joblib(pipeline, config.MODEL_PATH)

    metadata = {
        "model_name": best_name,
        "trained_at": timestamp(),
        "dataset": str(Path(data_path) if data_path else config.DEFAULT_DATASET),
        "n_rows": int(len(frame)),
        "n_train": int(len(X_train)),
        "n_holdout": int(len(X_test)),
        "features": config.CATEGORICAL_FEATURES,
        "feature_levels": config.FEATURE_LEVELS,
        "classes": sorted(set(y)),
        "class_distribution": y.value_counts().to_dict(),
        "business_rules": {
            "asset_impact": config.ASSET_IMPACT_SCORES,
            "reason_severity": config.SEVERITY_SCORES,
            "traffic": config.TRAFFIC_SCORES,
            "due_date": config.DUE_DATE_SCORES,
            "bands": config.PRIORITY_BANDS,
        },
        "rule_self_check": rule_health,
        "linear_weight_recovery": recovery,
        "selection_metric": config.SELECTION_METRIC,
        "model_comparison": comparison,
        "holdout_metrics": holdout_metrics,
        "exhaustive_metrics": {
            k: v for k, v in exhaustive_metrics.items() if k != "per_class"
        },
        "archived_previous_to": str(archived_to) if archived_to else None,
        "versions": {
            "python": sys.version.split()[0],
            "platform": platform.platform(),
            "scikit_learn": sklearn.__version__,
            "numpy": np.__version__,
        },
    }
    save_json(metadata, config.METADATA_PATH)
    save_json(comparison, config.REPORTS_DIR / "model_comparison.json")

    logger.info("Training complete. Artefacts written to %s", config.MODELS_DIR)
    if exhaustive_metrics["accuracy"] < 1.0:
        logger.warning(
            "The model reproduces only %.2f%% of the 180 rule outcomes. Leave "
            "SCORING_MODE on 'rules' until this is 100%%.",
            exhaustive_metrics["accuracy"] * 100,
        )
    return metadata


# --------------------------------------------------------------------------- #
# CLI
# --------------------------------------------------------------------------- #
def _main() -> None:
    parser = argparse.ArgumentParser(
        description="Train the maintenance priority classifier.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument("--data", type=Path, default=None,
                        help=f"Labelled CSV (default: {config.DEFAULT_DATASET}).")
    parser.add_argument("--test-size", type=float, default=config.TEST_SIZE)
    parser.add_argument("--no-archive", action="store_true")
    parser.add_argument("--models", nargs="+", default=None, metavar="NAME",
                        help="Restrict candidates: decision_tree logistic_regression random_forest.")
    args = parser.parse_args()

    try:
        train(args.data, test_size=args.test_size,
              archive=not args.no_archive, only_models=args.models)
    except Exception as exc:
        logger.error("Training failed: %s", exc)
        raise SystemExit(1) from exc


if __name__ == "__main__":
    _main()
