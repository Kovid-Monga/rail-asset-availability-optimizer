"""
tests/run_all.py
================
Run every test module in one command, with or without pytest installed::

    python tests/run_all.py

Run this after every retrain and before every deploy.
"""

from __future__ import annotations

import importlib
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from _runner import run_module  # noqa: E402

MODULES = ["test_rules", "test_validation", "test_dataset", "test_predict"]


def main() -> int:
    failures = 0
    for name in MODULES:
        print(f"\n{'=' * 70}\n{name}\n{'=' * 70}")
        failures += run_module(importlib.import_module(name))

    print(f"\n{'=' * 70}")
    print("ALL SUITES PASSED" if failures == 0 else f"{failures} SUITE(S) FAILED")
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
