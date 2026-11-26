#!/usr/bin/env python3
"""Builds src/data/keyword_map.json with 1,213 unique, non-cannibalizing URLs:
- 13 Pillar Hubs (/<pillar>/)
- 1,000 SEO Informational / Local / Commercial-Investigation Articles
- 200 Exclusive Amazon US Transactional Articles
"""
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
CITIES = json.loads((ROOT / "src/data/cities.json").read_text())
CATS = json.loads((ROOT / "src/data/categories.json").read_text())
PRODUCTS = json.loads((ROOT / "src/data/amazon-products.json").read_text())
OUT = ROOT / "src/data/keyword_map.json"

PRODS_BY_CAT = {}
for p in PRODUCTS:
    PRODS_BY_CAT.setdefault(p["category"], []).append(p["id"])


def pick_prods(cats_list, idx, n=3):
    pool = []
    for c in cats_list:
        pool.extend(PRODS_BY_CAT.get(c, []))
    if not pool:
        pool = [p["id"] for p in PRODUCTS]
    out = []
    for k in range(n):
        out.append(pool[(idx + k * 3) % len(pool)])
    return list(dict.fromkeys(out))


def clean_slug(s):
    return re.sub(r"[^a-z0-9-]+", "-", s.lower().strip()).strip("-")


entries = []
seen_slugs = set()
seen_titles = set()
seen_kws = set()


def add_entry(
    pillar,
    slug,
    is_pillar,
    is_transactional,
    primary_kw,
    intent,
    target_title,
    angle_brief,
    prod_cats,
    idx,
    city_slug=None,
):
    slug = clean_slug(slug)
    path = f"/{pillar}/" if is_pillar else f"/{pillar}/{slug}/"
    assert slug not in seen_slugs or is_pillar, f"Duplicate slug: {slug}"
    assert primary_kw.lower() not in seen_kws, f"Duplicate kw: {primary_kw}"
    assert target_title.lower() not in seen_titles, f"Duplicate title: {target_title}"
    if not is_pillar:
        seen_slugs.add(slug)
    seen_kws.add(primary_kw.lower())
    seen_titles.add(target_title.lower())
    n_prods = 5 if is_transactional else 3
    entries.append(
        {
            "id": len(entries) + 1,
            "slug": slug,
            "pillar": pillar,
            "path": path,
            "isPillar": is_pillar,
            "isTransactional": is_transactional,
            "primaryKeyword": primary_kw,
            "intent": intent,
            "targetTitle": target_title,
            "angleBrief": angle_brief,
            "citySlug": city_slug,
            "suggestedProductIds": pick_prods(prod_cats, idx, n=n_prods),
            "relatedPaths": [],
        }
    )


# 0. Add 13 Pillars
PILLAR_PROD_MAP = {
    "office-cleaning-cost-guides": ["backpack-vacuums", "mops-and-buckets", "paper-and-liners"],
    "city-cleaning-costs": ["entrance-mats", "mops-and-buckets", "chemicals-disinfectants"],
    "facility-cleaning-costs": ["chemicals-disinfectants", "air-purifiers", "restroom-dispensers"],
    "cleaning-services-and-tasks": ["carpet-extractors", "floor-machines", "cloths-window-safety"],
    "cleaning-frequency-and-schedules": ["carts-and-bins", "paper-and-liners", "backpack-vacuums"],
    "flooring-and-surface-cleaning-costs": ["floor-machines", "mops-and-buckets", "chemicals-disinfectants"],
    "comparing-quotes-and-contracts": ["carts-and-bins", "restroom-dispensers", "paper-and-liners"],
    "in-house-vs-outsourced-cleaning": ["carts-and-bins", "upright-vacuums", "chemicals-disinfectants"],
    "green-cleaning-and-osha-compliance": ["chemicals-disinfectants", "air-purifiers", "cloths-window-safety"],
    "commercial-vacuums-and-floor-machines": ["backpack-vacuums", "upright-vacuums", "carpet-extractors", "floor-machines"],
    "janitorial-carts-mops-and-tools": ["carts-and-bins", "mops-and-buckets", "cloths-window-safety"],
    "restroom-and-breakroom-dispensers": ["restroom-dispensers", "paper-and-liners"],
    "commercial-cleaning-chemicals-and-mats": ["chemicals-disinfectants", "entrance-mats", "paper-and-liners", "air-purifiers"],
}

for idx, c in enumerate(CATS):
    add_entry(
        pillar=c["slug"],
        slug=c["slug"],
        is_pillar=True,
        is_transactional=c["isTransactional"],
        primary_kw=c["name"].lower(),
        intent="pillar",
        target_title=f"{c['name']}: Complete US Benchmarks & Guides",
        angle_brief=c["description"] + " Serves as the authoritative hub linking all child articles in this silo.",
        prod_cats=PILLAR_PROD_MAP[c["slug"]],
        idx=idx,
    )

# 1. Silo 1: office-cleaning-cost-guides (110)
S1_SQFT = [
    (500, "Micro Suite"), (750, "Small Studio"), (1000, "Startup Suite"), (1200, "Boutique Office"),
    (1500, "Single-Suite Office"), (1800, "Growing Team Suite"), (2000, "Standard Small Office"),
    (2500, "Mid-Small Office"), (3000, "Multi-Room Office"), (3500, "Professional Workspace"),
    (4000, "Commercial Suite"), (4500, "Regional Branch"), (5000, "Mid-Size Office"),
    (6000, "Multi-Zone Suite"), (7500, "Open Floorplate"), (8000, "Corporate Wing"),
    (10000, "Full Floor"), (12000, "Mid-Rise Suite"), (15000, "Headquarters"),
    (18000, "Multi-Dept Wing"), (20000, "Corporate Floor"), (25000, "Commercial Building"),
    (30000, "Business Campus"), (40000, "Regional HQ"), (50000, "Tower Floor"),
    (75000, "Enterprise Campus"), (100000, "Flagship Headquarters"),
]
S1_SQFT_PATTERNS = [
    lambda sf, lb: f"Cost to Clean a {sf:,} Sq Ft {lb}: Weekly & Monthly Rates",
    lambda sf, lb: f"{sf:,} Sq Ft {lb} Janitorial Budget & Per-Visit Breakdown",
    lambda sf, lb: f"How Much for {sf:,} Sq Ft {lb} Cleaning? (Annual Estimates)",
    lambda sf, lb: f"Pricing Benchmarks for {sf:,} Sq Ft {lb}s (Hours & Crews)",
    lambda sf, lb: f"{sf:,} Sq Ft {lb} Quotes: Restrooms, Flooring & Frequency",
    lambda sf, lb: f"Monthly Maintenance Spend for a {sf:,} Sq Ft {lb}",
    lambda sf, lb: f"Per-Visit & Contract Math for {sf:,} Sq Ft {lb}s",
    lambda sf, lb: f"Estimating {sf:,} Sq Ft {lb} Vendor Proposals & Crew Time",
    lambda sf, lb: f"{sf:,} Sq Ft {lb} Sanitation Schedule & Supply Budgets",
]
for i, (sf, label) in enumerate(S1_SQFT):
    add_entry(
        "office-cleaning-cost-guides",
        f"cost-to-clean-a-{sf}-sq-ft-office",
        False, False,
        f"cost to clean a {sf} sq ft office",
        "informational",
        S1_SQFT_PATTERNS[i % len(S1_SQFT_PATTERNS)](sf, label),
        f"Exact per-visit, weekly, 3x/week, and 5x/week pricing math for a {sf:,} sq ft {label.lower()} using our official bracket rates and restroom surcharges.",
        ["backpack-vacuums", "mops-and-buckets", "paper-and-liners"], i
    )

S1_TOPICS = [
    ("average-office-cleaning-cost-per-square-foot", "average office cleaning cost per square foot", "Average Office Cleaning Cost per Square Foot in the US"),
    ("commercial-janitorial-hourly-rates-guide", "commercial janitorial hourly rates", "Commercial Janitorial Hourly Rates: $35 to $65+ Explained"),
    ("office-cleaning-minimum-charge-per-visit", "office cleaning minimum charge per visit", "Why Minimum Charges Apply to Small Office Cleaning Visits"),
    ("flat-rate-vs-hourly-office-cleaning-pricing", "flat rate vs hourly office cleaning", "Flat-Rate vs. Hourly Office Cleaning: Which Saves More?"),
    ("small-office-cleaning-monthly-budget-guide", "small office cleaning monthly budget", "Small Office Cleaning Monthly Budget Benchmarks Under 2,500 Sq Ft"),
    ("medium-office-janitorial-pricing-models", "medium office janitorial pricing", "Medium Office Janitorial Pricing (2,500–10,000 Sq Ft Breakdown)"),
    ("enterprise-corporate-campus-cleaning-cost", "enterprise corporate campus cleaning cost", "Enterprise & Corporate Campus Cleaning Cost per Sq Ft"),
    ("how-janitorial-production-rates-determine-price", "janitorial production rates sq ft per hour", "How ISSA Cleaning Production Rates Drive Your Vendor Quote"),
    ("cost-per-restroom-in-commercial-cleaning-quotes", "cost per restroom commercial cleaning", "How Each Office Restroom Adds $15–$30 to Your Visit Quote"),
    ("office-cleaning-cost-per-employee-headcount", "office cleaning cost per employee", "Estimating Office Cleaning Cost by Employee Headcount & Density"),
    ("one-time-deep-office-cleaning-cost-guide", "one time deep office cleaning cost", "One-Time Deep Office Cleaning Cost vs Recurring Contracts"),
    ("initial-first-time-office-clean-setup-fee", "initial office deep clean fee", "Why Vendors Charge an Initial Deep Clean Setup Fee"),
    ("after-hours-vs-daytime-office-cleaning-rates", "after hours vs daytime office cleaning cost", "After-Hours Night Crew vs. Daytime Office Cleaning Rates"),
    ("weekend-office-cleaning-surcharge-rates", "weekend office cleaning rates", "Weekend & Saturday Office Cleaning Surcharges Explained"),
    ("holiday-office-cleaning-schedule-pricing", "holiday office cleaning pricing", "How Federal Holidays Impact Monthly Janitorial Billing"),
    ("office-cleaning-cost-with-supplies-included", "office cleaning cost with supplies included", "Supplies Included vs. Client-Supplied Consumables Pricing"),
    ("how-much-do-commercial-cleaners-charge-per-desk", "office cleaning cost per cubicle or desk", "Calculating Workstation & Cubicle Sanitizing Costs per Desk"),
    ("multi-floor-office-building-cleaning-cost", "multi floor office building cleaning cost", "Multi-Floor Office Building Pricing & Elevator Logistics"),
    ("triple-net-nnn-lease-janitorial-cost-allocation", "triple net lease janitorial cost", "Triple-Net (NNN) Lease Janitorial Cost per Sq Ft Explained"),
    ("full-service-gross-lease-cleaning-standards", "full service gross lease cleaning scope", "Full-Service Gross Lease Cleaning Scope vs. Tenant Add-Ons"),
    ("quarterly-annual-office-cleaning-budget-forecast", "annual office cleaning budget forecast", "Building an Annual Office Cleaning & Consumables Budget"),
    ("seasonal-winter-salt-office-cleaning-surcharge", "winter salt office cleaning cost", "How Winter Snow & Salt Tracking Raises Seasonal Cleaning Bills"),
    ("office-move-in-move-out-cleaning-cost", "office move in move out cleaning cost", "Commercial Office Move-In and Move-Out Cleaning Rates"),
    ("lease-end-broom-swept-commercial-cleaning-cost", "broom swept office cleaning cost", "Lease-End Broom-Swept vs. White-Glove Commercial Turnovers"),
    ("emergency-spill-biohazard-office-cleaning-cost", "emergency office spill cleaning cost", "Emergency Spill & After-Hours Biohazard Cleanup Rates"),
    ("shared-suite-common-area-cleaning-cost-split", "shared office common area cleaning split", "Splitting Common-Area & Lobby Cleaning Costs Across Tenants"),
    ("high-density-call-center-cleaning-cost", "call center office cleaning cost", "High-Density Call Center Cleaning Rates & Shift Turnovers"),
    ("open-concept-office-vs-private-offices-cost", "open concept vs private office cleaning cost", "Open-Plan Offices vs. Private Suites: Cleaning Time & Cost"),
    ("executive-floor-white-glove-cleaning-rates", "executive suite white glove cleaning cost", "Executive Floor White-Glove Detailing & Boardroom Pricing"),
    ("suburban-office-park-vs-downtown-tower-rates", "suburban office park vs downtown cleaning cost", "Suburban Office Parks vs. Downtown High-Rise Cleaning Rates"),
    ("cleaning-cost-for-offices-with-pets-dogs", "dog friendly office cleaning cost", "How Pet-Friendly Office Policies Affect Janitorial Pricing"),
    ("hybrid-work-office-cleaning-cost-savings", "hybrid work office cleaning cost reduction", "Adjusting Cleaning Budgets for 2-Day & 3-Day Hybrid Offices"),
    ("peak-cold-flu-season-sanitizing-budget", "flu season office sanitizing cost", "Seasonal Flu & Cold High-Touch Disinfection Cost Add-Ons"),
    ("night-crew-minimum-hours-and-trip-fees", "janitorial trip fee minimum hours", "Understanding Janitorial Trip Fees & 2-Hour Crew Minimums"),
    ("how-ceiling-height-and-glass-impact-cleaning-cost", "office interior glass partition cleaning cost", "How Floor-to-Ceiling Glass Partitions Affect Cleaning Quotes"),
    ("parking-validation-and-downtown-access-fees", "downtown parking fee office cleaning quote", "Parking & Freight Elevator Surcharges in Downtown Bids"),
    ("24-hour-operations-office-cleaning-pricing", "24 hour office cleaning cost", "Pricing Janitorial Coverage for 24/7 Operations Centers"),
    ("quarterly-deep-clean-amortized-monthly-cost", "amortized quarterly deep clean cost", "Amortizing Quarterly Deep Cleans Into Flat Monthly Invoices"),
    ("office-cleaning-price-inflation-and-wage-trends", "office cleaning price inflation trends", "Why Commercial Cleaning Quotes Rose: Wage & Insurance Drivers"),
    ("negotiating-multi-year-office-cleaning-rate-locks", "multi year janitorial contract rate lock", "Multi-Year Commercial Cleaning Contracts & CPI Escalation Caps"),
    ("small-business-tax-deduction-office-cleaning", "is office cleaning tax deductible", "Tax Deductibility & Accounting Categories for Office Cleaning"),
    ("janitorial-cost-benchmark-1-person-vs-2-person-crew", "1 person vs 2 person cleaning crew cost", "Solo Cleaner vs. Two-Person Crew: Speed & Pricing Impact"),
    ("how-carpet-to-hard-floor-ratio-changes-quotes", "carpet vs hard floor office quote", "How Your Carpet-to-Hard-Floor Ratio Shifts Monthly Quotes"),
    ("conference-center-and-training-room-cleaning-rates", "office conference center cleaning cost", "Event-Driven Conference & Training Room Reset Pricing"),
    ("breakroom-kitchen-appliance-cleaning-add-on-cost", "office breakroom cleaning add on cost", "Breakroom, Microwave & Fridge Deep-Clean Pricing Breakdown"),
    ("reception-and-lobby-daily-maintenance-cost", "office lobby reception cleaning cost", "First-Impression Lobby & Reception Maintenance Pricing"),
    ("mailroom-and-copy-center-cleaning-scope-cost", "office mailroom copy room cleaning", "Mailroom, Shipping Desk & Copy Center Dust Control Costs"),
    ("server-room-it-closet-cleaning-cost-protocol", "office server room cleaning cost", "Static-Safe Server Room & IDF Closet Cleaning Rates"),
    ("basement-storage-archive-office-cleaning-cost", "office storage archive cleaning cost", "Low-Traffic Archive & Basement Storage Cleaning Pricing"),
    ("rooftop-terrace-and-patio-office-cleaning-cost", "office terrace patio cleaning cost", "Corporate Rooftop Terrace & Outdoor Break Patio Cleaning Cost"),
    ("how-to-calculate-office-cleaning-cost-yourself", "how to calculate office cleaning cost", "Step-by-Step Formula to Estimate Office Cleaning Yourself"),
    ("cost-difference-independent-cleaner-vs-franchise", "independent cleaner vs janitorial franchise cost", "Independent Commercial Cleaners vs. National Franchises Cost"),
    ("cost-per-hour-vs-cost-per-visit-benchmarks", "hourly vs per visit office cleaning benchmark", "Converting Hourly Janitorial Bids to Per-Visit Sq Ft Math"),
]
# Need 110 - 27 = 83 topics; we have 53 above, add 30 distinct specific scenarios:
S1_EXTRA = [
    ("office-cleaning-cost-by-day-of-week", "cheapest day of week office cleaning", "Does Choosing Mid-Week vs. Friday Visits Lower Cleaning Cost?"),
    ("office-cleaning-for-5-employees-to-20-employees", "office cleaning cost 5 to 20 employees", "Cleaning Cost Benchmarks for Teams of 5 to 20 Employees"),
    ("office-cleaning-for-25-to-50-employees", "office cleaning cost 25 to 50 employees", "Cleaning Budgets for Growing 25–50 Person Offices"),
    ("office-cleaning-for-100-to-250-employees", "office cleaning cost 100 to 250 employees", "Enterprise Janitorial Budgets for 100–250 Employee Floors"),
    ("office-cleaning-for-500-plus-employees", "office cleaning cost 500 employees", "Managing Janitorial Spend for 500+ Staff Headquarters"),
    ("how-elevator-wait-times-add-labor-cost", "elevator wait time janitorial labor cost", "How High-Rise Freight Elevator Delays Increase Cleaning Bills"),
    ("trash-haul-out-and-dumpster-distances-cost", "janitorial trash haul out labor cost", "How Loading-Dock Distance Affects Monthly Trash Pull Fees"),
    ("office-chair-and-upholstery-cleaning-cost", "office chair upholstery cleaning cost", "Fabric Task Chair & Reception Sofa Cleaning Rates per Seat"),
    ("cubicle-fabric-panel-steam-cleaning-cost", "cubicle partition cleaning cost", "Fabric Cubicle Partition & Acoustic Panel Cleaning Pricing"),
    ("office-blind-and-shade-cleaning-cost", "office window blind cleaning cost", "Commercial Horizontal Blind & Roller Shade Cleaning Rates"),
    ("overhead-air-duct-and-diffuser-cleaning-cost", "office ceiling vent diffuser cleaning cost", "Ceiling Diffuser, Return Grille & High-Dusting Pricing"),
    ("light-fixture-and-chandelier-office-dusting-cost", "office light fixture cleaning cost", "Atrium Light Fixture & Acoustic Baffle Dusting Costs"),
    ("elevator-cab-and-brass-polishing-cost", "office elevator cab cleaning cost", "Elevator Track Vacuuming & Stainless Panel Polishing Cost"),
    ("stairwell-and-fire-escape-cleaning-cost", "commercial stairwell cleaning cost", "Multi-Story Office Stairwell Sweeping & Handrail Pricing"),
    ("coffee-station-and-espresso-bar-cleaning-cost", "office coffee bar cleaning cost", "Office Coffee Station, Sink & Counter Sanitizing Costs"),
    ("water-cooler-and-ice-machine-exterior-cleaning", "office ice machine exterior cleaning cost", "Breakroom Ice Maker & Bottleless Cooler Hygiene Pricing"),
    ("microwave-and-refrigerator-monthly-cleanout-cost", "office fridge microwave cleanout cost", "Monthly Office Refrigerator Cleanout & Microwave Pricing"),
    ("dishwashing-and-mug-handling-janitorial-cost", "office breakroom dishwashing cleaning cost", "Why Breakroom Dishwashing Triggers Extra Janitorial Fees"),
    ("glass-whiteboard-and-conference-table-care-cost", "office whiteboard conference table cleaning", "Conference Table Polishing & Glass Whiteboard Care Costs"),
    ("printer-station-toner-dust-cleanup-cost", "office printer station toner cleaning", "Print Hub & Toner Particulate Microfiber Cleaning Rates"),
    ("mother-nursing-room-sanitation-cost", "office lactation room cleaning cost", "Wellness & Lactation Room Daily Sanitizing Scope & Cost"),
    ("on-site-office-gym-and-shower-cleaning-cost", "office fitness locker room cleaning cost", "Corporate Fitness Room & Locker Shower Cleaning Add-On Cost"),
    ("bike-storage-room-and-garage-vestibule-cost", "office bike room vestibule cleaning cost", "Ground-Floor Bike Room & Garage Vestibule Cleaning Rates"),
    ("loading-dock-and-service-corridor-cleaning-cost", "office loading dock corridor cleaning", "Service Corridor & Receiving Dock Sweeping Pricing"),
    ("parking-garage-elevator-lobby-cleaning-cost", "office parking garage lobby cleaning", "Parking Deck Vestibule & Pay-Station Cleaning Costs"),
    ("short-term-pop-up-office-cleaning-cost", "short term lease office cleaning cost", "Short-Term & Swing-Space Office Cleaning Pricing"),
    ("subleased-office-cleaning-cost-guide", "subleased office cleaning cost", "Subleased Office Suite Cleaning Responsibilities & Pricing"),
    ("summer-vacation-lull-cleaning-schedule-cost", "seasonal summer office cleaning reduction", "Pausing or Scaling Down Cleaning During Slow Business Months"),
    ("year-end-holiday-office-deep-clean-cost", "year end office deep clean cost", "Year-End Office Reset & Carpet Extraction Pricing"),
    ("how-janitorial-markup-and-overhead-work", "janitorial company profit margin overhead", "Breaking Down a Cleaning Quote: Labor, Taxes, Supplies & Margin"),
]
for i, (sl, kw, tt) in enumerate(S1_TOPICS + S1_EXTRA):
    add_entry(
        "office-cleaning-cost-guides", sl, False, False, kw, "informational", tt,
        f"In-depth US pricing breakdown for '{kw}' with real dollar ranges, labor-hour math, and budget tips.",
        ["backpack-vacuums", "mops-and-buckets", "cloths-window-safety"], 27 + i
    )

# 2. Silo 2: city-cleaning-costs (150 - 1 per city)
CITY_TITLE_PATTERNS = [
    lambda cn, sc, st, d1, hr: f"Office Cleaning Cost in {cn}, {sc}: {d1} & Metro Rates",
    lambda cn, sc, st, d1, hr: f"{cn}, {sc} Commercial Janitorial Rates (${hr[0]}–${hr[1]}/Hr)",
    lambda cn, sc, st, d1, hr: f"How Much Is {cn}, {sc} Office Cleaning? ({d1} Guide)",
    lambda cn, sc, st, d1, hr: f"{cn}, {sc} Janitorial Budgets: {d1} Monthly Estimates",
    lambda cn, sc, st, d1, hr: f"Commercial Cleaning Cost Index for {cn}, {sc} ({d1})",
    lambda cn, sc, st, d1, hr: f"{cn}, {sc} Building Maintenance Pricing: {d1} Visit Math",
    lambda cn, sc, st, d1, hr: f"Hiring Office Cleaners in {cn}, {sc}: {d1} Wage Benchmarks",
    lambda cn, sc, st, d1, hr: f"{cn}, {sc} Facility Sanitation Rates ({d1} Suites)",
    lambda cn, sc, st, d1, hr: f"{cn}, {st} ({sc}) Suite Cleaning Prices & {d1} Rates",
    lambda cn, sc, st, d1, hr: f"Average {cn}, {sc} Janitorial Contracts & {d1} Quote Ranges",
    lambda cn, sc, st, d1, hr: f"What {cn}, {sc} Companies Pay Near {d1} for Cleaning",
    lambda cn, sc, st, d1, hr: f"{cn}, {sc} Metro Upkeep Costs ({d1} Flooring & Shifts)",
]
for i, c in enumerate(CITIES):
    cname, sc, st, mult, hr = c["city"], c["stateCode"], c["state"], c["costMultiplier"], c["hourlyRange"]
    parts = [p.strip() for p in c["businessDistricts"].split(",")]
    d1 = next((p for p in parts if not p.lower().startswith("downtown")), parts[0])
    tt = CITY_TITLE_PATTERNS[i % len(CITY_TITLE_PATTERNS)](cname, sc, st, d1, hr)
    add_entry(
        "city-cleaning-costs",
        f"office-cleaning-cost-{c['slug']}",
        False, False,
        f"office cleaning cost {cname.lower()} {sc.lower()}",
        "local",
        tt,
        f"Localized janitorial pricing for {cname}, {sc} (multiplier {mult}x, hourly ${hr[0]}–${hr[1]}). Includes 2k/5k/10k/25k sq ft budget tables, {c['businessDistricts']} context, climate wear ({c['climateWearNote']}), and local rules ({c['regulatoryNote']}).",
        ["entrance-mats", "mops-and-buckets", "chemicals-disinfectants"], i, city_slug=c["slug"]
    )

# 3. Silo 3: facility-cleaning-costs (120)
FACILITIES = [
    ("medical-clinic", "Medical Clinic & Outpatient Suite"),
    ("dental-office", "Dental Office & Orthodontic Clinic"),
    ("law-firm", "Law Firm & Legal Suite"),
    ("accounting-cpa-office", "Accounting & CPA Firm Office"),
    ("coworking-space", "Coworking Space & Shared Office"),
    ("bank-branch", "Bank Branch & Credit Union"),
    ("financial-advisory-office", "Wealth Management & Financial Office"),
    ("real-estate-brokerage", "Real Estate Brokerage Office"),
    ("insurance-agency", "Insurance Agency Office"),
    ("tech-startup-office", "Tech Startup & Engineering Suite"),
    ("architecture-design-studio", "Architecture & Design Studio"),
    ("marketing-creative-agency", "Marketing & Creative Agency"),
    ("veterinary-clinic-office", "Veterinary Clinic & Admin Suite"),
    ("physical-therapy-clinic", "Physical Therapy & Rehab Office"),
    ("chiropractic-clinic", "Chiropractic & Wellness Clinic"),
    ("optometry-eye-clinic", "Optometry & Optical Retail Office"),
    ("dermatology-medspa-office", "Dermatology & MedSpa Suite"),
    ("mental-health-therapy-office", "Therapy & Counseling Practice"),
    ("urgent-care-center", "Urgent Care Facility"),
    ("diagnostic-lab-office", "Diagnostic Lab & Blood Draw Suite"),
    ("pharmacy-admin-office", "Compounding Pharmacy & Admin Office"),
    ("church-admin-office", "Church & Religious Admin Building"),
    ("nonprofit-headquarters", "Nonprofit Organization Office"),
    ("private-school-admin-office", "Private School Admin & Faculty Wing"),
    ("tutoring-learning-center", "Tutoring & Test Prep Center"),
    ("daycare-preschool-office", "Daycare & Preschool Admin Suite"),
    ("fitness-gym-office", "Boutique Fitness Studio & Office"),
    ("yoga-pilates-studio", "Yoga & Pilates Studio"),
    ("auto-dealership-showroom-office", "Auto Dealership Showroom & Offices"),
    ("property-management-leasing-office", "Apartment Leasing & Property Office"),
    ("logistics-warehouse-office", "Warehouse Front Office & Dispatch"),
    ("manufacturing-plant-office", "Manufacturing Plant Admin Wing"),
    ("construction-trailer-field-office", "Construction Site Trailer & Field Office"),
    ("recording-podcast-studio-office", "Media, Podcast & Production Office"),
    ("travel-hospitality-admin-office", "Hotel Back-Office & Hospitality Admin"),
    ("government-municipal-office", "Municipal & Government Contractor Suite"),
    ("union-hall-office", "Union Hall & Training Office"),
    ("research-biotech-office", "Biotech & Life Sciences Office Wing"),
    ("telemarketing-bpo-center", "BPO & Customer Support Center"),
    ("executive-suites-business-center", "Regus-Style Executive Business Center"),
]
FAC_T1 = [
    lambda fn: f"{fn} Cleaning Cost: Per-Sq-Ft & Monthly Rates",
    lambda fn: f"How Much Does {fn} Janitorial Service Cost?",
    lambda fn: f"{fn} Maintenance Pricing & Annual Budget Guide",
    lambda fn: f"Budgeting Contract Upkeep for a {fn}",
    lambda fn: f"{fn} Typical Per-Visit & Weekly Quotes",
    lambda fn: f"Monthly Janitorial Spend Benchmarks for {fn}s",
    lambda fn: f"Calculating {fn} Square-Foot Cleaning Proposals",
    lambda fn: f"{fn} Crew Rates & Restroom Pricing Breakdown",
]
FAC_T2 = [
    lambda fn: f"{fn} Janitorial Scope Checklist & Labor Hours",
    lambda fn: f"Daily & Weekly Task List for {fn} Crews",
    lambda fn: f"Production Benchmarks & Work Scope: {fn}",
    lambda fn: f"What Vendors Clean Inside a {fn} (Room-by-Room)",
    lambda fn: f"Estimating Labor Minutes & Tasks for {fn}s",
    lambda fn: f"Custom SOW Template for {fn} Housekeeping",
    lambda fn: f"High-Touch & Floor Maintenance Routines: {fn}",
    lambda fn: f"Nightly vs. Periodic Duty Roster for {fn}s",
]
FAC_T3 = [
    lambda fn: f"{fn} Compliance, Bonding & Disinfection Fees",
    lambda fn: f"Insurance, Security & Sanitation Add-Ons: {fn}",
    lambda fn: f"Regulatory & Chemical Surcharges in {fn} Bids",
    lambda fn: f"Background Checks, HIPAA/OSHA & Specialty Gear for {fn}s",
    lambda fn: f"Why {fn} Quotes Exceed Standard Corporate Suites",
    lambda fn: f"Infection Control & Vetting Costs for {fn} Contracts",
    lambda fn: f"Liability Coverage & EPA Disinfectant Rules: {fn}",
    lambda fn: f"Security Badging & Specialty Hygiene Pricing in {fn}s",
]
# 40 facilities x 3 distinct non-overlapping intents = 120!
for i, (fslug, fname) in enumerate(FACILITIES):
    core = fname.split("&")[0].strip()
    clow = core.lower()
    add_entry(
        "facility-cleaning-costs", f"{fslug}-cleaning-cost", False, False,
        f"{fslug.replace('-', ' ')} rates", "informational",
        FAC_T1[i % 8](fname),
        f"Benchmark pricing per sq ft and per month specifically for a {fname}, detailing restroom density, traffic wear, and recommended weekly frequency.",
        ["chemicals-disinfectants", "restroom-dispensers", "backpack-vacuums"], i * 3
    )
    add_entry(
        "facility-cleaning-costs", f"{fslug}-cleaning-checklist-scope", False, False,
        f"{fslug.replace('-', ' ')} scope tasks", "informational",
        FAC_T2[i % 8](fname),
        f"Task-by-task daily, weekly, and monthly scope of work for a {fname}, explaining which specialty tasks push labor hours above standard office rates.",
        ["cloths-window-safety", "mops-and-buckets", "air-purifiers"], i * 3 + 1
    )
    add_entry(
        "facility-cleaning-costs", f"{fslug}-disinfection-and-compliance-pricing", False, False,
        f"{fslug.replace('-', ' ')} compliance fees", "informational",
        FAC_T3[i % 8](fname),
        f"How regulatory standards, background checks, specialized EPA chemicals, and after-hours access affect vendor bids for a {fname}.",
        ["chemicals-disinfectants", "air-purifiers", "paper-and-liners"], i * 3 + 2
    )

# 4. Silo 4: cleaning-services-and-tasks (140)
TASKS_28 = [
    ("restroom-sanitization", "Commercial Restroom Sanitization & Descaling"),
    ("carpet-hot-water-extraction", "Commercial Carpet Hot-Water Extraction"),
    ("carpet-low-moisture-encapsulation", "Low-Moisture Carpet Encapsulation"),
    ("vct-strip-and-wax", "VCT Floor Stripping and Waxing"),
    ("vct-scrub-and-recoat", "VCT Top-Scrub and Recoat"),
    ("high-speed-floor-burnishing", "High-Speed Propane & Electric Floor Burnishing"),
    ("tile-and-grout-deep-cleaning", "Commercial Tile and Grout Deep Scrubbing"),
    ("interior-glass-partition-cleaning", "Interior Office Glass & Partition Cleaning"),
    ("exterior-ground-floor-window-washing", "Ground-Floor Commercial Window Washing"),
    ("high-rise-exterior-window-cleaning", "Multi-Story Exterior Office Window Cleaning"),
    ("electrostatic-disinfection-spraying", "Electrostatic Disinfection Spraying"),
    ("day-porter-services", "Full-Time & Part-Time Day Porter Services"),
    ("post-construction-rough-and-final-clean", "Post-Construction Office Cleanup (Rough & Final)"),
    ("office-renovation-dust-remediation", "Tenant Improvement Renovation Dust Cleanup"),
    ("high-dusting-exposed-ceilings", "Exposed Ceiling, Beam & Ductwork High Dusting"),
    ("breakroom-deep-sanitization", "Commercial Breakroom & Appliance Deep Cleaning"),
    ("upholstery-partition-steam-cleaning", "Office Chair & Fabric Panel Steam Cleaning"),
    ("pressure-washing-office-walkways", "Office Entry Sidewalk & Patio Pressure Washing"),
    ("marble-terrazzo-honing-and-polishing", "Lobby Marble & Terrazzo Honing and Sealing"),
    ("concrete-densifying-and-polishing", "Office Polished Concrete Buffing & Sealing"),
    ("trash-and-recycling-valet-service", "Multi-Floor Trash & Recycling Pulls"),
    ("restroom-consumable-restocking-service", "Restroom Paper, Soap & Liner Replenishment"),
    ("covid-norovirus-outbreak-decontamination", "Outbreak & Biohazard Office Decontamination"),
    ("odor-remediation-and-ozone-treatment", "Commercial Office Odor Neutralization"),
    ("workstation-it-peripherals-sanitizing", "Keyboard, Monitor & Desk Phone Sanitizing"),
    ("cubicle-deep-vacuum-and-baseboard-detailing", "Baseboard, Kickplate & Corner Detailing"),
    ("blind-ultrasonic-and-shade-cleaning", "Ultrasonic Blind & Roller Shade Cleaning"),
    ("floor-mat-rental-vs-purchased-cleaning", "Entrance Mat Vacuuming vs. Mat Exchange Programs"),
]
# 28 tasks x 5 distinct angles = 140!
for i, (tslug, tname) in enumerate(TASKS_28):
    short = tname.split("(")[0].strip().lower()
    stem = tslug.replace("-", " ")
    add_entry(
        "cleaning-services-and-tasks", f"{tslug}-cost-guide", False, False,
        f"{short} unit price", "informational",
        f"{tname} Cost: Per-Sq-Ft & Hourly Rates",
        f"National US pricing ranges for {short}, showing unit rates (per sq ft, per fixture, or per hour) and minimum service charges.",
        ["carpet-extractors", "floor-machines", "cloths-window-safety"], i * 5
    )
    add_entry(
        "cleaning-services-and-tasks", f"{tslug}-for-small-vs-large-offices", False, False,
        f"small vs large {stem} volume", "informational",
        f"{tname} Pricing: Small Suites vs. Large Floors",
        f"How economies of scale change unit pricing for {short} between 2,000 sq ft offices and 25,000+ sq ft buildings.",
        ["floor-machines", "mops-and-buckets", "chemicals-disinfectants"], i * 5 + 1
    )
    add_entry(
        "cleaning-services-and-tasks", f"how-often-to-schedule-{tslug}", False, False,
        f"quarterly annual calendar {stem}", "informational",
        f"Recommended Frequency for {tname} & Annual Spend",
        f"Foot-traffic thresholds (low, medium, heavy) dictating whether to schedule {short} monthly, quarterly, or annually—and its annualized cost.",
        ["chemicals-disinfectants", "carts-and-bins", "entrance-mats"], i * 5 + 2
    )
    add_entry(
        "cleaning-services-and-tasks", f"{tslug}-included-vs-add-on-quotes", False, False,
        f"extra charge {stem}", "commercial-investigation",
        f"Is {tname} Included in Standard Cleaning or Billed Extra?",
        f"Contract audit guide clarifying when vendors fold {short} into monthly base retainers versus charging separate project work-order invoices.",
        ["carts-and-bins", "cloths-window-safety", "paper-and-liners"], i * 5 + 3
    )
    add_entry(
        "cleaning-services-and-tasks", f"factors-raising-{tslug}-quotes", False, False,
        f"obstacles soil load {stem}", "informational",
        f"5 Site Factors That Increase {tname} Quotes",
        f"Obstacles, furniture-moving labor, after-hours security escorts, and soil load conditions that raise {short} estimates by 15%–45%.",
        ["carpet-extractors", "chemicals-disinfectants", "restroom-dispensers"], i * 5 + 4
    )

# 5. Silo 5: cleaning-frequency-and-schedules (80)
FREQ_TOPICS = [
    ("monthly-office-cleaning-cost", "monthly office cleaning cost", "Monthly (1x/Month) Office Cleaning Cost & Best Fit"),
    ("biweekly-office-cleaning-cost", "biweekly office cleaning cost", "Biweekly (Every 2 Weeks) Office Cleaning Cost Breakdown"),
    ("weekly-office-cleaning-cost", "weekly 1x week office cleaning cost", "Once-Weekly (1x/Week) Office Cleaning Cost Guide"),
    ("twice-weekly-office-cleaning-cost", "twice weekly 2x week office cleaning cost", "Twice-Weekly (2x/Week) Office Cleaning Rates"),
    ("three-times-weekly-office-cleaning-cost", "3 times a week office cleaning cost", "3x/Week Office Cleaning Cost: The Sweet Spot for Mid-Size Suites"),
    ("daily-5-days-office-cleaning-cost", "5 days a week daily office cleaning cost", "Daily Weekday (5x/Week) Office Cleaning Pricing"),
    ("seven-days-a-week-office-cleaning-cost", "7 days a week office cleaning cost", "7-Day-a-Week Commercial Cleaning Cost & Shift Math"),
    ("weekly-vs-biweekly-office-cleaning-comparison", "weekly vs biweekly office cleaning cost", "Weekly vs. Biweekly Office Cleaning: Total Annual Difference"),
    ("3x-week-vs-5x-week-office-cleaning-savings", "3x vs 5x week office cleaning cost", "3x/Week vs. 5x/Week Cleaning: How Much Do You Actually Save?"),
    ("1x-week-vs-2x-week-small-office-cost", "1x vs 2x week small office cleaning", "1x/Week vs. 2x/Week for Offices Under 3,000 Sq Ft"),
]
# Add 70 more unique schedule/shift/occupancy topics to reach 80:
SHIFT_SCENARIOS = [
    ("early-morning-5am-office-cleaning", "Early Morning (5 AM–8 AM) Office Cleaning"),
    ("business-hours-daytime-office-cleaning", "Business-Hours Daytime Office Cleaning"),
    ("evening-after-hours-6pm-office-cleaning", "Evening After-Hours (6 PM–10 PM) Cleaning"),
    ("overnight-graveyard-shift-cleaning", "Overnight Third-Shift Janitorial Coverage"),
    ("split-shift-day-porter-plus-night-crew", "Split-Shift Day Porter + Night Crew Hybrid"),
    ("on-demand-flexible-cleaning-blocks", "On-Demand & Flex-Schedule Cleaning"),
    ("1-day-hybrid-office-cleaning-schedule", "Monday-Only Single-Day Hybrid Cadence"),
    ("2-day-hybrid-office-cleaning-schedule", "Tuesday-Thursday Two-Day Staffing Cadence"),
    ("3-day-hybrid-office-cleaning-schedule", "Midweek Peak Three-Day Hybrid Cadence"),
    ("4-day-workweek-office-cleaning-schedule", "4-Day Compressed Workweek Cleaning Schedule"),
    ("peak-tax-season-cpa-cleaning-surge", "Seasonal Tax-Season CPA Surge Schedule"),
    ("summer-camp-and-school-break-schedule", "Academic Summer Recess Cleaning Schedule"),
    ("q4-retail-headquarters-surge-schedule", "Q4 Peak-Season Office Cleaning Surge"),
    ("rotating-zone-deep-cleaning-schedule", "Rotating Zone-Based Cleaning Schedule"),
    ("high-traffic-restroom-midday-refresh", "Midday Restroom Refresh Schedule"),
    ("monday-wednesday-friday-vs-tuesday-thursday", "MWF vs. Tuesday/Thursday Visit Split"),
    ("event-and-town-hall-cleaning-turnaround", "All-Hands & Town Hall Reset Turnaround"),
    ("building-alarm-and-security-lockup-windows", "Alarmed Suite Keyholder Window Scheduling"),
    ("multi-tenant-staggered-floor-scheduling", "Multi-Tenant Staggered Floor Cleaning"),
    ("weekend-only-deep-maintenance-schedule", "Weekend-Only Project & Deep Clean Schedule"),
    ("bi-monthly-quarterly-specialty-rotation", "Quarterly Carpet & VCT Rotation Calendar"),
    ("friday-evening-reset-vs-sunday-night", "Friday Evening Reset vs. Sunday Night Prep"),
    ("shared-desk-hoteling-daily-wipe-schedule", "Hot-Desking Daily Workstation Wipe Schedule"),
    ("winter-snow-event-on-call-schedule", "On-Call Winter Storm Lobby Cleanup Schedule"),
    ("medical-clinic-between-patient-turns", "Clinical Room Turnaround Scheduling"),
    ("24-hour-dispatch-quiet-zone-schedule", "24/7 Dispatch Quiet-Zone Cleaning Windows"),
    ("coworking-after-event-morning-reset", "Coworking Evening Event Morning Reset"),
    ("bank-dual-control-daytime-cleaning", "Bank Dual-Control Daytime Escort Scheduling"),
    ("law-firm-partner-suite-flexible-hours", "Law Firm Late-Night Partner Suite Scheduling"),
    ("tech-campus-free-lunch-breakroom-turns", "Tech Cafeteria Post-Lunch Cleanup Windows"),
    ("small-team-under-10-staff-frequency", "Under-10-Employee Suite Visit Planning"),
    ("mid-team-20-to-40-staff-frequency", "20–40 Employee Office Frequency Math"),
    ("dense-50-plus-staff-frequency", "50+ Employee High-Density Frequency Math"),
    ("restroom-only-daily-plus-weekly-full", "Daily Restrooms + Weekly Full Office Hybrid"),
    ("trash-and-kitchen-daily-plus-biweekly-floors", "Daily Trash/Kitchen + Biweekly Floor Care"),
]
for i, (sl, kw, tt) in enumerate(FREQ_TOPICS):
    add_entry("cleaning-frequency-and-schedules", sl, False, False, kw, "informational", tt,
              f"Detailed pricing and soil-accumulation math for '{kw}', comparing per-visit discounts against monthly totals.",
              ["carts-and-bins", "paper-and-liners", "backpack-vacuums"], i)

for i, (sc_slug, sc_name) in enumerate(SHIFT_SCENARIOS):
    stem = sc_name.lower()
    add_entry("cleaning-frequency-and-schedules", f"{sc_slug}-pricing", False, False,
              f"{stem} rates", "informational",
              f"{sc_name}: Hourly Rates & Crew Budgets",
              f"Cost impact, crew productivity, and security/HVAC considerations for {sc_name.lower()} in US offices.",
              ["backpack-vacuums", "carts-and-bins", "cloths-window-safety"], 10 + i * 2)
    add_entry("cleaning-frequency-and-schedules", f"when-to-choose-{sc_slug}", False, False,
              f"productivity savings window {i + 1} {stem}", "informational",
              f"Disruption vs. Savings Analysis: {sc_name}",
              f"Evaluating employee disruption, HVAC/lighting utility savings, and vendor rate discounts for {sc_name.lower()}.",
              ["air-purifiers", "paper-and-liners", "chemicals-disinfectants"], 10 + i * 2 + 1)

# 6. Silo 6: flooring-and-surface-cleaning-costs (90)
FLOORS_15 = [
    ("commercial-carpet-tiles", "Commercial Carpet Tiles & Broadloom"),
    ("vct-vinyl-composition-tile", "VCT (Vinyl Composition Tile)"),
    ("lvt-luxury-vinyl-plank", "LVT / LVP Commercial Vinyl Plank"),
    ("ceramic-and-porcelain-tile-grout", "Ceramic & Porcelain Tile with Grout"),
    ("engineered-and-solid-hardwood", "Commercial Engineered & Solid Hardwood"),
    ("polished-and-sealed-concrete", "Polished & Sealed Commercial Concrete"),
    ("lobby-marble-and-travertine", "Lobby Marble, Granite & Travertine Stone"),
    ("terrazzo-commercial-flooring", "Commercial Epoxy & Cement Terrazzo"),
    ("rubber-and-gym-mat-flooring", "Commercial Rubber & Fitness Flooring"),
    ("raised-access-data-center-floor", "Raised Access Computer Room Flooring"),
    ("slate-and-quarry-tile-breakrooms", "Quarry Tile & Breakroom Slip-Resistant Floor"),
    ("epoxy-coated-garage-and-lab-floors", "Epoxy-Coated Lab & Service Corridor Floors"),
    ("bamboo-and-cork-eco-flooring", "Bamboo & Cork Commercial Office Flooring"),
    ("linoleum-marmoleum-sheet-flooring", "Marmoleum / Sheet Linoleum Medical Flooring"),
    ("mixed-carpet-and-hard-surface-suites", "Mixed Carpet + Hard-Floor Office Suites"),
]
# 15 floors x 6 angles = 90!
for i, (fl_slug, fl_name) in enumerate(FLOORS_15):
    low = fl_name.split("(")[0].strip().lower()
    add_entry("flooring-and-surface-cleaning-costs", f"{fl_slug}-daily-cleaning-cost", False, False,
              f"{low} daily cleaning multiplier", "informational",
              f"{fl_name} Daily Cleaning Cost & Labor Multiplier",
              f"Per-sq-ft routine cleaning costs and labor-hour benchmarks for {low} in US commercial buildings.",
              ["floor-machines", "mops-and-buckets", "backpack-vacuums"], i * 6)
    add_entry("flooring-and-surface-cleaning-costs", f"{fl_slug}-periodic-restoration-cost", False, False,
              f"{low} restoration refinishing rates", "informational",
              f"{fl_name} Periodic Deep Restoration & Refinishing Rates",
              f"Quarterly and annual deep-restoration pricing (extraction, stripping, sealing, or honing) for {low}.",
              ["carpet-extractors", "floor-machines", "chemicals-disinfectants"], i * 6 + 1)
    add_entry("flooring-and-surface-cleaning-costs", f"{fl_slug}-chemicals-and-equipment-guide", False, False,
              f"{low} neutral chemicals pads", "informational",
              f"Surface-Safe Chemicals & Equipment for {fl_name}",
              f"Neutral pH requirements, pad colors, and machine RPM limits to avoid voiding warranties on {low}.",
              ["chemicals-disinfectants", "mops-and-buckets", "floor-machines"], i * 6 + 2)
    salt_title = (
        f"Protecting {fl_name} from Salt, Grit & Moisture Damage"
        if i % 3 == 0
        else f"Winter Ice-Melt & Matting Protection for {fl_name}"
        if i % 3 == 1
        else f"Moisture & De-Icer Defense Strategies for {fl_name}"
    )
    add_entry("flooring-and-surface-cleaning-costs", f"{fl_slug}-winter-salt-and-moisture-damage", False, False,
              f"{low} winter salt protection", "informational",
              salt_title,
              f"Matting lengths, neutralizer rinses, and preventive maintenance cost savings for {low}.",
              ["entrance-mats", "chemicals-disinfectants", "mops-and-buckets"], i * 6 + 3)
    add_entry("flooring-and-surface-cleaning-costs", f"{fl_slug}-annual-lifecycle-maintenance-budget", False, False,
              f"{low} 5 year maintenance budget", "informational",
              f"5-Year Cleaning & Maintenance Cost Model for {fl_name}",
              f"Total cost of ownership comparing daily janitorial labor plus periodic refinishing for {low}.",
              ["floor-machines", "entrance-mats", "upright-vacuums"], i * 6 + 4)
    add_entry("flooring-and-surface-cleaning-costs", f"{fl_slug}-common-janitorial-mistakes", False, False,
              f"{low} warranty damage mistakes", "informational",
              f"Costly Janitorial Mistakes That Ruin {fl_name}",
              f"High-alkaline cleaners, abrasive pads, and over-wetting errors that trigger expensive floor replacement on {low}.",
              ["mops-and-buckets", "chemicals-disinfectants", "cloths-window-safety"], i * 6 + 5)

# 7. Silo 7: comparing-quotes-and-contracts (120)
QUOTE_TOPICS_40 = [
    ("how-to-compare-3-office-cleaning-quotes", "compare 3 quotes", "How to Compare 3 Office Cleaning Quotes Apples-to-Apples"),
    ("office-cleaning-rfp-template-guide", "rfp template", "Writing an Office Cleaning RFP That Eliminates Hidden Fees"),
    ("janitorial-scope-of-work-checklist", "scope of work sow", "Complete Janitorial Scope of Work (SOW) Checklist"),
    ("red-flags-in-cheap-cleaning-quotes", "red flags cheap bids", "7 Red Flags in Suspiciously Cheap Janitorial Quotes"),
    ("how-to-verify-janitorial-general-liability-insurance", "general liability insurance", "Verifying General Liability ($1M/$2M) on Cleaning Bids"),
    ("janitorial-surety-bond-meaning-and-cost", "surety bond coverage", "Janitorial Bonds Explained: Why Keyed Offices Need Them"),
    ("workers-compensation-coi-for-cleaning-vendors", "workers comp coi", "Why Verifying Workers' Comp Prevents Tenant Liability"),
    ("1099-subcontractors-vs-w2-cleaning-crews", "1099 vs w2 crews", "1099 Subcontractors vs. W-2 Crews in Commercial Bids"),
    ("background-checks-and-e-verify-in-janitorial-bids", "background checks e-verify", "Background Checks, Drug Screening & Badging in Contracts"),
    ("cleaning-contract-termination-clause-guide", "contract termination notice", "Termination Clauses, 30-Day Out & Auto-Renewal Traps"),
    ("cpi-price-escalation-clauses-explained", "cpi escalation cap", "How Annual CPI & Minimum-Wage Escalation Clauses Work"),
    ("who-supplies-toilet-paper-soap-and-liners", "vendor supplied consumables", "Vendor-Supplied vs. Client-Supplied Consumables Math"),
    ("janitorial-inspection-scorecards-and-kpis", "inspection kpi scorecard", "Using APPA/ISSA Inspection Scorecards to Enforce Quality"),
    ("performance-credits-and-missed-visit-refunds", "missed visit credits", "Structuring Missed-Visit Credits & Cure-Notice Clauses"),
    ("why-cleaning-quotes-vary-by-50-percent", "why quotes vary widely", "Why Commercial Cleaning Quotes Vary by 40%–60% for the Same Suite"),
    ("walkthrough-questions-for-cleaning-vendors", "site walkthrough questions", "15 Questions to Ask During a Janitorial Site Walkthrough"),
    ("measuring-usable-vs-rentable-square-footage", "usable vs rentable sq ft", "Usable vs. Rentable Sq Ft: Which Number Should You Quote?"),
    ("auditing-implied-hourly-rate-in-flat-bids", "audit implied hourly rate", "How to Reverse-Engineer Labor Hours Inside a Flat-Rate Quote"),
    ("janitorial-franchise-vs-local-independent-bids", "franchise vs local operator", "Evaluating Franchise Brokers vs. Direct Local Operators"),
    ("green-cleaning-addendum-in-janitorial-rfps", "green rfp addendum", "Adding Green Seal & HEPA Clauses to Your Cleaning RFP"),
    ("alarm-code-and-key-control-liability-clauses", "key control alarm liability", "Key Control, Alarm False-Dispatch Fees & Security Protocols"),
    ("confidentiality-nda-and-hipaa-baa-for-cleaners", "vendor nda hipaa baa", "NDAs, Shredder Rules & HIPAA BAAs for Janitorial Vendors"),
    ("equipment-storage-closet-requirements-in-bids", "janitor closet slop sink", "What Vendors Need in Your Janitorial Closet (Slop Sink & Power)"),
    ("how-often-to-rebid-office-cleaning-contracts", "when to rebid contract", "When to Rebid Your Office Cleaning Contract (and Avoid Disruption)"),
    ("month-to-month-vs-annual-cleaning-contracts", "month to month vs annual", "Month-to-Month vs. 12-Month Commercial Cleaning Agreements"),
    ("multi-site-regional-office-cleaning-rfp", "multi site master rfp", "Bundling Multi-Location Branch Offices Into One Master RFP"),
    ("evaluating-janitorial-supervision-ratios", "field supervisor ratios", "How Account Supervision Ratios Prevent Quality Drift after Month 3"),
    ("day-porter-sla-and-response-time-clauses", "day porter response sla", "Writing Response-Time SLAs for Day Porters & Spill Calls"),
    ("project-work-rate-card-in-base-contracts", "project work rate card", "Locking In Pre-Negotiated Rates for Carpet & VCT Project Work"),
    ("indemnification-and-additional-insured-coi", "additional insured endorsement", "Additional Insured & Waiver of Subrogation on Cleaning COIs"),
    ("how-to-fire-and-transition-cleaning-vendors", "switch cleaning vendors", "30-Day Vendor Transition Checklist Without Security Gaps"),
    ("osha-bloodborne-pathogens-clause-in-contracts", "bloodborne pathogens clause", "Verifying OSHA Training Before Signing a Medical/Office Bid"),
    ("chemical-sds-binder-requirements-for-vendors", "sds chemical binder", "Digital & Onsite SDS Chemical Binder Compliance Checks"),
    ("measuring-restroom-fixture-count-accurately", "restroom fixture count", "Why Fixture Counts Matter More Than Room Counts on Bids"),
    ("evaluating-cleaning-equipment-age-and-hepa-specs", "vendor hepa equipment specs", "Checking Vendor Vacuum Filtration & Cord Safety During Bids"),
    ("snow-and-storm-cleanup-contingency-clauses", "weather closure contingency", "Handling Weather Closures & Emergency Cleanup Billing"),
    ("tenant-vs-landlord-cleaning-responsibility-matrix", "landlord vs tenant lease", "Lease Responsibility Matrix: Landlord Common Areas vs. Tenant Suite"),
    ("negotiating-free-first-month-or-deep-clean-credit", "negotiating contract discounts", "Realistic Concession Tactics When Negotiating Cleaning Bids"),
    ("color-coded-microfiber-clause-to-prevent-cross-contamination", "color coded microfiber clause", "Mandating Color-Coded Cloths & Separate Restroom Tools in SOW"),
    ("electronic-timekeeping-gps-geofencing-verification", "gps geofencing timekeeping", "Requiring GPS Check-In & Inspection Logs for Unattended Night Crews"),
]
Q_T2 = [
    lambda s: f"Billing Loopholes & Pitfalls in {s}",
    lambda s: f"Hidden Contract Oversights: {s}",
    lambda s: f"Avoiding Surprise Fees on {s}",
    lambda s: f"Red Flags Facility Teams Miss on {s}",
    lambda s: f"Costly Clauses & Trapdoors: {s}",
    lambda s: f"What Vendors Leave Out of {s}",
]
Q_T3 = [
    lambda s: f"Proposal Scoring Matrix for {s}",
    lambda s: f"Weighted Bid Evaluation: {s}",
    lambda s: f"Vendor Verification Checklist for {s}",
    lambda s: f"Comparing Proposals Side-by-Side: {s}",
    lambda s: f"Procurement Scorecard & Rubric: {s}",
    lambda s: f"Auditing Contractor Claims on {s}",
]
# 40 topics x 3 distinct facets = 120!
for i, (sl, kw, tt) in enumerate(QUOTE_TOPICS_40):
    subj = kw.title()
    stem = sl.replace("-", " ")
    add_entry("comparing-quotes-and-contracts", sl, False, False, kw, "commercial-investigation", tt,
              f"Procurement guide on '{kw}', giving facility managers clear contract verification criteria and pricing benchmarks.",
              ["carts-and-bins", "restroom-dispensers", "paper-and-liners"], i * 3)
    add_entry("comparing-quotes-and-contracts", f"{sl}-mistakes-to-avoid", False, False, f"billing traps mistakes {stem}", "commercial-investigation",
              Q_T2[i % 6](subj),
              f"Specific procurement oversights and billing loopholes facility managers miss regarding {kw}.",
              ["paper-and-liners", "chemicals-disinfectants", "cloths-window-safety"], i * 3 + 1)
    add_entry("comparing-quotes-and-contracts", f"{sl}-scoring-criteria", False, False, f"weighted evaluation rubric {stem}", "commercial-investigation",
              Q_T3[i % 6](subj),
              f"Weighted scoring rubric and vendor verification steps for {kw}.",
              ["carts-and-bins", "backpack-vacuums", "restroom-dispensers"], i * 3 + 2)

# 8. Silo 8: in-house-vs-outsourced-cleaning (90)
INHOUSE_30 = [
    ("in-house-janitor-vs-outsourced-cost-comparison", "in house vs outsourced janitor", "In-House Custodian vs. Outsourced Cleaning: Full Cost Math"),
    ("break-even-square-footage-for-in-house-cleaner", "break even sq ft custodian", "Break-Even Square Footage: When Does an In-House Cleaner Pay Off?"),
    ("true-cost-of-w2-janitor-salary-taxes-benefits", "w2 custodian payroll burden", "Fully Burdened W-2 Custodian Cost (Wage, FICA, Workers' Comp)"),
    ("janitorial-equipment-startup-cost-for-in-house", "equipment startup capex", "Capital Startup Budget: Vacuums, Carts & Floor Machines for In-House"),
    ("annual-cleaning-supply-cost-per-employee", "supply spend per employee", "Monthly & Annual Supply Cost per Employee for In-House Teams"),
    ("managing-custodian-absences-and-pto-coverage", "custodian pto sick coverage", "Hidden Cost of Covering In-House Custodian PTO & Sick Leave"),
    ("hybrid-in-house-day-porter-plus-outsourced-night", "hybrid day porter night", "Hybrid Model: In-House Day Porter + Outsourced Night Crew"),
    ("workers-comp-insurance-rates-for-in-house-janitors", "workers comp class codes", "How Janitorial Workers' Comp Codes Affect Employer Payroll"),
    ("training-and-osha-certification-cost-in-house", "osha onboarding training", "Onboarding, Chemical Safety & OSHA Training Costs In-House"),
    ("equipment-repair-and-depreciation-in-house-vs-vendor", "vacuum scrubber depreciation", "5-Year Vacuum & Scrubber Depreciation When Self-Performing"),
    ("in-house-cleaning-for-medical-and-dental-clinics", "clinic staff vs outsourced", "Should Medical & Dental Practices Use Staff or Outsourced Cleaners?"),
    ("asking-admin-staff-to-clean-hidden-productivity-cost", "admin staff productivity drag", "Why Having Office Staff Clean Costs More Than Hiring Pros"),
    ("in-house-janitorial-closet-and-laundry-setup", "microfiber laundry dilution", "Setting Up In-House Microfiber Laundering & Chemical Dilution"),
    ("part-time-20-hour-in-house-custodian-budget", "part time 20hr custodian", "Part-Time (20 Hr/Wk) In-House Custodian Budget vs. 3x/Wk Vendor"),
    ("full-time-40-hour-in-house-custodian-budget", "full time 40hr custodian", "Full-Time 40-Hour Custodian Total Annual Cost vs. 25k Sq Ft Quote"),
    ("two-person-in-house-custodial-team-budget", "two person custodial team", "Budgeting a 2-Person Team for 50,000+ Sq Ft Campuses"),
    ("chemical-dilution-dispensers-roi-in-house", "wall dilution dispenser roi", "How Wall-Mount Chemical Dilution Cuts In-House Supply Waste 40%"),
    ("cordless-battery-fleet-roi-for-in-house-teams", "cordless battery fleet roi", "Cordless Backpack & Scrubber ROI on In-House Labor Hours"),
    ("managing-turnover-in-in-house-janitorial-roles", "custodian turnover recruiting", "Replacement & Recruiting Cost of In-House Custodian Turnover"),
    ("outsourced-vendor-accountability-vs-direct-control", "direct control vs slas", "Quality Control: Direct Supervision In-House vs. Vendor SLAs"),
    ("in-house-cleaning-supply-purchasing-amazon-business", "bulk supply purchasing", "Centralizing Bulk Supply Purchasing for Self-Managed Offices"),
    ("transitioning-from-in-house-to-outsourced-cleaning", "transitioning to outsourced contract", "How to Transition From Custodians to an Outsourced Contract"),
    ("bringing-office-cleaning-back-in-house", "insourcing custodial program", "Bringing Cleaning Back In-House: 90-Day Setup & Budget Plan"),
    ("liability-exposure-slip-and-fall-in-house-vs-vendor", "slip fall liability transfer", "Slip-and-Fall Liability Transfer: Vendor COI vs. In-House Policy"),
    ("nighttime-unsupervised-staffing-risks-in-house", "lone worker night safety", "Lone-Worker Night Safety & Liability for Direct-Hire Cleaners"),
    ("multi-branch-in-house-floating-custodian-model", "floating custodian route", "Floating Custodian Route Model Across Nearby Local Branches"),
    ("hoa-and-property-management-in-house-vs-contract", "maintenance techs vs janitors", "Property Management Maintenance Techs vs. Dedicated Janitors"),
    ("coworking-community-team-plus-overnight-vendor", "coworking daytime reset", "Coworking Hybrid: Community Team Reset + Outsourced Night Crew"),
    ("nonprofit-volunteer-cleaning-vs-low-cost-vendor", "nonprofit volunteer rotation", "Nonprofit & Church Cleaning: Volunteer Rotations vs. Paid Vendors"),
    ("audit-tool-calculating-your-in-house-hourly-yield", "custodial sq ft per hour", "Measuring Your In-House Team's True Sq Ft Per Hour Output"),
]
IH_T2 = [
    lambda s: f"Suite Size Economics (5k vs. 30k Sq Ft): {s}",
    lambda s: f"Small vs. Enterprise Scale Curve for {s}",
    lambda s: f"Cost Scaling Across Building Sizes: {s}",
    lambda s: f"Headcount & Sq Ft Break-Even Analysis: {s}",
    lambda s: f"How Building Footprint Changes {s}",
    lambda s: f"Footprint & Staffing Economics: {s}",
]
IH_T3 = [
    lambda s: f"Payroll & Capex Worksheet for {s}",
    lambda s: f"Line-Item Annual Budget Template: {s}",
    lambda s: f"CFO Financial Breakdown Model: {s}",
    lambda s: f"All-In Cost Ledger & ROI Calculator: {s}",
    lambda s: f"Tax, Equipment & Labor Ledger for {s}",
    lambda s: f"Annual Operating Expense Model: {s}",
]
# 30 topics x 3 distinct facets = 90!
for i, (sl, kw, tt) in enumerate(INHOUSE_30):
    subj = kw.title()
    parts = [w for w in sl.split("-") if w not in ("for", "and", "to", "of", "in", "vs", "house", "cleaning", "office", "cost", "the")]
    uniq = " ".join(parts[:3])
    add_entry("in-house-vs-outsourced-cleaning", sl, False, False, kw, "informational", tt,
              f"Financial and operational ROI analysis of '{kw}', breaking down payroll burden, equipment capex, and monthly savings.",
              ["carts-and-bins", "upright-vacuums", "mops-and-buckets"], i * 3)
    add_entry("in-house-vs-outsourced-cleaning", f"{sl}-small-vs-enterprise", False, False, f"scale curve {uniq}", "informational",
              IH_T2[i % 6](subj),
              f"Comparing 5,000 sq ft, 15,000 sq ft, and 35,000 sq ft cost curves for {kw}.",
              ["backpack-vacuums", "paper-and-liners", "chemicals-disinfectants"], i * 3 + 1)
    add_entry("in-house-vs-outsourced-cleaning", f"{sl}-budget-worksheet", False, False, f"capex template {uniq}", "informational",
              IH_T3[i % 6](subj),
              f"Detailed spreadsheet-style cost table and decision checklist for {kw}.",
              ["carts-and-bins", "restroom-dispensers", "chemicals-disinfectants"], i * 3 + 2)

# 9. Silo 9: green-cleaning-and-osha-compliance (100)
GREEN_25 = [
    ("green-seal-gs-37-office-cleaning-cost", "green seal gs-37 gs-42", "Green Seal GS-37 & GS-42 Cleaning Cost Premium Explained"),
    ("epa-safer-choice-commercial-cleaning-budget", "epa safer choice budget", "EPA Safer Choice Office Cleaning: Does It Cost More?"),
    ("leed-ebom-janitorial-program-cost", "leed o+m credits", "LEED O+M Green Cleaning Compliance & Documentation Costs"),
    ("osha-hazard-communication-sds-office-cleaning", "osha hazcom sds rules", "OSHA Hazard Communication (HazCom) & SDS Rules for Offices"),
    ("osha-bloodborne-pathogens-standard-janitors", "bloodborne pathogens standard", "OSHA Bloodborne Pathogens Compliance in Commercial Suites"),
    ("epa-list-n-disinfectant-dwell-time-costs", "list n dwell time", "How Disinfectant Dwell Times Impact Janitorial Labor Cost"),
    ("hepa-filtration-vacuums-and-indoor-air-quality", "hepa cri seal iaq", "HEPA Vacuums & CRI Seal of Approval: IAQ Impact & Cost"),
    ("low-voc-and-fragrance-free-office-cleaning", "fragrance free low voc", "Fragrance-Free & Low-VOC Policies for Allergy-Sensitive Offices"),
    ("microfiber-reuse-vs-disposable-wipes-cost", "microfiber vs wipes", "Microfiber Laundering vs. Disposable Wipes: Cost & Waste"),
    ("cold-water-dilution-and-concentrate-savings", "closed loop dilution", "Closed-Loop Chemical Concentrates: Safety & 35% Cost Savings"),
    ("electrolyzed-water-aqueous-ozone-cleaning-cost", "aqueous ozone payback", "On-Site Aqueous Ozone Cleaning Systems: Capex & Payback"),
    ("uv-c-and-hepa-air-scrubbing-cost-benefit", "portable h13 hepa merv", "Portable H13 HEPA Air Purifiers vs. HVAC MERV-13 Upgrades"),
    ("zero-waste-recycling-and-composting-sorting-cost", "recycling compost sorting", "Multi-Stream Recycling & Compost Sorting Labor Add-Ons"),
    ("coreless-and-recycled-paper-dispensers-roi", "coreless recycled paper", "High-Capacity Coreless Tissue & Recycled Towels ROI"),
    ("touchless-restroom-fixtures-hygiene-and-cost", "touchless fixture savings", "Touchless Towel & Soap Dispensers: Waste Reduction Math"),
    ("slip-and-fall-osha-walking-working-surfaces", "walking working surfaces", "OSHA Walking-Working Surfaces: Matting & Wet-Floor Signage"),
    ("asthma-safe-green-cleaning-in-schools-and-offices", "asthma respiratory triggers", "Reducing Respiratory Triggers with Asthma-Safe Cleaning"),
    ("green-vct-zinc-free-floor-finish-cost", "zinc free finish", "Zinc-Free Green Floor Finishes vs. Traditional Acrylic Cost"),
    ("waterless-and-low-moisture-carpet-care-savings", "low moisture encapsulation", "Low-Moisture Encapsulation vs. Hot Extraction Water Savings"),
    ("hipaa-and-phi-privacy-compliance-for-medical-cleaners", "hipaa phi privacy", "HIPAA Privacy Rules for After-Hours Medical Cleaning Crews"),
    ("cdc-ventilation-and-surface-hygiene-guidelines", "cdc ventilation hygiene", "Aligning Office Cleaning Budgets with Current CDC Guidance"),
    ("issa-cims-green-building-certification-value", "issa cims-gb certification", "What ISSA CIMS-GB Certification Means for Vendor Pricing"),
    ("cord-safety-and-ergonomic-backpack-osha-benefits", "ergonomic cord trip safety", "Ergonomic Backpack Vacuums & Cord-Trip Prevention Standards"),
    ("battery-powered-daytime-cleaning-sustainability", "daytime hvac energy savings", "Daytime Cleaning Energy Savings: Turning Off Night HVAC & Lights"),
    ("well-building-standard-cleaning-protocol-cost", "well building hygiene", "WELL Building Standard Air & Hygiene Protocol Cost"),
]
GR_T2 = [
    lambda s: f"SOP Rollout Steps: {s}",
    lambda s: f"90-Day Facility Plan for {s}",
    lambda s: f"Staff Training & Implementation: {s}",
    lambda s: f"Deployment Playbook for {s}",
]
GR_T3 = [
    lambda s: f"Supply & Labor Delta: {s} vs. Legacy",
    lambda s: f"Price Premium vs. Traditional Methods ({s})",
    lambda s: f"Budget Trade-Offs: {s} vs. Conventional",
    lambda s: f"Cost Comparison Analysis: {s} Adoption",
]
GR_T4 = [
    lambda s: f"Verification Logs & Audit Questions: {s}",
    lambda s: f"How to Verify Contractor Compliance on {s}",
    lambda s: f"Documentation & Inspection Checklist for {s}",
    lambda s: f"Vendor Certification Proof & Field Audits: {s}",
]
# 25 topics x 4 distinct facets = 100!
for i, (sl, kw, tt) in enumerate(GREEN_25):
    subj = kw.title()
    stem = sl.replace("-", " ")
    add_entry("green-cleaning-and-osha-compliance", sl, False, False, kw, "informational", tt,
              f"Compliance and cost analysis of '{kw}', detailing US regulatory requirements and realistic budget impacts.",
              ["chemicals-disinfectants", "air-purifiers", "cloths-window-safety"], i * 4)
    add_entry("green-cleaning-and-osha-compliance", f"{sl}-implementation-checklist", False, False, f"90 day staff rollout checklist {stem}", "informational",
              GR_T2[i % 4](subj),
              f"Actionable facility-manager checklist for implementing {kw} without blowing the annual budget.",
              ["air-purifiers", "restroom-dispensers", "chemicals-disinfectants"], i * 4 + 1)
    add_entry("green-cleaning-and-osha-compliance", f"{sl}-cost-vs-conventional", False, False, f"supply premium legacy comparison {stem}", "informational",
              GR_T3[i % 4](subj),
              f"Side-by-side price and supply cost comparison between {kw} and conventional chemical protocols.",
              ["chemicals-disinfectants", "paper-and-liners", "mops-and-buckets"], i * 4 + 2)
    add_entry("green-cleaning-and-osha-compliance", f"{sl}-vendor-audit-questions", False, False, f"field inspection certification audit {stem}", "commercial-investigation",
              GR_T4[i % 4](subj),
              f"Proof of certification, product logs, and onsite verification questions for {kw}.",
              ["cloths-window-safety", "chemicals-disinfectants", "air-purifiers"], i * 4 + 3)

# 10–13. 200 Exclusive Amazon US Transactional Pages (55 + 50 + 50 + 45 = 200)
T_SILO1 = [  # 55 pages: commercial-vacuums-and-floor-machines
    ("best-commercial-backpack-vacuums-for-offices", "best commercial backpack vacuums for offices", "Best Commercial Backpack Vacuums for Fast Office Cleaning"),
    ("best-cordless-commercial-backpack-vacuums", "best cordless commercial backpack vacuums", "Best Cordless Commercial Backpack Vacuums for Day Porters"),
    ("proteam-super-coach-pro-6-vs-pro-10-review", "proteam super coach 6 vs 10 quart capacity", "ProTeam Super Coach Pro 6 vs. Pro 10: Which Size Fits Your Floor?"),
    ("proteam-super-coach-pro-6-vs-hoover-c2401", "proteam super coach 6 vs hoover shoulder vac", "ProTeam Super Coach Pro 6 vs. Hoover Shoulder Vac Pro C2401"),
    ("best-quiet-commercial-vacuums-for-daytime-cleaning", "best quiet commercial vacuums under 70 dba", "Best Quiet Commercial Vacuums Under 70 dBA for Daytime Suites"),
    ("hoover-commercial-hushtone-15-vs-13-review", "hoover hushtone ch54115 vs ch54113", "Hoover Commercial HushTone 15-Inch vs. 13-Inch Review"),
    ("sanitaire-tradition-sc888n-vs-oreck-xl2100rhs", "sanitaire tradition vs oreck commercial xl", "Sanitaire Tradition SC888N vs. Oreck Commercial XL2100RHS"),
    ("best-hepa-commercial-upright-vacuums-for-medical-offices", "best hepa commercial upright vacuums", "Best Sealed-HEPA Commercial Upright Vacuums for Medical Offices"),
    ("proteam-proforce-1500xp-vs-windsor-sensor-s12", "proteam proforce 1500xp vs windsor sensor", "ProTeam ProForce 1500XP vs. Windsor Sensor S12 Comparison"),
    ("bissell-biggreen-bg102hpro-vs-hoover-hushtone", "bissell biggreen upright vs hoover hushtone", "Bissell BigGreen BG102HPro vs. Hoover HushTone Commercial"),
    ("best-lightweight-commercial-uprights-for-stairs", "best lightweight commercial upright vacuum", "Best Lightweight Commercial Upright Vacuums Under 12 Lb"),
    ("best-commercial-vacuums-for-low-pile-office-carpet", "best commercial vacuum low pile carpet tiles", "Best Commercial Vacuums for Low-Pile Office Carpet Tiles"),
    ("best-commercial-carpet-extractors-for-offices", "best commercial carpet extractors for offices", "Best Commercial Carpet Extractors for Office Facilities"),
    ("bissell-biggreen-bg10-vs-rug-doctor-mighty-pro-x3", "bissell bg10 vs rug doctor x3", "Bissell BigGreen BG10 vs. Rug Doctor Mighty Pro X3 Comparison"),
    ("best-heated-commercial-carpet-spotters", "best heated commercial carpet spot extractor", "Best Heated Portable Carpet Spotters for Breakroom & Lobby Spills"),
    ("sandia-sniper-6-gallon-vs-mytee-lite-8070", "sandia sniper vs mytee lite 8070", "Sandia Sniper 6-Gallon vs. Mytee Lite 8070 Heated Extractor"),
    ("karcher-puzzi-8-1-c-vs-bissell-bgss1481-spotter", "karcher puzzi 8/1 vs bissell spotbot", "Karcher Puzzi 8/1 C vs. Bissell Commercial SpotBot Review"),
    ("best-commercial-vct-floor-buffers-and-scrubbers", "best commercial vct floor buffer scrubber", "Best 175 RPM Commercial Floor Scrubbers & VCT Buffers"),
    ("oreck-550mc-orbiter-vs-bissell-bgem9000-review", "oreck orbiter 550mc vs bissell bgem9000", "Oreck Commercial Orbiter 550MC vs. Bissell BGEM9000 Review"),
    ("powr-flite-m171-vs-sanitaire-sc6045a-floor-machine", "powr-flite m171 vs sanitaire sc6045a", "Powr-Flite M171 17-Inch vs. Sanitaire SC6045A 20-Inch"),
    ("best-high-speed-burnishers-for-vct-lobbies", "best 2000 rpm commercial floor burnisher", "Best 2000 RPM High-Speed Burnishers for Wet-Look VCT Floors"),
    ("best-compact-walk-behind-auto-scrubbers-for-offices", "best compact commercial floor auto scrubber", "Best Compact Walk-Behind Auto-Scrubbers for 5,000–25,000 Sq Ft"),
    ("karcher-bd-30-4-c-vs-hoover-40v-task-scrubber", "karcher bd 30/4 vs hoover 40v scrubber", "Karcher BD 30/4 C Bp vs. Hoover Commercial 40V Auto-Scrubber"),
    ("best-cordless-floor-scrubbers-for-office-restrooms", "best cordless floor scrubber restrooms", "Best Cordless Micro-Scrubbers for Restroom Tile & Grout"),
    ("best-non-electric-commercial-floor-sweepers", "best quiet commercial floor sweeper", "Best Non-Electric Quiet Commercial Sweepers for Lobby Touchups"),
    ("rubbermaid-421288-vs-bissell-bg23-sweeper", "rubbermaid 421288 vs bissell bg23 sweeper", "Rubbermaid 421288 Dual-Action vs. Bissell BG23 Sweeper"),
    ("best-backpack-vacuums-for-5000-sq-ft-offices", "best vacuum for 5000 sq ft office", "Best Commercial Vacuums for 5,000 Sq Ft Office Suites"),
    ("best-vacuums-for-20000-sq-ft-corporate-floors", "best vacuum for 20000 sq ft office", "Best Wide-Path & Backpack Vacuums for 20,000+ Sq Ft Floors"),
    ("sebo-automatic-x7-commercial-vacuum-review", "sebo automatic x7 commercial review", "Sebo Automatic X7 Commercial Upright: Hospital-Grade Review"),
    ("makita-xcv17z-vs-milwaukee-m18-backpack-vacuum", "makita xcv17z vs milwaukee m18 backpack vacuum", "Makita 36V XCV17Z vs. Milwaukee M18 FUEL Backpack Vacuum"),
    ("atrix-vacbp1-vs-powr-flite-bp6s-backpack-vacuum", "atrix vacbp1 vs powr-flite bp6s", "Atrix VACBP1 HEPA vs. Powr-Flite BP6S Comfort Pro Review"),
    ("best-commercial-vacuums-for-allergy-sensitive-offices", "best commercial vacuum allergies hepa", "Best True HEPA Commercial Vacuums for Allergy-Safe Offices"),
    ("best-hardwood-safe-commercial-floor-polishers", "best commercial hardwood floor polisher", "Best Twin-Brush Commercial Polishers for Engineered Hardwood"),
    ("bissell-bgfs650-vs-koblenz-p4000b-polisher", "bissell bgfs650 vs koblenz p4000b", "Bissell BigGreen BGFS650 vs. Koblenz P-4000 B Polisher"),
    ("best-commercial-vacuums-for-multi-floor-cubicles", "best vacuum for office cubicles", "Best Maneuverable Vacuums for Tight Office Cubicle Grids"),
    ("best-upholstery-extractors-for-office-chairs", "best extractor for office chairs", "Best Portable Extractors for Mesh & Fabric Office Chairs"),
    ("best-commercial-vacuums-with-50-foot-cords", "best commercial vacuum 50 ft cord", "Best Commercial Vacuums with 40–50 Ft Quick-Change Cords"),
    ("sanitaire-force-sc5845d-quietclean-review", "sanitaire force sc5845d review", "Sanitaire Force QuietClean SC5845D Commercial Review"),
    ("proteam-gofree-flex-pro-ii-cordless-review", "proteam gofree flex pro ii review", "ProTeam GoFree Flex Pro II Cordless Backpack Vacuum Review"),
    ("hoover-mpwr-40v-cordless-backpack-review", "hoover mpwr 40v backpack vacuum review", "Hoover Commercial MPWR 40V Backpack Vacuum Review"),
    ("best-floor-machines-for-concrete-office-lobbies", "best scrubber for polished concrete office", "Best Disk Scrubbers for Sealed & Polished Concrete Offices"),
    ("clarke-focus-ii-vs-tennant-imop-lite-review", "clarke focus ii vs tennant imop lite", "Clarke Focus II Micro-Scrubber vs. Tennant i-mop Lite"),
    ("best-commercial-vacuums-under-300-on-amazon", "best commercial office vacuum budget", "Best Budget-Friendly Commercial Office Vacuums on Amazon"),
    ("best-heavy-duty-vacuums-for-in-house-janitors", "best vacuum for in house office janitor", "Most Durable Commercial Vacuums for In-House Custodians"),
    ("eureka-c2094f-wide-track-vs-bissell-bg102hpro", "eureka c2094f vs bissell bg102hpro", "16-Inch Wide-Track Vacuums: Eureka C2094F vs. Bissell BG102HPro"),
    ("best-dual-motor-commercial-upright-vacuums", "best dual motor commercial upright vacuum", "Best Dual-Motor Commercial Uprights with Onboard Detail Wands"),
    ("best-carpet-encapsulation-orbital-machines", "best orbital carpet encapsulation machine", "Best Orbital Floor Machines for Low-Moisture Carpet Care"),
    ("best-commercial-grout-scrubbing-machines", "best commercial tile grout scrubber machine", "Best Rotary & Orbital Machines for Ceramic Tile & Grout"),
    ("dyson-v15-commercial-spot-touchup-review", "dyson cordless vacuum for office touchups", "Cordless Stick Vacuums for Executive Suite Daytime Touchups"),
    ("best-backpack-vacuums-for-medical-and-dental-clinics", "best backpack vacuum medical dental clinic", "Best 4-Stage HEPA Backpack Vacuums for Medical & Dental Suites"),
    ("best-bagless-vs-bagged-commercial-vacuums", "bagless vs bagged commercial office vacuum", "Bagless vs. HEPA-Bagged Commercial Vacuums for Offices"),
    ("best-commercial-vacuums-for-law-firms-and-executive-suites", "best quiet vacuum for law firms", "Whisper-Quiet Commercial Vacuums for Law Firms & Private Offices"),
    ("best-starter-floor-equipment-kit-for-new-offices", "office cleaning startup vacuum floor kit", "Complete Vacuum & Floor Care Starter Kit for Self-Managed Offices"),
    ("best-commercial-wet-dry-vacuums-for-facility-spills", "best commercial extractor wet spill office", "Best Commercial Spill Recovery & Extraction Units for Offices"),
    ("best-vacuums-for-mixed-carpet-and-hard-floor-offices", "best commercial vacuum carpet and hard floor", "Best Multi-Surface Commercial Vacuums for Mixed-Floor Suites"),
]
for i, (sl, kw, tt) in enumerate(T_SILO1):
    add_entry("commercial-vacuums-and-floor-machines", sl, False, True, kw, "transactional-amazon", tt,
              f"100% Amazon US commercial product buying guide for '{kw}' with side-by-side spec tables, verified capacity/filtration/dBA specs, and 'officecleaningcost-20' CTAs (zero fake ratings or prices).",
              ["backpack-vacuums", "upright-vacuums", "carpet-extractors", "floor-machines"], i)

T_SILO2 = [  # 50 pages: janitorial-carts-mops-and-tools
    ("best-commercial-mop-buckets-and-wringers", "best commercial mop bucket wringer", "Best Commercial Mop Buckets & Wringers for Offices"),
    ("rubbermaid-wavebrake-side-press-vs-down-press", "rubbermaid wavebrake side press vs down press", "Rubbermaid WaveBrake 35-Qt: Side-Press vs. Down-Press Wringer"),
    ("rubbermaid-wavebrake-vs-ocedar-maxiplus-26qt", "rubbermaid wavebrake vs o-cedar maxiplus", "Rubbermaid WaveBrake 35-Qt vs. O-Cedar MaxiPlus 26-Qt"),
    ("best-microfiber-flat-mop-kits-for-offices", "best commercial microfiber flat mop kit", "Best Commercial Microfiber Flat-Mop Kits for Hard Floors"),
    ("rubbermaid-hygen-pulse-vs-bona-commercial-mop", "rubbermaid hygen pulse vs bona commercial", "Rubbermaid HYGEN Pulse vs. Bona Commercial Mop Kit Review"),
    ("best-dual-bucket-mop-systems-for-restrooms", "best dual compartment mop bucket", "Best Dual-Compartment Mop Buckets to Stop Dirty Water Re-Soiling"),
    ("unger-smartcolor-15-gal-vs-rubbermaid-charging-bucket", "unger smartcolor vs rubbermaid hygen bucket", "Unger SmartColor Dual Bucket vs. Rubbermaid HYGEN Charging System"),
    ("best-commercial-janitorial-cleaning-carts", "best 3 shelf janitorial rolling carts", "Best Commercial Janitorial Cleaning Carts on Amazon"),
    ("rubbermaid-high-capacity-cart-vs-6173-traditional", "rubbermaid high capacity cart vs 6173", "Rubbermaid High-Capacity Cart vs. Traditional 6173 Cart"),
    ("best-discreet-executive-carts-for-day-porters", "best discreet executive cleaning cart", "Best Discreet Executive Housekeeping Carts for Daytime Porters"),
    ("suncast-locking-cart-vs-rubbermaid-executive-cart", "suncast locking janitor cart vs rubbermaid", "Suncast Locking Cabinet Cart vs. Rubbermaid Executive Quick Cart"),
    ("best-commercial-trash-cans-for-office-kitchens", "best commercial trash cans office breakroom", "Best Commercial Trash & Recycling Bins for Office Breakrooms"),
    ("rubbermaid-brute-44-gallon-vs-slim-jim-23-gallon", "rubbermaid brute 44 gal vs slim jim 23 gal", "Rubbermaid Brute 44-Gal Barrel vs. Slim Jim 23-Gal Station"),
    ("best-hands-free-step-trash-cans-for-medical-offices", "best step on trash can medical office", "Best Hands-Free Step-On Trash Cans for Medical & Restroom Compliance"),
    ("simplehuman-55l-commercial-vs-safco-steel-bin", "simplehuman commercial vs safco public square", "Simplehuman 55L Commercial vs. Safco Architectural Steel Bin"),
    ("best-rolling-trash-dollies-and-mega-collectors", "best commercial trash can dolly", "Best Heavy-Duty Trash Can Dollies & Mobile Waste Collectors"),
    ("best-color-coded-microfiber-cloths-for-offices", "best color coded microfiber cloths commercial", "Best Color-Coded Commercial Microfiber Cloths (OSHA Cross-Contamination)"),
    ("microfiber-wholesale-150-pack-vs-rubbermaid-hygen-cloths", "microfiber wholesale vs rubbermaid hygen", "Microfiber Wholesale 150-Pack vs. Rubbermaid HYGEN Cloths"),
    ("best-commercial-window-squeegee-kits-for-offices", "best commercial window squeegee kit", "Best Commercial Squeegee & Telescopic Pole Kits for Interior Glass"),
    ("unger-18-inch-pro-kit-vs-ettore-master-brass", "unger squeegee kit vs ettore master brass", "Unger Pro 18-Inch Squeegee Kit vs. Ettore Master Brass"),
    ("best-commercial-wet-floor-signs-and-safety-cones", "best commercial wet floor caution sign", "Best OSHA-Compliant Wet Floor Cones & A-Frame Signs"),
    ("rubbermaid-36-inch-cone-vs-25-inch-a-frame-signs", "rubbermaid 36 inch cone vs a-frame sign", "Rubbermaid 36-Inch 4-Sided Cone vs. 25-Inch A-Frame 6-Pack"),
    ("best-lobby-dustpans-and-brooms-for-day-porters", "best commercial lobby dustpan broom", "Best Upright Lobby Dustpans & Angled Brooms for Day Porters"),
    ("best-high-reach-dusters-for-office-vents-and-blinds", "best extendable duster commercial office", "Best High-Reach Microfiber & Electrostatic Dusters for Ceilings"),
    ("best-hardwood-floor-mops-for-commercial-suites", "best commercial hardwood floor mop", "Best Low-Moisture Mops for Commercial Engineered Hardwood"),
    ("best-wide-dust-mops-for-polished-concrete-lobbies", "best 36 inch commercial dust mop", "Best 24–36 Inch Dust Mops for Polished Concrete & Wide Corridors"),
    ("best-vct-floor-finish-applicator-mop-kits", "best vct floor wax applicator mop", "Best Flat Finish Applicator Mops for Streak-Free VCT Waxing"),
    ("best-looped-end-cotton-wet-mops-for-tile-grout", "best commercial looped end mop head", "Best Launderable Looped-End Wet Mop Heads for Heavy Traffic"),
    ("best-restroom-cleaning-caddies-and-spray-bottles", "best janitorial carry caddy spray bottles", "Best Portable Restroom Cleaning Caddies & Viton Trigger Bottles"),
    ("best-outdoor-litter-grabbers-for-office-grounds", "best commercial trash picker grabber", "Best Commercial Litter Grabbers for Office Entries & Walkways"),
    ("best-janitorial-utility-carts-for-supply-restocking", "best commercial 3 shelf utility cart", "Best 500-Lb Capacity Utility Carts for Paper & Supply Restocks"),
    ("rubbermaid-brute-rim-caddy-and-dolly-bundle-guide", "rubbermaid brute rim caddy dolly guide", "Upgrading a 44-Gallon Brute Barrel with Dolly & Rim Caddy"),
    ("best-scour-pads-for-office-breakroom-sinks", "best commercial scour pads breakroom", "Best Non-Rusting Commercial Scour Pads for Office Sinks"),
    ("best-slim-recycling-stations-for-cubicle-corridors", "best narrow office recycling bin", "Best Narrow-Footprint Recycling Bins for Copy Rooms & Aisles"),
    ("best-fire-safe-steel-trash-bins-for-class-a-lobbies", "best stainless steel office lobby trash can", "Best Fire-Safe Steel & Stainless Receptacles for Class A Lobbies"),
    ("best-mop-kits-for-small-offices-under-2500-sq-ft", "best mop bucket small office", "Best Compact Mop Buckets & Spray Mops for Offices Under 2,500 Sq Ft"),
    ("best-janitorial-gear-kit-for-10000-sq-ft-offices", "best janitorial cart kit 10000 sq ft", "Complete Cart, Bucket & Microfiber Kit for 10,000+ Sq Ft Offices"),
    ("rubbermaid-mega-brute-120-gal-review", "rubbermaid mega brute 120 gal review", "Rubbermaid Mega BRUTE 120-Gal Mobile Waste Collector Review"),
    ("o-cedar-promist-max-vs-rubbermaid-hygen-spray-mop", "o-cedar promist max vs rubbermaid hygen", "O-Cedar ProMist MAX vs. Rubbermaid HYGEN for Light Daily Mopping"),
    ("best-bleach-safe-microfiber-cloths-for-restrooms", "best bleach safe commercial microfiber", "Best Bleach-Safe Commercial Microfiber Cloths Rated for 500 Washes"),
    ("best-telescoping-window-poles-for-glass-atriums", "best commercial window pole interior glass", "Best Telescoping Aluminum Poles for High Office Glass Partitions"),
    ("best-commercial-brooms-for-baseboards-and-elevators", "best commercial angled broom office", "Best Flagged-Bristle Commercial Brooms for Baseboard Detailing"),
    ("best-chemical-resistant-trigger-sprayers-for-cleaners", "best heavy duty chemical spray bottles", "Best Viton-Seal 32-Oz Commercial Trigger Spray Bottles"),
    ("best-portable-microfiber-charging-buckets-for-crews", "best microfiber pre-soak charging bucket", "Best Microfiber Pre-Soak Charging Buckets for Multi-Floor Crews"),
    ("best-lockable-janitor-carts-for-schools-and-clinics", "best locking janitorial cleaning cart", "Best Lockable Janitorial Carts for Clinics & Daytime Facilities"),
    ("best-waste-sorting-carts-for-leed-certified-buildings", "best commercial recycling collector cart", "Best Multi-Stream Waste & Recycling Collection Carts for LEED"),
    ("best-commercial-mop-handles-and-quick-change-frames", "best commercial mop frame handle", "Best Aluminum Quick-Change Mop Frames & Grips for Crews"),
    ("best-breakroom-cleaning-tool-bundle-on-amazon", "office breakroom cleaning tools bundle", "Essential Breakroom & Kitchenette Cleaning Tool Bundle on Amazon"),
    ("best-restroom-detailing-kit-for-in-house-custodians", "commercial restroom cleaning tool kit", "Complete Commercial Restroom Cleaning & Safety Sign Kit"),
    ("best-day-porter-quick-response-tool-kit", "day porter cleaning tool kit", "Compact Day Porter Spill-Response & Touchup Kit on Amazon"),
]
for i, (sl, kw, tt) in enumerate(T_SILO2):
    add_entry("janitorial-carts-mops-and-tools", sl, False, True, kw, "transactional-amazon", tt,
              f"100% Amazon US commercial equipment buying guide for '{kw}' with factual capacities, dimensions, and 'officecleaningcost-20' links.",
              ["carts-and-bins", "mops-and-buckets", "cloths-window-safety"], i)

T_SILO3 = [  # 50 pages: restroom-and-breakroom-dispensers
    ("best-touchless-commercial-paper-towel-dispensers", "best touchless commercial paper towel dispenser", "Best Touchless Commercial Paper Towel Dispensers for Offices"),
    ("georgia-pacific-enmotion-10-vs-tork-elevation-h1", "enmotion 10 inch vs tork elevation h1", "Georgia-Pacific enMotion 10-Inch vs. Tork Elevation Matic H1"),
    ("enmotion-10-inch-vs-enmotion-impulse-8-inch", "enmotion 10 inch vs impulse 8 inch", "enMotion 10-Inch Automated vs. enMotion Impulse 8-Inch Compact"),
    ("san-jamar-tear-n-dry-universal-towel-dispenser-review", "san jamar tear n dry dispenser review", "San Jamar Tear-N-Dry Universal Dispenser: Cut Proprietary Paper Lock-In"),
    ("best-non-proprietary-commercial-paper-towel-dispensers", "best universal non proprietary paper towel dispenser", "Best Universal Non-Proprietary Commercial Towel Dispensers"),
    ("best-jumbo-commercial-toilet-paper-dispensers", "best commercial jumbo toilet paper dispenser", "Best Twin Jumbo 9-Inch Commercial Toilet Paper Dispensers"),
    ("tork-t2-twin-jumbo-vs-san-jamar-oceans-tissue", "tork t2 jumbo vs san jamar oceans", "Tork T2 Twin Jumbo vs. San Jamar Oceans Bath Tissue Dispenser"),
    ("best-coreless-commercial-toilet-paper-dispensers", "best coreless commercial toilet paper dispenser", "Best High-Capacity Coreless Commercial Toilet Paper Dispensers"),
    ("georgia-pacific-compact-coreless-vs-scott-pro-4-roll", "gp compact coreless vs scott pro 4 roll", "Georgia-Pacific Compact Vertical vs. Scott Pro 4-Roll Coreless"),
    ("best-touchless-commercial-foam-soap-dispensers", "best touchless commercial foam soap dispenser", "Best Touchless Commercial Foam Soap Dispensers for Restrooms"),
    ("gojo-tfx-vs-rubbermaid-autofoam-1100ml", "gojo tfx vs rubbermaid autofoam", "GOJO TFX Touch-Free vs. Rubbermaid AutoFoam 1100 mL Dispenser"),
    ("kimberly-clark-icon-dispenser-vs-gojo-es8", "kimberly clark icon vs gojo es8", "Kimberly-Clark ICON Automatic vs. GOJO PURELL ES8 Comparison"),
    ("best-touchless-hand-sanitizer-stations-for-lobbies", "best commercial touchless sanitizer dispenser", "Best Touchless Hand Sanitizer Dispensers for Office Lobbies"),
    ("purell-es8-energy-on-the-refill-dispenser-review", "purell es8 sanitizer dispenser review", "PURELL ES8 Touch-Free Sanitizer Dispenser Commercial Review"),
    ("best-stainless-steel-folded-towel-dispensers", "best stainless steel paper towel dispenser", "Best 304 Stainless Steel Folded Towel Dispensers for Class A Suites"),
    ("bobrick-b262-surface-mounted-towel-dispenser-review", "bobrick b262 towel dispenser review", "Bobrick B-262 ClassicSeries Stainless Towel Dispenser Review"),
    ("best-commercial-sanitary-napkin-disposal-bins", "best commercial feminine hygiene disposal bin", "Best Stainless Surface-Mounted Sanitary Napkin Disposal Receptacles"),
    ("best-ada-compliant-restroom-dispensers-for-offices", "best ada compliant restroom dispensers", "Best Slim ADA-Compliant Restroom Dispensers Under 4-Inch Depth"),
    ("best-paper-towel-dispensers-for-office-kitchenettes", "best paper towel dispenser office breakroom", "Best Compact Roll & Folded Towel Dispensers for Breakrooms"),
    ("best-bulk-commercial-roll-paper-towels-on-amazon", "best bulk commercial paper towel rolls", "Best High-Capacity Commercial Roll Paper Towels in Bulk Cases"),
    ("enmotion-800ft-rolls-vs-scott-pro-1150ft-hard-roll", "enmotion 800ft vs scott pro 1150ft towels", "enMotion 800-Ft Rolls vs. Scott Pro 1,150-Ft Hard Roll Towels"),
    ("best-multifold-commercial-paper-towels-in-bulk", "best commercial multifold paper towels bulk", "Best 4,000-Count Multifold Commercial Paper Towels on Amazon"),
    ("tork-universal-multifold-vs-pacific-blue-basic", "tork multifold vs pacific blue basic", "Tork Universal Recycled Multifold vs. Pacific Blue Basic Towels"),
    ("best-bulk-2-ply-toilet-paper-for-offices", "best bulk commercial 2 ply toilet paper", "Best Bulk 2-Ply Commercial Toilet Paper Cases for Offices"),
    ("angel-soft-professional-80-rolls-vs-scott-jumbo", "angel soft professional vs scott jumbo", "Standard 80-Roll Cases (Angel Soft Pro) vs. 12-Roll Jumbo Tissue"),
    ("tork-universal-jumbo-tissue-vs-scott-essential-jumbo", "tork jumbo tissue vs scott essential jumbo", "Tork Universal Jumbo vs. Scott Essential 1,000-Ft Jumbo Tissue"),
    ("best-commercial-foam-soap-refills-fragrance-free", "best fragrance free commercial foam soap", "Best Fragrance-Free Commercial Foam Soap Refills for Sensitive Staff"),
    ("best-facial-tissue-cube-cases-for-conference-rooms", "best bulk facial tissue cubes for offices", "Best Commercial Facial Tissue Cube Cases for Conference Rooms"),
    ("best-passive-odor-control-dispensers-for-restrooms", "best commercial restroom odor control dispenser", "Best Zero-Battery Passive Restroom Air Freshener Systems"),
    ("rubbermaid-tcell-2-vs-fresh-wave-3d-urinal-screens", "rubbermaid tcell 2 vs wave 3d urinal screen", "Continuous Restroom Odor Control: TCell 2.0 vs. Wave 3D Screens"),
    ("best-urinal-deodorizer-screens-for-high-traffic-men-rooms", "best commercial urinal screens 30 day", "Best 30-Day Anti-Splash Enzymatic Urinal Screens for Offices"),
    ("best-high-traffic-restroom-dispenser-bundle-50-plus-staff", "restroom dispenser kit 50 employees", "High-Traffic Restroom Dispenser Upgrade Kit for 50+ Employees"),
    ("best-small-office-restroom-starter-pack-dispensers", "small office restroom dispenser starter kit", "Complete Single-Restroom Dispenser Kit for Small Office Suites"),
    ("best-breakroom-wall-mounted-soap-and-towel-pair", "office kitchen wall soap towel dispenser", "Best Matching Soap & Paper Towel Dispensers for Office Kitchenettes"),
    ("best-battery-free-mechanical-roll-towel-dispensers", "best mechanical commercial towel dispenser", "Best Low-Maintenance Mechanical Towel Dispensers (No Batteries)"),
    ("best-eco-certified-recycled-office-paper-supplies", "best recycled commercial paper towels toilet paper", "Best EcoLogo & FSC-Certified Commercial Paper Cases on Amazon"),
    ("best-lockable-anti-pilferage-toilet-paper-holders", "best locking commercial toilet paper dispenser", "Best Key-Locked Commercial Tissue Dispensers to Prevent Waste"),
    ("best-high-yield-soap-dispensers-over-2000-washes", "best high capacity commercial soap dispenser", "Best High-Yield 1100–1200 mL Soap Dispensers (2,000+ Washes/Refill)"),
    ("best-commercial-restroom-supplies-subscription-kit", "best monthly office restroom supply kit", "Top Bulk Restroom Paper, Soap & Liner Supplies to Stock Monthly"),
    ("best-reception-sanitizer-stand-and-wall-dispensers", "best office lobby hand sanitizer station", "Best Reception Desk & Elevator Lobby Hand Sanitizer Dispensers"),
    ("best-medical-clinic-touchless-restroom-dispensers", "best touchless dispensers medical clinic", "Best Hands-Free Touchless Dispensers for Medical & Dental Suites"),
    ("best-single-sheet-dispensers-to-cut-towel-waste", "best controlled paper towel dispenser waste", "Best One-at-a-Time Towel Dispensers to Reduce Paper Waste 25%"),
    ("best-stub-roll-toilet-paper-dispensers-zero-waste", "best stub roll zero waste tissue dispenser", "Best Stub-Roll Feature Tissue Dispensers (Zero Leftover Roll Waste)"),
    ("best-budget-commercial-soap-and-towel-dispensers", "best affordable commercial restroom dispensers", "Best Value Commercial Restroom Dispensers for Leased Offices"),
    ("best-executive-suite-stainless-restroom-upgrades", "best executive office restroom hardware", "Best Architectural Stainless Steel Restroom Dispensers"),
    ("how-to-match-paper-rolls-to-commercial-dispensers", "commercial paper towel core size compatibility", "Dispenser Compatibility Guide: Core Sizes & Proprietary vs. Universal"),
    ("best-commercial-restroom-accessories-for-day-porters", "best restroom restocking supplies office", "Top Refill Cases & Deodorizers for Midday Restroom Resets"),
    ("best-vandal-resistant-dispensers-for-shared-lobbies", "best heavy duty commercial restroom dispenser", "Most Durable Impact-Resistant Dispensers for Shared Building Restrooms"),
    ("best-quick-view-window-restroom-dispensers", "best translucent commercial tissue dispenser", "Best Translucent Level-Check Dispensers for Fast Night Checks"),
    ("best-breakroom-hygiene-and-sanitizing-station-kit", "office breakroom hygiene dispenser kit", "Complete Office Breakroom Sanitizer, Towel & Waste Bin Kit"),
]
for i, (sl, kw, tt) in enumerate(T_SILO3):
    add_entry("restroom-and-breakroom-dispensers", sl, False, True, kw, "transactional-amazon", tt,
              f"100% Amazon US commercial dispenser & consumables buying guide for '{kw}' with real capacity/core specs and 'officecleaningcost-20' links.",
              ["restroom-dispensers", "paper-and-liners"], i)

T_SILO4 = [  # 45 pages: commercial-cleaning-chemicals-and-mats
    ("best-epa-registered-commercial-disinfectants-for-offices", "best epa commercial disinfectant for offices", "Best EPA-Registered Commercial Disinfectants for Offices"),
    ("cloroxpro-700-count-wipes-vs-lysol-professional-spray", "cloroxpro wipes vs lysol professional spray", "CloroxPro 700-Count Disinfecting Wipes vs. Lysol Pro Spray Case"),
    ("cloroxpro-hydrogen-peroxide-vs-diversey-virex-ii-256", "cloroxpro peroxide vs diversey virex ii 256", "CloroxPro Hydrogen Peroxide vs. Diversey Virex II 256 Concentrate"),
    ("best-neutral-ph-commercial-floor-cleaners", "best neutral ph commercial floor cleaner", "Best Neutral-pH Commercial Floor Cleaners for VCT, Tile & Stone"),
    ("zep-neutral-ph-5-gal-vs-fabuloso-professional-case", "zep neutral floor cleaner vs fabuloso pro", "Zep Neutral pH 5-Gal Pail vs. Fabuloso Professional 4-Gal Case"),
    ("best-green-seal-commercial-office-cleaners", "best green seal commercial cleaning chemicals", "Best Green Seal & EPA Safer Choice Commercial Cleaners on Amazon"),
    ("spartan-clean-by-peroxy-vs-ecos-pro-orange-plus", "spartan peroxy vs ecos pro cleaner", "Spartan Clean by Peroxy vs. ECOS Pro Orange Plus Comparison"),
    ("best-commercial-hardwood-floor-cleaners-residue-free", "best commercial hardwood floor cleaner", "Best GREENGUARD Residue-Free Cleaners for Office Hardwood"),
    ("best-commercial-glass-cleaners-for-lobby-walls", "best commercial streak free glass cleaner", "Best Bulk Commercial Glass Cleaners for Partitions & Lobbies"),
    ("best-vct-floor-finish-wax-and-stripper-combos", "best commercial vct floor finish wax stripper", "Best High-Solids VCT Floor Finishes & Strippers on Amazon"),
    ("diversey-vectra-5-gal-vs-zep-floor-polish-bundle", "diversey vectra vs zep floor polish", "Diversey Vectra 25% Solids vs. Zep High-Traffic Floor Polish"),
    ("best-commercial-degreasers-for-breakrooms-and-docks", "best commercial biodegradable degreaser office", "Best Non-Corrosive Degreasers for Office Breakrooms & Docks"),
    ("best-commercial-trash-can-liners-by-gallon-size", "best commercial trash bags liners bulk", "Best Bulk Commercial Trash Can Liners (Deskside to 55-Gallon)"),
    ("boardwalk-40x48-liners-vs-berry-rhino-x-38x60", "boardwalk 40x48 vs berry rhino x liners", "Boardwalk 40x48 16-Micron vs. Berry Rhino-X 38x60 Heavy Liners"),
    ("best-clear-recycling-can-liners-for-office-audits", "best clear commercial recycling bags", "Best Clear 20–30 Gallon Recycling Liners for Single-Stream Offices"),
    ("best-deskside-wastebasket-liners-1000-count-cases", "best deskside office trash bags 1000 case", "Best 1,000-Count Coreless Deskside Wastebasket Liner Cases"),
    ("best-commercial-entrance-scraper-mats-for-lobbies", "best commercial entrance door mat lobby", "Best Heavy-Duty Commercial Entrance Scraper Mats for Office Lobbies"),
    ("waterhog-classic-vs-apache-mills-cross-rib-mat", "waterhog mat vs apache mills cross rib", "M+A WaterHog Classic vs. Apache Mills Cross Rib Commercial Mat"),
    ("waterhog-fashion-4x6-vs-crown-water-trap-4x8", "waterhog fashion vs crown water trap mat", "WaterHog Fashion 4x6 vs. Crown Mats 4x8 Water-Trap Entrance Mat"),
    ("best-long-commercial-hallway-runners-for-winter-salt", "best commercial hallway floor runner mat", "Best 10–12 Foot Commercial Lobby Runners for Rain & Winter Salt"),
    ("notrax-brush-step-3x10-vs-rubber-cal-corrugated", "notrax brush step vs rubber cal runner", "NoTrax Brush Step 3x10 vs. Rubber-Cal Corrugated Runner"),
    ("best-anti-fatigue-mats-for-office-reception-desks", "best commercial anti fatigue mat reception", "Best Nitrile-Rubber Anti-Fatigue Mats for Reception & Copy Stations"),
    ("best-commercial-hepa-air-purifiers-for-offices", "best commercial hepa air purifier office", "Best Commercial True HEPA H13 Air Purifiers for Offices & Clinics"),
    ("medify-ma-50-vs-coway-airmega-400-office-review", "medify ma-50 vs coway airmega 400", "Medify MA-50 vs. Coway Airmega 400: Which Fits Your Office Suite?"),
    ("medify-ma-112-vs-blueair-pro-l-large-office", "medify ma-112 vs blueair pro l", "Medify MA-112 (950 CADR) vs. Blueair Pro L Commercial Purifier"),
    ("best-quiet-hepa-air-purifiers-for-therapy-and-law-offices", "best quiet hepa purifier law therapy office", "Best Ultra-Quiet Medical HEPA Purifiers for Therapy & Law Suites"),
    ("alen-breathesmart-75i-vs-levoit-everestair-review", "alen breathesmart 75i vs levoit everestair", "Alen BreatheSmart 75i vs. Levoit EverestAir Commercial Review"),
    ("best-concentrated-cleaners-to-lower-supply-costs", "best concentrated janitorial cleaning chemicals", "Best 1:128 & 1:256 Concentrated Cleaners That Cut Supply Spend"),
    ("best-hospital-grade-1-minute-contact-disinfectants", "best fast kill time commercial disinfectant", "Best 1-Minute Dwell-Time Commercial Disinfectants for Busy Clinics"),
    ("best-bleach-free-desk-wipes-for-shared-workstations", "best bleach free disinfecting wipes office", "Best Bleach-Free Commercial Wipes for Hot-Desking Workstations"),
    ("best-vinyl-and-tile-safe-ice-melt-neutralizers", "best floor cleaner winter salt neutralizer", "Best Neutral Floor Cleaners to Remove White Winter Salt Haze"),
    ("best-33-gallon-breakroom-puncture-resistant-liners", "best 33 gallon heavy duty office trash bags", "Best 1.5-Mil 33-Gallon Liners for Breakroom & Copy Room Waste"),
    ("best-entrance-mats-for-hardwood-and-stone-lobbies", "best non staining entrance mat hardwood lobby", "Best Non-Staining Natural Rubber Entrance Mats for Hardwood Lobbies"),
    ("best-commercial-matting-setup-for-15-foot-track-off", "best 15 foot commercial lobby matting kit", "Building a 15-Foot Scraper + Wiper Lobby Mat System on Amazon"),
    ("best-air-purifier-and-disinfectant-combo-for-flu-season", "best office flu season purifier disinfectant kit", "Office Cold & Flu Season Air Purifier + Disinfectant Bundle"),
    ("best-budget-deskside-and-restroom-supply-bundle", "best budget office cleaning chemical liner pack", "Best-Value Monthly Chemicals & Trash Liner Bundle for Small Suites"),
    ("best-low-profile-ada-entrance-mats-for-office-doors", "best low profile ada commercial door mat", "Best Beveled ADA-Compliant Low-Profile Commercial Door Mats"),
    ("best-odor-neutralizing-cleaners-for-pet-friendly-offices", "best enzymatic cleaner pet friendly office", "Best Enzymatic & Odor-Neutralizing Cleaners for Pet-Friendly Offices"),
    ("best-5-gallon-janitorial-chemical-pails-for-large-offices", "best 5 gallon commercial floor cleaner pail", "Best 5-Gallon Pail Floor Cleaners & Finishes for 15,000+ Sq Ft"),
    ("best-fragrance-free-green-cleaners-for-medical-suites", "best fragrance free green cleaner medical", "Best Fragrance-Free Safer Choice Cleaners for Medical Suites"),
    ("best-breakroom-sanitizer-and-liner-kit-on-amazon", "best office kitchen disinfectant trash bag bundle", "Top Disinfectants, Degreasers & Liners for Office Breakrooms"),
    ("best-high-capacity-hepa-purifier-for-open-floorplans", "best air purifier 2500 sq ft open office", "Best High-CADR Air Purifiers for 2,000–3,000 Sq Ft Open Offices"),
    ("winix-5500-2-vs-levoit-for-small-private-offices", "winix 5500-2 vs levoit small office", "Winix 5500-2 vs. Levoit for 300–500 Sq Ft Private Offices"),
    ("best-slip-resistant-rubber-runners-for-service-entries", "best rubber walkway mat commercial entry", "Best Non-Slip Rubber Runners for Rainy Service & Dock Entries"),
    ("best-all-in-one-commercial-supply-closet-starter-kit", "office cleaning supply closet starter kit", "Complete Office Supply Closet Kit: Chemicals, Liners & Entrance Mats"),
]
for i, (sl, kw, tt) in enumerate(T_SILO4):
    add_entry("commercial-cleaning-chemicals-and-mats", sl, False, True, kw, "transactional-amazon", tt,
              f"100% Amazon US commercial supply buying guide for '{kw}' with real EPA/mil/CADR/dimension specs and 'officecleaningcost-20' links.",
              ["chemicals-disinfectants", "paper-and-liners", "entrance-mats", "air-purifiers"], i)

# Populate relatedPaths (4-5 internal links per entry within matrix + calculator/compare)
by_pillar = {}
for e in entries:
    if not e["isPillar"]:
        by_pillar.setdefault(e["pillar"], []).append(e["path"])

non_trans_pool = [e["path"] for e in entries if not e["isPillar"] and not e["isTransactional"]]
trans_pool = [e["path"] for e in entries if not e["isPillar"] and e["isTransactional"]]

for idx, e in enumerate(entries):
    siblings = by_pillar.get(e["pillar"], [])
    rel = [f"/{e['pillar']}/"] if not e["isPillar"] else []
    if siblings:
        pos = siblings.index(e["path"]) if e["path"] in siblings else 0
        for step in (1, 2, 3):
            cand = siblings[(pos + step) % len(siblings)]
            if cand != e["path"] and cand not in rel:
                rel.append(cand)
    # Cross-link informational <-> transactional
    if not e["isTransactional"] and trans_pool:
        rel.append(trans_pool[idx % len(trans_pool)])
    elif e["isTransactional"] and non_trans_pool:
        rel.append(non_trans_pool[idx % len(non_trans_pool)])
    e["relatedPaths"] = rel[:5]

print(f"Total entries: {len(entries)}")
print(f"Pillars: {sum(1 for e in entries if e['isPillar'])}")
print(f"SEO Non-transactional: {sum(1 for e in entries if not e['isPillar'] and not e['isTransactional'])}")
print(f"Amazon Transactional: {sum(1 for e in entries if not e['isPillar'] and e['isTransactional'])}")
print(f"City guides: {sum(1 for e in entries if e['citySlug'])}")
OUT.write_text(json.dumps(entries, indent=2))
