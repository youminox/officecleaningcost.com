#!/usr/bin/env python3
"""Comprehensive SEO, Image (<100KB), Legal Identity, and Amazon Associates Quality Audit."""
import json
import pathlib
import re
import sys
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
ART_DIR = ROOT / "src/content/articles"
DATA_DIR = ROOT / "src/data"
AMB_DIR = ROOT / "public/img/ambient"
ART_IMG_DIR = ROOT / "public/img/articles"
HASH_FILE = ROOT / "scripts/.cache/hashes.json"

if str(ROOT / "scripts") not in sys.path:
    sys.path.insert(0, str(ROOT / "scripts"))

from validate_article import validate_one  # noqa: E402


def main():
    errors: list[str] = []
    km = json.loads((DATA_DIR / "keyword_map.json").read_text())
    km_by_slug = {e["slug"]: e for e in km}

    if len(km) != 1213:
        errors.append(f"keyword_map.json count {len(km)} != 1213")

    pillars = 0
    seo_guides = 0
    transactional = 0
    cities_seen = set()
    seo_titles = {}
    meta_descs = {}
    primary_kws = {}

    for e in km:
        sl = e["slug"]
        errs = validate_one(sl)
        if errs:
            errors.extend(errs)
            continue

        a = json.loads((ART_DIR / f"{sl}.json").read_text())
        if a.get("isPillar"):
            pillars += 1
        elif a.get("isTransactional"):
            transactional += 1
        else:
            seo_guides += 1

        if e.get("citySlug"):
            cities_seen.add(e["citySlug"])

        st = a["seoTitle"].strip().lower()
        md = a["metaDescription"].strip().lower()
        pk = a["primaryKeyword"].strip().lower()

        if st in seo_titles:
            errors.append(f"Duplicate seoTitle: {sl} and {seo_titles[st]} -> {a['seoTitle']!r}")
        seo_titles[st] = sl

        if md in meta_descs:
            errors.append(f"Duplicate metaDescription: {sl} and {meta_descs[md]}")
        meta_descs[md] = sl

        if pk in primary_kws:
            errors.append(f"Duplicate primaryKeyword: {sl} and {primary_kws[pk]}")
        primary_kws[pk] = sl

    if pillars != 13:
        errors.append(f"Expected 13 pillars, got {pillars}")
    if seo_guides != 1000:
        errors.append(f"Expected 1000 non-transactional SEO guides, got {seo_guides}")
    if transactional != 200:
        errors.append(f"Expected 200 transactional Amazon guides, got {transactional}")
    if len(cities_seen) != 150:
        errors.append(f"Expected 150 unique city guides, got {len(cities_seen)}")

    # 2. Check 18 ambient images + 1,213 article WebP images (< 100,000 bytes)
    amb_files = sorted(AMB_DIR.glob("*.webp"))
    if len(amb_files) < 18:
        errors.append(f"Expected 18 ambient WebP images, found {len(amb_files)}")
    for f in amb_files:
        sz = f.stat().st_size
        if sz >= 100_000:
            errors.append(f"Ambient image {f.name} >= 100KB ({sz} bytes)")

    art_img_ok = 0
    for e in km:
        sl = e["slug"]
        m_img = ART_IMG_DIR / f"{sl}.webp"
        s_img = ART_IMG_DIR / f"{sl}-640.webp"
        if not m_img.exists():
            errors.append(f"Missing article image: {m_img.name}")
            continue
        if not s_img.exists():
            errors.append(f"Missing article 640w image: {s_img.name}")
            continue
        if m_img.stat().st_size >= 100_000:
            errors.append(f"Article image {m_img.name} >= 100KB ({m_img.stat().st_size} bytes)")
        if s_img.stat().st_size >= 100_000:
            errors.append(f"Article 640w image {s_img.name} >= 100KB ({s_img.stat().st_size} bytes)")
        art_img_ok += 1

    # Spot-check dimensions on 15 sample article images
    for e in km[:15]:
        sl = e["slug"]
        m_img = ART_IMG_DIR / f"{sl}.webp"
        s_img = ART_IMG_DIR / f"{sl}-640.webp"
        if m_img.exists() and s_img.exists():
            with Image.open(m_img) as im:
                if im.size != (1200, 800):
                    errors.append(f"{m_img.name} size {im.size} != (1200, 800)")
            with Image.open(s_img) as im:
                if im.size != (640, 427):
                    errors.append(f"{s_img.name} size {im.size} != (640, 427)")

    if not HASH_FILE.exists():
        errors.append("Missing scripts/.cache/hashes.json")

    # 3. Check Legal Identity
    for rel in ("src/components/Footer.tsx", "src/components/SimplePage.tsx", "src/lib/content.ts"):
        p = ROOT / rel
        if not p.exists():
            errors.append(f"Missing {rel}")
    combined_legal = "\n".join(
        (ROOT / rel).read_text()
        for rel in ("src/components/Footer.tsx", "src/components/SimplePage.tsx", "src/lib/content.ts")
        if (ROOT / rel).exists()
    )
    for token in ("CARLOS LINGAN BORJA", "Lima, Peru", "info@charlielingan.com"):
        if token not in combined_legal:
            errors.append(f"Missing legal token {token!r} in Footer/SimplePage/content.ts")
    for rel in ("src/components/Footer.tsx", "src/components/SimplePage.tsx"):
        if "LEGAL_LINE" not in (ROOT / rel).read_text():
            errors.append(f"LEGAL_LINE not rendered in {rel}")

    # 4. Check Amazon Associates compliance
    amz_raw = (DATA_DIR / "amazon-products.json").read_text()
    amz_box = (ROOT / "src/components/AmazonAffiliateBox.tsx").read_text()
    amz_lib = (ROOT / "src/lib/amazon.ts").read_text()
    if "officecleaningcost-20" not in amz_lib and "officecleaningcost-20" not in (ROOT / "src/lib/client-constants.ts").read_text():
        errors.append("Missing officecleaningcost-20 Amazon US tag")
    for bad in ("★★★★★", "4.8/5", "4.7/5"):
        if bad in amz_raw or bad in amz_box:
            errors.append(f"Forbidden rating token {bad} in Amazon data/component")
    if re.search(r"\$\d+", amz_raw):
        errors.append("Static dollar price detected in amazon-products.json")

    for template in (
        "src/app/page.tsx",
        "src/components/CalculatorWidget.tsx",
        "src/components/QuoteComparisonTool.tsx",
        "src/app/[categoria]/page.tsx",
        "src/components/ArticleLayout.tsx",
        "src/components/SimplePage.tsx",
    ):
        tp = ROOT / template
        if not tp.exists() or "AmazonAffiliateBox" not in tp.read_text():
            errors.append(f"AmazonAffiliateBox not mounted in {template}")

    print(
        f"Summary: pillars={pillars}/13, seo={seo_guides}/1000, transactional={transactional}/200, "
        f"cities={len(cities_seen)}/150, ambient_imgs={len(amb_files)}/18, article_imgs={art_img_ok}/1213"
    )
    if errors:
        print(f"SEO QUALITY CHECK FAILED ({len(errors)} errors):")
        for err in errors[:35]:
            print(" -", err)
        sys.exit(1)

    print("SEO QUALITY CHECK PASSED: All 1,213 articles, images (<100KB), legal pages, and Amazon cards verified.")


if __name__ == "__main__":
    main()
