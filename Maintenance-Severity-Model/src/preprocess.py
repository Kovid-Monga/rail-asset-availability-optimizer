"""
preprocess.py
=============
Turns a raw maintenance remark into the normalised token string that TF-IDF
sees. Implements the four required steps: lowercasing, punctuation removal,
stopword removal and lemmatisation.

Why this file exists
--------------------
Training and inference **must** clean text identically. If train.py lemmatised
but predict.py did not, every production prediction would be made on features
the model has never seen and accuracy would silently collapse. Both import
``clean_text`` from here, so that class of bug cannot happen.

Two domain-specific decisions worth knowing about
-------------------------------------------------
1. **Negations are kept.** NLTK's default English stopword list removes "not",
   "no", "off", "down", "against" and "under". In maintenance text those words
   carry the signal — "points not locking" and "points locking" mean opposite
   things. The curated list below deliberately keeps them.
2. **NLTK is optional.** WordNet lemmatisation is used when NLTK and its corpora
   are available; otherwise a rule-based fallback runs. The pipeline therefore
   works on an air-gapped machine with no downloads, which matters if this ends
   up on a railway network.
"""

from __future__ import annotations

import re
from typing import Iterable, Sequence

from src.utils import InvalidInputError, get_logger

logger = get_logger(__name__)

# --------------------------------------------------------------------------- #
# Optional NLTK / WordNet support
# --------------------------------------------------------------------------- #
_WORDNET_LEMMATIZER = None
_NLTK_AVAILABLE = False

try:  # pragma: no cover - environment dependent
    import nltk
    from nltk.stem import WordNetLemmatizer

    try:
        nltk.data.find("corpora/wordnet.zip")
    except LookupError:
        # Fetch quietly; if the machine is offline this simply fails and we
        # fall back to the rule-based lemmatiser below.
        nltk.download("wordnet", quiet=True)
        nltk.download("omw-1.4", quiet=True)

    _WORDNET_LEMMATIZER = WordNetLemmatizer()
    _WORDNET_LEMMATIZER.lemmatize("testing", pos="v")  # force corpus load now
    _NLTK_AVAILABLE = True
except Exception as exc:  # ImportError, LookupError, network failure...
    logger.info(
        "WordNet lemmatiser unavailable (%s). Using the built-in rule-based "
        "fallback — results remain deterministic.",
        type(exc).__name__,
    )


# --------------------------------------------------------------------------- #
# Stopwords
# --------------------------------------------------------------------------- #
# Curated English stopwords with negations and directional words removed.
STOPWORDS: frozenset[str] = frozenset(
    """
    a about above after again all also am an and any are as at be because been
    before being below between both but by can cannot could did do does doing
    during each few for from further had has have having he her here hers herself
    him himself his how i if in into is it its itself just me more most my myself
    of on once only or other our ours ourselves out own same she should so some
    such than that the their theirs them themselves then there these they this
    those through to too under until up very was we were what when where which
    while who whom why will with would you your yours yourself yourselves
    """.split()
)

# Words that appear in nearly every maintenance remark and carry no severity
# signal. Extend this list once you inspect the real corpus.
DOMAIN_STOPWORDS: frozenset[str] = frozenset(
    {"km", "kmp", "nos", "etc", "shri", "sr", "jr", "dt", "w", "r", "t"}
)

ALL_STOPWORDS: frozenset[str] = STOPWORDS | DOMAIN_STOPWORDS

# NOTE: "not", "no", "non", "without", "over", "off", "down", "against", "near"
# and "beyond" are intentionally absent from both sets.

# --------------------------------------------------------------------------- #
# Regexes (compiled once at import)
# --------------------------------------------------------------------------- #
_URL_RE = re.compile(r"https?://\S+|www\.\S+")
_EMAIL_RE = re.compile(r"\S+@\S+\.\S+")
_TOKEN_RE = re.compile(r"[a-z]+")           # letters only: drops punctuation + digits
_WHITESPACE_RE = re.compile(r"\s+")

# Irregular plurals/verbs the rule-based fallback would otherwise mangle.
_IRREGULAR: dict[str, str] = {
    "broken": "break",
    "broke": "break",
    "was": "be",
    "were": "be",
    "is": "be",
    "are": "be",
    "has": "have",
    "had": "have",
    "found": "find",
    "given": "give",
    "gave": "give",
    "taken": "take",
    "took": "take",
    "leaves": "leaf",
    "lives": "life",
    "knives": "knife",
    "men": "man",
    "feet": "foot",
    "children": "child",
}


def _rule_based_lemmatize(token: str) -> str:
    """
    Lightweight suffix-stripping lemmatiser used when WordNet is unavailable.

    Deliberately conservative: it only folds the endings that actually create
    duplicate features in maintenance text (plurals, -ing, -ed). Over-stemming
    would merge unrelated words and cost more accuracy than it saves.
    """
    if token in _IRREGULAR:
        return _IRREGULAR[token]

    if len(token) <= 3:
        return token

    # Plurals -------------------------------------------------------------
    if token.endswith("ies") and len(token) > 4:
        return token[:-3] + "y"
    if token.endswith(("sses", "shes", "ches", "xes", "zes")):
        return token[:-2]
    if token.endswith("s") and not token.endswith(("ss", "us", "is")):
        return token[:-1]

    # Verb forms ----------------------------------------------------------
    for suffix in ("ing", "ed"):
        if token.endswith(suffix) and len(token) - len(suffix) >= 3:
            stem = token[: -len(suffix)]
            # "cracking" -> "crack" (already fine), "running" -> "runn" -> "run"
            if len(stem) > 3 and stem[-1] == stem[-2] and stem[-1] not in "ls":
                stem = stem[:-1]
            # "leaking" -> "leak"; restore a dropped silent e: "leakag"? no.
            return stem

    return token


def _lemmatize(token: str) -> str:
    """Lemmatise one token with WordNet if possible, else the fallback."""
    if _WORDNET_LEMMATIZER is not None:
        # Try verb first (maintenance remarks are action-heavy), then noun.
        lemma = _WORDNET_LEMMATIZER.lemmatize(token, pos="v")
        if lemma == token:
            lemma = _WORDNET_LEMMATIZER.lemmatize(token, pos="n")
        return lemma
    return _rule_based_lemmatize(token)


class TextCleaner:
    """
    Configurable cleaner for maintenance remarks.

    The default instance (``DEFAULT_CLEANER``) is what train.py and predict.py
    both use. Instantiate your own only if you want to A/B a different recipe.

    Parameters
    ----------
    lowercase, remove_punctuation, remove_stopwords, lemmatize
        Toggle each stage independently — useful for ablation experiments.
    min_token_length
        Tokens shorter than this are discarded after cleaning.
    extra_stopwords
        Additional domain terms to strip, e.g. a station code that appears in
        every remark in your corpus.
    """

    def __init__(
        self,
        *,
        lowercase: bool = True,
        remove_punctuation: bool = True,
        remove_stopwords: bool = True,
        lemmatize: bool = True,
        min_token_length: int = 2,
        extra_stopwords: Iterable[str] | None = None,
    ) -> None:
        self.lowercase = lowercase
        self.remove_punctuation = remove_punctuation
        self.remove_stopwords = remove_stopwords
        self.lemmatize = lemmatize
        self.min_token_length = min_token_length
        self.stopwords = ALL_STOPWORDS | frozenset(extra_stopwords or ())
        # Memoise lemmas: maintenance vocabulary is small and highly repetitive,
        # so this materially speeds up training on large corpora.
        self._cache: dict[str, str] = {}

    # -- public API --------------------------------------------------------
    def clean(self, text: str) -> str:
        """
        Normalise one remark into a space-separated token string.

        Returns an empty string when nothing survives cleaning (e.g. the input
        was only punctuation or digits). Callers should treat that as a signal,
        not a crash.

        Raises
        ------
        InvalidInputError
            If ``text`` is not a string.
        """
        if text is None or isinstance(text, float):
            # float covers pandas NaN, the most common real-world offender.
            raise InvalidInputError("Expected a string, got a missing value.")
        if not isinstance(text, str):
            raise InvalidInputError(
                f"Expected a string, got {type(text).__name__}: {text!r}"
            )

        cleaned = text
        if self.lowercase:
            cleaned = cleaned.lower()

        cleaned = _URL_RE.sub(" ", cleaned)
        cleaned = _EMAIL_RE.sub(" ", cleaned)

        if self.remove_punctuation:
            # _TOKEN_RE keeps letters only, which removes punctuation, digits
            # and symbols in a single pass.
            tokens: Sequence[str] = _TOKEN_RE.findall(cleaned)
        else:
            tokens = _WHITESPACE_RE.split(cleaned.strip())

        out: list[str] = []
        for token in tokens:
            if self.remove_stopwords and token in self.stopwords:
                continue
            if self.lemmatize:
                lemma = self._cache.get(token)
                if lemma is None:
                    lemma = _lemmatize(token)
                    self._cache[token] = lemma
                token = lemma
            # Re-check after lemmatising: "was" -> "be" should still go.
            if self.remove_stopwords and token in self.stopwords:
                continue
            if len(token) < self.min_token_length:
                continue
            out.append(token)

        return " ".join(out)

    def clean_many(self, texts: Iterable[str]) -> list[str]:
        """Vectorised convenience wrapper over :meth:`clean`."""
        return [self.clean(t) for t in texts]

    def __repr__(self) -> str:  # pragma: no cover - debugging aid
        return (
            f"TextCleaner(lowercase={self.lowercase}, "
            f"remove_punctuation={self.remove_punctuation}, "
            f"remove_stopwords={self.remove_stopwords}, "
            f"lemmatize={self.lemmatize}, "
            f"backend={'wordnet' if _NLTK_AVAILABLE else 'rule-based'})"
        )


# Shared default instance — import this rather than building your own.
DEFAULT_CLEANER = TextCleaner()


def clean_text(text: str) -> str:
    """Module-level shortcut used by train.py, evaluate.py and predict.py."""
    return DEFAULT_CLEANER.clean(text)


def clean_corpus(texts: Iterable[str]) -> list[str]:
    """Clean a whole column of remarks."""
    return DEFAULT_CLEANER.clean_many(texts)


# --------------------------------------------------------------------------- #
# CLI: `python -m src.preprocess --demo`
# --------------------------------------------------------------------------- #
def _main() -> None:
    import argparse

    parser = argparse.ArgumentParser(description="Text cleaning utilities.")
    parser.add_argument(
        "--setup",
        action="store_true",
        help="Download the optional NLTK WordNet corpora (needs internet).",
    )
    parser.add_argument("--text", help="Clean a single string and print the result.")
    parser.add_argument(
        "--demo", action="store_true", help="Show before/after on sample remarks."
    )
    args = parser.parse_args()

    if args.setup:
        try:
            import nltk

            for pkg in ("wordnet", "omw-1.4"):
                ok = nltk.download(pkg)
                logger.info("nltk.download(%s) -> %s", pkg, ok)
        except Exception as exc:
            logger.error("NLTK setup failed: %s", exc)
            logger.info("Not a problem — the rule-based fallback will be used.")

    if args.text:
        print(clean_text(args.text))

    if args.demo or (not args.text and not args.setup):
        samples = [
            "Track fracture detected at KM 42/3 -- IMMEDIATE safety risk!!",
            "Point machine NOT locking; trains held at home signal.",
            "Scheduled preventive lubrication of points & crossings (monthly).",
        ]
        print(f"Cleaner: {DEFAULT_CLEANER!r}\n")
        for s in samples:
            print(f"  raw    : {s}")
            print(f"  cleaned: {clean_text(s)}\n")


if __name__ == "__main__":
    _main()
