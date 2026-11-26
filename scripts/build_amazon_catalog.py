#!/usr/bin/env python3
"""Generates src/data/amazon-products.json with 150 commercial office cleaning products (US Amazon tag: officecleaningcost-20).
Strictly ZERO star ratings, ZERO review counts, ZERO hardcoded dollar prices."""
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "src/data/amazon-products.json"

# 150 real commercial-grade products across 12 categories
CATALOG_SEED = [
    # 1. Backpack Vacuums (12)
    ("backpack-vacuums", "ProTeam", "ProTeam Super Coach Pro 6 Commercial Backpack Vacuum", "6-quart four-level HEPA filtration backpack vacuum for fast cubicle and stair passes", "6 qt", "4-Level HEPA", "11.5 lb", "66 dBA", "carpet"),
    ("backpack-vacuums", "ProTeam", "ProTeam Super Coach Pro 10 Commercial Backpack Vacuum", "10-quart high-capacity commercial backpack vacuum for open-plan office suites", "10 qt", "4-Level HEPA", "12.5 lb", "66 dBA", "carpet"),
    ("backpack-vacuums", "ProTeam", "ProTeam GoFree Flex Pro II Cordless Backpack Vacuum", "Battery-powered commercial backpack vacuum for daytime cleaning without cord hazards", "6 qt", "HEPA Media", "18 lb w/ battery", "Cordless 75 min", "carpet"),
    ("backpack-vacuums", "Hoover Commercial", "Hoover Commercial C2401 Shoulder Vac Pro Backpack Vacuum", "Lightweight shoulder-strap commercial vacuum with Chiropractors-endorsed harness", "6.4 qt", "HEPA Media", "9.2 lb", "66 dBA", "carpet"),
    ("backpack-vacuums", "Hoover Commercial", "Hoover Commercial MPWR 40V Cordless Backpack Vacuum", "40V brushless cordless commercial backpack vacuum for high-traffic hallways", "6 qt", "HEPA Media", "14 lb", "Cordless 40V", "mixed"),
    ("backpack-vacuums", "Makita", "Makita XCV17Z 36V LXT Brushless Backpack Vacuum", "Compact cordless brushless HEPA backpack vacuum for spot daytime maintenance", "2.0 L", "HEPA Filter", "9.9 lb", "36V LXT", "mixed"),
    ("backpack-vacuums", "Atrix", "Atrix VACBP1 Ergo HEPA Commercial Backpack Vacuum", "Ergonomic 4-stage HEPA backpack vacuum tailored for medical and office suites", "8 qt", "HEPA 99.97%", "10.3 lb", "67 dBA", "carpet"),
    ("backpack-vacuums", "Sanitaire", "Sanitaire SC412A Commercial Backpack Vacuum", "10-quart corded commercial backpack vacuum with sealed HEPA filtration system", "10 qt", "Sealed HEPA", "11.5 lb", "68 dBA", "carpet"),
    ("backpack-vacuums", "Milwaukee", "Milwaukee M18 FUEL 3-in-1 Backpack Vacuum", "Cordless M18 FUEL HEPA vacuum convertible for overhead vents and cubicle corners", "1 gal", "HEPA Filter", "15 lb", "M18 Brushless", "mixed"),
    ("backpack-vacuums", "Powr-Flite", "Powr-Flite BP6S Comfort Pro Backpack Vacuum", "6-quart commercial backpack vacuum with ergonomic cooling mesh harness", "6 qt", "5-Stage HEPA", "11 lb", "62 dBA", "carpet"),
    ("backpack-vacuums", "Oreck Commercial", "Oreck Commercial Pro6A Backpack Vacuum", "6-quart lightweight backpack vacuum built for multi-floor stairwells and offices", "6 qt", "Micro-Filter", "10.5 lb", "67 dBA", "carpet"),
    ("backpack-vacuums", "Karcher", "Karcher BV 5/1 Commercial Backpack Vacuum", "German-engineered 1.3-gallon commercial backpack vacuum with telescoping wand", "1.3 gal", "Fleece + HEPA", "11.7 lb", "62 dBA", "carpet"),

    # 2. Upright Commercial Vacuums (14)
    ("upright-vacuums", "Hoover Commercial", "Hoover Commercial HushTone CH54115 Upright Vacuum", "15-inch two-speed sealed allergen upright vacuum rated at 69 dBA quiet mode", "4.5 qt", "Sealed HEPA", "15-in path", "69 dBA Quiet", "carpet"),
    ("upright-vacuums", "Hoover Commercial", "Hoover Commercial HushTone CH54113 13-Inch Upright Vacuum", "13-inch quiet commercial upright for narrow workstation aisles and law offices", "4.5 qt", "Sealed HEPA", "13-in path", "69 dBA Quiet", "carpet"),
    ("upright-vacuums", "Sanitaire", "Sanitaire Tradition SC888N Commercial Upright Vacuum", "Chrome-hood shake-out bag upright built for heavy daily commercial carpet wear", "18 qt", "Micro-Filter", "12-in path", "7 Amp Motor", "carpet"),
    ("upright-vacuums", "Sanitaire", "Sanitaire Force QuietClean SC5845D Commercial Upright", "Quiet 69 dBA sealed HEPA upright vacuum with onboard stretch hose and tools", "3.5 qt", "Sealed HEPA", "15-in path", "69 dBA", "carpet"),
    ("upright-vacuums", "Oreck Commercial", "Oreck Commercial XL2100RHS Upright Vacuum", "8-pound commercial upright vacuum with Helping Hand handle and auto floor adjustment", "630 cu in", "Saniseal Bag", "12-in path", "8.2 lb", "carpet"),
    ("upright-vacuums", "Oreck Commercial", "Oreck Commercial U2000RB-1 Upright Vacuum", "Heavy-duty 12-inch commercial upright with 40-foot high-visibility safety cord", "630 cu in", "Top-Fill Bag", "12-in path", "40 ft cord", "carpet"),
    ("upright-vacuums", "Bissell Commercial", "Bissell BigGreen Commercial BG102HPro Upright Vacuum", "16-inch wide-path dual-motor commercial upright with HEPA media bag", "4.5 qt", "HEPA Media", "16-in path", "Dual Motor", "carpet"),
    ("upright-vacuums", "Bissell Commercial", "Bissell Commercial BG101DC Dirt Cup Upright Vacuum", "Bagless steel-brushroll 12-inch commercial upright for quick facility turnarounds", "Clear Cup", "Washable Filter", "12-in path", "Magnet Bar", "carpet"),
    ("upright-vacuums", "Sebo", "Sebo Automatic X7 Commercial Upright Vacuum", "Hospital-grade S-class filtration upright with automatic brush height sensor", "1.4 gal", "S-Class HEPA", "12-in path", "Auto Height", "carpet"),
    ("upright-vacuums", "Windsor", "Windsor Sensor S12 Commercial Upright Vacuum", "12-inch single-motor commercial upright trusted in Class A corporate towers", "1.4 gal", "HEPA + Micro", "12-in path", "66 dBA", "carpet"),
    ("upright-vacuums", "ProTeam", "ProTeam ProForce 1500XP HEPA Upright Vacuum", "15-inch dual-motor upright with onboard wand for cubicle partitions and crevices", "3.25 qt", "HEPA Media", "15-in path", "67 dBA", "carpet"),
    ("upright-vacuums", "Shark", "Shark Commercial Navigator Upright Vacuum", "Lift-away commercial canister upright with Anti-Allergen Complete Seal HEPA", "3.0 qt", "Sealed HEPA", "11-in path", "Swivel Steer", "mixed"),
    ("upright-vacuums", "Eureka", "Eureka Commercial C2094F Wide Track Upright", "16-inch wide-track commercial upright for auditoriums and open corridors", "18 qt", "Allergen Bag", "16-in path", "50 ft cord", "carpet"),
    ("upright-vacuums", "Hoover Commercial", "Hoover Commercial TaskVac CH53010 Lightweight Upright", "Lightweight 13-inch bagged commercial upright with 35-foot quick-change cord", "3.7 qt", "HEPA Bag", "13-in path", "15 lb", "carpet"),

    # 3. Carpet Extractors & Spotters (10)
    ("carpet-extractors", "Bissell Commercial", "Bissell BigGreen Commercial BG10 Deep Cleaning Extractor", "10-row DirtLifter PowerBrush commercial carpet extractor with dual 1.75-gal tanks", "1.75 gal", "2x Motors", "10.5-in path", "25 ft cord", "carpet"),
    ("carpet-extractors", "Bissell Commercial", "Bissell Commercial BGSS1481 SpotBot Heated Spotter", "Portable heated commercial carpet spotter for coffee spills and conference rooms", "48 oz", "Heated Tank", "1400W", "5-ft hose", "carpet"),
    ("carpet-extractors", "Rug Doctor", "Rug Doctor Mighty Pro X3 Commercial Carpet Cleaner", "Deep-cleaning commercial carpet extractor with vibrating brush and 3.9-gal recovery", "3.9 gal", "28 PSI Pump", "10.8-in path", "Commercial", "carpet"),
    ("carpet-extractors", "Hoover Commercial", "Hoover Commercial Spotter CH84000 Portable Extractor", "Compact 1.2-gallon heated portable extractor for upholstery and office chairs", "1.2 gal", "Stainless Tool", "13 lb", "20 ft cord", "carpet"),
    ("carpet-extractors", "Powr-Flite", "Powr-Flite PE301 Heated Commercial Carpet Spotter", "3-gallon heated spot extractor for high-traffic reception lobbies and breakrooms", "3 gal", "60 PSI Pump", "10-ft hose", "Heated", "carpet"),
    ("carpet-extractors", "Sandia", "Sandia Sniper 6-Gallon Heated Carpet Extractor", "6-gallon 100 PSI heated commercial extractor for quarterly deep carpet contracts", "6 gal", "100 PSI Pump", "Dual Vac", "2000W Heat", "carpet"),
    ("carpet-extractors", "Mytee", "Mytee S-300H Tempo Heated Spotter Extractor", "Compact 1-gallon 210°F heated spotter for executive chairs and boardroom stains", "1 gal", "55 PSI", "210F Heater", "24 lb", "carpet"),
    ("carpet-extractors", "Mytee", "Mytee Lite 8070 Heated Carpet Extractor", "4-gallon 120 PSI heated commercial extractor for mid-size office suites", "4 gal", "120 PSI", "1000W Heat", "4-in tool", "carpet"),
    ("carpet-extractors", "Karcher", "Karcher Puzzi 8/1 C Commercial Spray Extractor", "Lightweight 2-gallon European spray-extraction machine for upholstery and spots", "2.1 gal", "1-Stage Vac", "21.6 lb", "Fast Dry", "carpet"),
    ("carpet-extractors", "Oreck Commercial", "Oreck Commercial Orbiter ORB550MC Floor Machine", "Multi-purpose orbital dry carpet encapsulation and hard-floor scrub machine", "Orbital", "13-in pad", "24 lb", "50 ft cord", "mixed"),

    # 4. Floor Scrubbers, Buffers & Sweepers (14)
    ("floor-machines", "Bissell Commercial", "Bissell Commercial BGEM9000 Easy Motion Floor Machine", "13-inch random-orbit floor scrubber and polisher for VCT, tile, and hardwood", "13-in pad", "Random Orbit", "50 ft cord", "Low Vibrate", "vct-vinyl"),
    ("floor-machines", "Oreck Commercial", "Oreck Commercial 550MC Orbiter Multi-Purpose Machine", "Oscillating 13-inch floor buffer and grout brush machine safe for beginners", "13-in pad", "175 RPM eq", "24 lb", "Multi-Surface", "tile-grout"),
    ("floor-machines", "Sanitaire", "Sanitaire SC6045A Commercial Rotary Floor Machine", "20-inch heavy-duty 175 RPM rotary floor scrubber and VCT stripper", "20-in pad", "175 RPM", "1.5 HP", "Steel Gear", "vct-vinyl"),
    ("floor-machines", "Powr-Flite", "Powr-Flite M171-3 Classic 17-Inch Floor Scrubber", "17-inch 175 RPM rotary floor machine for scrubbing, stripping, and buffing VCT", "17-in pad", "175 RPM", "1.5 HP", "50 ft cord", "vct-vinyl"),
    ("floor-machines", "Powr-Flite", "Powr-Flite P202-3 20-Inch 2000 RPM High-Speed Burnisher", "20-inch high-speed electric burnisher for wet-look shine on large VCT lobbies", "20-in pad", "2000 RPM", "1.5 HP", "Dust Control", "vct-vinyl"),
    ("floor-machines", "Karcher", "Karcher BD 30/4 C Bp Compact Scrubber Drier", "Cordless compact lithium walk-behind auto-scrubber for lobbies and breakrooms", "1 gal tanks", "Cordless Li-Ion", "11-in scrub", "180 RPM", "polished-concrete"),
    ("floor-machines", "Hoover Commercial", "Hoover Commercial 40V Cordless Task Floor Scrubber", "17-inch compact cordless auto-scrubber replacing mop-and-bucket on hard floors", "1.1 gal", "40V Cordless", "17-in path", "Quick Dry", "tile-grout"),
    ("floor-machines", "iMop", "Tennant i-mop Lite Compact Auto-Scrubber", "Ultra-maneuverable twin-brush walk-behind scrubber for restrooms and tight offices", "0.8 gal", "500 RPM", "14.5-in path", "Cordless", "tile-grout"),
    ("floor-machines", "Bissell Commercial", "Bissell BigGreen Commercial BGFS650 Scrub & Polish Machine", "12-inch twin-brush commercial scrubber and polisher for boutique office lobbies", "12-in", "Twin Brush", "1050 RPM", "19 lb", "hardwood"),
    ("floor-machines", "Koblenz", "Koblenz P-4000 B Heavy Duty Commercial Floor Polisher", "12-inch twin-brush cast-alloy polisher and scrubber for small office suites", "12-in", "1100 RPM", "4.2 Amp", "50 ft cord", "vct-vinyl"),
    ("floor-machines", "Rubbermaid Commercial", "Rubbermaid Commercial 421288 Dual-Action Mechanical Sweeper", "Cordless 7.5-inch quiet mechanical floor sweeper for daytime lobby touchups", "7.5-in path", "Dual Rotor", "Galvanized", "Quiet Day", "mixed"),
    ("floor-machines", "Bissell Commercial", "Bissell Commercial BG23 Commercial Floor Sweeper", "9.5-inch commercial bare-floor and low-pile carpet sweeper with dual debris bins", "9.5-in path", "Dual Debris", "4.5 lb", "Non-Electric", "mixed"),
    ("floor-machines", "Rubbermaid Commercial", "Rubbermaid Commercial 421588 Executive Floor Sweeper", "Quiet 6.5-inch executive sweeper for conference rooms during business hours", "6.5-in path", "Soft Blades", "Quiet", "Bumper Guard", "carpet"),
    ("floor-machines", "Clarke", "Clarke Focus II Compact Micro-Scrubber", "17-inch commercial disk scrubber-dryer built for 10,000+ sq ft hard-floor facilities", "6 gal", "Cordless AGM", "17-in path", "200 RPM", "polished-concrete"),

    # 5. Mop Buckets, Microfiber & Flat Mops (14)
    ("mops-and-buckets", "Rubbermaid Commercial", "Rubbermaid Commercial WaveBrake 35-Quart Mop Bucket & Side-Press Wringer", "Industry-standard 35-qt splash-reducing wringer bucket built for 200,000+ cycles", "35 qt", "WaveBrake", "Side-Press", "5-Yr Wringer", "vct-vinyl"),
    ("mops-and-buckets", "Rubbermaid Commercial", "Rubbermaid Commercial WaveBrake 35-Quart Down-Press Mop Bucket", "High-efficiency down-press wringer bucket with dirty-water separation divider option", "35 qt", "WaveBrake", "Down-Press", "Quiet Casters", "tile-grout"),
    ("mops-and-buckets", "Rubbermaid Commercial", "Rubbermaid Commercial HYGEN 18-Inch Microfiber Flat Mop Kit", "Pulse microfiber spray mop kit with 2-quart onboard reservoir and quick-connect frame", "18-in pad", "Onboard Tank", "Microfiber", "No Bucket", "hardwood"),
    ("mops-and-buckets", "Rubbermaid Commercial", "Rubbermaid Commercial HYGEN Charging Bucket", "20-pad microfiber flat-mop pre-soak charging bucket for zero cross-contamination", "20 pads", "Snap Lid", "Color-Coded", "OSHA Ready", "tile-grout"),
    ("mops-and-buckets", "O-Cedar Commercial", "O-Cedar Commercial MaxiPlus 26-Quart Wringer Combo", "Compact 26-quart side-press wringer bucket ideal for small 1,500–5,000 sq ft suites", "26 qt", "Side-Press", "3-in Casters", "Compact", "vct-vinyl"),
    ("mops-and-buckets", "Unger", "Unger Commercial 15-Gallon Dual-Bucket SmartColor System", "Color-coded dual-compartment mop bucket separating clean solution from dirty rinse water", "15 gal", "Dual Tank", "Red/Blue", "Zero Re-Soil", "tile-grout"),
    ("mops-and-buckets", "O-Cedar", "O-Cedar ProMist MAX Commercial Microfiber Spray Mop", "Refillable bottle microfiber spray mop for spot spills on engineered hardwood floors", "14.5-in pad", "Double-Sided", "Machine Wash", "Low Moisture", "hardwood"),
    ("mops-and-buckets", "Rubbermaid Commercial", "Rubbermaid Commercial 24-Inch Microfiber Dust Mop Kit", "High-dust-retention looped microfiber dry mop for polished concrete and hardwood corridors", "24-in pad", "Swivel Head", "Aluminum", "Washable", "polished-concrete"),
    ("mops-and-buckets", "Rubbermaid Commercial", "Rubbermaid Commercial 36-Inch Cotton Dust Mop Frame & Handle", "Wide 36-inch lobby dust mop for fast pre-damp-mopping sweeps across open hallways", "36-in head", "Swivel 360", "60-in Handle", "Wide Lobby", "polished-concrete"),
    ("mops-and-buckets", "O-Cedar Commercial", "O-Cedar Commercial 24-oz Looped-End Cotton Wet Mop", "Launderable looped-end wet mop head with heavy-duty tailband for VCT and grout", "24 oz", "Looped-End", "5-in Band", "Blue/White", "vct-vinyl"),
    ("mops-and-buckets", "Rubbermaid Commercial", "Rubbermaid Commercial Super Stitch Blend Mop Head 24-oz", "Balanced cotton-synthetic blend mop delivering high absorbency and floor release", "24 oz", "Cotton/Synth", "Launderable", "Medium Duty", "tile-grout"),
    ("mops-and-buckets", "Bona", "Bona Commercial System Multi-Surface Hardwood Mop Kit", "18-inch heavy-duty aluminum flat mop with washable microfiber dusting and wet pads", "18-in base", "Telescoping", "2 Pads", "Wood Safe", "hardwood"),
    ("mops-and-buckets", "Rubbermaid Commercial", "Rubbermaid Commercial Finish Applicator Flat Mop Kit", "Dedicated nylon/microfiber floor finish applicator pad system for VCT waxing", "18-in pad", "Blue/White", "Streak-Free", "VCT Waxing", "vct-vinyl"),
    ("mops-and-buckets", "Alpine Industries", "Alpine Commercial 36-Quart Side-Press Mop Bucket", "High-visibility yellow 36-quart side-press wringer bucket with built-in caution icon", "36 qt", "Side-Press", "3-in Casters", "Pour Spout", "mixed"),

    # 6. Janitorial Carts, Brute Bins & Dollies (14)
    ("carts-and-bins", "Rubbermaid Commercial", "Rubbermaid Commercial High-Capacity Janitorial Cleaning Cart", "Three-shelf structural web cleaning cart with 34-gal zippered vinyl bag and tool hooks", "34 gal bag", "40% More Cap", "8-in Wheels", "Locking Door", "mixed"),
    ("carts-and-bins", "Rubbermaid Commercial", "Rubbermaid Commercial Traditional Janitorial Cart 6173", "Classic 3-shelf janitor cart with 25-gal vinyl bag and front platform for WaveBrake bucket", "25 gal bag", "300 lb Cap", "8-in Wheels", "Bucket Shelf", "mixed"),
    ("carts-and-bins", "Rubbermaid Commercial", "Rubbermaid Commercial Executive Quick Cart Large", "Discreet charcoal executive housekeeping caddy cart for daytime lobby and Class A tours", "60 lb cap", "Teflon Coated", "Quiet Casters", "Stealth Look", "mixed"),
    ("carts-and-bins", "Rubbermaid Commercial", "Rubbermaid Commercial Brute 44-Gallon Vented Trash Can", "Heavy-duty 44-gal commercial trash barrel with venting channels reducing liner pull force 50%", "44 gal", "Vent Channels", "LLDPE Resin", "NSF Listed", "mixed"),
    ("carts-and-bins", "Rubbermaid Commercial", "Rubbermaid Commercial Brute 5-Caster Trash Can Dolly", "Twist-lock rolling dolly rated to 250 lb for 20–55 gallon Brute trash barrels", "250 lb cap", "5 Swivel", "Twist-Lock", "Quiet Wheels", "mixed"),
    ("carts-and-bins", "Rubbermaid Commercial", "Rubbermaid Commercial Brute Rim Caddy Attachment", "Snap-on 44-gal barrel rim caddy holding spray bottles, wet floor signs, and liner rolls", "Fits 44-gal", "9 Compartments", "Snap-On", "Tool Clips", "mixed"),
    ("carts-and-bins", "Rubbermaid Commercial", "Rubbermaid Commercial Slim Jim 23-Gallon Recycling & Waste Station", "Narrow-footprint 23-gallon container with venting channels for tight breakrooms and copy rooms", "23 gal", "Vent Channels", "11-in Wide", "Bag Cinches", "mixed"),
    ("carts-and-bins", "Rubbermaid Commercial", "Rubbermaid Commercial Slim Jim Step-On Front-Step 18-Gallon Bin", "Hands-free internal-hinge commercial step trash can compliant with OSHA/medical rooms", "18 gal", "Quiet Lid", "Foot Pedal", "OSHA/Medical", "tile-grout"),
    ("carts-and-bins", "Simplehuman", "Simplehuman 55L / 14.5-Gal Commercial Semi-Round Open Can", "Brushed stainless steel open-top breakroom & restroom receptacle with lift-off lid", "14.5 gal", "Stainless Steel", "ADA Friendly", "Heavy Base", "mixed"),
    ("carts-and-bins", "Safco", "Safco Public Square 37-Gallon Commercial Steel Receptacle", "Powder-coated architectural steel trash bin for Class A office lobbies and elevator banks", "37 gal", "Fire-Safe Steel", "Square Profile", "Liner Retainer", "mixed"),
    ("carts-and-bins", "Rubbermaid Commercial", "Rubbermaid Commercial Mega BRUTE Mobile Collector 120-Gal", "120-gallon high-capacity rolling waste collector for multi-floor evening trash pulls", "120 gal", "400 lb Cap", "Rear Doors", "12-in Wheels", "mixed"),
    ("carts-and-bins", "Rubbermaid Commercial", "Rubbermaid Commercial Utility Service Cart 3-Shelf", "Heavy-duty structural foam 3-shelf cart carrying 500 lb of paper and chemical restocks", "500 lb cap", "3 Shelves", "4-in Casters", "Rounded Trim", "mixed"),
    ("carts-and-bins", "Suncast Commercial", "Suncast Commercial Housekeeping Cart with Locking Cabinet", "Enclosed-cabinet janitorial cart securing chemicals safely during daytime office hours", "Locking Doors", "300 lb Cap", "8-in Wheels", "Bag Holder", "mixed"),
    ("carts-and-bins", "Rubbermaid Commercial", "Rubbermaid Commercial Deluxe Carry Caddy 3154", "8-compartment portable restroom cleaning caddy holding quart bottles and brushes", "8 Slots", "Ergonomic Grip", "Fits Carts", "15x11x7 in", "tile-grout"),

    # 7. Restroom & Breakroom Dispensers (14)
    ("restroom-dispensers", "Georgia-Pacific", "Georgia-Pacific enMotion 10-Inch Automated Touchless Paper Towel Dispenser", "Battery-operated hygienic touchless roll towel dispenser cutting paper waste in high-traffic restrooms", "10-in Roll", "Touchless IR", "Whisper Quiet", "ADA Depth", "tile-grout"),
    ("restroom-dispensers", "Georgia-Pacific", "Georgia-Pacific enMotion Impulse 8-Inch Compact Towel Dispenser", "Slim 8-inch touchless towel dispenser sized for office kitchenettes and single-occupant restrooms", "8-in Roll", "Compact Depth", "Touchless", "4 D-Cell", "tile-grout"),
    ("restroom-dispensers", "Tork", "Tork Elevation Matic Hand Towel Roll Dispenser H1", "Controlled one-at-a-time commercial towel dispenser reducing restock frequency", "1000-ft Roll", "One-at-a-Time", "Key Lock", "ADA Compliant", "tile-grout"),
    ("restroom-dispensers", "Tork", "Tork Twin Jumbo Bath Tissue Roll Dispenser T2", "Dual 9-inch jumbo toilet paper dispenser preventing run-outs between janitorial visits", "2x 9-in Jumbo", "Stub-Roll", "High Capacity", "Keyed Lock", "tile-grout"),
    ("restroom-dispensers", "Georgia-Pacific", "Georgia-Pacific Compact Vertical Coreless Toilet Paper Dispenser", "Dual coreless tissue dispenser holding up to 3,000 sheets with zero cardboard core waste", "2x Coreless", "3000 Sheets", "ADA Slim", "Keyed Lock", "tile-grout"),
    ("restroom-dispensers", "San Jamar", "San Jamar Classic Oceans Twin 9-Inch Jumbo Tissue Dispenser", "Break-resistant translucent jumbo toilet tissue dispenser for fast custodian level checks", "2x 9-in Rolls", "Translucent", "Universal Core", "Wall Mount", "tile-grout"),
    ("restroom-dispensers", "San Jamar", "San Jamar Tear-N-Dry Essence Electronic Towel Dispenser", "Universal non-proprietary 8-inch roll towel dispenser lowering ongoing consumable costs", "Universal 8-in", "No Proprietary", "4 D-Cell", "Low Profile", "tile-grout"),
    ("restroom-dispensers", "GOJO", "GOJO PURELL ES8 Touch-Free Hand Sanitizer Dispenser", "Energy-on-the-refill touchless sanitizer station for reception desks and elevator lobbies", "1200 mL", "Energy-on-Refill", "ADA Compliant", "At-a-Glance", "mixed"),
    ("restroom-dispensers", "GOJO", "GOJO TFX Touch-Free Foam Hand Soap Dispenser", "1200 mL touchless foaming soap wall dispenser delivering 2,000+ handwashes per refill", "1200 mL", "Touch-Free", "Skylight View", "ADA Depth", "tile-grout"),
    ("restroom-dispensers", "Kimberly-Clark", "Kimberly-Clark Professional ICON Automatic Soap & Sanitizer Dispenser", "Interchangeable faceplate commercial touchless dispenser for modern Class A restrooms", "1.2 L Refill", "Touchless", "Custom Trim", "5-Yr Warranty", "tile-grout"),
    ("restroom-dispensers", "Kimberly-Clark", "Scott Pro High-Capacity Coreless Standard Roll Dispenser", "4-roll high-capacity coreless toilet paper dispenser reducing custodian refill labor", "4 Coreless", "Keyed/Keyless", "High Traffic", "ADA Compliant", "tile-grout"),
    ("restroom-dispensers", "Bobrick", "Bobrick B-262 ClassicSeries Surface-Mounted Folded Towel Dispenser", "Satin-finish 304 stainless steel C-fold/multifold towel dispenser for architectural restrooms", "400 C-Fold", "304 Stainless", "Tumbler Lock", "Commercial", "tile-grout"),
    ("restroom-dispensers", "Bobrick", "Bobrick B-270 ConturaSeries Sanitary Napkin Disposal", "Surface-mounted satin stainless steel restroom feminine hygiene disposal receptacle", "1.0 gal", "304 Stainless", "Self-Closing", "ADA Reach", "tile-grout"),
    ("restroom-dispensers", "Rubbermaid Commercial", "Rubbermaid Commercial AutoFoam 1100 mL Touchless Soap Dispenser", "High-yield touchless foam soap dispenser delivering up to 2,750 doses per battery cycle", "1100 mL", "2,750 Doses", "3-Yr Battery", "ADA Compliant", "tile-grout"),

    # 8. Paper Consumables & Trash Liners (14)
    ("paper-and-liners", "Georgia-Pacific", "Georgia-Pacific enMotion 10-Inch High-Capacity Paper Towel Rolls (6-Case)", "800-foot 1-ply commercial roll towels engineered for enMotion touchless dispensers", "6 x 800 ft", "4,800 ft/case", "10-in Width", "Eco-Friendly", "mixed"),
    ("paper-and-liners", "Kimberly-Clark", "Scott Pro Hard Roll Paper Towels 1.75-Inch Core (6-Case)", "Absorbency-pocket commercial roll towels reducing sheets dried per handwash", "6 x 1,150 ft", "6,900 ft/case", "1.75-in Core", "FSC Certified", "mixed"),
    ("paper-and-liners", "Tork", "Tork Universal Multifold Hand Towels Natural (16-Pack Case)", "4,000-sheet recycled multifold paper towels for standard office restroom dispensers", "4,000 Sheets", "16 x 250", "9.125x9.5 in", "100% Recycled", "mixed"),
    ("paper-and-liners", "Georgia-Pacific", "Angel Soft Professional Series 2-Ply Embossed Toilet Paper (80-Case)", "Soft 2-ply 450-sheet individually wrapped standard rolls for executive and boutique offices", "80 Rolls", "450 Sheets/Roll", "2-Ply", "Septic Safe", "mixed"),
    ("paper-and-liners", "Kimberly-Clark", "Scott Essential Jumbo Roll Toilet Paper 2-Ply (12-Case)", "1,000-foot 2-ply jumbo bath tissue rolls minimizing maintenance checks in busy restrooms", "12 x 1,000 ft", "12,000 ft/case", "2-Ply", "3.25-in Core", "mixed"),
    ("paper-and-liners", "Tork", "Tork Universal Jumbo Bath Tissue 2-Ply (12-Case)", "9-inch jumbo commercial bath tissue rolls certified EcoLogo for green office contracts", "12 x 1,000 ft", "9-in Diameter", "2-Ply", "EcoLogo", "mixed"),
    ("paper-and-liners", "Boardwalk", "Boardwalk 40x48 High-Density 45-Gallon Commercial Trash Liners (250-Case)", "16-micron high-density star-seal liners for 44-gal Brute office paper and restroom pulls", "40x48 in", "16 Micron", "250 Count", "Star-Seal", "mixed"),
    ("paper-and-liners", "Boardwalk", "Boardwalk 24x33 Low-Cost Office Deskside Trash Can Liners (1000-Case)", "8-micron high-density liners sized for 12–16 quart workstation deskside wastebaskets", "24x33 in", "8 Micron", "1000 Count", "Coreless Roll", "mixed"),
    ("paper-and-liners", "Berry Global", "Berry Rhino-X 38x60 Heavy-Duty 55-Gallon Liners (200-Case)", "17-micron high-density liners built for breakroom wet waste and heavy cafeteria loads", "38x60 in", "17 Micron", "200 Count", "Leak-Proof", "mixed"),
    ("paper-and-liners", "Plasticplace", "Plasticplace 30x36 Clear 20–30 Gallon Recycling Can Liners (250-Case)", "Clear 0.75-mil LLDPE bags letting janitors inspect single-stream recycling compliance", "30x36 in", "0.75 Mil", "250 Count", "Clear Inspect", "mixed"),
    ("paper-and-liners", "Genuine Joe", "Genuine Joe 33x39 Heavy-Duty 33-Gallon Can Liners (100-Case)", "1.5-mil puncture-resistant black liners for sharp breakroom packaging and copy-room debris", "33x39 in", "1.5 Mil", "100 Count", "Flat Pack", "mixed"),
    ("paper-and-liners", "Georgia-Pacific", "Pacific Blue Basic Folded Paper Towels (4000-Case)", "Economical 1-ply white multifold hand towels for mid-size commercial offices", "4,000 Towels", "16 Packs", "Multifold", "EPA Compliant", "mixed"),
    ("paper-and-liners", "PURELL", "PURELL ES8 1200 mL Healthy Soap Foam Refill (2-Pack)", "Fragrance-free dye-free commercial foam hand soap refills for high-compliance restrooms", "2 x 1200 mL", "Fragrance Free", "Sanitary Seal", "Green Cert", "mixed"),
    ("paper-and-liners", "Kleenex", "Kleenex Professional Facial Tissue Cube Boxes for Offices (36-Case)", "2-ply soft conference-room and reception facial tissue cubes reducing desk clutter", "36 Cubes", "95 Sheets/Box", "2-Ply", "FSC Certified", "mixed"),

    # 9. Commercial Chemicals & Disinfectants (14)
    ("chemicals-disinfectants", "CloroxPro", "CloroxPro Clorox Disinfecting Wipes Commercial Bucket (700-Count)", "EPA-registered 700-count refillable wipe bucket for rapid high-touch desk and doorknob wiping", "700 Wipes", "EPA List N", "Bleach-Free", "Refillable", "mixed"),
    ("chemicals-disinfectants", "CloroxPro", "CloroxPro Hydrogen Peroxide Cleaner Disinfectant Concentrate", "Fast 30-second to 1-minute contact time hospital-grade disinfectant without harsh fumes", "128 oz Gal", "Hydrogen Perox", "1-Min Kill", "No VOC Fumes", "tile-grout"),
    ("chemicals-disinfectants", "Lysol", "Lysol Professional Disinfectant Spray 19-oz Case (12-Pack)", "Commercial aerosol disinfectant for phones, conference tables, and restroom fixtures", "12 x 19 oz", "EPA Reg", "Kills 99.9%", "Crisp Linen", "mixed"),
    ("chemicals-disinfectants", "Zep", "Zep Neutral pH Industrial Floor Cleaner Concentrate (5-Gallon Pail)", "Non-dulling pH-neutral cleaner safe for finished VCT, terrazzo, sealed stone, and LVT", "5 gal Pail", "Neutral pH 7", "1:128 Dilute", "No Rinse", "vct-vinyl"),
    ("chemicals-disinfectants", "Zep", "Zep Commercial Streak-Free Glass Cleaner Gallon (4-Case)", "Ammonia-based rapid-dry glass cleaner for lobby curtain walls and conference partitions", "4 x 1 gal", "Ammonia Formula", "Streak-Free", "Refillable", "mixed"),
    ("chemicals-disinfectants", "Bona", "Bona Pro Series Commercial Hardwood Floor Cleaner Gallon", "GREENGUARD Gold certified residue-free neutral cleaner protecting urethane wood floors", "1 gal", "GREENGUARD", "No Residue", "Ready/Conc", "hardwood"),
    ("chemicals-disinfectants", "Simple Green", "Simple Green Pro HD Heavy-Duty Cleaner & Degreaser (1-Gallon)", "Non-corrosive biodegradable degreaser for breakroom appliances and concrete dock entries", "1 gal", "Biodegradable", "Phosphate-Free", "Concentrate", "polished-concrete"),
    ("chemicals-disinfectants", "Spartan", "Spartan Clean by Peroxy All-Purpose Cleaner Gallon (4-Case)", "Green Seal GS-37 hydrogen-peroxide cleaner brightening ceramic tile grout and glass", "4 x 1 gal", "Green Seal", "Peroxide", "Multi-Surface", "tile-grout"),
    ("chemicals-disinfectants", "Diversy", "Diversey Virex II 256 One-Step Disinfectant Cleaner Gallon", "1:256 ultra-concentrated neutral quaternary disinfectant safe for daily floor & restroom care", "1 gal", "1:256 Yield", "Neutral pH", "Hospital Grade", "tile-grout"),
    ("chemicals-disinfectants", "Diversy", "Diversey Vectra Commercial High-Gloss Floor Finish (5-Gal)", "25% solids durable zinc-interlocked acrylic VCT floor finish resisting scuff marks", "5 gal", "25% Solids", "High Gloss", "VCT Finish", "vct-vinyl"),
    ("chemicals-disinfectants", "Zep", "Zep High-Traffic Floor Polish & Stripper Bundle", "Commercial VCT floor stripper + acrylic finish combo for quarterly/semi-annual restoration", "2 x 1 gal", "Acrylic + Strip", "Wet-Look", "VCT Care", "vct-vinyl"),
    ("chemicals-disinfectants", "ECOS Pro", "ECOS Pro Orange Plus All-Purpose Cleaner (1-Gallon)", "EPA Safer Choice plant-derived neutral cleaner for green-certified corporate offices", "1 gal", "Safer Choice", "Plant-Based", "Low VOC", "mixed"),
    ("chemicals-disinfectants", "Fabuloso", "Fabuloso Professional All-Purpose Cleaner Concentrate (1-Gallon 4-Case)", "Neutral pH multi-surface floor and restroom cleaner delivering long-lasting lavender scent", "4 x 1 gal", "Neutral pH", "1:64 Dilute", "4-Gal Case", "mixed"),
    ("chemicals-disinfectants", "Fresh Products", "Fresh Products Wave 3D Urinal Deodorizer Screens (10-Box)", "30-day enzymatic splash-reducing urinal screens eliminating restroom odor complaints", "10 Screens", "30-Day Life", "Anti-Splash", "Enzymatic", "tile-grout"),

    # 10. Microfiber Cloths, Window Tools & Safety Cones (14)
    ("cloths-window-safety", "Microfiber Wholesale", "Microfiber Wholesale 16x16 Commercial Cleaning Cloths (150-Pack, Color-Coded)", "4-color OSHA cross-contamination pack (red restroom, yellow glass, blue general, green kitchen)", "150 Cloths", "16x16 in", "300 GSM", "4-Color Code", "mixed"),
    ("cloths-window-safety", "Rubbermaid Commercial", "Rubbermaid Commercial HYGEN Microfiber Damp/Wet Cloths (12-Pack)", "Commercial 16x16 split-microfiber cloths rated for 500 commercial launderings", "12 Cloths", "500 Washes", "Bleach Safe", "Color-Coded", "mixed"),
    ("cloths-window-safety", "Unger", "Unger Professional 18-Inch Window Squeegee & Scrubber Kit", "Anodized aluminum 18-inch squeegee + microfiber washer + 8-ft telescopic pole", "18-in Blade", "8-ft Pole", "Rubber Blade", "Streak-Free", "mixed"),
    ("cloths-window-safety", "Unger", "Unger Nifty Nabber 36-Inch Commercial Trash Picker Grabber", "Heavy-duty rubber-tipped 36-inch litter grabber for exterior entries and parking aprons", "36-in Reach", "Steel Claws", "Ergonomic", "10 lb Lift", "mixed"),
    ("cloths-window-safety", "Rubbermaid Commercial", "Rubbermaid Commercial 36-Inch Yellow Caution Wet Floor Cone (4-Side)", "36-inch four-sided high-visibility wet floor safety cone with bilingual English/Spanish print", "36-in Tall", "4-Sided Print", "Stackable", "ANSI/OSHA", "vct-vinyl"),
    ("cloths-window-safety", "Rubbermaid Commercial", "Rubbermaid Commercial 25-Inch Multilingual Wet Floor A-Frame Sign (6-Pack)", "Fold-flat 25-inch yellow A-frame caution signs for multi-restroom night crews", "6 Signs", "25-in Tall", "Fold-Flat", "Carry Handle", "tile-grout"),
    ("cloths-window-safety", "Rubbermaid Commercial", "Rubbermaid Commercial Lobby Pro Upright Dust Pan & Broom", "Self-opening lidded upright lobby dustpan and angled broom for discrete daytime spills", "Long Handle", "Auto Lid", "Quiet Wheels", "Day Porter", "mixed"),
    ("cloths-window-safety", "O-Cedar Commercial", "O-Cedar Commercial MaxiClean Angle Broom & Lobby Pan", "Flagged-bristle angled broom capturing fine dust along baseboards and elevator tracks", "12-in Head", "Flagged Poly", "48-in Handle", "Baseboard Fit", "mixed"),
    ("cloths-window-safety", "Swiffer", "Swiffer Dusters Heavy Duty 360 Commercial Starter + 24 Refills", "Disposable electrostatic high-reach dusters for cubicles, blinds, and monitor stands", "24 Refills", "3-ft Extend", "360 Fibers", "No Scratch", "mixed"),
    ("cloths-window-safety", "Dyson", "Dyson V15 Detect Pro / Commercial Spot Cordless Stick", "Piezo sensor cordless stick vacuum for quick executive-suite daytime touchups", "HEPA Seal", "Laser Detect", "60 min Run", "6.8 lb", "hardwood"),
    ("cloths-window-safety", "3M", "3M Scotch-Brite Commercial Heavy-Duty Scour Pads (20-Pack)", "Non-rusting synthetic scouring pads for commercial breakroom sinks and porcelain", "20 Pads", "6x9 in", "Commercial", "Breakroom", "tile-grout"),
    ("cloths-window-safety", "Impact Products", "Impact 32-oz Heavy-Duty Chemical Spray Bottles (12-Pack)", "OSHA-ready embossed measurement trigger sprayers rated for commercial concentrates", "12 x 32 oz", "Viton Seal", "Graduated", "Color Coded", "mixed"),
    ("cloths-window-safety", "Rubbermaid Commercial", "Rubbermaid Commercial 16-Inch High-Duster Microfiber Wand", "Bendable 51-inch high-reach microfiber wand cleaning ceiling vents and light fixtures", "51-in Reach", "Bendable", "Washable Pad", "Overhead", "mixed"),
    ("cloths-window-safety", "Ettore", "Ettore Master Brass 14-Inch Commercial Window Squeegee", "Solid tempered brass 14-inch squeegee handle with replaceable streak-free rubber", "14-in Blade", "Solid Brass", "Pro Rubber", "Glass Part", "mixed"),

    # 11. Commercial Entrance Mats & Floor Protection (8)
    ("entrance-mats", "Apache Mills", "Apache Mills Cross Rib 4x6 Heavy-Duty Commercial Entrance Mat", "Raised cross-rib olefin carpet mat trapping 80% of rain, snow, and grit at lobby doors", "4x6 ft", "Vinyl Back", "Cross-Rib", "Indoor/Entry", "mixed"),
    ("entrance-mats", "Gorilla Grip", "Gorilla Grip Commercial Grade 36x60 Heavy-Duty Door Mat", "Stain-resistant deep-groove scraper mat protecting office carpet and hardwood entries", "3x5 ft", "Natural Rubber", "Deep Groove", "Low Profile", "carpet"),
    ("entrance-mats", "Notrax", "NoTrax 136 Brush Step 3x10 Commercial Lobby Runner", "10-foot commercial double-rib runner catching winter slush across main corridors", "3x10 ft", "Vinyl Base", "24-oz Face", "ADA Bevel", "vct-vinyl"),
    ("entrance-mats", "Crown Matting", "Crown Mats 4x8 Charcoal Commercial Water-Trap Entrance Mat", "Absorbent molded-pattern water-dam mat holding up to 1.5 gallons of rainwater per sq yd", "4x8 ft", "Rubber Border", "Water-Dam", "High Traffic", "hardwood"),
    ("entrance-mats", "Rubber-Cal", "Rubber-Cal Corrugated Ribbed 3x12 Commercial Rubber Runner", "Slip-resistant corrugated rubber walkway runner for rainy loading docks and service entries", "3x12 ft", "1/8-in Thick", "Non-Slip", "Wet Entries", "polished-concrete"),
    ("entrance-mats", "M+A Matting", "M+A Matting WaterHog Classic 3x5 Commercial Mat", "Bi-level polypropylene WaterHog mat certified slip-resistant by NFSI for Class A lobbies", "3x5 ft", "NFSI Cert", "Rubber Dam", "Bevel Edge", "tile-grout"),
    ("entrance-mats", "M+A Matting", "M+A Matting WaterHog Fashion 4x6 Commercial Mat", "Fabric-bordered 4x6 WaterHog mat blending into executive reception lobbies", "4x6 ft", "Pet-Fiber", "45% Recycled", "NFSI Cert", "carpet"),
    ("entrance-mats", "Wearwell", "Wearwell 24/7 Anti-Fatigue Standing Desk & Reception Mat", "Commercial closed-cell nitrile-rubber mat for security desks and copy-station floors", "3x5 ft", "5/8-in Thick", "Beveled Edge", "Ergonomic", "polished-concrete"),

    # 12. Commercial Air Purifiers & Odor Control (8)
    ("air-purifiers", "Medify Air", "Medify MA-50 Commercial H13 HEPA Air Purifier (2,200 sq ft/hr)", "Dual-side True HEPA H13 purifier scrubbing dust and odors in conference rooms and suites", "1,100 sq ft", "True HEPA H13", "36 dBA Min", "4 Fan Speeds", "mixed"),
    ("air-purifiers", "Medify Air", "Medify MA-112 Large Commercial Room HEPA H13 Purifier", "Twin-intake 950 CADR purifier covering 2,500+ sq ft open office floors every 30 minutes", "2,500 sq ft", "Dual H13", "950 CADR", "Carbon Filter", "mixed"),
    ("air-purifiers", "Coway", "Coway Airmega 400 Commercial Grade Smart HEPA Purifier", "1,560 sq ft dual-suction Green True HEPA purifier with real-time PM2.5 LED ring", "1,560 sq ft", "Max2 Green", "Dual Suction", "Auto Mode", "mixed"),
    ("air-purifiers", "Winix", "Winix 5500-2 True HEPA Commercial Office Air Purifier", "Washable AOC carbon + True HEPA unit ideal for 360 sq ft private offices and breakrooms", "360 sq ft", "True HEPA", "AOC Carbon", "PlasmaWave", "mixed"),
    ("air-purifiers", "Blueair", "Blueair Pro L Commercial Air Purifier for Open Offices", "Powder-coated galvanized steel commercial purifier built for 390–800 sq ft medical suites", "390 sq ft+", "HEPASilent", "Steel Chassis", "Low Watt", "mixed"),
    ("air-purifiers", "Levoit", "Levoit EverestAir Commercial Large-Room HEPA Purifier", "Laser dust-sensor commercial purifier with 3-stage HEPA filtration for busy reception areas", "558 sq ft+", "3-Stage HEPA", "PM Sensor", "App Control", "mixed"),
    ("air-purifiers", "Alen", "Alen BreatheSmart 75i Commercial True HEPA Purifier", "Ultra-quiet 1,300 sq ft medical-grade HEPA purifier for law offices and therapy clinics", "1,300 sq ft", "Medical HEPA", "Laser Sensor", "Whisper Run", "mixed"),
    ("air-purifiers", "Rubbermaid Commercial", "Rubbermaid Commercial TCell 2.0 Continuous Odor Control System", "Fuel-cell passive 60–90 day restroom air care dispenser requiring zero batteries or VOC propellants", "60-90 Days", "Zero Battery", "Fuel Cell", "ADA Compact", "tile-grout"),
]

# Pad or verify count == 150
BADGES = {
    "backpack-vacuums": "Commercial Backpack Pick",
    "upright-vacuums": "Commercial Upright Pick",
    "carpet-extractors": "Deep Carpet Care Pick",
    "floor-machines": "Floor Machine Pick",
    "mops-and-buckets": "Hard-Floor Mop System",
    "carts-and-bins": "Facility Cart & Waste Pick",
    "restroom-dispensers": "Touchless Restroom Pick",
    "paper-and-liners": "Bulk Consumables Pick",
    "chemicals-disinfectants": "Commercial Chemical Pick",
    "cloths-window-safety": "Pro Detailing & Safety Pick",
    "entrance-mats": "Lobby Matting Pick",
    "air-purifiers": "Indoor Air Quality Pick",
}

products = []
seen_ids = set()
for idx, row in enumerate(CATALOG_SEED):
    cat, brand, title, subtitle, s1, s2, s3, s4, floor_fit = row
    slug = (
        title.lower()
        .replace("&", "and")
        .replace("/", "-")
        .replace(".", "")
    )
    import re
    pid = re.sub(r"[^a-z0-9]+", "-", slug).strip("-")[:64]
    if pid in seen_ids:
        pid = f"{pid}-{idx}"
    seen_ids.add(pid)
    products.append({
        "id": pid,
        "category": cat,
        "badge": BADGES[cat],
        "brand": brand,
        "title": title,
        "subtitle": subtitle,
        "specs": {
            "capacityOrSize": s1,
            "filtrationOrGrade": s2,
            "footprintOrReach": s3,
            "dutyProfile": s4,
        },
        "features": [
            f"Built by {brand} for repeatable commercial janitorial shifts ({s1}, {s2}).",
            f"Engineered to protect facility surfaces and optimize crew speed ({s3}, {s4}).",
            "Available in bulk or single commercial units on Amazon US with business invoicing.",
        ],
        "bestForFloor": floor_fit,
        "queryUS": title.split("(")[0].strip(),
        "ctaLabel": "Check Price on Amazon",
    })

print(f"Generated {len(products)} commercial Amazon products.")
OUT.write_text(json.dumps(products, indent=2))
