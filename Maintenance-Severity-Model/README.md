# Maintenance Remark Severity Classifier

Backend NLP component for a maintenance prioritisation system. It takes a
free-text maintenance remark and returns the **Reason Severity** term of the
priority formula.

```python
from src.predict import predict_severity

predict_severity("Track fracture detected near station causing immediate operational risk")
# {'severity': 'Critical', 'score': 25, 'confidence': 0.6442}
```

| Severity | Points (out of 25) |
|----------|--------------------|
| Critical | 25 |
| Major    | 18 |
| Moderate | 12 |
| Minor    | 5  |

**Scope.** This is the ML component only — no API server, no UI, no dashboard.
It is a library you import, plus CLIs for training, evaluating and batch
scoring. The other three priority factors (Asset Impact, Traffic, Due Date) are
deterministic lookups from your spec and do not need a model; see
[Where this fits](#where-this-fits-in-the-priority-score) at the end.

---

## Quick start

```bash
cd project
python -m venv .venv && source .venv/bin/activate     # Windows: .venv\Scripts\activate
pip install -r requirements.txt

python -m src.train                    # trains on the bundled sample data
python -m src.predict --text "Points not locking, trains held at home signal"
python tests/test_pipeline.py          # 11 smoke tests
```

The repository ships with a model already trained on the sample data, so
`predict` works before you run `train`.

---

## Project layout

```
project/
├── data/
│   ├── sample_severity_dataset.csv     120 demo remarks (30 per class)
│   └── raw/                            put the real dataset here
├── models/
│   ├── model.joblib                    the selected classifier
│   ├── vectorizer.joblib               the fitted TF-IDF vectorizer
│   ├── label_encoder.joblib            severity string <-> integer mapping
│   ├── metadata.json                   what was trained, when, on what, how well
│   └── archive/<timestamp>/            the previous model, kept on every retrain
├── reports/                            classification reports + confusion matrices
├── src/
│   ├── __init__.py
│   ├── config.py
│   ├── utils.py
│   ├── preprocess.py
│   ├── train.py
│   ├── evaluate.py
│   └── predict.py
├── tests/test_pipeline.py
├── requirements.txt
└── README.md
```

### Why each file exists

**`src/config.py`** — every path, column name, label, threshold and
hyper-parameter, in one place. Nothing elsewhere hard-codes any of them. This
is what makes swapping in the real dataset a configuration change rather than a
code change. Read this file first; it is the map of the project.

**`src/utils.py`** — logging, filesystem handling, joblib/JSON persistence, the
project's exception types, and `load_dataset()`. That last one does the work
people usually skip: it checks the columns exist, drops blank rows, normalises
label casing so `critical` and `CRITICAL` both work, removes exact duplicate
remarks, discards rows with labels outside the four severities, and warns when
a class is too small to learn from. It lives here rather than in `train.py` so
that training, evaluation and batch prediction all validate input identically —
otherwise a malformed CSV surfaces as a confusing stack trace three steps later.

**`src/preprocess.py`** — the four required cleaning stages: lowercasing,
punctuation removal, stopword removal, lemmatisation. Its real job is
**guaranteeing train/inference parity**. If training lemmatised and prediction
did not, every production prediction would be computed on features the model
never saw and accuracy would collapse silently. `train.py` and `predict.py`
both import the same `clean_text`, so that class of bug is impossible.

Two decisions in here are deliberate and worth knowing about:

- **Negations are kept.** NLTK's default English stopword list deletes `not`,
  `no`, `off`, `down`, `under` and `against`. In maintenance text those words
  *are* the signal — "points not locking" and "points locking" mean opposite
  things. The curated list in this file keeps them.
- **NLTK is optional.** WordNet lemmatisation is used when available; otherwise
  a conservative rule-based lemmatiser takes over automatically. The pipeline
  therefore runs on an air-gapped machine with no downloads.

**`src/train.py`** — the whole pipeline end to end: load → clean → split → fit
TF-IDF → cross-validate candidates → select → refit → evaluate → archive the
old model → save artefacts, metadata and reports. This is the one command you
run when new labelled data arrives.

**`src/evaluate.py`** — metrics, classification reports and confusion matrices
(PNG + CSV + JSON). Deliberately separate from training, because it has a
second job: scoring the deployed model against a fresh batch of labelled
remarks weeks later, which is how you decide it is time to retrain. Monitoring
should not require re-running training.

**`src/predict.py`** — the inference surface, and the only module the rest of
your prioritisation system needs to import. Training and inference have
different lifecycles: training is slow and occasional, inference runs on every
maintenance request and must be fast. `SeverityPredictor` caches the artefacts
in a module-level singleton, so a long-running service pays the joblib load
once rather than per call.

**`src/__init__.py`** — makes `src` a package so absolute imports
(`from src import config`) and `python -m src.train` work from any directory.
Without it the code breaks the moment you run it from somewhere other than
`src/`.

**`tests/test_pipeline.py`** — the dangerous failure in an ML component is not
a crash, it is a silent regression. These 11 tests pin the contract: output
shape, output types, train/predict cleaning parity, error behaviour. Run them
after every retrain.

**`requirements.txt`** — lower bounds rather than exact pins, since this
component has to sit inside a larger service without forcing a downgrade on it.
Pin exactly (`==`) in your deployment image. `nltk` and `xgboost` are both
optional; the code degrades gracefully if either is missing.

---

## The API

```python
from src.predict import predict_severity, predict_batch, get_predictor

predict_severity("Signal malfunction causing repeated train delays")
# {'severity': 'Major', 'score': 18, 'confidence': 0.664}

# Full probability distribution, for review queues and debugging
predict_severity("Loose fittings found", return_details=True)
# {'severity': 'Moderate', 'score': 12, 'confidence': 0.642,
#  'probabilities': {'Moderate': 0.642, 'Minor': 0.19, 'Major': 0.11, 'Critical': 0.058},
#  'low_confidence': False, 'model_name': 'logistic_regression',
#  'cleaned_text': 'loose fitting find'}

# Vectorised — far faster than looping predict_severity over a backlog
predict_batch(["Broken rail traffic suspended", "Routine greasing of joints"])

get_predictor(reload=True)   # pick up a retrained model without restarting
```

Errors are typed, so callers can handle them precisely:
`InvalidInputError` (not a usable string), `ModelNotTrainedError` (artefacts
missing — the message tells you to run `python -m src.train`), `DatasetError`
(bad CSV), all subclassing `MaintenanceMLError`.

### CLI

```bash
python -m src.train                                    # sample data
python -m src.train --data data/raw/real_remarks.csv   # real data
python -m src.train --models logistic_regression       # restrict candidates
python -m src.train --no-archive                       # skip the backup copy

python -m src.predict --text "Broken rail on main line"
python -m src.predict --text "..." --details
python -m src.predict --input-csv requests.csv --output-csv scored.csv

python -m src.evaluate --data data/raw/heldout.csv --prefix march_audit
python -m src.preprocess --demo                        # see cleaning before/after
python -m src.preprocess --setup                       # fetch WordNet (optional)
```

Logs go to stderr and results to stdout, so
`python -m src.predict --text "..." > out.json` gives a clean JSON file.

---

## Plugging in the real dataset

This is the part the whole design is built around. When your labelled data
arrives:

1. Save it as CSV with these two columns:

   ```csv
   reason_description,severity
   "Track fracture detected",Critical
   "Signal failure causing delays",Major
   "Loose fitting found",Moderate
   "Preventive lubrication",Minor
   ```

2. Drop it in `data/raw/`.

3. Retrain:

   ```bash
   python -m src.train --data data/raw/maintenance_remarks.csv
   python tests/test_pipeline.py
   ```

That is the entire procedure. No code changes. The previous model is copied to
`models/archive/<timestamp>/` first, so a retrain on a bad batch of labels is
always reversible — copy the four files back over `models/`.

**If your column names differ**, change `TEXT_COLUMN` / `LABEL_COLUMN` in
`config.py` instead of renaming your data. **If your severity names differ**,
change `SEVERITY_SCORES` there — the points mapping, label validation and the
`score` field in every prediction all read from that one dict.

Things worth tuning in `config.py` once you have real volume:

| Setting | Why |
|---------|-----|
| `TFIDF_PARAMS["min_df"]` | Raise to 2–3 on thousands of rows to drop typo-only features |
| `DOMAIN_STOPWORDS` (in `preprocess.py`) | Add terms that appear in nearly every remark in *your* corpus |
| `CALIBRATE_PROBABILITIES` | Turn on once you have ≥30 examples per class, so `confidence` means what it says |
| `TEST_SIZE` | Set to `0` for the final production fit, after you trust the CV numbers |

---

## How model selection works

Logistic Regression, Random Forest and XGBoost (when installed) are each
cross-validated with stratified k-fold on the **training split only** —
selecting by hold-out score would leak the test set into model selection and
inflate the number you eventually report. The metric is weighted F1, as
specified.

One addition worth flagging, because it changes the winner. On small datasets
the fold scores are noisy enough that a heavier model wins by luck. On the
bundled sample data:

```
logistic_regression  CV weighted F1 = 0.5928 (+/- 0.0677)
random_forest        CV weighted F1 = 0.6004 (+/- 0.1078)
xgboost              CV weighted F1 = 0.5374 (+/- 0.0680)
```

Random Forest "wins" by 0.008 with a fold-to-fold spread of 0.108 — and then
scores **0.49** weighted F1 on the hold-out set, against Logistic Regression's
**0.79**. So `select_best()` applies the one-standard-error rule: among models
within one standard error of the top score, take the simplest. Set
`USE_ONE_SE_RULE = False` in `config.py` for the raw argmax.

The pipeline is also resilient by construction: a candidate that fails to train
is logged and skipped rather than aborting the run; cross-validation folds drop
automatically when the rarest class cannot support five; the hold-out split is
skipped entirely (with a warning) when the data is too small to stratify; and
XGBoost is an optional import.

---

## Reports

Every training run writes to `reports/`:

- `holdout_classification_report.txt` — per-class precision / recall / F1
- `holdout_confusion_matrix.csv` and `.png` (plus a row-normalised PNG)
- `holdout_metrics.json` — machine-readable, for tracking across runs
- `model_comparison.json` — every candidate's fold scores

`models/metadata.json` records the winning model, the dataset path, row counts,
class distribution, feature count, library versions and the full comparison —
enough to reconstruct why a given model is in production.

Current run on the sample data: Logistic Regression, hold-out accuracy 0.792,
weighted F1 0.787 (n=24).

---

## Honest limitations

**The sample dataset proves the plumbing works, not that the model works.**
120 synthetic remarks I wrote to be representative are not 120 real ones. The
0.787 hold-out F1 is a smoke-test number from 24 examples; treat it as "the
pipeline runs end to end", nothing more. Delete it once real data arrives —
mixing synthetic and real remarks would teach the model my phrasing habits
rather than your maintenance vocabulary.

**`confidence` is a raw `predict_proba` value, not a calibrated probability.**
0.94 does not currently mean "right 94% of the time". Turn on
`CALIBRATE_PROBABILITIES` once you have enough data per class.

**Class boundaries are genuinely fuzzy.** Critical/Major and Major/Moderate
share vocabulary; most confusion-matrix errors are between adjacent classes,
which is also where human labellers disagree. Expect to write an annotation
guideline before labelling, or the model will learn your labellers' noise.

**Critical recall is the metric that matters.** A missed Critical remark is a
safety issue; a Minor remark scored as Moderate is a scheduling inconvenience.
Watch per-class Critical recall in the reports, not overall accuracy, and route
low-confidence predictions (`confidence < LOW_CONFIDENCE_THRESHOLD`) to a human
rather than trusting them.

**Before production**, consider: an annotation guideline and inter-annotator
agreement check; ≥200–500 real examples per class; a held-out evaluation set
that is *never* trained on; and logging every prediction with its confidence so
you can measure drift and build the next training set from live data.

---

## Where this fits in the priority score

Not part of this component, but for context — the `score` this model returns is
the Reason Severity term of your formula:

```
Priority Score = Asset Impact (30) + Reason Severity (25) + Traffic (25) + Due Date (20)
```

```python
from src.predict import predict_severity

severity = predict_severity(request["reason_description"])
total = (
    ASSET_IMPACT[request["asset_impact"]]      # High 30 / Medium 20 / Low 10
    + severity["score"]                        # <- this model
    + TRAFFIC[coa_traffic_level(request["block_section"])]   # High 25 / Medium 15 / Low 5
    + due_date_score(request["due_date"], request["request_date"])
)
```

The other three factors are deterministic lookups, so they belong in plain
Python rather than a model. Two suggestions when you build that layer: log
`severity["confidence"]` alongside the total so low-confidence requests can be
flagged for review, and keep the Reason Code as a sanity check against the
model's prediction — a large disagreement between the coded reason and the
predicted severity is usually a data-quality signal worth surfacing.
