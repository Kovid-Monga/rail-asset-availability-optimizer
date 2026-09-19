# Maintenance Priority Engine (stage 2)

Takes a maintenance request, calls the stage-1 severity NLP model for the
reason description, and returns a 0–100 priority score with its class.

```python
from src.predict import predict_priority

predict_priority(
    asset_impact="High",
    traffic="High",
    due_date="2026-09-19",
    reason_description="Track fracture detected near station",
)
```
```json
{
  "predicted_severity": "Critical",
  "severity_score": 25,
  "asset_impact_score": 30,
  "traffic_score": 25,
  "due_date_score": 17,
  "priority_score": 97,
  "priority_class": "Critical"
}
```

---

## Read this first: what the ML layer can and cannot do here

Stage 1 was a real machine-learning problem. Free text has no closed form, so a
model earns its place.

Stage 2 is different, and it is worth being explicit about why before you read
a single accuracy figure.

**The priority score is fully specified arithmetic.** Four table lookups summed,
then a threshold. There are 3 × 4 × 3 × 5 = **180 possible inputs in total** —
the entire input space fits in a lookup table that this project writes to
`reports/rule_lookup_table.csv`. A function that computes the sum is not 99%
accurate, it is *correct*, and it can be audited line by line when an operations
manager asks why a request was ranked Critical.

So this project builds both, and defaults to the arithmetic:

| | What it is | Default |
|---|---|---|
| `SCORING_MODE = "rules"` | The documented arithmetic, in `rules.py` | ✅ yes |
| `SCORING_MODE = "ml"` | A trained sklearn Pipeline predicting the class | available, off |

The ML pipeline is built exactly as specified — Pipeline, joblib persistence,
auto-load on restart, cross-validated model comparison, the full metric suite.
It scores **1.000** on accuracy, precision, recall and F1, and reproduces all
180 rule outcomes exactly. That number is not an achievement. It means the model
successfully memorised a 180-row lookup table it was handed. A model cannot beat
the rules it was trained on; it can only match them or make mistakes.

**What the ML layer is genuinely for**, and why it is worth keeping:

1. **A correctness harness now.** `reports/exhaustive_all_combinations_*` checks
   the model against every possible input, and `linear_weight_recovery.json`
   proves the training labels reproduce your documented weights to within 6e-14.
   If someone edits a weight in `config.py` and forgets to tell anyone, these
   reports catch it.
2. **A working seat for later.** The moment you have *real* recorded priorities —
   where a supervisor overrode the formula because a section had a festival
   crowd, or a bridge had a pending inspection — the gap between the rules and
   reality becomes learnable. `dataset.py` measures that gap on load and tells
   you how large it is. If agreement is 99%, you do not need a model. If it is
   75%, the 25% is worth learning, and the pipeline is already there.

Everything below assumes you want both. Nothing below hides the above.

---

## Quick start

```bash
cd priority-engine
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Point at the stage-1 severity model (or place it at ../maintenance-severity-model)
export PRIORITY_SEVERITY_MODEL_PATH=/path/to/maintenance-severity-model

python -m src.train                      # generates data, trains, writes reports
python tests/run_all.py                  # 61 tests
python -m src.predict --asset-impact High --traffic High \
    --due-date 2026-09-19 --reason "Track fracture detected"
```

Scoring in `rules` mode needs no trained model at all. Only `--mode ml` does.

---

## Project layout

```
priority-engine/
├── data/
│   ├── priority_training_data.csv    generated from the rules until you supply real data
│   └── raw/                          put the real dataset here
├── models/
│   ├── priority_model.joblib         the fitted sklearn Pipeline
│   ├── metadata.json                 model, dataset, metrics, rule snapshot, versions
│   └── archive/<timestamp>/          previous model, kept on every retrain
├── logs/
│   ├── app.log                       rotating application log
│   └── predictions.jsonl             one JSON line per prediction (audit trail)
├── reports/
│   ├── rule_lookup_table.csv         all 180 combinations — the full specification
│   ├── holdout_*                     classification report, confusion matrices, metrics
│   ├── exhaustive_all_combinations_* the same, over the entire input space
│   ├── linear_weight_recovery.json   proof the data encodes your documented weights
│   ├── decision_tree_rules.txt       the learned logic, as readable text
│   └── model_comparison.json
├── src/
│   ├── config.py, utils.py, rules.py, dataset.py,
│   ├── severity_client.py, train.py, evaluate.py, predict.py
├── tests/
│   ├── test_rules.py, test_validation.py, test_dataset.py, test_predict.py
│   ├── _runner.py, run_all.py
├── requirements.txt
└── README.md
```

### Why each file exists

**`config.py`** — the business rules live here as data, not scattered through
the code. When operations decides Traffic is worth 30 instead of 25, one line
changes and the rule engine, the data generator, the validators, the metadata
snapshot and the reports all follow. Environment variables override the three
things a deployment actually needs to change (`PRIORITY_SEVERITY_MODEL_PATH`,
`PRIORITY_SCORING_MODE`, `PRIORITY_LOG_LEVEL`).

**`utils.py`** — logging, persistence and validation. Three things here are
load-bearing:

- *Typed exceptions with HTTP statuses.* `ValidationError.http_status == 400`,
  `SeverityModelUnavailableError` is 503, `ModelNotTrainedError` is 500. Your API
  layer maps types to codes instead of catching `ValueError` and guessing.
- *Validators that return canonical values.* `validate_choice` accepts `"high"`,
  `" HIGH "` and `"High"` and returns `"High"`. Normalising at the boundary means
  nothing downstream thinks about casing.
- *Logs to stderr, results to stdout*, so `python -m src.predict ... > out.json`
  gives clean JSON.

**`rules.py`** — the specification in executable form, and the source of truth.
Separating it from any model buys three things: the ML training labels are
*generated* from it so they cannot drift apart; the model can be measured
against it; and if the ML layer is disabled or removed the service still works.
`self_check()` validates the constants themselves — that the four weights sum to
100, that the bands tile 0–100 with no gap or overlap — and runs at the start of
every training job.

**`dataset.py`** — generates training data from the rules and validates whatever
you supply. Its most useful function is `_report_rule_agreement`, which measures
how often your data's labels match what the rules would produce. On generated
data that is 100% by construction. On *real* data it is the single most
informative number in this project.

**`severity_client.py`** — the seam to stage 1, and the only file that knows how
stage 1 is laid out. See [Integration](#integration-with-the-stage-1-severity-model)
for the package-name collision it handles.

**`train.py`** — one command, run when the data changes. Everything is packaged
as a single `sklearn.pipeline.Pipeline` containing the one-hot encoder *and* the
classifier, which is the whole point of using Pipeline: the transform applied at
inference is provably the one fitted during training. A separately-pickled
encoder eventually drifts from its model and nothing warns you.

**`evaluate.py`** — the standard metrics plus the two diagnostics that matter
here (rule agreement, linear weight recovery). Separate from training because it
also scores the deployed model against fresh data months later.

**`predict.py`** — the runtime entry point. Caches the pipeline in a
module-level singleton, so a restart loads from disk once and an API process
pays the joblib cost once rather than per request. `reload_pipeline()` picks up
a retrain without a restart.

**`tests/`** — 61 tests across four files. Every band edge (0/34/35/59/60/79/80/100),
every due-date boundary (−1/0/1/2/3/7/8/14/15), the response contract, the
integration seam, and an exhaustive 180-input check of ML mode against the rules.
`pytest tests/` works; so does `python tests/run_all.py` on a box without pytest.

---

## The API

```python
from src.predict import predict_priority, predict_priority_batch, reload_pipeline

# Normal path — the NLP model supplies the severity
predict_priority("High", "High", "2026-09-19",
                 reason_description="Track fracture detected")

# Known severity: human override, backfill, or a test
predict_priority("Low", "Low", "2026-12-01", severity="Minor")

# Reproducible: urgency measured from an explicit request date
predict_priority("High", "Medium", "2026-09-22", severity="Major",
                 request_date="2026-09-17")

# Diagnostics on top of the seven required keys
predict_priority(..., return_details=True)
# adds severity_confidence, severity_source, due_date_bucket, days_until_due,
#      scoring_mode, rule_priority_class, model_priority_class, agrees_with_rules

# Batch: one bad row does not sink the rest
predict_priority_batch([{...}, {...}])
# failures come back as {"index": 1, "error": ..., "error_type": "ValidationError"}
```

### CLI

```bash
python -m src.train                                    # generated data
python -m src.train --data data/raw/real.csv           # real data
python -m src.predict --asset-impact High --traffic High \
    --due-date 2026-09-19 --reason "Track fracture" --details
python -m src.predict --asset-impact Low --traffic Low \
    --due-date 2026-12-01 --severity Minor --mode ml
python -m src.predict --input-csv requests.csv --output-csv scored.csv
python -m src.evaluate --data data/raw/heldout.csv --prefix march_audit
python -m src.dataset --lookup-table                   # write all 180 combinations
```

### Ready for a frontend API

No web framework is included on purpose — keeping FastAPI out means the scoring
logic is equally usable from a batch job or a scheduler. What is here is the
part an API layer needs:

| Exception | HTTP | Cause |
|---|---|---|
| `ValidationError` | 400 | Bad or missing input |
| `SeverityModelUnavailableError` | 503 | Stage-1 model unreachable |
| `ModelNotTrainedError` | 500 | ML mode with no trained artefact |
| `DatasetError` | 500 | Malformed training data |
| `PriorityEngineError` | 500 | Base class — catch-all |

Every exception carries `.http_status`. Responses are plain `str`/`int`, tested
for `json.dumps` compatibility. `get_metadata()` and `severity_client.is_available()`
give you a `/health` endpoint. A thin FastAPI wrapper is about 40 lines.

---

## Integration with the stage-1 severity model

`severity_client.py` locates the stage-1 project in this order: the
`PRIORITY_SEVERITY_MODEL_PATH` environment variable, `config.SEVERITY_MODEL_PATH`,
sibling folders (`../maintenance-severity-model`), then whatever is already
importable.

**A collision you need to know about.** Both projects lay their code out under a
package called `src`. A plain `import_module("src.predict")` from inside this
project returns *this* project's predict module, and the failure looks like a
missing function rather than a name clash — it cost a debugging cycle to find.
`_import_isolated()` handles it: stash our `src.*` entries, clear them, import
with the severity project first on `sys.path` so its internal `from src import
config` resolves to its own package, then restore. The one constraint it leaves
is that stage 1 must not perform a *lazy* `import src.x` after that point;
`predict_severity` binds everything at module import, so it is safe today.

The durable fix, when you have a moment: rename stage 1's package to something
unique (`severity_model`), install it with `pip install -e`, and set
`SEVERITY_MODEL_MODULE = "severity_model.predict"`. The isolation code then
short-circuits because there is no collision. You will also stop seeing two
different modules logging under the same `src.predict` logger name.

**No fallback, deliberately.** If the severity model is unreachable, the call
raises. There is no keyword-matching substitute, because a guessed severity would
flow into a priority score used to schedule safety work and would look exactly
like a real one. Callers who already know the severity pass it directly.

---

## Using your real dataset

Your brief said to use the provided dataset, but none was attached, so
`dataset.py` generates one from the rules and the whole pipeline runs today.
When real data arrives:

```csv
asset_impact,reason_severity,traffic,due_date_bucket,priority_score,priority_class
High,Critical,High,Overdue or Today,100,Critical
```

```bash
python -m src.train --data data/raw/real_priorities.csv
python tests/run_all.py
```

The loader is deliberately forgiving about shape, because real request logs
rarely match a spec exactly:

- `due_date_bucket` may be replaced by `days_until_due` — it is bucketed for you
- `priority_class` may be omitted if `priority_score` is present — it is derived
- Casing and whitespace are normalised; unrecognised values are dropped with a
  warning naming the offending value

**Watch the rule-agreement line in the training log.** It reports how often your
recorded labels match the arithmetic. If it is ~100%, your data confirms the
rules and the ML model has nothing to add — use `SCORING_MODE = "rules"` and
treat the model as a regression test. If it is materially below that, investigate
*before* training: the gap is either genuine business judgement worth learning,
or inconsistent data entry worth fixing. Training on the second teaches the model
to reproduce someone's bad Tuesday.

---

## Results on the generated data

```
decision_tree          CV weighted F1 = 1.0000 (+/- 0.0000)
logistic_regression    CV weighted F1 = 0.9975 (+/- 0.0024)
random_forest          CV weighted F1 = 1.0000 (+/- 0.0000)
Selected: decision_tree
```

Hold-out (n=1000) and exhaustive (all 180 inputs): accuracy, precision, recall
and F1 all **1.000**.

Two selection notes. The **one-standard-error rule** breaks the tie between the
decision tree and the random forest in favour of the simpler model — the same
rule stage 1 uses, and here it hands production to a model whose logic is
exported as readable text in `reports/decision_tree_rules.txt` rather than
spread across 300 trees. And logistic regression's 0.9975 is the interesting
number: a linear model in class space cannot perfectly represent a threshold
over a sum, so it misses a handful of band-edge cases. The tree can.

Again: 1.000 here means the model memorised the lookup table correctly. It is a
correctness check, not evidence of value.

---

## Two things the rules themselves reveal

Both surfaced from `rules.self_check()`, and both are worth a decision from
whoever owns the business rules:

**The Normal band is nearly unreachable.** The lowest achievable score is 25
(Low + Minor + Low + >14 days), so scores 0–24 cannot occur. Only **4 of the 180
combinations** land in Normal at all:

| Score | Asset | Severity | Traffic | Due |
|---|---|---|---|---|
| 25 | Low | Minor | Low | More than 14 days |
| 29 | Low | Minor | Low | 8–14 days |
| 32 | Low | Moderate | Low | More than 14 days |
| 33 | Low | Minor | Low | 3–7 days |

Anything with medium asset impact, or medium traffic, or a due date inside a
week, is at least Moderate. In practice you have a three-band system. If Normal
is meant to be a real bucket — "genuinely can wait" — the 35 threshold wants
raising to around 45.

**The bands are lopsided.** Urgent covers 80 combinations and Moderate 70, so
150 of 180 inputs land in the middle two. If the point of the score is to sort a
backlog, most requests will arrive with the same label and you will be sorting on
the raw score anyway — which is fine, and an argument for surfacing
`priority_score` prominently in the UI rather than just `priority_class`.

Neither is a bug. They are properties of the weights and thresholds as
specified, and easier to change now than after the frontend ships.

---

## Honest limitations

**The training data is generated from the rules.** It proves the pipeline works
and the rules are self-consistent. It is not evidence about real maintenance
requests, and metrics computed on it should not be quoted as model performance
to anyone.

**`predicted_severity` inherits stage 1's uncertainty.** Stage 1's own README
notes its confidence values are uncalibrated and it was trained on a synthetic
sample. A priority score is exactly as reliable as the severity that feeds it,
and a wrong severity moves the score by up to 20 points — more than enough to
cross a band edge. `return_details=True` surfaces `severity_confidence`; route
low-confidence requests to a human before acting on the priority.

**Nothing here models interactions.** The formula is additive by design, so a
Critical remark on a Low-impact asset in Low traffic scores 45 (Moderate) even if
operationally it should be seen today. If that pattern shows up in real
overrides, it is precisely the kind of thing an ML layer could learn — and the
reason this project keeps one wired up.

**Due-date urgency depends on `request_date`.** It defaults to today, which makes
a stored score go stale the moment it is saved. Either recompute on read, or
store `request_date` with the score so it can be recomputed. Scoring a backlog
overnight without pinning `request_date` produces results that quietly differ
from yesterday's.
