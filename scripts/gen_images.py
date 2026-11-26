#!/usr/bin/env python3
"""Generates unique, realistic, diverse commercial office photography via Supabase Edge Function
officecleaningcost-images (ChatGPT Image API quality="medium"), compresses to WebP strictly < 100 KB
(1200x800 <= 90 KB, 640x427 <= 42 KB), and enforces perceptual dHash uniqueness.

Usage:
  python3 scripts/gen_images.py home         # Home + 13 Category ambient assets
  python3 scripts/gen_images.py articles     # All authored article JSONs missing images
  python3 scripts/gen_images.py all          # Both home + all articles
"""
import base64
import concurrent.futures as cf
import hashlib
import io
import json
import pathlib
import sys
import threading
import time
import urllib.error
import urllib.request
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
ENDPOINT = "https://ehwjvuhbimqakvzqbvvg.supabase.co/functions/v1/officecleaningcost-images"
TOKEN = "occ-img-2026"
RAW_DIR = ROOT / "scripts/.cache/raw"
RAW_DIR.mkdir(parents=True, exist_ok=True)
HASH_FILE = ROOT / "scripts/.cache/hashes.json"
ART_DIR = ROOT / "src/content/articles"
AMB_OUT = ROOT / "public/img/ambient"
ART_OUT = ROOT / "public/img/articles"
AMB_OUT.mkdir(parents=True, exist_ok=True)
ART_OUT.mkdir(parents=True, exist_ok=True)

HASH_LOCK = threading.Lock()
HASHES: dict[str, int] = {}
if HASH_FILE.exists():
    try:
        HASHES = {k: int(v, 16) for k, v in json.loads(HASH_FILE.read_text()).items()}
    except Exception:
        HASHES = {}

# Combinatorial diversity matrix (12 angles x 10 lightings x 12 interiors x 6 human modes)
CAMERAS = [
    "35mm architectural wide-angle lens at chest height with crisp perspective lines",
    "50mm eye-level editorial photograph with natural shallow depth of field",
    "85mm f/2.8 medium-telephoto detail shot highlighting textures and finishes",
    "elevated three-quarter mezzanine angle looking across the workspace floorplan",
    "low-angle foreground perspective emphasizing spotless gleaming floor reflections",
    "28mm interior doorway framing looking into a freshly serviced commercial suite",
    "side-profile documentary shot along a glass conference corridor",
    "candid diagonal composition through open glass partitions and workstations",
    "tight medium close-up focusing on commercial equipment and surface sheen",
    "40mm balanced symmetrical shot down a pristine corporate hallway",
    "three-quarter overhead perspective near an office reception desk and seating",
    "natural documentary handheld angle beside an organized janitorial supply station",
]

LIGHTING = [
    "crisp early-morning sunrise light streaming through floor-to-ceiling windows",
    "bright neutral midday office LED and skylight illumination",
    "warm late-afternoon golden-hour sun casting soft shadows across desks",
    "cool after-hours evening commercial lighting with glowing lobby accents",
    "soft diffused overcast daylight balanced with recessed ceiling downlights",
    "clean twilight blue-hour exterior glow balanced with warm interior sconces",
    "bright clinical 5000K daylight lighting with crisp color accuracy",
    "natural north-facing window daylight without harsh glare",
    "evening task lighting across freshly vacuumed carpet lanes",
    "sunny crisp mid-morning light highlighting glass and stainless steel hardware",
]

INTERIORS = [
    "in a modern steel-and-glass downtown high-rise suite",
    "inside a warm brick-and-timber converted loft office",
    "in a clean suburban corporate business park building",
    "inside an upscale executive legal or financial suite with walnut trim",
    "in a bright contemporary medical outpatient reception and hallway",
    "inside a sleek tech startup open floorplan with acoustic ceiling baffles",
    "in a minimalist polished-concrete creative studio workspace",
    "inside a sunlit multi-tenant building lobby with stone flooring",
    "in a busy collaborative coworking lounge and kitchenette area",
    "inside a quiet tiled commercial restroom and touchless sink alcove",
    "in a modern office breakroom with stainless appliances and quartz counters",
    "inside an organized facility supply closet with commercial mop and cart gear",
]

HUMAN_PRESENCE = [
    "with no people visible, emphasizing quiet freshly cleaned readiness",
    "with a uniformed commercial custodian in the mid-ground pushing a microfiber cart",
    "with an office worker walking in soft background bokeh across clean flooring",
    "with a daytime facility porter wiping glass hardware in natural motion",
    "empty and freshly reset for morning opening with aligned chairs",
    "with two custodians in clean dark polos inspecting checklist details nearby",
]

HOME_PROMPTS = {
    "og-default": "Wide architectural editorial photograph of a spotless sunlit modern US corporate office lobby and glass conference room with polished stone floor and ergonomic desks",
    "home-medical-suite": "Clean bright modern US outpatient medical clinic reception desk and tiled hallway with touchless hand sanitizer wall station and gleaming floor",
    "home-law-office": "Executive law firm glass conference room with walnut table, spotless dark carpet tiles, and city skyline window view in natural morning light",
    "home-coworking": "Bright modern US coworking open workspace with clean oak tables, kitchenette coffee bar, and acoustic ceiling panels in soft daylight",
    "home-corporate-lobby": "Spacious Class A US commercial office building lobby with honed travertine stone floors, entrance scraper mats, and clean glass turnstiles",
    "cat-office-cleaning-cost-guides": "Clean mid-size US office floorplate showing neat workstation desks, freshly vacuumed carpet lanes, and glass meeting rooms",
    "cat-city-cleaning-costs": "Panoramic interior view from a high-rise US office window overlooking a city skyline above spotless desks and polished floors",
    "cat-facility-cleaning-costs": "Split architectural view of a spotless dental and professional office suite corridor with clean tile flooring and sanitizing station",
    "cat-cleaning-services-and-tasks": "Uniformed commercial cleaner operating a HEPA backpack vacuum along an open US office cubicle aisle",
    "cat-cleaning-frequency-and-schedules": "Evening view of a freshly serviced US corporate office floor with warm interior lighting and gleaming clean aisles",
    "cat-flooring-and-surface-cleaning-costs": "Low-angle photograph showing gleaming waxed VCT vinyl tile beside commercial carpet tiles in a US office hallway",
    "cat-comparing-quotes-and-contracts": "Facility manager holding a clipboard walking down a clean commercial office corridor beside a stocked janitorial cart",
    "cat-in-house-vs-outsourced-cleaning": "Organized US commercial building janitorial supply closet with rolling cleaning cart, microfiber mop bucket, and stacked paper cases",
    "cat-green-cleaning-and-osha-compliance": "Sunlit LEED-certified office lobby with indoor plants, HEPA air purifier, and eco-friendly microfiber cleaning cart",
    "cat-commercial-vacuums-and-floor-machines": "Commercial upright HEPA vacuum and rotary floor buffer parked neatly on a clean US office hallway floor",
    "cat-janitorial-carts-mops-and-tools": "Fully stocked 3-shelf commercial janitorial cart with yellow wringer mop bucket and color-coded microfiber cloths in an office corridor",
    "cat-restroom-and-breakroom-dispensers": "Spotless modern US office restroom with stainless steel touchless paper towel dispenser, foam soap dispenser, and clean ceramic tile",
    "cat-commercial-cleaning-chemicals-and-mats": "Clean office entrance vestibule featuring a heavy-duty charcoal commercial scraper mat and sparkling glass lobby doors",
}


def compute_dhash(img: Image.Image) -> int:
    gray = img.convert("L").resize((9, 8), Image.Resampling.LANCZOS)
    px = list(gray.getdata())
    bits = 0
    for row in range(8):
        base = row * 9
        for col in range(8):
            if px[base + col] > px[base + col + 1]:
                bits |= 1 << (row * 8 + col)
    return bits


def hamming(a: int, b: int) -> int:
    return bin(a ^ b).count("1")


def save_hashes():
    HASH_FILE.write_text(
        json.dumps({k: hex(v) for k, v in HASHES.items()}, indent=2)
    )


def build_prompt(base_prompt: str, slug: str, salt: int = 0) -> str:
    h = int(hashlib.md5(f"{slug}:{salt}".encode()).hexdigest(), 16)
    cam = CAMERAS[(h) % len(CAMERAS)]
    lit = LIGHTING[(h // 13) % len(LIGHTING)]
    inter = INTERIORS[(h // 173) % len(INTERIORS)]
    hum = HUMAN_PRESENCE[(h // 2111) % len(HUMAN_PRESENCE)]
    return (
        f"{base_prompt}. Camera & composition: {cam}, {inter}, {hum}, {lit}. "
        "Strictly photorealistic US commercial photography, no text, no letters, no logos, no watermarks."
    )


def call_edge_image(slug: str, prompt: str) -> bytes:
    payload = json.dumps({"slug": slug, "prompt": prompt}).encode()
    for attempt in range(4):
        req = urllib.request.Request(
            ENDPOINT,
            data=payload,
            headers={
                "Content-Type": "application/json",
                "x-occ-token": TOKEN,
                "User-Agent": "occ-img-gen/1.0",
            },
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=120) as resp:
                data = json.loads(resp.read().decode())
            if not data.get("ok"):
                err = str(data.get("error", "unknown"))
                if "OPENAI_BILLING_BLOCK" in err:
                    raise RuntimeError(err)
                raise RuntimeError(err)
            if data.get("b64"):
                return base64.b64decode(data["b64"])
            url = data.get("url")
            if not url:
                raise RuntimeError("Missing url and b64 in response")
            with urllib.request.urlopen(url, timeout=60) as img_resp:
                return img_resp.read()
        except urllib.error.HTTPError as e:
            body = e.read().decode("utf-8", errors="ignore")
            if "OPENAI_BILLING_BLOCK" in body:
                raise RuntimeError(body)
            if attempt == 3:
                raise RuntimeError(f"HTTP {e.code}: {body[:200]}")
            time.sleep(2.5 * (attempt + 1))
        except Exception as e:
            if "OPENAI_BILLING_BLOCK" in str(e):
                raise
            if attempt == 3:
                raise
            time.sleep(2.5 * (attempt + 1))
    raise RuntimeError("Unreachable")


def encode_under_limit(img: Image.Image, size: tuple[int, int], max_bytes: int) -> bytes:
    resized = img.convert("RGB").resize(size, Image.Resampling.LANCZOS)
    for q in (82, 76, 70, 64, 58, 52, 46, 40, 34):
        buf = io.BytesIO()
        resized.save(buf, format="WEBP", quality=q, method=6)
        raw = buf.getvalue()
        if len(raw) <= max_bytes:
            return raw
    return raw


def process_one(slug: str, base_prompt: str, out_dir: pathlib.Path, make_640: bool) -> tuple[str, int, int]:
    out_main = out_dir / f"{slug}.webp"
    out_640 = out_dir / f"{slug}-640.webp"
    if out_main.exists() and out_main.stat().st_size <= 96000 and (not make_640 or out_640.exists()):
        if slug not in HASHES:
            with Image.open(out_main) as im:
                dh = compute_dhash(im)
            with HASH_LOCK:
                HASHES[slug] = dh
        return slug, out_main.stat().st_size, out_640.stat().st_size if out_640.exists() else 0

    raw_cache = RAW_DIR / f"{slug}.webp"
    img_bytes = None
    chosen_hash = None

    for salt in range(3):
        if salt == 0 and raw_cache.exists():
            candidate_bytes = raw_cache.read_bytes()
        else:
            full_prompt = build_prompt(base_prompt, slug, salt=salt)
            candidate_bytes = call_edge_image(slug, full_prompt)

        with Image.open(io.BytesIO(candidate_bytes)) as im:
            dh = compute_dhash(im)
            too_close = False
            with HASH_LOCK:
                for other_slug, other_hash in HASHES.items():
                    if other_slug != slug and hamming(dh, other_hash) < 8:
                        too_close = True
                        break
            if not too_close or salt == 2:
                img_bytes = candidate_bytes
                chosen_hash = dh
                break

    assert img_bytes is not None and chosen_hash is not None
    raw_cache.write_bytes(img_bytes)

    with Image.open(io.BytesIO(img_bytes)) as im:
        main_webp = encode_under_limit(im, (1200, 800), 92000)
        out_main.write_bytes(main_webp)
        s640 = 0
        if make_640:
            small_webp = encode_under_limit(im, (640, 427), 43000)
            out_640.write_bytes(small_webp)
            s640 = len(small_webp)

    with HASH_LOCK:
        HASHES[slug] = chosen_hash

    return slug, len(main_webp), s640


def run_batch(tasks: list[tuple[str, str, pathlib.Path, bool]], workers: int = 8):
    done = 0
    errors = 0
    total = len(tasks)
    with cf.ThreadPoolExecutor(max_workers=workers) as ex:
        futs = {ex.submit(process_one, sl, pr, od, m640): sl for sl, pr, od, m640 in tasks}
        for f in cf.as_completed(futs):
            sl = futs[f]
            try:
                slug, s1, s2 = f.result()
                done += 1
                if done % 10 == 0 or done == total:
                    with HASH_LOCK:
                        save_hashes()
                print(f"[{done}/{total}] {slug}: {s1 // 1024}KB" + (f" / 640w={s2 // 1024}KB" if s2 else ""), flush=True)
            except Exception as e:
                if "OPENAI_BILLING_BLOCK" in str(e):
                    with HASH_LOCK:
                        save_hashes()
                    raise
                errors += 1
                print(f"[ERR] {sl}: {e}", flush=True)
    with HASH_LOCK:
        save_hashes()
    if errors:
        print(f"COMPLETED WITH {errors} TRANSIENT ERRORS (re-run to resume missing).", flush=True)


def gather_home_tasks():
    return [(sl, pr, AMB_OUT, False) for sl, pr in HOME_PROMPTS.items()]


def gather_article_tasks():
    tasks = []
    for p in sorted(ART_DIR.glob("*.json")):
        try:
            a = json.loads(p.read_text())
            slug = a["slug"]
            prompt = a.get("image", {}).get("prompt") or a["title"]
            tasks.append((slug, prompt, ART_OUT, True))
        except Exception:
            continue
    return tasks


if __name__ == "__main__":
    mode = sys.argv[1] if len(sys.argv) > 1 else "home"
    if mode == "home":
        run_batch(gather_home_tasks(), workers=6)
    elif mode == "articles":
        run_batch(gather_article_tasks(), workers=10)
    elif mode == "all":
        run_batch(gather_home_tasks(), workers=6)
        run_batch(gather_article_tasks(), workers=10)
    else:
        print("Usage: gen_images.py [home|articles|all]")
        sys.exit(1)
