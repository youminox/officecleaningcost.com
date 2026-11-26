import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-sync-key",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY =
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const SITE = "https://officecleaningcost.com";
const ALLOWED_MODELS = ["gpt-4o-mini", "gpt-4o"];
const AMAZON_TAG_US = "officecleaningcost-20";
const SYNC_KEY = "occ-sync-2026";

interface AmazonCard {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  urlUS: string;
}

const AMAZON_PICKS: Record<string, AmazonCard> = {
  "proteam-super-coach-pro-6": {
    id: "proteam-super-coach-pro-6",
    badge: "Commercial Backpack Pick",
    title: "ProTeam Super Coach Pro 6 Commercial Backpack Vacuum (4-Level HEPA)",
    subtitle: "6-quart HEPA backpack unit built for fast cubicle, stair, and corridor vacuuming.",
    urlUS: `https://www.amazon.com/s?k=${encodeURIComponent("ProTeam Super Coach Pro 6 Commercial Backpack Vacuum")}&tag=${AMAZON_TAG_US}`,
  },
  "hoover-hushtone-ch54115": {
    id: "hoover-hushtone-ch54115",
    badge: "Quiet Daytime Upright",
    title: "Hoover Commercial HushTone CH54115 15-Inch Sealed HEPA Upright",
    subtitle: "Two-speed 69 dBA quiet-mode commercial upright ideal for daytime or medical suites.",
    urlUS: `https://www.amazon.com/s?k=${encodeURIComponent("Hoover Commercial HushTone CH54115 Upright Vacuum")}&tag=${AMAZON_TAG_US}`,
  },
  "rubbermaid-wavebrake-35qt": {
    id: "rubbermaid-wavebrake-35qt",
    badge: "Hard-Floor Mop System",
    title: "Rubbermaid Commercial WaveBrake 35-Quart Mop Bucket & Side-Press Wringer",
    subtitle: "Splash-reducing commercial wringer bucket for VCT, tile, and sealed lobby floors.",
    urlUS: `https://www.amazon.com/s?k=${encodeURIComponent("Rubbermaid Commercial WaveBrake 35-Quart Mop Bucket")}&tag=${AMAZON_TAG_US}`,
  },
  "rubbermaid-hygen-pulse": {
    id: "rubbermaid-hygen-pulse",
    badge: "Low-Moisture Flat Mop",
    title: "Rubbermaid Commercial HYGEN 18-Inch Microfiber Pulse Spray Mop Kit",
    subtitle: "Onboard reservoir flat mop safe for engineered hardwood and quick daytime spills.",
    urlUS: `https://www.amazon.com/s?k=${encodeURIComponent("Rubbermaid Commercial HYGEN 18-Inch Microfiber Flat Mop Kit")}&tag=${AMAZON_TAG_US}`,
  },
  "enmotion-10-dispenser": {
    id: "enmotion-10-dispenser",
    badge: "Touchless Restroom Pick",
    title: "Georgia-Pacific enMotion 10-Inch Automated Touchless Paper Towel Dispenser",
    subtitle: "Hygienic controlled-length roll towel dispenser reducing restroom paper waste.",
    urlUS: `https://www.amazon.com/s?k=${encodeURIComponent("Georgia-Pacific enMotion 10-Inch Automated Touchless Paper Towel Dispenser")}&tag=${AMAZON_TAG_US}`,
  },
  "cloroxpro-disinfecting-wipes": {
    id: "cloroxpro-disinfecting-wipes",
    badge: "EPA List N Disinfectant",
    title: "CloroxPro Clorox Disinfecting Wipes Commercial Bucket (700-Count)",
    subtitle: "Bleach-free refillable commercial wipe bucket for desks, phones, and conference rooms.",
    urlUS: `https://www.amazon.com/s?k=${encodeURIComponent("CloroxPro Clorox Disinfecting Wipes Commercial Bucket 700")}&tag=${AMAZON_TAG_US}`,
  },
  "waterhog-classic-mat": {
    id: "waterhog-classic-mat",
    badge: "Lobby Entrance Mat",
    title: "M+A Matting WaterHog Classic 3x5 Commercial Scraper Entrance Mat",
    subtitle: "NFSI slip-resistant water-dam mat protecting office floors from rain and winter salt.",
    urlUS: `https://www.amazon.com/s?k=${encodeURIComponent("M+A Matting WaterHog Classic 3x5 Commercial Mat")}&tag=${AMAZON_TAG_US}`,
  },
  "medify-ma50-hepa": {
    id: "medify-ma50-hepa",
    badge: "Indoor Air Quality Pick",
    title: "Medify MA-50 Commercial H13 True HEPA Air Purifier",
    subtitle: "Dual-intake H13 HEPA air scrubber for conference rooms, clinics, and executive suites.",
    urlUS: `https://www.amazon.com/s?k=${encodeURIComponent("Medify MA-50 Commercial H13 HEPA Air Purifier")}&tag=${AMAZON_TAG_US}`,
  },
  "bissell-bg10-extractor": {
    id: "bissell-bg10-extractor",
    badge: "Deep Carpet Care Pick",
    title: "Bissell BigGreen Commercial BG10 Deep Cleaning Carpet Extractor",
    subtitle: "Dual-motor commercial carpet extractor for quarterly in-house or spot maintenance.",
    urlUS: `https://www.amazon.com/s?k=${encodeURIComponent("Bissell BigGreen Commercial BG10 Deep Cleaning Extractor")}&tag=${AMAZON_TAG_US}`,
  },
  "rubbermaid-janitor-cart": {
    id: "rubbermaid-janitor-cart",
    badge: "Facility Cart Pick",
    title: "Rubbermaid Commercial High-Capacity Janitorial Cleaning Cart",
    subtitle: "3-shelf structural web cart with 34-gal zippered vinyl bag for multi-room restocking.",
    urlUS: `https://www.amazon.com/s?k=${encodeURIComponent("Rubbermaid Commercial High-Capacity Janitorial Cleaning Cart")}&tag=${AMAZON_TAG_US}`,
  },
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function estimateCostUsd(model: string, pt: number, ct: number): number {
  if (model === "gpt-4o") {
    return (pt * 2.5 + ct * 10) / 1_000_000;
  }
  return (pt * 0.15 + ct * 0.6) / 1_000_000;
}

const SYSTEM_PROMPT = `You are the OfficeCleaningCost.com AI Estimator & Facility Advisor (English only, US market).
Your job is to help US office managers, business owners, and facility coordinators:
1. Estimate realistic per-visit, monthly, and annual commercial office cleaning prices in USD using our exact pricing model:
   - Size brackets (base rate per sq ft per visit):
     * Under 2,500 sq ft: $0.12 – $0.20 / sq ft (subject to $90 – $135 minimum per visit)
     * 2,500 – 9,999 sq ft: $0.09 – $0.15 / sq ft
     * 10,000 – 24,999 sq ft: $0.07 – $0.12 / sq ft
     * 25,000+ sq ft: $0.05 – $0.10 / sq ft
   - Restroom surcharge: +$15 – $30 per restroom per visit
   - Flooring multipliers: Carpet 1.00x, VCT/Vinyl 1.04x, Ceramic Tile & Grout 1.12x, Hardwood 1.08x, Polished Concrete 0.95x, Mixed 1.05x
   - Frequency multipliers and EXACT monthly total formula: monthlyTotal = perVisitTotal * visitsPerMonth.
     * monthly: 1.28x per-visit rate, visitsPerMonth = 1.0
     * biweekly: 1.16x per-visit rate, visitsPerMonth = 2.17
     * 1x/week: 1.08x per-visit rate, visitsPerMonth = 4.33
     * 2x/week: 1.00x per-visit rate, visitsPerMonth = 8.66
     * 3x/week: 0.95x per-visit rate, visitsPerMonth = 13.0 (3 * 4.33 — NEVER multiply by 4.33!)
     * 5x/week: 0.90x per-visit rate, visitsPerMonth = 21.65 (5 * 4.33)
     * 7x/week: 0.87x per-visit rate, visitsPerMonth = 30.33 (7 * 4.33)
   - City multipliers: ~0.85x in lower-cost Southern/Midwestern metros up to ~1.35x in NYC, SF, Boston, Seattle, DC.
   - Optional add-ons per visit: Breakroom +$12–$25, Interior Glass +$15–$35, Paper/Soap Consumables +$0.012–$0.025/sq ft.
   - Standard hourly reference: $35–$65/hr; ISSA pace ~3,000–4,000 sq ft per labor hour.
2. Advise on comparing janitorial bids (SOW checklist, W-2 vs 1099, $1M/$2M General Liability + Workers' Comp + Janitorial Bond, consumables inclusion).
3. Recommend up to 2 relevant commercial supplies/equipment from our Amazon US catalog IDs when appropriate (NEVER invent star ratings, review counts, or exact Amazon prices).
4. Always reply in clear, concise, helpful US English.

Return strictly valid JSON with keys:
{
  "reply": "string (clear answer in US English, max ~180 words, using bullet points or short paragraphs)",
  "suggested_options": ["2 to 3 short follow-up prompt chips in English"],
  "product_ids": ["0 to 2 IDs from the provided Amazon catalog list"],
  "article_slugs": ["0 to 3 slugs from the provided relevant articles list"]
}`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    if (req.method === "GET") {
      const { data: cfg } = await supabase
        .from("officecleaningcost_chat_config")
        .select("is_enabled, ai_model, welcome_message")
        .eq("id", "default")
        .maybeSingle();

      return json({
        is_enabled: cfg ? Boolean(cfg.is_enabled) : true,
        ai_model: cfg?.ai_model || "gpt-4o-mini",
        welcome_message:
          cfg?.welcome_message ||
          "Hi! 👋 I am the OfficeCleaningCost.com AI Estimator. Share your office sq ft, restrooms, flooring, US city, and frequency for a quick budget range.",
      });
    }

    if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
    const body = await req.json().catch(() => ({}));
    const action = String(body.action || "chat");

    if (action === "sync_articles") {
      const key = req.headers.get("x-sync-key") || "";
      if (key !== SYNC_KEY) return json({ error: "Unauthorized" }, 401);
      const rows = Array.isArray(body.articles) ? body.articles : [];
      if (!rows.length) return json({ synced: 0 });
      const now = new Date().toISOString();
      const clean = rows.map((r: Record<string, unknown>) => ({
        slug: String(r.slug || ""),
        title: String(r.title || ""),
        category: String(r.category || ""),
        category_name: String(r.category_name || ""),
        excerpt: String(r.excerpt || ""),
        featured_image: String(r.featured_image || ""),
        read_time: String(r.read_time || "7 min"),
        search_text: String(r.search_text || ""),
        active: r.active !== false,
        updated_at: now,
      }));
      const { error } = await supabase
        .from("officecleaningcost_articles")
        .upsert(clean, { onConflict: "slug" });
      if (error) return json({ error: error.message }, 500);
      return json({ ok: true, synced: clean.length });
    }

    if (action === "track_click") {
      const sessionId = body.session_id || null;
      const visitorId = String(body.visitor_id || "");
      const articleSlug = String(body.article_slug || "");
      const articleTitle = String(body.article_title || "");
      const category = String(body.category || "amazon");
      const targetUrl = String(body.target_url || "");
      const pageUrl = String(body.page_url || "");

      await supabase.from("officecleaningcost_chat_clicks").insert({
        session_id: sessionId,
        visitor_id: visitorId,
        article_slug: articleSlug,
        article_title: articleTitle,
        category,
        target_url: targetUrl,
        page_url: pageUrl,
      });

      if (sessionId) {
        const { data: sess } = await supabase
          .from("officecleaningcost_chat_sessions")
          .select("clicks_count, clicked_urls")
          .eq("id", sessionId)
          .maybeSingle();
        if (sess) {
          const urls = Array.isArray(sess.clicked_urls) ? sess.clicked_urls : [];
          if (targetUrl && !urls.includes(targetUrl)) urls.push(targetUrl);
          await supabase
            .from("officecleaningcost_chat_sessions")
            .update({
              clicks_count: (sess.clicks_count || 0) + 1,
              clicked_urls: urls.slice(-20),
            })
            .eq("id", sessionId);
        }
      }
      return json({ ok: true });
    }

    // CHAT ACTION
    const { data: cfg } = await supabase
      .from("officecleaningcost_chat_config")
      .select("*")
      .eq("id", "default")
      .maybeSingle();

    if (cfg && cfg.is_enabled === false) {
      return json({ error: "Chat is currently paused." }, 503);
    }

    const model = ALLOWED_MODELS.includes(String(cfg?.ai_model))
      ? String(cfg.ai_model)
      : "gpt-4o-mini";
    const temperature = Number(cfg?.temperature ?? 0.35);
    const maxMsgs = Number(cfg?.max_messages_per_session ?? 30);
    const customInstr = String(cfg?.custom_instructions || "").trim();

    const userMessage = String(body.message || "").trim().slice(0, 1500);
    if (!userMessage) return json({ error: "Empty message" }, 400);

    const visitorId = String(body.visitor_id || "anon").slice(0, 120);
    const pageUrl = String(body.page_url || SITE).slice(0, 300);
    const userAgent = (req.headers.get("user-agent") || "").slice(0, 280);
    let sessionId: string | null = body.session_id ? String(body.session_id) : null;

    if (!sessionId) {
      const { data: created } = await supabase
        .from("officecleaningcost_chat_sessions")
        .insert({
          visitor_id: visitorId,
          page_url: pageUrl,
          user_agent: userAgent,
          first_user_message: userMessage,
          last_user_message: userMessage,
          messages_count: 1,
          model_used: model,
        })
        .select("id")
        .single();
      sessionId = created?.id || null;
    }

    let history: Array<{ role: string; content: string }> = [];
    if (sessionId) {
      const { data: prev } = await supabase
        .from("officecleaningcost_chat_messages")
        .select("role, content")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true })
        .limit(12);
      if (prev) history = prev;
      if (history.length >= maxMsgs * 2) {
        return json({
          session_id: sessionId,
          reply: "You have reached the message limit for this session. Try our full Office Cleaning Cost Calculator or refresh to start a new thread.",
          suggested_options: ["Open Cost Calculator", "Compare Janitorial Quotes"],
          recommended_articles: [],
          recommended_products: [],
        });
      }
      await supabase.from("officecleaningcost_chat_messages").insert({
        session_id: sessionId,
        role: "user",
        content: userMessage,
        model,
      });
    }

    // Retrieve top matching articles
    const terms = userMessage
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2)
      .slice(0, 5);

    let matchedArticles: Array<{
      slug: string;
      title: string;
      category: string;
      category_name: string;
      url: string;
      excerpt: string;
    }> = [];

    if (terms.length > 0) {
      const { data: artRows } = await supabase
        .from("officecleaningcost_articles")
        .select("slug, title, category, category_name, excerpt, search_text")
        .eq("active", true)
        .limit(400);

      if (artRows && artRows.length > 0) {
        const scored = artRows.map((a) => {
          const hay = `${a.title} ${a.search_text || ""} ${a.category_name}`.toLowerCase();
          let sc = 0;
          for (const t of terms) if (hay.includes(t)) sc += 1;
          return { a, sc };
        });
        scored.sort((x, y) => y.sc - x.sc);
        matchedArticles = scored
          .filter((s) => s.sc > 0)
          .slice(0, 6)
          .map(({ a }) => ({
            slug: a.slug,
            title: a.title,
            category: a.category,
            category_name: a.category_name,
            url: `${SITE}/${a.category}/${a.slug}/`,
            excerpt: a.excerpt || "",
          }));
      }
    }

    const productContext = Object.values(AMAZON_PICKS)
      .map((p) => `- ${p.id}: ${p.title} (${p.subtitle})`)
      .join("\n");
    const articleContext = matchedArticles.length
      ? matchedArticles.map((a) => `- ${a.slug} (${a.category}): ${a.title}`).join("\n")
      : "- office-cleaning-cost-calculator: Interactive Office Cleaning Cost Calculator";

    const messagesPayload = [
      {
        role: "system",
        content: `${SYSTEM_PROMPT}${customInstr ? `\n\nExtra admin instructions:\n${customInstr}` : ""}\n\nAvailable Amazon US product IDs:\n${productContext}\n\nRelevant site articles:\n${articleContext}`,
      },
      ...history.map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      })),
      { role: "user", content: userMessage },
    ];

    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature,
        max_tokens: 520,
        response_format: { type: "json_object" },
        messages: messagesPayload,
      }),
    });

    const aiJson = await aiRes.json();
    const rawContent = aiJson?.choices?.[0]?.message?.content || "{}";
    let parsed: {
      reply?: string;
      suggested_options?: string[];
      product_ids?: string[];
      article_slugs?: string[];
    } = {};
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      parsed = { reply: rawContent };
    }

    const reply =
      String(parsed.reply || "").trim() ||
      "For a quick benchmark, offices under 2,500 sq ft typically run $0.12–$0.20/sq ft per visit ($90 minimum), while 2,500–10,000 sq ft suites average $0.09–$0.15/sq ft plus $15–$30 per restroom. Share your sq ft, restroom count, and frequency for an exact estimate.";
    const suggestedOptions = Array.isArray(parsed.suggested_options)
      ? parsed.suggested_options.slice(0, 3).map(String)
      : ["5,000 sq ft 3x/week quote", "Compare 3 cleaning bids", "Best commercial backpack vacuum"];

    const chosenProds = (Array.isArray(parsed.product_ids) ? parsed.product_ids : [])
      .map((id) => AMAZON_PICKS[id])
      .filter(Boolean)
      .slice(0, 2);

    const chosenSlugs = new Set(Array.isArray(parsed.article_slugs) ? parsed.article_slugs : []);
    const chosenArticles = matchedArticles
      .filter((a) => chosenSlugs.has(a.slug))
      .slice(0, 3);
    if (chosenArticles.length === 0 && matchedArticles.length > 0) {
      chosenArticles.push(...matchedArticles.slice(0, 2));
    }

    const pt = Number(aiJson?.usage?.prompt_tokens || 0);
    const ct = Number(aiJson?.usage?.completion_tokens || 0);
    const tt = Number(aiJson?.usage?.total_tokens || pt + ct);
    const costUsd = estimateCostUsd(model, pt, ct);

    if (sessionId) {
      await supabase.from("officecleaningcost_chat_messages").insert({
        session_id: sessionId,
        role: "assistant",
        content: reply,
        recommended_articles: chosenArticles,
        suggested_options: suggestedOptions,
        model,
        prompt_tokens: pt,
        completion_tokens: ct,
        total_tokens: tt,
        cost_usd: costUsd,
      });

      const { data: sess } = await supabase
        .from("officecleaningcost_chat_sessions")
        .select("messages_count, prompt_tokens, completion_tokens, total_tokens, estimated_cost_usd")
        .eq("id", sessionId)
        .maybeSingle();

      await supabase
        .from("officecleaningcost_chat_sessions")
        .update({
          last_user_message: userMessage,
          messages_count: (sess?.messages_count || 1) + 1,
          recommended_articles: chosenArticles,
          prompt_tokens: (sess?.prompt_tokens || 0) + pt,
          completion_tokens: (sess?.completion_tokens || 0) + ct,
          total_tokens: (sess?.total_tokens || 0) + tt,
          estimated_cost_usd: Number(sess?.estimated_cost_usd || 0) + costUsd,
          model_used: model,
          last_message_at: new Date().toISOString(),
        })
        .eq("id", sessionId);
    }

    await supabase.from("token_usage").insert({
      source: "officecleaningcost.com",
      content_type: "ai_chat",
      model,
      prompt_tokens: pt,
      completion_tokens: ct,
      total_tokens: tt,
      images_generated: 0,
      estimated_cost_usd: costUsd,
      slug: sessionId || "anon",
    });

    return json({
      session_id: sessionId,
      model,
      reply,
      suggested_options: suggestedOptions,
      recommended_articles: chosenArticles,
      recommended_products: chosenProds,
    });
  } catch (err) {
    console.error("officecleaningcost-chat error:", err);
    return json({ error: String((err as Error).message || err) }, 500);
  }
});
