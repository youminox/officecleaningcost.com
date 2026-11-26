import json
from pathlib import Path

ROOT = Path("/Users/charlie/Documents/Google Antigravity/officecleaningcost.com")
ARTICLES_DIR = ROOT / "src" / "content" / "articles"
DATA_DIR = ROOT / "src" / "data"
OUT_PATH = ROOT / "public" / "search-index.json"


def main():
    categories = {
        c["slug"]: c for c in json.loads((DATA_DIR / "categories.json").read_text())
    }
    hits = [
        {
            "slug": "office-cleaning-cost-calculator",
            "pillar": "calculator",
            "title": "Commercial Office Cleaning Cost Calculator (2026 US Rates)",
            "path": "/office-cleaning-cost-calculator/",
        },
        {
            "slug": "compare-cleaning-quotes",
            "pillar": "quotes",
            "title": "Commercial Cleaning Quote Comparison Tool & Spec Grader",
            "path": "/compare-cleaning-quotes/",
        },
    ]

    for f in sorted(ARTICLES_DIR.glob("*.json")):
        a = json.loads(f.read_text())
        cat_name = categories.get(a.get("pillar", ""), {}).get("shortName", a.get("pillar", ""))
        hits.append(
            {
                "slug": a["slug"],
                "pillar": cat_name,
                "title": a["title"],
                "path": a["path"],
            }
        )

    OUT_PATH.write_text(json.dumps(hits, separators=(",", ":")))
    size_kb = OUT_PATH.stat().st_size / 1024.0
    print(f"Wrote {len(hits)} search hits to {OUT_PATH} ({size_kb:.1f} KB)")


if __name__ == "__main__":
    main()
