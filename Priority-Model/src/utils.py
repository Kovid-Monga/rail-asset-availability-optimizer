"""
utils.py
========
Logging, exception types, input validation and persistence helpers.

Why this file exists
--------------------
Three things in here are load-bearing for a service that will sit behind an API:

1. **Typed exceptions.** A web layer needs to map failures to status codes.
   ``ValidationError`` is a 400, ``SeverityModelUnavailableError`` is a 503,
   ``ModelNotTrainedError`` is a 500. Catching ``ValueError`` and guessing is
   how you end up returning 500 for a user typo.
2. **Validation that returns canonical values.** ``validate_choice`` does not
   just say yes or no — it accepts ``"high"``, ``" HIGH "`` and ``"High"`` and
   returns ``"High"``. Normalising at the boundary means nothing downstream has
   to think about casing.
3. **Logging configured once, to both console and file.** The audit log is
   separate and machine-readable, because "why did request #4712 get priority
   Critical" is a question you will be asked months later.
"""

from __future__ import annotations

import json
import logging
import sys
from datetime import date, datetime
from logging.handlers import RotatingFileHandler
from pathlib import Path
from typing import Any, Iterable, Mapping

import joblib

from src import config


# --------------------------------------------------------------------------- #
# Exceptions
# --------------------------------------------------------------------------- #
class PriorityEngineError(Exception):
    """Base class — catch this to catch anything this package raises."""

    http_status: int = 500


class ValidationError(PriorityEngineError):
    """Caller supplied an invalid value. Maps to HTTP 400."""

    http_status = 400


class DatasetError(PriorityEngineError):
    """Training data is missing or malformed. Maps to HTTP 500."""

    http_status = 500


class ModelNotTrainedError(PriorityEngineError):
    """Artefacts are missing — train.py has not run. Maps to HTTP 500."""

    http_status = 500


class SeverityModelUnavailableError(PriorityEngineError):
    """The stage-1 NLP model could not be reached. Maps to HTTP 503."""

    http_status = 503


class ConfigurationError(PriorityEngineError):
    """The business rules in config.py are internally inconsistent."""

    http_status = 500


# --------------------------------------------------------------------------- #
# Logging
# --------------------------------------------------------------------------- #
_LOGGING_CONFIGURED = False


def setup_logging(force: bool = False) -> None:
    """
    Configure root logging once: stderr + a rotating file in ``logs/``.

    Logs go to stderr rather than stdout so that CLI JSON output stays clean
    and pipeable (``python -m src.predict ... > result.json``).
    """
    global _LOGGING_CONFIGURED
    if _LOGGING_CONFIGURED and not force:
        return

    config.LOGS_DIR.mkdir(parents=True, exist_ok=True)
    formatter = logging.Formatter(config.LOG_FORMAT, datefmt=config.LOG_DATE_FORMAT)

    console = logging.StreamHandler(sys.stderr)
    console.setFormatter(formatter)

    handlers: list[logging.Handler] = [console]
    try:
        file_handler = RotatingFileHandler(
            config.APP_LOG_PATH,
            maxBytes=config.LOG_FILE_MAX_BYTES,
            backupCount=config.LOG_FILE_BACKUP_COUNT,
            encoding="utf-8",
        )
        file_handler.setFormatter(formatter)
        handlers.append(file_handler)
    except OSError as exc:
        # A read-only filesystem must not stop the service from running.
        console.handle(
            logging.LogRecord(
                "utils", logging.WARNING, __file__, 0,
                "File logging disabled (%s): %s", (config.APP_LOG_PATH, exc), None,
            )
        )

    root = logging.getLogger()
    root.handlers.clear()
    for handler in handlers:
        root.addHandler(handler)
    root.setLevel(config.LOG_LEVEL)

    _LOGGING_CONFIGURED = True


def get_logger(name: str) -> logging.Logger:
    setup_logging()
    return logging.getLogger(name)


logger = get_logger(__name__)


def audit_log(record: Mapping[str, Any]) -> None:
    """
    Append one prediction to ``logs/predictions.jsonl``.

    Best-effort by design: an audit-log failure must never break a prediction
    that otherwise succeeded, so failures are logged and swallowed.
    """
    if not config.ENABLE_AUDIT_LOG:
        return
    try:
        config.LOGS_DIR.mkdir(parents=True, exist_ok=True)
        payload = {"logged_at": datetime.now().isoformat(timespec="seconds"), **record}
        with config.AUDIT_LOG_PATH.open("a", encoding="utf-8") as fh:
            fh.write(json.dumps(payload, default=str) + "\n")
    except Exception as exc:  # noqa: BLE001 - deliberately broad
        logger.warning("Could not write to the audit log: %s", exc)


# --------------------------------------------------------------------------- #
# Filesystem / persistence
# --------------------------------------------------------------------------- #
def ensure_dirs(*paths: Path) -> None:
    for path in paths:
        Path(path).mkdir(parents=True, exist_ok=True)


def timestamp() -> str:
    return datetime.now().strftime("%Y%m%d_%H%M%S")


def save_joblib(obj: Any, path: Path) -> None:
    path = Path(path)
    ensure_dirs(path.parent)
    try:
        joblib.dump(obj, path)
    except Exception as exc:
        raise PriorityEngineError(f"Could not write {path}: {exc}") from exc
    logger.debug("Saved %s", path)


def load_joblib(path: Path) -> Any:
    path = Path(path)
    if not path.exists():
        raise ModelNotTrainedError(
            f"Missing artefact {path}. Train the model first:\n    python -m src.train"
        )
    try:
        return joblib.load(path)
    except Exception as exc:
        raise PriorityEngineError(
            f"Could not load {path} ({exc}). The file may be corrupt or was "
            f"written by an incompatible scikit-learn version — retrain to fix."
        ) from exc


def save_json(obj: Any, path: Path) -> None:
    path = Path(path)
    ensure_dirs(path.parent)
    with path.open("w", encoding="utf-8") as fh:
        json.dump(obj, fh, indent=2, ensure_ascii=False, default=str)
    logger.debug("Saved %s", path)


def load_json(path: Path) -> Any:
    path = Path(path)
    if not path.exists():
        raise PriorityEngineError(f"Missing JSON file {path}.")
    with path.open(encoding="utf-8") as fh:
        return json.load(fh)


# --------------------------------------------------------------------------- #
# Input validation
# --------------------------------------------------------------------------- #
def validate_choice(value: Any, allowed: Iterable[str], field: str) -> str:
    """
    Validate a categorical input and return it in canonical casing.

    Accepts any casing and surrounding whitespace; ``"  high "`` becomes
    ``"High"``. Normalising here means no downstream code has to.

    Raises
    ------
    ValidationError
        With the list of accepted values, so an API can return something the
        caller can act on.
    """
    allowed = list(allowed)
    if not isinstance(value, str):
        raise ValidationError(
            f"{field} must be a string, got {type(value).__name__}: {value!r}. "
            f"Accepted values: {allowed}."
        )

    cleaned = value.strip()
    if not cleaned:
        raise ValidationError(f"{field} must not be empty. Accepted values: {allowed}.")

    lookup = {option.lower(): option for option in allowed}
    canonical = lookup.get(cleaned.lower())
    if canonical is None:
        raise ValidationError(
            f"{field} must be one of {allowed}, got {value!r}."
        )
    return canonical


def validate_text(value: Any, field: str, max_chars: int | None = None) -> str:
    """Validate a free-text field and return it stripped."""
    if not isinstance(value, str):
        raise ValidationError(
            f"{field} must be a string, got {type(value).__name__}: {value!r}."
        )
    cleaned = value.strip()
    if not cleaned:
        raise ValidationError(f"{field} must not be empty or whitespace only.")
    limit = max_chars or config.MAX_REASON_DESCRIPTION_CHARS
    if len(cleaned) > limit:
        raise ValidationError(
            f"{field} is {len(cleaned)} characters; the limit is {limit}."
        )
    return cleaned


def parse_date(value: Any, field: str = "due_date") -> date:
    """
    Coerce a date-like input into a ``datetime.date``.

    Accepts ``date``, ``datetime`` and strings in the formats listed in
    ``config.DATE_FORMATS``. Ambiguous US-style ``%m-%d-%Y`` is deliberately not
    supported: with ``%d-%m-%Y`` also accepted, "03-04-2026" would parse under
    both and silently pick one. Send ISO ``YYYY-MM-DD`` from an API.

    Raises
    ------
    ValidationError
        If the value cannot be parsed unambiguously.
    """
    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, date):
        return value
    if not isinstance(value, str):
        raise ValidationError(
            f"{field} must be a date or a string, got {type(value).__name__}: {value!r}."
        )

    cleaned = value.strip()
    if not cleaned:
        raise ValidationError(f"{field} must not be empty.")

    # ISO 8601 first, including datetimes with a time component.
    try:
        return datetime.fromisoformat(cleaned).date()
    except ValueError:
        pass

    for fmt in config.DATE_FORMATS:
        try:
            return datetime.strptime(cleaned, fmt).date()
        except ValueError:
            continue

    raise ValidationError(
        f"{field} {value!r} is not a recognised date. Accepted formats: "
        f"{config.DATE_FORMATS} (ISO 8601 preferred)."
    )
