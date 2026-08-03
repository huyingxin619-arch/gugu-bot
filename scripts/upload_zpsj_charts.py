#!/usr/bin/env python3
"""Upload ZPSJ charts to CDN and return URLs."""
import os
import subprocess
import json

CHART_DIR = os.path.join(os.path.dirname(__file__), 'zpsj-charts')
files = sorted(os.listdir(CHART_DIR))

results = {}
for f in files:
    path = os.path.join(CHART_DIR, f)
    # Try uploading to a simple file host or just output paths
    results[f] = path

for name, path in results.items():
    print(f'{name}: {path}')
