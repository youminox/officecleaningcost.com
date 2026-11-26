import asyncio
import json
import sys
from pathlib import Path

ROOT = Path("/Users/charlie/Documents/Google Antigravity/officecleaningcost.com")
SCRIPTS_DIR = ROOT / "scripts"
DATA_DIR = ROOT / "src" / "data"
ARTICLES_DIR = ROOT / "src" / "content" / "articles"
BATCHES_DIR = SCRIPTS_DIR / ".batches"

if str(SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPTS_DIR))

from validate_article import validate_one  # noqa: E402

ARTICLES_DIR.mkdir(parents=True, exist_ok=True)
BATCHES_DIR.mkdir(parents=True, exist_ok=True)

keyword_map = json.loads((DATA_DIR / "keyword_map.json").read_text())
cities_by_slug = {c["slug"]: c for c in json.loads((DATA_DIR / "cities.json").read_text())}
products_list = json.loads((DATA_DIR / "amazon-products.json").read_text())
products_by_id = {p["id"]: p for p in products_list}
pricing = json.loads((DATA_DIR / "pricing.json").read_text())
categories_by_slug = {c["slug"]: c for c in json.loads((DATA_DIR / "categories.json").read_text())}
all_valid_paths = {e["path"] for e in keyword_map} | {
    "/office-cleaning-cost-calculator/",
    "/compare-cleaning-quotes/",
}

WAVE_SIZE = int(args.get("wave_size", 20))
PILLAR_BATCH_SIZE = int(args.get("pillar_batch_size", 3))
ARTICLE_BATCH_SIZE = int(args.get("article_batch_size", 6))
MAX_BATCHES = int(args.get("max_batches", 60))
MODEL_NAME = str(args.get("model", "pro"))
START_WAVE = int(args.get("start_wave", 0))


def compact_pricing_summary() -> dict:
    return {
        "currency": pricing["currency"],
        "weeksPerMonth": pricing["weeksPerMonth"],
        "minimumPerVisit": pricing["minimumPerVisit"],
        "sizeBrackets": pricing["sizeBrackets"],
        "restroomPerVisit": pricing["restroomPerVisit"],
        "flooringTypes": pricing["flooringTypes"],
        "frequencies": pricing["frequencies"],
        "addOns": pricing["addOns"],
        "benchmarks": pricing["benchmarks"],
    }


def enrich_entry(entry: dict) -> dict:
    cat = categories_by_slug.get(entry["pillar"], {})
    city = cities_by_slug.get(entry["citySlug"]) if entry.get("citySlug") else None
    needed_prods = 4 if entry.get("isTransactional") else 2
    prod_ids = [pid for pid in entry.get("suggestedProductIds", []) if pid in products_by_id]
    if len(prod_ids) < needed_prods:
        for p in products_list:
            if p["id"] not in prod_ids:
                prod_ids.append(p["id"])
            if len(prod_ids) >= needed_prods:
                break
    prods = [products_by_id[pid] for pid in prod_ids[:6]]
    related = [r for r in entry.get("relatedPaths", []) if r in all_valid_paths]
    for fallback in ("/office-cleaning-cost-calculator/", "/compare-cleaning-quotes/", f"/{entry['pillar']}/"):
        if len(related) >= 4:
            break
        if fallback in all_valid_paths and fallback != entry["path"] and fallback not in related:
            related.append(fallback)
    return {
        "slug": entry["slug"],
        "pillar": entry["pillar"],
        "pillarName": cat.get("name", entry["pillar"]),
        "path": entry["path"],
        "isPillar": bool(entry.get("isPillar", False)),
        "isTransactional": bool(entry.get("isTransactional", False)),
        "primaryKeyword": entry["primaryKeyword"],
        "intent": entry["intent"],
        "targetTitle": entry["targetTitle"],
        "angleBrief": entry["angleBrief"],
        "city": city,
        "recommendedProductIds": [p["id"] for p in prods],
        "products": [
            {
                "id": p["id"],
                "title": p["title"],
                "brand": p["brand"],
                "category": p["category"],
                "subtitle": p["subtitle"],
                "specs": p["specs"],
            }
            for p in prods
        ],
        "relatedPaths": related[:5],
    }


def pending_entries() -> list[dict]:
    pending = []
    for e in keyword_map:
        slug = e["slug"]
        f = ARTICLES_DIR / f"{slug}.json"
        if f.exists():
            errs = validate_one(slug)
            if not errs:
                continue
        pending.append(e)
    return pending


def build_batches(entries: list[dict]) -> list[list[dict]]:
    pillars = [e for e in entries if e.get("isPillar")]
    regulars = [e for e in entries if not e.get("isPillar")]
    batches: list[list[dict]] = []

    for i in range(0, len(pillars), PILLAR_BATCH_SIZE):
        batches.append(pillars[i : i + PILLAR_BATCH_SIZE])

    by_pillar: dict[str, list[dict]] = {}
    for e in regulars:
        by_pillar.setdefault(e["pillar"], []).append(e)

    for _, group in by_pillar.items():
        for i in range(0, len(group), ARTICLE_BATCH_SIZE):
            batches.append(group[i : i + ARTICLE_BATCH_SIZE])

    return batches


def build_prompt(batch_file: Path, slugs: list[str], batch_idx: int) -> str:
    slug_list = " ".join(slugs)
    return f"""You are a senior US commercial facility operations editor authoring genuinely original, practical, data-grounded articles in American English (en-US, USD $, square feet / sq ft) for officecleaningcost.com.

TASK:
1. Read the batch specification file `{batch_file}` in full using `read_file`. It defines {len(slugs)} articles to write (`{", ".join(slugs)}`) plus shared `pricing` benchmarks, optional `city` data, and exact `products` metadata.
2. For EVERY item in `items`, author an original, deeply helpful JSON article file saved directly to:
   `/Users/charlie/Documents/Google Antigravity/officecleaningcost.com/src/content/articles/<slug>.json`
   using `write_file` (batch parallel `write_file` calls in the same turn!).
   STRICTLY FORBIDDEN: Do NOT write or run Python scripts to template or generate article text! You must author every word of prose, every table, every FAQ, and every image prompt directly in your `write_file` payloads.

EXACT REQUIRED JSON SCHEMA PER ARTICLE:
{{
  "slug": "<exact slug from spec>",
  "pillar": "<exact pillar from spec>",
  "path": "<exact path from spec>",
  "isPillar": <exact boolean from spec>,
  "isTransactional": <exact boolean from spec>,
  "primaryKeyword": "<exact primaryKeyword from spec>",
  "title": "<compelling US English H1 matching primaryKeyword and angleBrief>",
  "seoTitle": "<globally unique <= 72 chars; keep the unique subject/city/modifier from primaryKeyword/targetTitle right at the start>",
  "metaDescription": "<globally unique 115-158 chars keeping the unique subject/city/modifier upfront + metric + calculator/comparison CTA>",
  "excerpt": "<2 crisp sentences summarizing what a US office manager learns>",
  "quickAnswer": "<2-3 direct sentences answering the query with concrete USD/sq-ft ranges or buyer criteria aligned to pricing.json / city>",
  "readingMinutes": <integer 6 to 12>,
  "datePublished": "2026-11-25",
  "dateModified": "2026-11-25",
  "image": {{
    "prompt": "<at least 85 chars; unique photorealistic US commercial office / janitorial scene specific to THIS article topic & city/product setting, lighting and camera angle, ZERO text/words/logos/watermarks>",
    "alt": "<at least 25 chars descriptive accessibility alt text>"
  }},
  "blocks": [
    {{ "type": "h2", "text": "..." }},
    {{ "type": "p", "text": "..." }},
    {{ "type": "table", "caption": "...", "headers": ["...", "..."], "rows": [["...", "..."], ...] }},
    {{ "type": "ul", "items": ["...", "..."] }},
    {{ "type": "callout", "variant": "benchmark|warning|compliance|tip", "title": "...", "text": "..." }},
    {{ "type": "steps", "items": [{{ "name": "...", "text": "..." }}] }},
    {{ "type": "cta", "text": "..." }}
  ],
  "faqs": [
    {{ "q": "...", "a": "..." }}
  ],
  "amazonProductIds": ["<exact ids from item.products, >=4 if isTransactional else >=2>"],
  "related": ["<exact paths from item.relatedPaths, >=3>"]
}}

STRICT QUALITY & VALIDATION RULES:
- Word count across quickAnswer + blocks + faqs MUST be:
  - >= 1350 words if `isPillar` is true (safety margin above 1200 minimum)
  - >= 1020 words if `isPillar` is false (safety margin above 900 minimum)
- `blocks` MUST include at least 5 `"h2"` headings, at least 1 `"table"` (with realistic aligned numbers matching `pricing` and city `costMultiplier` if `city` is present), at least 1 `"callout"`, at least 1 `"ul"` or `"ol"` or `"steps"`, and 1 `"cta"` inviting readers to run their exact numbers in the Office Cleaning Cost Calculator or Quote Comparator.
- `faqs` MUST contain 4 or 5 substantial Q&As grounded in US commercial janitorial contracts (COI, OSHA bloodborne/HazCom, green seal, scope exclusions, frequency math `weeksPerMonth: 4.333`).
- AMAZON COMPLIANCE: NEVER include star ratings (`4.8/5`, `★★★★★`), review counts, `"best seller"` claims, or fixed dollar prices for any Amazon product! Describe products by real operational specs (`specs`, durability, filtration, ergonomics, chemical dwell time, compatibility).
- For city guides (`city != null`): weave in the specific `city.businessDistricts`, `city.costMultiplier` applied to national rates, `city.hourlyRange`, `city.climateWearNote`, and `city.regulatoryNote` naturally.
- ZERO generic fluff ("In today's fast-paced world...", "Cleanliness is paramount..."). Write like a seasoned US commercial property & janitorial procurement consultant.
- Make every article's structure, examples, tables, and image prompt distinctly tailored to its exact `slug`, `angleBrief`, and `targetTitle`.

VERIFICATION (MANDATORY BEFORE FINISHING):
3. After writing all files in this batch, run via `run_command`:
   `cd "/Users/charlie/Documents/Google Antigravity/officecleaningcost.com" && python3 scripts/validate_article.py {slug_list}`
4. If ANY slug reports an error (word count, missing block, length, forbidden phrase, etc.), immediately fix that JSON file and re-run `validate_article.py` until it exits 0 with zero errors!
5. Call your `finish` tool with a concise string listing the validated slugs for batch {batch_idx}.
"""


phase("Inventory pending articles")
todo = pending_entries()
batches = build_batches(todo)
batches_to_run = batches[:MAX_BATCHES]
print(f"Pending articles: {len(todo)} | Total batches needed: {len(batches)} | Running now: {len(batches_to_run)} (wave_size={WAVE_SIZE}, model={MODEL_NAME})")

if not batches_to_run:
    print("NOTHING PENDING: all articles already validated.")
else:
    shared_pricing = compact_pricing_summary()
    prepared = []
    for idx, batch in enumerate(batches_to_run):
        b_id = START_WAVE * 1000 + idx
        b_file = BATCHES_DIR / f"batch_{b_id:04d}.json"
        payload = {
            "batchId": b_id,
            "pricing": shared_pricing,
            "items": [enrich_entry(e) for e in batch],
        }
        b_file.write_text(json.dumps(payload, indent=2))
        prepared.append((b_id, b_file, [e["slug"] for e in batch]))

    results_summary = []
    for w_start in range(0, len(prepared), WAVE_SIZE):
        wave_num = START_WAVE + (w_start // WAVE_SIZE) + 1
        wave_items = prepared[w_start : w_start + WAVE_SIZE]
        phase(f"Authoring wave {wave_num} ({len(wave_items)} parallel agents)")

        async def run_one(item):
            b_id, b_file, slugs = item
            try:
                prompt = build_prompt(b_file, slugs, b_id)
                out = await agent(
                    prompt,
                    schema={"type": "string"},
                    role=f"Article Author B{b_id:04d}",
                    type_name="self",
                    workspace="inherit",
                    model=MODEL_NAME,
                )
                failed = []
                for s in slugs:
                    errs = validate_one(s)
                    if errs:
                        failed.append((s, errs))
                return {"batch": b_id, "ok": len(slugs) - len(failed), "failed": failed, "error": None, "note": str(out)[:240]}
            except Exception as exc:
                return {"batch": b_id, "ok": 0, "failed": [(s, [str(exc)]) for s in slugs], "error": str(exc), "note": ""}

        wave_res = await parallel(wave_items, run_one)
        results_summary.extend(wave_res)
        ok_cnt = sum(r["ok"] for r in wave_res)
        tot_cnt = sum(r["ok"] + len(r["failed"]) for r in wave_res)
        err_cnt = sum(1 for r in wave_res if r["error"])
        print(f"Wave {wave_num} complete: {ok_cnt}/{tot_cnt} articles valid | agent exceptions: {err_cnt}")
        for r in wave_res:
            if r["error"] or r["failed"]:
                print(f"  Batch {r['batch']}: err={r['error']} failed={[(s, e[:2]) for s, e in r['failed'][:3]]}")
        if ok_cnt == 0 and err_cnt == len(wave_items):
            print("Full wave hit quota/transport error; stopping early so progress is saved cleanly.")
            break

    total_ok = sum(r["ok"] for r in results_summary)
    total_fail = sum(len(r["failed"]) for r in results_summary)
    print(f"WORKFLOW DONE: {total_ok} newly validated articles, {total_fail} remaining/failed in this run.")
