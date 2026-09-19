"""
severity_client.py
==================
The seam between this project and the stage-1 severity NLP model.

Why this file exists
--------------------
Stage 2 needs a severity label; stage 1 produces one. The naive options are
both bad: copying stage 1's code in means maintaining two divergent copies, and
importing it directly from ten places means every one of them breaks when the
stage-1 layout changes.

So the dependency is confined to this one adapter. It locates the stage-1
project, imports its ``predict_severity`` function, caches it, and hands back a
normalised result. Everything else in this package calls
``get_severity(text)`` and knows nothing about how stage 1 is laid out. If the
NLP model is later replaced by a service call, an LLM or a lookup table, this
is the only file that changes.

Where it looks, in order
------------------------
1. ``PRIORITY_SEVERITY_MODEL_PATH`` environment variable
2. ``config.SEVERITY_MODEL_PATH``
3. ``config.SEVERITY_MODEL_SEARCH_PATHS`` (sibling folders)
4. Already importable on ``sys.path`` (e.g. pip-installed)

No fallback
-----------
There is deliberately no keyword-matching fallback for when the model is
unreachable. A guessed severity would flow into a priority score that someone
uses to schedule safety work, and it would look exactly like a real one. An
error the caller can handle is better. Callers who already know the severity —
a human override, a backfill, a test — pass it directly instead:

    predict_priority(..., severity="Critical")
"""

from __future__ import annotations

import importlib
import sys
from pathlib import Path
from typing import Any, Callable

from src import config
from src.utils import (
    SeverityModelUnavailableError,
    ValidationError,
    get_logger,
    validate_choice,
    validate_text,
)

logger = get_logger(__name__)

_SEVERITY_FN: Callable[..., dict] | None = None
_RESOLVED_PATH: Path | None = None


def _candidate_paths() -> list[Path]:
    candidates: list[Path] = []
    if config.SEVERITY_MODEL_PATH:
        candidates.append(config.SEVERITY_MODEL_PATH)
    candidates.extend(config.SEVERITY_MODEL_SEARCH_PATHS)
    # De-duplicate while preserving order.
    seen: set[Path] = set()
    unique: list[Path] = []
    for path in candidates:
        resolved = path.expanduser().resolve()
        if resolved not in seen:
            seen.add(resolved)
            unique.append(resolved)
    return unique


def _import_isolated(project_path: Path, module_name: str):
    """
    Import ``module_name`` from ``project_path`` even when its top-level package
    name collides with one already imported here.

    The problem this solves is concrete. Both projects lay their code out under
    a package called ``src``. By the time this runs, *our* ``src`` is already in
    ``sys.modules``, so a plain ``importlib.import_module("src.predict")``
    returns **our** predict module — which has no ``predict_severity`` — and the
    failure looks like a missing function rather than a name clash.

    So: stash our ``src.*`` entries, clear them, put the severity project first
    on ``sys.path``, import (its internal ``from src import config`` now
    resolves to its own package), then restore ours. The severity modules stay
    referenced by the imported module object, so they are not re-imported later.

    The one constraint this leaves behind is that the severity model must not
    perform a *lazy* ``import src.x`` after this function returns — by then
    ``src`` means this project again. Stage 1's ``predict_severity`` binds
    everything it needs at module import time, which is why this is safe. If
    that ever stops being true, install the severity project as a real
    distribution with a unique package name (``severity_model.predict``) and
    set ``SEVERITY_MODEL_MODULE`` accordingly — no isolation needed then,
    because there is no collision.
    """
    top_level = module_name.split(".", 1)[0]
    collides = top_level in sys.modules

    if not collides:
        if str(project_path) not in sys.path:
            sys.path.insert(0, str(project_path))
        return importlib.import_module(module_name)

    stashed = {
        name: module
        for name, module in sys.modules.items()
        if name == top_level or name.startswith(top_level + ".")
    }
    original_path = list(sys.path)
    try:
        for name in stashed:
            del sys.modules[name]
        sys.path.insert(0, str(project_path))
        return importlib.import_module(module_name)
    finally:
        for name in list(sys.modules):
            if name == top_level or name.startswith(top_level + "."):
                del sys.modules[name]
        sys.modules.update(stashed)
        sys.path[:] = original_path


def _load_severity_function() -> Callable[..., dict]:
    """
    Locate and import stage 1's ``predict_severity``.

    Raises
    ------
    SeverityModelUnavailableError
        With every path that was tried and what to do about it.
    """
    global _SEVERITY_FN, _RESOLVED_PATH
    if _SEVERITY_FN is not None:
        return _SEVERITY_FN

    tried: list[str] = []

    for path in _candidate_paths():
        module_file = path / Path(config.SEVERITY_MODEL_MODULE.replace(".", "/") + ".py")
        if not module_file.exists():
            tried.append(f"{path} (no {config.SEVERITY_MODEL_MODULE})")
            continue
        try:
            module = _import_isolated(path, config.SEVERITY_MODEL_MODULE)
            _SEVERITY_FN = getattr(module, config.SEVERITY_MODEL_FUNCTION)
            _RESOLVED_PATH = path
            logger.info("Loaded the severity model from %s", path)
            return _SEVERITY_FN
        except Exception as exc:  # noqa: BLE001 - report every failure mode
            tried.append(f"{path} ({type(exc).__name__}: {exc})")

    # Last resort: already importable, e.g. pip-installed under its own name.
    try:
        module = importlib.import_module(config.SEVERITY_MODEL_MODULE)
        _SEVERITY_FN = getattr(module, config.SEVERITY_MODEL_FUNCTION)
        logger.info("Loaded the severity model from sys.path.")
        return _SEVERITY_FN
    except Exception as exc:  # noqa: BLE001
        tried.append(f"sys.path ({type(exc).__name__}: {exc})")

    raise SeverityModelUnavailableError(
        "Could not load the stage-1 severity model.\n"
        "Tried:\n  - " + "\n  - ".join(tried) + "\n\n"
        "Fix it with one of:\n"
        "  export PRIORITY_SEVERITY_MODEL_PATH=/path/to/maintenance-severity-model\n"
        "  set SEVERITY_MODEL_PATH in src/config.py\n"
        "  place the severity project beside this one as ../maintenance-severity-model\n"
        "Or bypass the NLP call entirely by passing the severity yourself:\n"
        "  predict_priority(..., severity='Critical')"
    )


def is_available() -> bool:
    """True if the severity model can be loaded. Never raises — for health checks."""
    try:
        _load_severity_function()
        return True
    except SeverityModelUnavailableError:
        return False


def resolved_path() -> Path | None:
    """Where the severity model was loaded from, once it has been loaded."""
    return _RESOLVED_PATH


def reset() -> None:
    """Drop the cached function so the next call re-resolves. Used by tests."""
    global _SEVERITY_FN, _RESOLVED_PATH
    _SEVERITY_FN = None
    _RESOLVED_PATH = None


def get_severity(reason_description: str) -> dict[str, Any]:
    """
    Predict severity for a maintenance remark by calling stage 1.

    Returns
    -------
    dict
        ``{"severity": str, "confidence": float | None}``. The severity is
        validated against this project's own label set rather than trusted, so
        a stage-1 change that introduces a new label fails here with a clear
        message instead of producing a silently wrong score.

    Raises
    ------
    ValidationError
        Empty input, or stage 1 returned something unusable.
    SeverityModelUnavailableError
        The model could not be loaded.
    """
    text = validate_text(reason_description, "reason_description")
    predict_fn = _load_severity_function()

    try:
        raw = predict_fn(text)
    except Exception as exc:  # noqa: BLE001
        raise SeverityModelUnavailableError(
            f"The severity model raised {type(exc).__name__}: {exc}"
        ) from exc

    if not isinstance(raw, dict) or "severity" not in raw:
        raise ValidationError(
            f"The severity model returned {raw!r}; expected a dict with a "
            f"'severity' key."
        )

    severity = validate_choice(raw["severity"], config.SEVERITY_SCORES, "reason_severity")
    confidence = raw.get("confidence")

    return {
        "severity": severity,
        "confidence": float(confidence) if confidence is not None else None,
    }
