#!/usr/bin/env python3
"""Validates src/data/keyword_map.json for zero cannibalization and exact counts."""
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
KM = json.loads((ROOT / "src/data/keyword_map.json").read_text())
PRODS = {p["id"] for p in json.loads((ROOT / "src/data/amazon-products.json").read_text())}
CITIES = {c["slug"] for c in json.loads((ROOT / "src/data/cities.json").read_text())}

STOP = {"the", "a", "an", "and", "or", "for", "of", "in", "to", "on", "with", "vs", "by", "cost", "cleaning", "office", "commercial", "best"}

def tokens(s):
    s = re.sub(r"(?<=\d),(?=\d)", "", s.lower())
    return {w for w in re.findall(r"[a-z0-9]+", s) if w not in STOP}

errors = []
pillars = [e for e in KM if e["isPillar"]]
seo = [e for e in KM if not e["isPillar"] and not e["isTransactional"]]
trans = [e for e in KM if not e["isPillar"] and e["isTransactional"]]
city_entries = [e for e in KM if e.get("citySlug")]

if len(KM) != 1213:
    errors.append(f"Expected 1213 entries, got {len(KM)}")
if len(pillars) != 13:
    errors.append(f"Expected 13 pillars, got {len(pillars)}")
if len(seo) != 1000:
    errors.append(f"Expected 1000 SEO articles, got {len(seo)}")
if len(trans) != 200:
    errors.append(f"Expected 200 transactional articles, got {len(trans)}")
if len(city_entries) != 150:
    errors.append(f"Expected 150 city entries, got {len(city_entries)}")

seen_paths, seen_kws, seen_titles, seen_cities = set(), set(), set(), set()
by_pillar = {}

for e in KM:
    p = e["path"]
    k = e["primaryKeyword"].lower().strip()
    t = e["targetTitle"].lower().strip()
    if p in seen_paths:
        errors.append(f"Duplicate path: {p}")
    seen_paths.add(p)
    if k in seen_kws:
        errors.append(f"Duplicate keyword: {k}")
    seen_kws.add(k)
    if t in seen_titles:
        errors.append(f"Duplicate title: {t}")
    seen_titles.add(t)

    cs = e.get("citySlug")
    if cs:
        if cs not in CITIES:
            errors.append(f"Unknown citySlug: {cs}")
        if cs in seen_cities:
            errors.append(f"Duplicate citySlug: {cs}")
        seen_cities.add(cs)

    for pid in e.get("suggestedProductIds", []):
        if pid not in PRODS:
            errors.append(f"Invalid product id {pid} in {p}")

    # Intent separation checks
    if not e["isPillar"] and not e["isTransactional"]:
        if re.match(r"^(best |top 10 |.* review$)", k):
            errors.append(f"Informational URL targets product review kw: {p} -> {k}")
    if e["isTransactional"]:
        if "cost per sq ft" in k or "how much to hire" in k:
            errors.append(f"Transactional URL targets service rate kw: {p} -> {k}")

    if not e["isPillar"]:
        by_pillar.setdefault(e["pillar"], []).append(e)

# Check intra-silo Jaccard similarity (0.62 threshold)
high_sim = []
for pil, items in by_pillar.items():
    tok_list = [(it["path"], tokens(it["primaryKeyword"]), tokens(it["targetTitle"])) for it in items]
    for i in range(len(tok_list)):
        p1, k1, t1 = tok_list[i]
        for j in range(i + 1, len(tok_list)):
            p2, k2, t2 = tok_list[j]
            if len(k1) >= 2 and len(k2) >= 2:
                sim_k = len(k1 & k2) / len(k1 | k2)
                if sim_k >= 0.62:
                    high_sim.append((pil, "kw", p1, p2, round(sim_k, 2)))
            if len(t1) >= 2 and len(t2) >= 2:
                sim_t = len(t1 & t2) / len(t1 | t2)
                if sim_t >= 0.62:
                    high_sim.append((pil, "title", p1, p2, round(sim_t, 2)))

if high_sim:
    errors.append(f"High intra-silo keyword similarity ({len(high_sim)} pairs): {high_sim[:5]}")

if errors:
    print("VALIDATION FAILED:")
    for err in errors:
        print(" -", err)
    sys.exit(1)

print(f"VALIDATION PASSED: {len(KM)} URLs (13 pillars, {len(seo)} SEO, {len(trans)} transactional, {len(city_entries)} cities), 0 cannibalization conflicts.")
