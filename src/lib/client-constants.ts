export const CHAT_ENDPOINT =
  "https://ehwjvuhbimqakvzqbvvg.supabase.co/functions/v1/officecleaningcost-chat";

export const SITE_URL = "https://officecleaningcost.com";

export function trackClick(
  source: string,
  extra?: {
    article_slug?: string;
    article_title?: string;
    category?: string;
    target_url?: string;
  }
) {
  if (typeof window === "undefined") return;
  let visitorId = "";
  let sessionId: string | null = null;
  try {
    visitorId = window.localStorage.getItem("occ_visitor_id") || "";
    sessionId = window.localStorage.getItem("occ_chat_session_id");
  } catch {
    // ignore
  }
  const payload = JSON.stringify({
    action: "track_click",
    session_id: sessionId,
    visitor_id: visitorId || source,
    article_slug: extra?.article_slug || source,
    article_title: extra?.article_title || source,
    category: extra?.category || "amazon",
    target_url: extra?.target_url || "",
    page_url: window.location.href,
  });
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        CHAT_ENDPOINT,
        new Blob([payload], { type: "application/json" })
      );
      return;
    }
  } catch {
    // fallback
  }
  fetch(CHAT_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => {});
}
