#!/usr/bin/env python3
"""Validates authored article JSON files against keyword_map.json, amazon-products.json,
strict schema, minimum word counts, and Amazon Associates compliance."""
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
ART_DIR = ROOT / "src/content/articles"
KM = {e["slug"]: e for e in json.loads((ROOT / "src/data/keyword_map.json").read_text())}
KM_PATHS = {e["path"] for e in KM.values()} | {
    "/office-cleaning-cost-calculator/",
    "/compare-cleaning-quotes/",
}
PRODS = {p["id"] for p in json.loads((ROOT / "src/data/amazon-products.json").read_text())}


def count_words(a: dict) -> int:
    parts = [a.get("quickAnswer", ""), a.get("excerpt", "")]
    for b in a.get("blocks", []):
        t = b.get("type")
        if t in ("p", "h2", "h3", "cta"):
            parts.append(b.get("text", ""))
        elif t in ("ul", "ol"):
            parts.extend(b.get("items", []))
        elif t == "callout":
            parts.append(b.get("title", ""))
            parts.append(b.get("text", ""))
        elif t == "steps":
            for it in b.get("items", []):
                parts.append(it.get("name", ""))
                parts.append(it.get("text", ""))
        elif t == "table":
            parts.extend(b.get("headers", []))
            for r in b.get("rows", []):
                parts.extend(str(c) for c in r)
    for f in a.get("faqs", []):
        parts.append(f.get("q", ""))
        parts.append(f.get("a", ""))
    return len(re.findall(r"\S+", " ".join(parts)))


def validate_one(slug: str) -> list[str]:
    errs = []
    fp = ART_DIR / f"{slug}.json"
    if not fp.exists():
        return [f"{slug}: file missing"]
    try:
        a = json.loads(fp.read_text())
    except Exception as e:
        return [f"{slug}: invalid JSON ({e})"]

    spec = KM.get(slug)
    if not spec:
        return [f"{slug}: slug not found in keyword_map.json"]

    for field in ("slug", "pillar", "path", "primaryKeyword", "title", "seoTitle", "metaDescription", "excerpt", "quickAnswer"):
        if not str(a.get(field, "")).strip():
            errs.append(f"{slug}: missing {field}")

    if a.get("pillar") != spec["pillar"]:
        errs.append(f"{slug}: pillar mismatch ({a.get('pillar')} != {spec['pillar']})")
    if a.get("path") != spec["path"]:
        errs.append(f"{slug}: path mismatch ({a.get('path')} != {spec['path']})")
    if bool(a.get("isPillar")) != bool(spec["isPillar"]):
        errs.append(f"{slug}: isPillar mismatch")
    if bool(a.get("isTransactional")) != bool(spec["isTransactional"]):
        errs.append(f"{slug}: isTransactional mismatch")

    if len(a.get("seoTitle", "")) > 72:
        errs.append(f"{slug}: seoTitle too long ({len(a.get('seoTitle', ''))})")
    if not (90 <= len(a.get("metaDescription", "")) <= 165):
        errs.append(f"{slug}: metaDescription length {len(a.get('metaDescription', ''))} out of 90..165")

    img = a.get("image") or {}
    if len(img.get("prompt", "")) < 70:
        errs.append(f"{slug}: image.prompt too short (<70 chars)")
    if len(img.get("alt", "")) < 20:
        errs.append(f"{slug}: image.alt too short")

    blocks = a.get("blocks") or []
    h2_count = sum(1 for b in blocks if b.get("type") == "h2")
    table_count = sum(1 for b in blocks if b.get("type") == "table" and b.get("rows"))
    if h2_count < 4:
        errs.append(f"{slug}: need >=4 H2 sections (got {h2_count})")
    if table_count < 1:
        errs.append(f"{slug}: need >=1 table block")

    wc = count_words(a)
    min_wc = 1200 if spec["isPillar"] else 900
    if wc < min_wc:
        errs.append(f"{slug}: word count {wc} < {min_wc}")

    faqs = a.get("faqs") or []
    if len(faqs) < 3:
        errs.append(f"{slug}: need >=3 faqs (got {len(faqs)})")

    pids = a.get("amazonProductIds") or []
    min_prods = 4 if spec["isTransactional"] else 2
    if len(pids) < min_prods:
        errs.append(f"{slug}: need >={min_prods} amazonProductIds (got {len(pids)})")
    for pid in pids:
        if pid not in PRODS:
            errs.append(f"{slug}: invalid amazonProductId {pid}")

    rel = a.get("related") or []
    if len(rel) < 3:
        errs.append(f"{slug}: need >=3 related paths")
    for rp in rel:
        if rp not in KM_PATHS:
            errs.append(f"{slug}: unknown related path {rp}")

    raw_text = fp.read_text()
    if "★★★★★" in raw_text or "4.8/5" in raw_text or "4.7/5" in raw_text:
        errs.append(f"{slug}: fabricated star rating string detected")

    return errs


def main():
    args = sys.argv[1:]
    if not args or args[0] == "--all":
        slugs = list(KM.keys())
    else:
        slugs = args

    all_errs = []
    seen_titles = {}
    seen_metas = {}

    for sl in slugs:
        all_errs.extend(validate_one(sl))
        fp = ART_DIR / f"{sl}.json"
        if fp.exists():
            try:
                a = json.loads(fp.read_text())
                st = str(a.get("seoTitle", "")).strip().lower()
                md = str(a.get("metaDescription", "")).strip().lower()
                if st in seen_titles:
                    all_errs.append(f"{sl}: duplicate seoTitle with {seen_titles[st]}")
                seen_titles[st] = sl
                if md in seen_metas:
                    all_errs.append(f"{sl}: duplicate metaDescription with {seen_metas[md]}")
                seen_metas[md] = sl
            except Exception:
                pass

    if all_errs:
        print(f"VALIDATION ERRORS ({len(all_errs)}):")
        for e in all_errs[:30]:
            print(" -", e)
        sys.exit(1)

    print(f"ALL {len(slugs)} ARTICLES VALIDATED CLEANLY.")


if __name__ == "__main__":
    main()
