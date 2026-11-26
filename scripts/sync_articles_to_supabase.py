import json
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path("/Users/charlie/Documents/Google Antigravity/officecleaningcost.com")
ARTICLES_DIR = ROOT / "src" / "content" / "articles"
DATA_DIR = ROOT / "src" / "data"

CHAT_ENDPOINT = "https://ehwjvuhbimqakvzqbvvg.supabase.co/functions/v1/officecleaningcost-chat"
SYNC_KEY = "occ-sync-2026"
BATCH_SIZE = 100


def flatten_text(a: dict) -> str:
    parts = [a.get("primaryKeyword", ""), a.get("quickAnswer", ""), a.get("excerpt", "")]
    for b in a.get("blocks", []):
        if isinstance(b.get("text"), str):
            parts.append(b["text"])
        if isinstance(b.get("items"), list):
            for it in b["items"]:
                if isinstance(it, str):
                    parts.append(it)
                elif isinstance(it, dict):
                    parts.append(f"{it.get('name', '')} {it.get('text', '')}")
    for f in a.get("faqs", []):
        parts.append(f"{f.get('q', '')} {f.get('a', '')}")
    return " ".join(parts)[:1800]


def post_batch(payload_articles: list[dict]) -> dict:
    body = json.dumps({"action": "sync_articles", "articles": payload_articles}).encode("utf-8")
    req = urllib.request.Request(
        CHAT_ENDPOINT,
        data=body,
        headers={
            "Content-Type": "application/json",
            "x-sync-key": SYNC_KEY,
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.loads(resp.read().decode("utf-8"))


def main():
    categories = {
        c["slug"]: c for c in json.loads((DATA_DIR / "categories.json").read_text())
    }
    files = sorted(ARTICLES_DIR.glob("*.json"))
    if not files:
        print("No articles found in src/content/articles/")
        sys.exit(1)

    rows = []
    for f in files:
        a = json.loads(f.read_text())
        cat = categories.get(a.get("pillar", ""), {})
        rows.append(
            {
                "slug": a["slug"],
                "title": a["title"],
                "category": a["pillar"],
                "category_name": cat.get("name", a["pillar"]),
                "excerpt": a["excerpt"],
                "featured_image": f"/img/articles/{a['slug']}.webp",
                "read_time": int(a.get("readingMinutes", 7)),
                "search_text": flatten_text(a),
                "active": True,
            }
        )

    synced = 0
    for i in range(0, len(rows), BATCH_SIZE):
        chunk = rows[i : i + BATCH_SIZE]
        for attempt in range(3):
            try:
                res = post_batch(chunk)
                synced += len(chunk)
                print(f"[{synced}/{len(rows)}] synced batch -> {res}")
                break
            except Exception as exc:
                if attempt == 2:
                    raise RuntimeError(f"Failed syncing batch {i}: {exc}") from exc
                time.sleep(2 * (attempt + 1))

    print(f"DONE: Synced {synced} articles to Supabase officecleaningcost_articles.")


if __name__ == "__main__":
    main()
