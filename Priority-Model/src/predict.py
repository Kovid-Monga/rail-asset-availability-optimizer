"""
predict.py
==========
The runtime entry point. Everything downstream — a REST layer, a batch job, a
scheduler — imports ``predict_priority`` from here and nothing else.

    from src.predict import predict_priority

    predict_priority(
        asset_impact="High",
        traffic="High",
        due_date="2026-09-19",
        reason_description="Track fracture detected near station",
    )

Why this file exists
--------------------
Three responsibilities that belong together at the boundary, and nowhere else:

**Model caching.** The trained pipeline is loaded once into a module-level
singleton on first use and reused for every subsequent call. That satisfies the
requirement that a restart loads the saved model rather than retraining, and it
means a long-running API process pays the joblib load once rather than per
request. ``reload_pipeline()`` picks up a retrain without a restart.

**Validation at the edge.** Every input is validated and normalised here, so
nothing downstream has to defend itself. ``"high"``, ``" HIGH "`` and ``"High"``
all work; anything else raises ``ValidationError``, which an API layer maps
straight to a 400.

**Audit logging.** Every prediction is appended to ``logs/predictions.jsonl``
with its inputs, its component scores and the model that produced it. Someone
will eventually ask why a particular request was ranked Critical in March.
"""

from __future__ import annotations

import argparse
import json
from datetime import date
from pathlib import Path
from typing import Any, Sequence

import pandas as pd

from src import config, rules, severity_client
from src.utils import (
    PriorityEngineError,
    ValidationError,
    audit_log,
    get_logger,
    load_joblib,
    load_json,
    validate_choice,
)

logger = get_logger(__name__)

_PIPELINE = None
_METADATA: dict[str, Any] | None = None


# --------------------------------------------------------------------------- #
# Model loading
# --------------------------------------------------------------------------- #
def get_pipeline(reload: bool = False):
    """
    Return the trained pipeline, loading it from disk on first use.

    Raises ``ModelNotTrainedError`` if the artefact is missing, with a message
    telling the caller to run ``python -m src.train``.
    """
    global _PIPELINE, _METADATA
    if _PIPELINE is None or reload:
        _PIPELINE = load_joblib(config.MODEL_PATH)
        try:
            _METADATA = load_json(config.METADATA_PATH)
        except Exception:
            logger.warning("No metadata at %s — continuing without it.", config.METADATA_PATH)
            _METADATA = {}
        logger.info(
            "Loaded the priority model (%s, trained %s).",
            (_METADATA or {}).get("model_name", "unknown"),
            (_METADATA or {}).get("trained_at", "unknown date"),
        )
    return _PIPELINE


def reload_pipeline() -> None:
    """Drop the cached pipeline so the next call re-reads from disk."""
    get_pipeline(reload=True)


def get_metadata() -> dict[str, Any]:
    """Training metadata for the loaded model. Useful for a /health endpoint."""
    get_pipeline()
    return dict(_METADATA or {})


def _predict_class_with_model(features: dict[str, str]) -> str:
    """Run one row through the sklearn pipeline."""
    frame = pd.DataFrame([features], columns=config.CATEGORICAL_FEATURES)
    return str(get_pipeline().predict(frame)[0])


# --------------------------------------------------------------------------- #
# Main entry point
# --------------------------------------------------------------------------- #
def predict_priority(
    asset_impact: str,
    traffic: str,
    due_date: str | date,
    reason_description: str | None = None,
    *,
    severity: str | None = None,
    request_date: str | date | None = None,
    scoring_mode: str | None = None,
    return_details: bool = False,
) -> dict[str, Any]:
    """
    Score a maintenance request end to end.

    Parameters
    ----------
    asset_impact, traffic
        ``"High" | "Medium" | "Low"``, any casing.
    due_date
        ``date``, ``datetime`` or a string. ISO ``YYYY-MM-DD`` preferred;
        ``DD-MM-YYYY`` and ``DD/MM/YYYY`` also accepted.
    reason_description
        Free text. Sent to the stage-1 NLP model to obtain a severity.
        Optional only if ``severity`` is supplied instead.
    severity
        Bypass the NLP call with a known severity — for human overrides,
        backfills and tests. When given, ``reason_description`` is not required.
    request_date
        The date urgency is measured from. Defaults to today; pass it
        explicitly for reproducible batch runs and tests.
    scoring_mode
        ``"rules"`` (default) or ``"ml"``. Overrides ``config.SCORING_MODE``
        for this call.
    return_details
        Add confidence, the due-date bucket, the day count, the scoring mode
        and a rules-vs-model comparison to the response.

    Returns
    -------
    dict
        ``predicted_severity``, ``severity_score``, ``asset_impact_score``,
        ``traffic_score``, ``due_date_score``, ``priority_score``,
        ``priority_class`` — and the extras above when ``return_details``.

    Raises
    ------
    ValidationError
        Bad or missing input (HTTP 400).
    SeverityModelUnavailableError
        The stage-1 model could not be reached (HTTP 503).
    ModelNotTrainedError
        ``scoring_mode="ml"`` but no trained artefact exists (HTTP 500).
    """
    mode = (scoring_mode or config.SCORING_MODE).strip().lower()
    if mode not in {"rules", "ml"}:
        raise ValidationError(f"scoring_mode must be 'rules' or 'ml', got {mode!r}.")

    # ---- 1. Validate the directly-supplied factors ----------------------- #
    asset_impact = validate_choice(asset_impact, config.ASSET_IMPACT_SCORES, "asset_impact")
    traffic = validate_choice(traffic, config.TRAFFIC_SCORES, "traffic")

    # ---- 2. Obtain the severity ------------------------------------------ #
    confidence: float | None = None
    if severity is not None:
        # Explicit override: trust it, but still validate the label.
        predicted_severity = validate_choice(
            severity, config.SEVERITY_SCORES, "reason_severity"
        )
        severity_source = "supplied"
    else:
        if reason_description is None:
            raise ValidationError(
                "Provide either reason_description (to be classified by the "
                "severity model) or severity (a known label)."
            )
        result = severity_client.get_severity(reason_description)
        predicted_severity = result["severity"]
        confidence = result["confidence"]
        severity_source = "nlp_model"

    # ---- 3. Apply the business rules ------------------------------------- #
    computed = rules.compute_priority(
        asset_impact=asset_impact,
        reason_severity=predicted_severity,
        traffic=traffic,
        due_date=due_date,
        request_date=request_date,
    )

    rule_class = computed["priority_class"]
    priority_class = rule_class
    agrees = True
    model_class: str | None = None

    # ---- 4. Optionally let the ML model decide the class ------------------ #
    if mode == "ml":
        model_class = _predict_class_with_model(
            {
                "asset_impact": asset_impact,
                "reason_severity": predicted_severity,
                "traffic": traffic,
                "due_date_bucket": computed["due_date_bucket"],
            }
        )
        priority_class = model_class
        agrees = model_class == rule_class
        if not agrees and config.WARN_ON_RULE_DISAGREEMENT:
            logger.warning(
                "Model predicted %s but the rules give %s for "
                "asset=%s severity=%s traffic=%s due=%s (score %d).",
                model_class, rule_class, asset_impact, predicted_severity,
                traffic, computed["due_date_bucket"], computed["priority_score"],
            )

    # ---- 5. Build the response ------------------------------------------- #
    response: dict[str, Any] = {
        "predicted_severity": predicted_severity,
        "severity_score": computed["severity_score"],
        "asset_impact_score": computed["asset_impact_score"],
        "traffic_score": computed["traffic_score"],
        "due_date_score": computed["due_date_score"],
        "priority_score": computed["priority_score"],
        "priority_class": priority_class,
    }

    if return_details:
        response.update(
            {
                "severity_confidence": confidence,
                "severity_source": severity_source,
                "due_date_bucket": computed["due_date_bucket"],
                "days_until_due": computed["days_until_due"],
                "scoring_mode": mode,
                "rule_priority_class": rule_class,
                "model_priority_class": model_class,
                "agrees_with_rules": agrees,
            }
        )

    audit_log(
        {
            "inputs": {
                "asset_impact": asset_impact,
                "traffic": traffic,
                "due_date": str(due_date),
                "request_date": str(request_date) if request_date else None,
                "reason_description": reason_description,
            },
            "severity_source": severity_source,
            "severity_confidence": confidence,
            "scoring_mode": mode,
            "rule_priority_class": rule_class,
            "model_priority_class": model_class,
            **response,
        }
    )

    return response


def predict_priority_batch(
    requests: Sequence[dict[str, Any]], *, return_details: bool = False
) -> list[dict[str, Any]]:
    """
    Score a list of request dicts.

    One failing row does not sink the batch: failures come back as
    ``{"error": ..., "error_type": ..., "index": ...}`` in the same position,
    so a caller scoring a thousand backlog items gets the 999 that worked.
    """
    results: list[dict[str, Any]] = []
    for index, request in enumerate(requests):
        try:
            results.append(predict_priority(**request, return_details=return_details))
        except PriorityEngineError as exc:
            logger.error("Request %d failed: %s", index, exc)
            results.append(
                {"index": index, "error": str(exc), "error_type": type(exc).__name__}
            )
    return results


# --------------------------------------------------------------------------- #
# CLI
# --------------------------------------------------------------------------- #
def _main() -> None:
    parser = argparse.ArgumentParser(
        description="Score a maintenance request.",
        epilog=(
            "Examples:\n"
            "  python -m src.predict --asset-impact High --traffic High \\\n"
            "      --due-date 2026-09-19 --reason 'Track fracture detected'\n"
            "  python -m src.predict --asset-impact Low --traffic Low \\\n"
            "      --due-date 2026-12-01 --severity Minor --details"
        ),
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("--asset-impact", required=True)
    parser.add_argument("--traffic", required=True)
    parser.add_argument("--due-date", required=True)
    parser.add_argument("--reason", help="Free-text reason description.")
    parser.add_argument("--severity", help="Skip the NLP call with a known severity.")
    parser.add_argument("--request-date", help="Defaults to today.")
    parser.add_argument("--mode", choices=["rules", "ml"], default=None)
    parser.add_argument("--details", action="store_true")
    parser.add_argument("--input-csv", type=Path, help="Batch score a CSV of requests.")
    parser.add_argument("--output-csv", type=Path)
    args = parser.parse_args()

    try:
        if args.input_csv:
            frame = pd.read_csv(args.input_csv)
            results = predict_priority_batch(
                frame.to_dict("records"), return_details=args.details
            )
            scored = pd.concat([frame, pd.DataFrame(results)], axis=1)
            if args.output_csv:
                scored.to_csv(args.output_csv, index=False)
                logger.info("Wrote %d scored row(s) to %s", len(scored), args.output_csv)
            else:
                print(scored.to_string(index=False))
            return

        result = predict_priority(
            asset_impact=args.asset_impact,
            traffic=args.traffic,
            due_date=args.due_date,
            reason_description=args.reason,
            severity=args.severity,
            request_date=args.request_date,
            scoring_mode=args.mode,
            return_details=args.details,
        )
        print(json.dumps(result, indent=2, default=str))

    except PriorityEngineError as exc:
        logger.error("%s: %s", type(exc).__name__, exc)
        raise SystemExit(1) from exc


if __name__ == "__main__":
    _main()
