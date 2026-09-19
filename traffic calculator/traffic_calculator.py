#!/usr/bin/env python3
"""
Northern Railway Corridor Traffic Calculator
Takes a block (Station A and Station B) as input and outputs strictly: HIGH, MEDIUM, or LOW.
"""

import sys
import os
import argparse
import pandas as pd
from collections import defaultdict

# Data files in current directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TRAIN_DATA_FILE = os.path.join(BASE_DIR, "ALL-TRAINS_NR_STOPS_COMBINED.csv")
STATION_MASTER_FILE = os.path.join(BASE_DIR, "NR_stations.csv")


class NRTrafficClassifier:
    """Lightweight engine to compute corridor traffic level (HIGH, MEDIUM, LOW)."""

    def __init__(self, train_file=TRAIN_DATA_FILE, station_file=STATION_MASTER_FILE):
        self.station_lookup = {}                  # name/code -> normalized code
        self.corridor_services = defaultdict(int) # (st_a, st_b) -> total weekly services
        self.q33 = 0.0
        self.q66 = 0.0

        self._load_stations(station_file)
        self._load_trains_and_compute_thresholds(train_file)

    def _load_stations(self, station_file):
        if not os.path.exists(station_file):
            print(f"[ERROR] Station file not found: {station_file}", file=sys.stderr)
            sys.exit(1)

        df_st = pd.read_csv(station_file, dtype=str)
        df_nr = df_st[df_st["zone"].str.strip().str.upper() == "NR"]

        for _, row in df_nr.iterrows():
            code = str(row["station_code"]).strip().upper()
            name = str(row["station_name"]).strip().upper()
            self.station_lookup[code] = code
            self.station_lookup[name] = code

            # Clean suffixes like JN, HALT, CABIN for flexible matching
            for suffix in [" JN.", " JN", " JUNCTION", " HALT", " CABIN"]:
                if name.endswith(suffix):
                    self.station_lookup[name[:-len(suffix)].strip()] = code

    def _load_trains_and_compute_thresholds(self, train_file):
        if not os.path.exists(train_file):
            print(f"[ERROR] Train data file not found: {train_file}", file=sys.stderr)
            sys.exit(1)

        df = pd.read_csv(train_file, dtype=str)
        df = df[df["runningDays"].str.match(r"^[01]{7}$", na=False)].copy()
        df["sno_num"] = pd.to_numeric(df["sno"], errors="coerce")
        df = df.dropna(subset=["sno_num"]).sort_values(by=["trainNumber", "sno_num"])

        # Aggregate total weekly services for every connected station pair
        for _, grp in df.groupby("trainNumber"):
            freq = grp["runningDays"].iloc[0].count("1")
            stations = [
                s for s in grp["stationName"].str.strip().str.upper()
                if s in self.station_lookup
            ]
            # Deduplicate stations preserving order
            seen = set()
            ordered = [s for s in stations if not (s in seen or seen.add(s))]

            n = len(ordered)
            for i in range(n):
                for j in range(i + 1, n):
                    pair = tuple(sorted([ordered[i], ordered[j]]))
                    self.corridor_services[pair] += freq

        # Precompute Q33 and Q66 thresholds across all connected corridors
        if self.corridor_services:
            traffic_series = pd.Series(list(self.corridor_services.values()))
            self.q33 = traffic_series.quantile(0.33)
            self.q66 = traffic_series.quantile(0.66)

    def classify_block(self, station_a: str, station_b: str) -> str:
        """Resolves stations and returns strictly 'HIGH', 'MEDIUM', or 'LOW'."""
        if not station_a or not station_b:
            return "ERROR: Station input cannot be empty"

        code_a = self.station_lookup.get(station_a.strip().upper())
        code_b = self.station_lookup.get(station_b.strip().upper())

        if not code_a:
            return f"ERROR: Station '{station_a}' not found in Northern Railway stations"
        if not code_b:
            return f"ERROR: Station '{station_b}' not found in Northern Railway stations"
        if code_a == code_b:
            return "ERROR: Station A and Station B must be different"

        pair = tuple(sorted([code_a, code_b]))
        services = self.corridor_services.get(pair, 0)

        if services == 0 or services < self.q33:
            return "Low"
        elif services < self.q66:
            return "Medium"
        return "High"


def main():
    parser = argparse.ArgumentParser(description="Corridor traffic classifier (outputs HIGH, MEDIUM, or LOW).")
    parser.add_argument("station_a", nargs="?", help="Station A (code or name)")
    parser.add_argument("station_b", nargs="?", help="Station B (code or name)")
    args = parser.parse_args()

    classifier = NRTrafficClassifier()

    # CLI arguments mode: e.g. python traffic_calculator.py LKO CNB
    if args.station_a and args.station_b:
        print(classifier.classify_block(args.station_a, args.station_b))
        return

    # Interactive mode
    try:
        station_a = input("Enter Station A: ").strip()
        station_b = input("Enter Station B: ").strip()
        print(classifier.classify_block(station_a, station_b))
    except (KeyboardInterrupt, EOFError):
        pass


if __name__ == "__main__":
    main()
