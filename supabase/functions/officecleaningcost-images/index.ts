import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-occ-token",
};

const STYLE =
  "Photorealistic editorial commercial office interior and facility maintenance photography in the United States, sharp optical lens depth, natural lighting, authentic textures and proportions. Strictly no text, no words, no letters, no numbers, no signage text, no brand logos, no watermarks, no deformed hands.";

function b64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) throw new Error("OPENAI_API_KEY not set");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const token = req.headers.get("x-occ-token") || "";
    if (token !== "occ-img-2026") {
      return json({ ok: false, error: "unauthorized" }, 401);
    }

    const { slug, prompt, size } = await req.json();
    if (!slug || !prompt || !/^[a-z0-9-]+$/.test(slug)) {
      throw new Error("slug (a-z0-9-) and prompt are required");
    }
    const fullPrompt = `${prompt}. ${STYLE}`;
    const imgSize = size === "square" ? "1024x1024" : "1536x1024";

    let b64Out = "";
    let bytes: Uint8Array | null = null;
    let modelUsed = "";
    const errors: string[] = [];

    const callOpenAI = async (model: string) => {
      const r = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          prompt: fullPrompt,
          size: imgSize,
          quality: "medium",
          output_format: "webp",
          output_compression: 80,
          n: 1,
        }),
      });
      const j = await r.json().catch(() => ({}));
      return { status: r.status, j };
    };

    for (const attempt of ["gpt-image-1", "retry-429", "gpt-image-1-mini"]) {
      const model = attempt === "gpt-image-1-mini" ? "gpt-image-1-mini" : "gpt-image-1";
      const { status, j } = await callOpenAI(model);
      const b64 = j?.data?.[0]?.b64_json;
      if (b64) {
        b64Out = b64;
        bytes = b64ToBytes(b64);
        modelUsed = model;
        break;
      }
      const errMsg = String(j?.error?.message || status);
      const errCode = String(j?.error?.code || "");
      errors.push(`${model}: ${errMsg}`);
      if (
        errCode === "insufficient_quota" ||
        errCode === "billing_hard_limit_reached" ||
        /quota|billing/i.test(errMsg)
      ) {
        throw new Error(`OPENAI_BILLING_BLOCK: ${errMsg}`);
      }
      if (attempt === "gpt-image-1" && status === 429) {
        await sleep(2500);
        continue;
      }
      if (attempt === "gpt-image-1") {
        continue;
      }
    }

    if (!bytes) throw new Error(errors.join(" | "));

    const objectPath = `officecleaningcost/${slug}.webp`;
    let publicUrl: string | null = null;
    for (let tryUp = 0; tryUp < 2; tryUp++) {
      const { error: upErr } = await supabase.storage
        .from("content-images")
        .upload(objectPath, bytes, {
          contentType: "image/webp",
          upsert: true,
        });
      if (!upErr) {
        const { data } = supabase.storage
          .from("content-images")
          .getPublicUrl(objectPath);
        publicUrl = data.publicUrl;
        break;
      }
      if (tryUp === 0) await sleep(800);
    }

    await supabase.from("token_usage").insert({
      source: "officecleaningcost.com",
      content_type: "ai_image",
      model: modelUsed,
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
      images_generated: 1,
      estimated_cost_usd: modelUsed === "gpt-image-1" ? 0.063 : 0.015,
      slug,
    });

    return json({ ok: true, url: publicUrl, b64: publicUrl ? undefined : b64Out, model: modelUsed });
  } catch (e) {
    return json({ ok: false, error: String((e as Error).message || e) }, 500);
  }
});
