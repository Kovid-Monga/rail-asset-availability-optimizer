"""
rules.py
========
The business rules from the specification, in executable form. This module is
the **source of truth** for what a priority score is.

Why this file exists
--------------------
The priority score is defined as an exact arithmetic sum of four table
lookups::

    Priority Score = Asset Impact + Reason Severity + Traffic + Due-Date Urgency

A function that computes that sum is correct by construction: not 99% accurate,
not "accurate on the test set" — correct, every time, and auditable line by
line when someone asks why a request was ranked Critical.

Keeping it in its own module, separate from any model, buys three things:

* The training data for the ML stage is *generated* from these rules, so the
  rules and the labels can never drift apart.
* The ML model can be measured against the rules, which is the only honest way
  to find out whether it has learned them.
* If the ML layer is ever removed, disabled or found wanting, the service still
  works. ``SCORING_MODE = "rules"`` is the default for exactly this reason.

A note on the rule set itself
-----------------------------
There are 3 x 4 x 3 x 5 = **180** possible input combinations in total. The
entire input space fits in a lookup table you could print on one page — see
``reports/rule_lookup_table.csv``, which this module can generate. That fact
drives most of the design decisions in this project; the README explains what
it means for the ML component.
"""

from __future__ import annotations

from datetime import date
from typing import Any

from src import config
from src.utils import ConfigurationError, ValidationError, get_logger, parse_date, validate_choice

logger = get_logger(__name__)


# --------------------------------------------------------------------------- #
# Individual factor scores
# --------------------------------------------------------------------------- #
def asset_impact_score(level: str) -> int:
    """High 30 / Medium 20 / Low 10. Input is case-insensitive."""
    return config.ASSET_IMPACT_SCORES[validate_choice(level, config.ASSET_IMPACT_SCORES, "asset_impact")]


def severity_score(severity: str) -> int:
    """Critical 25 / Major 18 / Moderate 12 / Minor 5."""
    return config.SEVERITY_SCORES[validate_choice(severity, config.SEVERITY_SCORES, "reason_severity")]


def traffic_score(level: str) -> int:
    """High 25 / Medium 15 / Low 5. Sourced from COA data, not the request."""
    return config.TRAFFIC_SCORES[validate_choice(level, config.TRAFFIC_SCORES, "traffic")]


def days_until_due(due: date | str, request_date: date | str | None = None) -> int:
    """
    Whole days from the request date to the due date. Negative means overdue.

    ``request_date`` defaults to today, but is an explicit parameter so that
    tests and back-dated batch runs are reproducible. A scoring function that
    silently depends on ``date.today()`` cannot be unit-tested properly.
    """
    due_parsed = parse_date(due, "due_date")
    base = parse_date(request_date, "request_date") if request_date is not None else date.today()
    delta = (due_parsed - base).days

    if abs(delta) > config.MAX_REASONABLE_DAYS:
        logger.warning(
            "due_date %s is %d days from the request date — check for a typo.",
            due_parsed, delta,
        )
    return delta


def due_date_bucket(days: int) -> str:
    """
    Map a day count to its urgency band label.

    Boundaries follow the spec exactly: <=0 overdue or today, 1-2, 3-7, 8-14,
    then everything beyond 14 days.
    """
    if not isinstance(days, (int, float)) or isinstance(days, bool):
        raise ValidationError(f"days must be a number, got {type(days).__name__}.")
    for upper, label, _ in config.DUE_DATE_BUCKETS:
        if upper is None or days <= upper:
            return label
    return config.DUE_DATE_BUCKETS[-1][1]  # unreachable; defensive


def due_date_score(due: date | str, request_date: date | str | None = None) -> tuple[int, str, int]:
    """
    Score a due date.

    Returns
    -------
    (score, bucket_label, days_until_due)
        The extra two values are returned rather than recomputed by callers,
        because the bucket label is also the ML model's input feature and the
        day count is worth putting in the audit log.
    """
    days = days_until_due(due, request_date)
    bucket = due_date_bucket(days)
    return config.DUE_DATE_SCORES[bucket], bucket, days


# --------------------------------------------------------------------------- #
# Classification
# --------------------------------------------------------------------------- #
def classify_score(score: int | float) -> str:
    """
    Map a 0-100 priority score to its band: Critical / Urgent / Moderate / Normal.

    Raises
    ------
    ValidationError
        If the score falls outside 0-100, which means an upstream factor score
        is wrong rather than the input being unusual.
    """
    if not isinstance(score, (int, float)) or isinstance(score, bool):
        raise ValidationError(f"score must be numeric, got {type(score).__name__}.")
    if not (config.MIN_POSSIBLE_SCORE <= score <= config.MAX_POSSIBLE_SCORE):
        raise ValidationError(
            f"priority score {score} is outside "
            f"{config.MIN_POSSIBLE_SCORE}-{config.MAX_POSSIBLE_SCORE}; the "
            f"factor weights in config.py no longer sum to 100."
        )
    for low, high, label in config.PRIORITY_BANDS:
        if low <= score <= high:
            return label
    raise ConfigurationError(
        f"No priority band covers score {score}. Check PRIORITY_BANDS in config.py."
    )


# --------------------------------------------------------------------------- #
# Full computation
# --------------------------------------------------------------------------- #
def compute_priority(
    asset_impact: str,
    reason_severity: str,
    traffic: str,
    due_date: date | str,
    request_date: date | str | None = None,
) -> dict[str, Any]:
    """
    Apply the full rule set and return every component plus the total.

    This is the deterministic path. Everything it returns is reproducible from
    the inputs and ``config.py`` alone, with no model involved.
    """
    a_score = asset_impact_score(asset_impact)
    s_score = severity_score(reason_severity)
    t_score = traffic_score(traffic)
    d_score, bucket, days = due_date_score(due_date, request_date)

    total = a_score + s_score + t_score + d_score

    return {
        "asset_impact_score": a_score,
        "severity_score": s_score,
        "traffic_score": t_score,
        "due_date_score": d_score,
        "due_date_bucket": bucket,
        "days_until_due": days,
        "priority_score": total,
        "priority_class": classify_score(total),
    }


# --------------------------------------------------------------------------- #
# Self-check and enumeration
# --------------------------------------------------------------------------- #
def self_check() -> dict[str, Any]:
    """
    Verify that the rule constants in config.py are internally consistent.

    Called at the start of training and covered by the tests. It catches the
    kind of edit that would otherwise produce plausible-looking nonsense: a
    weight typo that makes the maximum score 105, or a band edit that leaves a
    gap at 34.5.

    Raises
    ------
    ConfigurationError
        On any inconsistency, with a message naming the specific problem.
    """
    max_weights = (
        max(config.ASSET_IMPACT_SCORES.values())
        + max(config.SEVERITY_SCORES.values())
        + max(config.TRAFFIC_SCORES.values())
        + max(config.DUE_DATE_SCORES.values())
    )
    if max_weights != config.MAX_POSSIBLE_SCORE:
        raise ConfigurationError(
            f"Maximum achievable score is {max_weights}, not "
            f"{config.MAX_POSSIBLE_SCORE}. The four factor weights must sum to 100."
        )

    # Bands must tile 0-100 with no gaps and no overlaps.
    bands = sorted(config.PRIORITY_BANDS, key=lambda b: b[0])
    if bands[0][0] != config.MIN_POSSIBLE_SCORE or bands[-1][1] != config.MAX_POSSIBLE_SCORE:
        raise ConfigurationError("PRIORITY_BANDS must cover 0 through 100 inclusive.")
    for (_, prev_high, prev_label), (next_low, _, next_label) in zip(bands, bands[1:]):
        if next_low != prev_high + 1:
            raise ConfigurationError(
                f"Gap or overlap between the {prev_label} band (ends {prev_high}) "
                f"and the {next_label} band (starts {next_low})."
            )

    combos = enumerate_all_combinations()
    reachable = {row["priority_class"] for row in combos}
    unreachable = sorted(set(config.PRIORITY_CLASSES) - reachable)
    min_score = min(row["priority_score"] for row in combos)

    result = {
        "n_combinations": len(combos),
        "min_achievable_score": min_score,
        "max_achievable_score": max(row["priority_score"] for row in combos),
        "unreachable_classes": unreachable,
        "class_counts": {
            cls: sum(1 for r in combos if r["priority_class"] == cls)
            for cls in config.PRIORITY_CLASSES
        },
    }

    if unreachable:
        logger.warning(
            "No input combination can produce these priority classes: %s. "
            "The band thresholds and the factor weights disagree.",
            unreachable,
        )
    if min_score > config.PRIORITY_BANDS[-1][1]:
        logger.warning(
            "The lowest achievable score is %d, so part of the lowest band is "
            "unreachable by construction.", min_score,
        )
    return result


def enumerate_all_combinations() -> list[dict[str, Any]]:
    """
    Every possible input combination with its rule-derived score and class.

    180 rows. This *is* the complete specification of the priority model, and
    it is what the ML component is asked to learn.
    """
    from itertools import product

    rows: list[dict[str, Any]] = []
    for asset, severity, traffic, bucket in product(
        config.ASSET_IMPACT_SCORES,
        config.SEVERITY_SCORES,
        config.TRAFFIC_SCORES,
        config.DUE_DATE_LABELS,
    ):
        total = (
            config.ASSET_IMPACT_SCORES[asset]
            + config.SEVERITY_SCORES[severity]
            + config.TRAFFIC_SCORES[traffic]
            + config.DUE_DATE_SCORES[bucket]
        )
        rows.append(
            {
                "asset_impact": asset,
                "reason_severity": severity,
                "traffic": traffic,
                "due_date_bucket": bucket,
                "asset_impact_score": config.ASSET_IMPACT_SCORES[asset],
                "severity_score": config.SEVERITY_SCORES[severity],
                "traffic_score": config.TRAFFIC_SCORES[traffic],
                "due_date_score": config.DUE_DATE_SCORES[bucket],
                "priority_score": total,
                "priority_class": classify_score(total),
            }
        )
    return rows
