import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ClientEffects from "@/components/ClientEffects";
import SplitHeading from "@/components/SplitHeading";
import ReadingProgress from "@/components/ReadingProgress";
import CalculatorWidget from "@/components/CalculatorWidget";
import AmazonAffiliateBox from "@/components/AmazonAffiliateBox";
import OpenChatButton from "@/components/OpenChatButton";
import { JsonLd } from "@/components/Breadcrumbs";
import Hero from "@/components/home/Hero";
import ScrollStory from "@/components/home/ScrollStory";
import TaskOrbit, { type TaskOrbitItem } from "@/components/home/TaskOrbit";
import CostCounters, { type CostStat } from "@/components/home/CostCounters";
import DayNightSlider from "@/components/home/DayNightSlider";
import FacilityCarousel, {
  type FacilitySlide,
} from "@/components/home/FacilityCarousel";
import CityExplorer from "@/components/home/CityExplorer";
import { getContextualAmazonProducts } from "@/lib/amazon";
import {
  SITE_URL,
  ambient,
  getCategories,
  getCities,
  safeHref,
} from "@/lib/content";

const MARQUEE_TOP = [
  "New York, NY · 1.35x",
  "San Francisco, CA · 1.35x",
  "Chicago, IL · 1.22x",
  "Dallas, TX · 0.99x",
  "Austin, TX · 1.03x",
  "Seattle, WA · 1.27x",
  "Atlanta, GA · 1.01x",
  "Miami, FL · 1.08x",
  "Denver, CO · 1.12x",
  "Phoenix, AZ · 0.98x",
];

const MARQUEE_BOTTOM = [
  "Medical & Dental Suites",
  "Law Firms & CPA Offices",
  "Coworking & Shared Spaces",
  "Corporate Class A Towers",
  "Bank Branches & Credit Unions",
  "Tech Campuses & Labs",
  "VCT Strip & Wax",
  "HEPA Carpet Extraction",
];

const PRICE_DRIVERS = [
  {
    icon: "📐",
    t: "Square Footage Brackets",
    d: "Unit prices step down from $0.12–$0.20/sq ft under 2,500 sq ft to $0.05–$0.10/sq ft above 25,000 sq ft thanks to crew setup amortization.",
  },
  {
    icon: "🚻",
    t: "Restrooms & Fixtures",
    d: "Each commercial restroom adds $15–$30 per visit for porcelain descaling, partition wiping, mirror polishing, and paper/soap restocking.",
  },
  {
    icon: "🪵",
    t: "Flooring & Grout Mix",
    d: "Polished concrete cleans fastest (0.95x), carpet tiles set the baseline (1.00x), while ceramic tile & grout requires 1.12x more scrubbing labor.",
  },
  {
    icon: "📅",
    t: "Weekly Cadence",
    d: "Daily 5x/week contracts unlock a 10% per-visit discount versus 2x/week, while monthly deep visits carry a 28% soil-buildup surcharge.",
  },
  {
    icon: "🏙️",
    t: "Metro Wage Index",
    d: "Prevailing wages, freight elevator delays, and downtown parking push NYC/SF bids 35% above the US average, while Midwest/South metros run ~0.85x–0.98x.",
  },
  {
    icon: "🧻",
    t: "Consumables & Bonding",
    d: "Including paper towels, toilet tissue, liners, and $2M Class A insurance adds $0.012–$0.025/sq ft per visit—verify this line item before comparing bids.",
  },
];

const ORBIT_TASKS: TaskOrbitItem[] = [
  {
    k: "restrooms",
    name: "Restroom Sanitation",
    icon: "🧼",
    role: "+$15–$30 / room per visit",
    d: "EPA-registered disinfection of toilets, urinals, sinks, chrome hardware, mirrors, and high-touch stall latches.",
    href: safeHref("/cleaning-services-and-tasks/restroom-sanitization-cost-guide/"),
  },
  {
    k: "vacuums",
    name: "HEPA Vacuuming",
    icon: "🧹",
    role: "3,000–4,000 sq ft / hr",
    d: "Commercial backpack or sealed-HEPA upright passes across open cubicles, hallways, and conference suites.",
    href: safeHref("/commercial-vacuums-and-floor-machines/best-commercial-backpack-vacuums-for-offices/"),
  },
  {
    k: "vct",
    name: "VCT Strip & Wax",
    icon: "✨",
    role: "$0.35–$0.75 / sq ft periodic",
    d: "Quarterly or semi-annual rotary stripping, neutralizer rinse, and 3–5 coats of high-solids acrylic floor finish.",
    href: safeHref("/cleaning-services-and-tasks/vct-strip-and-wax-cost-guide/"),
  },
  {
    k: "breakroom",
    name: "Breakroom Hygiene",
    icon: "☕",
    role: "+$12–$25 / visit add-on",
    d: "Sanitizing counters, sinks, coffee stations, microwave interiors, and refrigerator handles.",
    href: safeHref("/cleaning-services-and-tasks/breakroom-deep-sanitization-cost-guide/"),
  },
  {
    k: "glass",
    name: "Interior Glass",
    icon: "🪟",
    role: "+$15–$35 / visit add-on",
    d: "Streak-free squeegee and microfiber detailing on reception doors, sidelights, and glass conference walls.",
    href: safeHref("/cleaning-services-and-tasks/interior-glass-partition-cleaning-cost-guide/"),
  },
  {
    k: "trash",
    name: "Trash & Recycling",
    icon: "♻️",
    role: "Included in base SOW",
    d: "Emptying deskside wastebaskets, replacing high-density liners, and hauling single-stream bins to dock compactors.",
    href: safeHref("/cleaning-services-and-tasks/trash-and-recycling-valet-service-cost-guide/"),
  },
  {
    k: "carpet",
    name: "Carpet Extraction",
    icon: "💦",
    role: "$0.18–$0.35 / sq ft project",
    d: "Hot-water extraction or low-moisture encapsulation removing winter salt, coffee spills, and traffic-lane soil.",
    href: safeHref("/cleaning-services-and-tasks/carpet-hot-water-extraction-cost-guide/"),
  },
  {
    k: "porter",
    name: "Day Porter Shifts",
    icon: "🧑‍🔧",
    role: "$28–$45 / hr staffed",
    d: "On-site daytime attendant keeping lobbies spotless, resetting conference rooms, and restocking busy restrooms.",
    href: safeHref("/cleaning-services-and-tasks/day-porter-services-cost-guide/"),
  },
];

const COST_STATS: CostStat[] = [
  { v: 0.11, prefix: "$", suffix: "/sf", dec: 2, l: "Avg. US Mid-Size Rate", note: "2,500–10,000 sq ft per visit", pct: 65 },
  { v: 90, prefix: "$", suffix: "+", dec: 0, l: "Minimum Visit Fee", note: "Covers crew trip & setup", pct: 45 },
  { v: 48, prefix: "$", suffix: "/hr", dec: 0, l: "Median Commercial Crew", note: "Standard range $35–$65/hr", pct: 72 },
  { v: 3500, prefix: "", suffix: " sf/h", dec: 0, l: "ISSA Cleaning Pace", note: "Typical light-office speed", pct: 80 },
  { v: 22, prefix: "$", suffix: "/rm", dec: 0, l: "Restroom Surcharge", note: "Typical range $15–$30/visit", pct: 58 },
  { v: 150, prefix: "", suffix: " cities", dec: 0, l: "US Metro Benchmarks", note: "0.85x to 1.35x wage index", pct: 100 },
];

const HOME_FAQ = [
  {
    q: "How much does commercial office cleaning cost per square foot in the US?",
    a: "Most US offices pay between $0.07 and $0.20 per square foot per visit. Suites under 2,500 sq ft typically run $0.12–$0.20/sq ft (often subject to a $90–$135 minimum visit fee), 2,500–10,000 sq ft offices average $0.09–$0.15/sq ft, and facilities over 25,000 sq ft drop to $0.05–$0.10/sq ft.",
  },
  {
    q: "What is the average monthly office cleaning cost for a 5,000 sq ft office?",
    a: "At the US national average with 3 restrooms and mixed flooring cleaned 3 times per week (13 visits/month), a 5,000 sq ft office typically costs $2,100 to $3,600 per month ($160–$275+ per visit depending on restrooms, supplies, and metro wages).",
  },
  {
    q: "Are paper towels, toilet paper, and soap included in cleaning quotes?",
    a: "Usually not by default. Most standard commercial bids cover labor and cleaning chemicals only. Adding vendor-supplied paper consumables and trash liners typically adds $0.012–$0.025 per sq ft per visit—or you can purchase bulk commercial cases directly on Amazon for lower markup.",
  },
  {
    q: "How should office managers compare three different janitorial quotes?",
    a: "Convert each monthly quote into an implied hourly rate and per-visit cost per sq ft, verify whether consumables are included, and confirm $1M/$2M General Liability, Workers' Compensation, a Janitorial Surety Bond, W-2 employee status, and a 30-day cancellation clause.",
  },
];

export default function HomePage() {
  const cats = getCategories();
  const cities = getCities();
  const featuredProducts = getContextualAmazonProducts({
    pillar: "commercial-vacuums-and-floor-machines",
    slug: "home-showcase",
    count: 6,
  });

  const slides: FacilitySlide[] = [
    {
      img: ambient("home-medical-suite"),
      t: "Medical & Dental",
      rate: "$0.14–$0.24 / sq ft",
      d: "EPA List N disinfection, exam rooms, and OSHA-trained crews.",
      href: safeHref("/facility-cleaning-costs/medical-clinic-cleaning-cost/"),
      alt: "Clean modern US outpatient medical clinic reception and hallway",
    },
    {
      img: ambient("home-law-office"),
      t: "Law & CPA Firms",
      rate: "$0.10–$0.16 / sq ft",
      d: "Glass conference walls, wood credenzas, and NDA-vetted night staff.",
      href: safeHref("/facility-cleaning-costs/law-firm-cleaning-cost/"),
      alt: "Executive law firm glass conference room in the United States",
    },
    {
      img: ambient("home-coworking"),
      t: "Coworking Hubs",
      rate: "$0.11–$0.18 / sq ft",
      d: "High-density kitchenettes, phone booths, and midday restroom resets.",
      href: safeHref("/facility-cleaning-costs/coworking-space-cleaning-cost/"),
      alt: "Bright US coworking open workspace with clean desks and lounge",
    },
    {
      img: ambient("home-corporate-lobby"),
      t: "Corporate Towers",
      rate: "$0.06–$0.11 / sq ft",
      d: "Multi-floor evening teams plus lobby day porters and floor care.",
      href: safeHref("/office-cleaning-cost-guides/cost-to-clean-a-25000-sq-ft-office/"),
      alt: "Polished stone commercial office building lobby in a US metro",
    },
  ];

  return (
    <>
      <ReadingProgress />
      <Header />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: HOME_FAQ.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }}
      />

      <main>
        <Hero />

        {/* Dual Marquee */}
        <section className="border-y border-[var(--line)] bg-occsky py-5 overflow-hidden">
          <div className="marquee">
            <div className="marquee-track text-sm font-bold text-occslate">
              {[...MARQUEE_TOP, ...MARQUEE_TOP].map((m, idx) => (
                <span key={idx} className="whitespace-nowrap">
                  ✦ {m}
                </span>
              ))}
            </div>
          </div>
          <div className="marquee reverse mt-2.5">
            <div className="marquee-track text-xs font-semibold uppercase tracking-wider text-occbluedeep">
              {[...MARQUEE_BOTTOM, ...MARQUEE_BOTTOM].map((m, idx) => (
                <span key={idx} className="whitespace-nowrap">
                  • {m}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Full Interactive Calculator */}
        <section className="wrap py-20">
          <div className="max-w-3xl">
            <span className="eyebrow">Primary Estimation Tool</span>
            <SplitHeading
              text="Office Cleaning Cost"
              accent="Calculator"
              className="section-title mt-3"
            />
            <p className="mt-3 text-lg text-[var(--muted)]">
              Adjust square footage, restroom count, floor surface, weekly
              frequency, and your US metro market to estimate realistic per-visit
              and monthly budgets.
            </p>
          </div>
          <div className="mt-8">
            <CalculatorWidget />
          </div>
        </section>

        {/* What Drives the Price — Spotlight Cards */}
        <section className="bg-occsky/60 py-20">
          <div className="wrap">
            <div className="max-w-3xl">
              <span className="eyebrow">How Bids Are Built</span>
              <SplitHeading
                text="Six drivers behind every"
                accent="janitorial quote"
                className="section-title mt-3"
              />
            </div>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {PRICE_DRIVERS.map((item, idx) => (
                <div
                  key={item.t}
                  className="card spot p-6"
                  data-reveal
                  data-reveal-delay={String(idx % 3)}
                >
                  <span className="text-3xl" aria-hidden>
                    {item.icon}
                  </span>
                  <h3 className="mt-3 font-display text-xl font-extrabold text-occink">
                    {item.t}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                    {item.d}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* GSAP ScrollStory */}
        <ScrollStory />

        {/* Task Orbit */}
        <section className="wrap py-20">
          <TaskOrbit items={ORBIT_TASKS} />
        </section>

        {/* Dark Animated Cost Counters */}
        <section className="relative isolate overflow-hidden bg-gradient-to-br from-[#04283d] via-[#071923] to-[#0d2838] py-20 text-white">
          <div className="wrap">
            <div className="max-w-2xl">
              <span className="chip text-[#bef264]">
                2026–2027 National US Data
              </span>
              <h2 className="section-title mt-4 text-white">
                Real pricing benchmarks,{" "}
                <span className="text-[#bef264]">not guesswork.</span>
              </h2>
              <p className="mt-3 text-white/75">
                Every guide on {SITE_URL.replace("https://", "")} shares one
                pricing model so your calculator math, city pages, and quote
                comparisons always agree.
              </p>
            </div>
            <div className="mt-10">
              <CostCounters data={COST_STATS} />
            </div>
          </div>
        </section>

        {/* Day vs Night Slider */}
        <section className="wrap py-20">
          <div className="max-w-3xl mb-8">
            <span className="eyebrow">Shift Strategy</span>
            <SplitHeading
              text="Daytime Porter vs."
              accent="After-Hours Night Crew"
              className="section-title mt-3"
            />
            <p className="mt-3 text-[var(--muted)]">
              Compare how daytime cleaning lowers night HVAC/lighting energy
              costs while after-hours crews deliver faster sq-ft-per-hour vacuum
              and floor machine speed.
            </p>
          </div>
          <DayNightSlider />
        </section>

        {/* Facility Carousel */}
        <section className="bg-occsky/60 py-20">
          <div className="wrap">
            <div className="max-w-2xl mb-10">
              <span className="eyebrow">By Industry</span>
              <SplitHeading
                text="Rates by facility"
                accent="type"
                className="section-title mt-3"
              />
            </div>
            <FacilityCarousel items={slides} />
          </div>
        </section>

        {/* 13-Silo Bento Grid */}
        <section className="wrap py-20">
          <div className="max-w-3xl">
            <span className="eyebrow">Complete Knowledge Base</span>
            <SplitHeading
              text="1,213 guides across"
              accent="13 specialized silos"
              className="section-title mt-3"
            />
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cats.map((c, idx) => (
              <Link
                key={c.slug}
                href={`/${c.slug}/`}
                className="card spot flex flex-col justify-between p-6"
                data-reveal
                data-reveal-delay={String(idx % 3)}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-occbluedeep">
                      {c.eyebrow}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ${
                        c.isTransactional
                          ? "bg-amber-100 text-amber-900"
                          : "bg-occsky text-occink"
                      }`}
                    >
                      {c.targetCount} guides
                    </span>
                  </div>
                  <h3 className="mt-2 font-display text-xl font-extrabold text-occink">
                    {c.name}
                  </h3>
                  <p className="mt-2 text-sm text-[var(--muted)]">
                    {c.description}
                  </p>
                </div>
                <span className="mt-4 text-xs font-bold text-occblue">
                  Explore {c.shortName} →
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* 150 City Explorer */}
        <section className="bg-occsky/60 py-20">
          <div className="wrap">
            <div className="max-w-3xl mb-8">
              <span className="eyebrow">Localized Metro Rates</span>
              <SplitHeading
                text="Office cleaning costs across"
                accent="150 US cities"
                className="section-title mt-3"
              />
            </div>
            <CityExplorer cities={cities} />
          </div>
        </section>

        {/* Quote Comparator Callout + Featured Amazon Gear */}
        <section className="wrap py-20 space-y-12">
          <div className="rounded-3xl bg-gradient-to-r from-[#071923] via-[#0d2838] to-[#0369a1] p-8 sm:p-10 text-white grid gap-6 lg:grid-cols-[1.2fr_auto] lg:items-center">
            <div>
              <span className="chip text-[#bef264]">
                Free Procurement Audit Matrix
              </span>
              <h2 className="mt-3 font-display text-3xl font-extrabold">
                Already have 2 or 3 cleaning quotes on your desk?
              </h2>
              <p className="mt-2 text-white/80 max-w-2xl">
                Score each vendor side-by-side on implied rate per sq ft,
                consumables inclusion, Workers&apos; Comp, janitorial bonding,
                and 30-day termination flexibility.
              </p>
            </div>
            <Link
              href="/compare-cleaning-quotes/"
              className="btn btn-lime shine text-base shrink-0"
              data-magnetic
            >
              Open Quote Comparator →
            </Link>
          </div>

          <AmazonAffiliateBox
            variant="showcase"
            sectionTitle="Top Commercial Office Cleaning Equipment & Supplies on Amazon US"
            sectionSubtitle="Vetted commercial vacuums, microfiber systems, touchless dispensers, and EPA disinfectants for in-house crews or supply closets."
            products={featuredProducts}
            source="home-showcase"
          />
        </section>

        {/* FAQ + AI Chat CTA */}
        <section className="wrap pb-10">
          <div className="max-w-3xl">
            <span className="eyebrow">Quick Answers</span>
            <h2 className="section-title mt-3">Frequently Asked Questions</h2>
          </div>
          <div className="mt-6 grid gap-3 lg:grid-cols-2">
            {HOME_FAQ.map((f) => (
              <details key={f.q} className="card p-5">
                <summary className="cursor-pointer font-display text-lg font-bold text-occink">
                  {f.q}
                </summary>
                <p className="mt-2.5 text-sm text-[var(--muted)] leading-relaxed">
                  {f.a}
                </p>
              </details>
            ))}
          </div>

          <div className="mt-10 rounded-3xl border border-[var(--line)] bg-occsky p-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-display text-2xl font-extrabold text-occink">
                Have a custom building layout or tricky vendor bid?
              </p>
              <p className="text-sm text-[var(--muted)]">
                Ask our English AI Cost Estimator for instant per-visit math,
                scope checks, and supply picks.
              </p>
            </div>
            <OpenChatButton className="btn btn-buy shine shrink-0">
              Chat With AI Estimator →
            </OpenChatButton>
          </div>
        </section>
      </main>

      <Footer />
      <ClientEffects />
    </>
  );
}
