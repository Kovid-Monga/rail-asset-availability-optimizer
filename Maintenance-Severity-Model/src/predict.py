"""
predict.py
==========
The inference surface of the project — the only module the rest of your
maintenance-prioritisation system needs to import.

    from src.predict import predict_severity

    predict_severity("Track fracture detected near station causing immediate operational risk")
    # {"severity": "Critical", "score": 25, "confidence": 0.94}

Why this file exists
--------------------
Training and inference have completely different lifecycles. Training runs
occasionally, is slow, and needs pandas/matplotlib. Inference runs on every
maintenance request, must be fast, and should load the model once rather than
per call. ``SeverityPredictor`` caches the artefacts in a module-level
singleton so a long-running service pays the joblib load exactly once.
"""

from __future__ import annotations

import argparse
from pathlib import Path
from typing import Any, Iterable, Sequence

import numpy as np

from src import config
from src.preprocess import clean_text
from src.utils import (
    InvalidInputError,
    ModelNotTrainedError,
    get_logger,
    load_joblib,
    load_json,
    severity_to_score,
)

logger = get_logger(__name__)


class SeverityPredictor:
    """
    Loads the trained artefacts and scores maintenance remarks.

    Instantiate directly if you need two models side by side (e.g. comparing a
    candidate against production); otherwise use the module-level
    :func:`predict_severity`, which shares one cached instance.
    """

    def __init__(
        self,
        model_path: Path = config.MODEL_PATH,
        vectorizer_path: Path = config.VECTORIZER_PATH,
        label_encoder_path: Path = config.LABEL_ENCODER_PATH,
        metadata_path: Path = config.METADATA_PATH,
    ) -> None:
        self.model = load_joblib(model_path)
        if not hasattr(self.model, "multi_class"):
            self.model.multi_class = "auto"
        self.vectorizer = load_joblib(vectorizer_path)
        self.label_encoder = load_joblib(label_encoder_path)

        # Metadata is informational; a missing file must not break inference.
        try:
            self.metadata: dict[str, Any] = load_json(metadata_path)
        except Exception:
            logger.warning("No metadata at %s — continuing without it.", metadata_path)
            self.metadata = {}

        # Cast away numpy.str_: callers serialising to JSON or comparing with
        # `is` should get plain Python strings, not numpy scalars.
        self.classes: list[str] = [str(c) for c in self.label_encoder.classes_]
        self._supports_proba = hasattr(self.model, "predict_proba")
        if not self._supports_proba:
            logger.warning(
                "%s does not expose predict_proba; confidence will fall back to "
                "a decision-function softmax.",
                type(self.model).__name__,
            )

        logger.info(
            "Loaded %s trained on %s (%s).",
            self.metadata.get("model_name", type(self.model).__name__),
            self.metadata.get("dataset", "unknown dataset"),
            self.metadata.get("trained_at", "unknown date"),
        )

    # -- internals ---------------------------------------------------------
    def _probabilities(self, matrix) -> np.ndarray:
        """Return an (n_samples, n_classes) probability array for any estimator."""
        if self._supports_proba:
            return np.asarray(self.model.predict_proba(matrix))

        scores = np.asarray(self.model.decision_function(matrix))
        if scores.ndim == 1:  # binary case
            scores = np.column_stack([-scores, scores])
        # Softmax with max-subtraction for numerical stability.
        shifted = scores - scores.max(axis=1, keepdims=True)
        exp = np.exp(shifted)
        return exp / exp.sum(axis=1, keepdims=True)

    def _format(self, probabilities: np.ndarray, *, return_details: bool, raw: str) -> dict:
        index = int(np.argmax(probabilities))
        severity = self.classes[index]
        confidence = round(float(probabilities[index]), 4)

        result = {
            "severity": severity,
            "score": severity_to_score(severity),
            "confidence": confidence,
        }

        if confidence < config.LOW_CONFIDENCE_THRESHOLD:
            logger.debug(
                "Low confidence (%.2f) on: %s", confidence, raw[:80]
            )

        if return_details:
            result["probabilities"] = {
                cls: round(float(p), 4)
                for cls, p in sorted(
                    zip(self.classes, probabilities), key=lambda kv: -kv[1]
                )
            }
            result["low_confidence"] = confidence < config.LOW_CONFIDENCE_THRESHOLD
            result["model_name"] = self.metadata.get(
                "model_name", type(self.model).__name__
            )
            result["cleaned_text"] = clean_text(raw)

        return result

    # -- public API --------------------------------------------------------
    def predict(self, text: str, *, return_details: bool = False) -> dict:
        """
        Predict the severity of a single maintenance remark.

        Returns
        -------
        dict
            ``{"severity": str, "score": int, "confidence": float}``.
            With ``return_details=True`` it also carries the full probability
            distribution, a ``low_confidence`` flag, the model name and the
            cleaned text — useful for debugging and for review queues.

        Raises
        ------
        InvalidInputError
            If ``text`` is not a non-empty string.
        """
        if not isinstance(text, str) or not text.strip():
            raise InvalidInputError(
                "predict expects a non-empty string; got "
                f"{type(text).__name__}: {text!r}"
            )

        cleaned = clean_text(text)
        if not cleaned:
            # Nothing survived cleaning. The model still returns its prior,
            # which is deterministic, but the caller deserves a warning.
            logger.warning(
                "Remark contained no usable words after cleaning: %r", text[:80]
            )

        matrix = self.vectorizer.transform([cleaned])
        probabilities = self._probabilities(matrix)[0]
        return self._format(probabilities, return_details=return_details, raw=text)

    def predict_batch(
        self, texts: Sequence[str], *, return_details: bool = False
    ) -> list[dict]:
        """
        Score many remarks in one vectorised pass.

        Far faster than calling :meth:`predict` in a loop — use this when
        scoring a backlog of maintenance requests.
        """
        if not isinstance(texts, (list, tuple, np.ndarray)):
            texts = list(texts)
        if len(texts) == 0:
            return []

        cleaned: list[str] = []
        for i, text in enumerate(texts):
            if not isinstance(text, str) or not text.strip():
                raise InvalidInputError(
                    f"Item {i} is not a non-empty string: {text!r}"
                )
            cleaned.append(clean_text(text))

        matrix = self.vectorizer.transform(cleaned)
        all_probabilities = self._probabilities(matrix)
        return [
            self._format(p, return_details=return_details, raw=raw)
            for p, raw in zip(all_probabilities, texts)
        ]


# --------------------------------------------------------------------------- #
# Module-level cached predictor
# --------------------------------------------------------------------------- #
_PREDICTOR: SeverityPredictor | None = None


def get_predictor(reload: bool = False) -> SeverityPredictor:
    """
    Return the shared predictor, loading it on first use.

    Call with ``reload=True`` after a retrain so a long-running process picks
    up the new artefacts without a restart.
    """
    global _PREDICTOR
    if _PREDICTOR is None or reload:
        _PREDICTOR = SeverityPredictor()
    return _PREDICTOR


def predict_severity(text: str, *, return_details: bool = False) -> dict:
    """
    Predict severity for one maintenance remark. The project's main entry point.

    Example
    -------
    >>> predict_severity("Track fracture detected near station causing immediate operational risk")
    {'severity': 'Critical', 'score': 25, 'confidence': 0.94}
    """
    return get_predictor().predict(text, return_details=return_details)


def predict_batch(texts: Iterable[str], *, return_details: bool = False) -> list[dict]:
    """Batch version of :func:`predict_severity`."""
    return get_predictor().predict_batch(list(texts), return_details=return_details)


# --------------------------------------------------------------------------- #
# CLI
# --------------------------------------------------------------------------- #
def _main() -> None:
    import json

    parser = argparse.ArgumentParser(
        description="Predict maintenance-remark severity.",
        epilog=(
            'Examples:\n'
            '  python -m src.predict --text "Track fracture detected"\n'
            "  python -m src.predict --input-csv requests.csv --output-csv scored.csv"
        ),
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("--text", help="A single maintenance remark.")
    parser.add_argument(
        "--input-csv",
        type=Path,
        help=f"CSV with a '{config.TEXT_COLUMN}' column to score in bulk.",
    )
    parser.add_argument(
        "--output-csv", type=Path, help="Where to write the scored CSV."
    )
    parser.add_argument(
        "--details", action="store_true", help="Include the full probability breakdown."
    )
    args = parser.parse_args()

    try:
        if args.text:
            print(json.dumps(predict_severity(args.text, return_details=args.details), indent=2))

        if args.input_csv:
            import pandas as pd

            from src.utils import load_dataset

            df = load_dataset(args.input_csv, require_labels=False)
            results = predict_batch(
                df[config.TEXT_COLUMN].tolist(), return_details=args.details
            )
            scored = pd.concat([df, pd.DataFrame(results)], axis=1)

            if args.output_csv:
                scored.to_csv(args.output_csv, index=False)
                logger.info("Wrote %d scored row(s) to %s", len(scored), args.output_csv)
            else:
                print(scored.to_string(index=False))

        if not args.text and not args.input_csv:
            parser.print_help()

    except ModelNotTrainedError as exc:
        logger.error("%s", exc)
        raise SystemExit(1) from exc
    except InvalidInputError as exc:
        logger.error("Bad input: %s", exc)
        raise SystemExit(2) from exc


if __name__ == "__main__":
    _main()
