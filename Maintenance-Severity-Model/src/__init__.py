"""
src package
===========
Marks ``src`` as an importable Python package so every module can use absolute
imports (``from src import config``) and be run as ``python -m src.train``.

Without this file those imports break the moment you run the code from any
directory other than ``src/`` itself.

The public surface is deliberately tiny: everything downstream of this project
should only ever need ``predict_severity``.
"""

__version__ = "1.0.0"

__all__ = ["__version__"]
