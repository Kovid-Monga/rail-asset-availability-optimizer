"""
src package
===========
Makes ``src`` an importable package so absolute imports (``from src import
config``) and ``python -m src.train`` work from any working directory.

Public surface, in order of how often you will touch it:

    from src.predict import predict_priority      # the runtime entry point
    from src.rules import compute_priority        # deterministic scoring
    from src.train import train                   # retraining
"""

__version__ = "1.0.0"

__all__ = ["__version__"]
