"""
tests/_runner.py
================
A 30-line stand-in for pytest.

Why this file exists
--------------------
The test files are written as plain ``test_*`` functions with ``assert``
statements, so ``pytest tests/ -v`` runs them normally. This runner lets the
exact same files run on a machine where pytest is not installed — which is the
situation on a locked-down deployment box, and exactly where you most want to
verify that a retrained model still behaves.
"""

from __future__ import annotations

import sys
import traceback
from pathlib import Path
from types import ModuleType

# Make `src` importable when a test file is run directly.
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))


def run_module(module: ModuleType, verbose: bool = True) -> int:
    """Run every ``test_*`` callable in a module. Returns a process exit code."""
    tests = [
        (name, fn)
        for name, fn in sorted(vars(module).items())
        if name.startswith("test_") and callable(fn)
    ]

    failures = 0
    for name, fn in tests:
        try:
            fn()
            if verbose:
                print(f"PASS  {name}")
        except Exception as exc:  # noqa: BLE001 - a test runner catches everything
            failures += 1
            print(f"FAIL  {name}: {type(exc).__name__}: {exc}")
            if verbose:
                traceback.print_exc(limit=3)

    print(f"\n{len(tests) - failures}/{len(tests)} passed in {module.__name__}")
    return 1 if failures else 0
