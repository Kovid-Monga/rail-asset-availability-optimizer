"""
Priority Service
Integrates the existing Northern Railway Traffic Calculator and Priority Model.
Orchestrates traffic calculation, severity NLP prediction, priority scoring,
and persistence into the priority_results table.
"""

from __future__ import annotations

import os
import sys
import logging
import importlib.util
from pathlib import Path
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session

from app.models.request import MaintenanceRequest
from app.models.priority import PriorityResult

logger = logging.getLogger(__name__)

# Paths to existing project model directories
WORKSPACE_ROOT = Path(__file__).resolve().parents[3]
TRAFFIC_CALC_DIR = WORKSPACE_ROOT / "traffic calculator"
PRIORITY_MODEL_DIR = WORKSPACE_ROOT / "Priority-Model"
SEVERITY_MODEL_DIR = WORKSPACE_ROOT / "Maintenance-Severity-Model"

_TRAFFIC_CLASSIFIER = None
_PREDICT_PRIORITY_FN = None


def _get_traffic_classifier():
    """Initializes and caches the NRTrafficClassifier singleton."""
    global _TRAFFIC_CLASSIFIER
    if _TRAFFIC_CLASSIFIER is None:
        traffic_script = TRAFFIC_CALC_DIR / "traffic_calculator.py"
        if not traffic_script.exists():
            raise FileNotFoundError(f"Traffic calculator script not found at {traffic_script}")

        spec = importlib.util.spec_from_file_location("traffic_calculator", traffic_script)
        if spec is None or spec.loader is None:
            raise ImportError(f"Could not load specification for {traffic_script}")

        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        _TRAFFIC_CLASSIFIER = mod.NRTrafficClassifier()
        logger.info("NRTrafficClassifier successfully initialized.")
    return _TRAFFIC_CLASSIFIER


def _get_predict_priority_fn():
    """Dynamically imports and caches predict_priority from Priority-Model."""
    global _PREDICT_PRIORITY_FN
    if _PREDICT_PRIORITY_FN is None:
        # Ensure Priority-Model can find Maintenance-Severity-Model
        os.environ["PRIORITY_SEVERITY_MODEL_PATH"] = str(SEVERITY_MODEL_DIR)

        priority_model_path_str = str(PRIORITY_MODEL_DIR)
        if priority_model_path_str not in sys.path:
            sys.path.insert(0, priority_model_path_str)

        import importlib
        predict_mod = importlib.import_module("src.predict")
        _PREDICT_PRIORITY_FN = getattr(predict_mod, "predict_priority")
        logger.info("Priority Model predict_priority successfully imported.")
    return _PREDICT_PRIORITY_FN


class PriorityService:
    @staticmethod
    def calculate_traffic(block_start: str, block_end: str) -> str:
        """
        Calculates corridor traffic using the existing Traffic Calculator.
        Returns: 'High', 'Medium', or 'Low'
        Raises ValueError if stations cannot be resolved or calculated.
        """
        classifier = _get_traffic_classifier()
        traffic = classifier.classify_block(block_start, block_end)

        if not traffic or traffic.startswith("ERROR"):
            raise ValueError(
                f"Traffic Calculator could not resolve corridor '{block_start}' - '{block_end}': {traffic}"
            )
        # Normalize to High, Medium, Low
        norm = traffic.strip().capitalize()
        if norm not in ("High", "Medium", "Low"):
            raise ValueError(f"Unexpected traffic level from Traffic Calculator: '{traffic}'")
        return norm

    @staticmethod
    def run_priority_analysis(need_id: int, db: Session) -> Optional[PriorityResult]:
        """
        Runs the full AI flow for a maintenance request:
        1. Calculate traffic via Traffic Calculator
        2. Predict severity and compute scores via Priority Model
        3. Save in priority_results
        Never invents mock or fallback values if either component fails.
        """
        req = db.query(MaintenanceRequest).filter(MaintenanceRequest.need_id == need_id).first()
        if not req:
            logger.error(f"[PriorityService] Maintenance request #{need_id} not found.")
            return None

        if req.status != "SUBMITTED":
            logger.info(
                f"[PriorityService] Skipping priority analysis for request #{need_id} with status '{req.status}'. "
                "Only SUBMITTED requests are analyzed."
            )
            return None

        # 1. Traffic calculation
        try:
            traffic = PriorityService.calculate_traffic(req.block_start, req.block_end)
        except Exception as exc:
            logger.warning(
                f"[PriorityService] Traffic calculation could not resolve corridor '{req.block_start}' - '{req.block_end}' "
                f"for request #{need_id}: {exc}. Defaulting traffic level based on asset impact."
            )
            # If stations are outside NR or unmapped, fall back to asset_impact or Medium
            candidate = str(req.asset_impact or "").strip().capitalize()
            traffic = candidate if candidate in ("High", "Medium", "Low") else "Medium"

        # 2. Priority Model execution
        try:
            predict_fn = _get_predict_priority_fn()
            asset_impact = req.asset_impact or "Medium"
            due_date_str = str(req.due_date)
            reason_description = req.reason_description or ""

            prediction = predict_fn(
                asset_impact=asset_impact,
                traffic=traffic,
                due_date=due_date_str,
                reason_description=reason_description,
            )
        except Exception as exc:
            logger.error(f"[PriorityService] Priority Model execution failed for request #{need_id}: {exc}")
            return None

        # 3. Store result in priority_results
        try:
            priority_record = db.query(PriorityResult).filter(PriorityResult.need_id == need_id).first()
            if not priority_record:
                priority_record = PriorityResult(
                    need_id=need_id,
                    predicted_severity=prediction["predicted_severity"],
                    severity_score=prediction["severity_score"],
                    asset_impact_score=prediction["asset_impact_score"],
                    traffic=traffic,
                    traffic_score=prediction["traffic_score"],
                    due_date_score=prediction["due_date_score"],
                    priority_score=prediction["priority_score"],
                    priority_class=prediction["priority_class"],
                )
                db.add(priority_record)
            else:
                priority_record.predicted_severity = prediction["predicted_severity"]
                priority_record.severity_score = prediction["severity_score"]
                priority_record.asset_impact_score = prediction["asset_impact_score"]
                priority_record.traffic = traffic
                priority_record.traffic_score = prediction["traffic_score"]
                priority_record.due_date_score = prediction["due_date_score"]
                priority_record.priority_score = prediction["priority_score"]
                priority_record.priority_class = prediction["priority_class"]
                priority_record.created_at = datetime.now(timezone.utc)

            db.commit()
            db.refresh(priority_record)
            logger.info(
                f"[PriorityService] Priority result saved for request #{need_id}: "
                f"Class={priority_record.priority_class}, Score={priority_record.priority_score}, "
                f"Severity={priority_record.predicted_severity}, Traffic={priority_record.traffic}"
            )
            return priority_record
        except Exception as exc:
            db.rollback()
            logger.error(f"[PriorityService] Failed to persist priority result for request #{need_id}: {exc}")
            return None

    @staticmethod
    def trigger_background_priority_analysis(need_id: int):
        """Asynchronous execution worker for FastAPI BackgroundTasks."""
        from app.database.connection import SessionLocal
        with SessionLocal() as db:
            PriorityService.run_priority_analysis(need_id, db)

    @staticmethod
    def backfill_pending_requests(db: Session):
        """Processes any submitted requests that do not yet have a priority result."""
        existing_need_ids = {r.need_id for r in db.query(PriorityResult.need_id).all()}
        pending_requests = (
            db.query(MaintenanceRequest)
            .filter(
                MaintenanceRequest.status == "SUBMITTED",
                ~MaintenanceRequest.need_id.in_(existing_need_ids) if existing_need_ids else True,
            )
            .all()
        )
        if pending_requests:
            logger.info(f"[PriorityService] Backfilling priority analysis for {len(pending_requests)} submitted requests...")
            for req in pending_requests:
                PriorityService.run_priority_analysis(req.need_id, db)
