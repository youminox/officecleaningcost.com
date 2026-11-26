"use client";

import { useState, useEffect, useRef, useCallback, type FormEvent } from "react";
import { CHAT_ENDPOINT, trackClick } from "@/lib/client-constants";

interface RecommendedArticle {
  slug: string;
  title: string;
  category: string;
  category_name?: string;
  url: string;
}

interface RecommendedProduct {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  urlUS: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  recommended_articles?: RecommendedArticle[];
  recommended_products?: RecommendedProduct[];
  suggested_options?: string[];
}

const DEFAULT_WELCOME =
  "Hi! 👋 I am the OfficeCleaningCost.com AI Estimator (fast mini model). Share your office square footage, restroom count, floor type, US city, and weekly schedule—I will calculate a realistic per-visit and monthly price range and recommend commercial supplies on Amazon.";

export default function OfficeCleaningChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);
  const [showTeaser, setShowTeaser] = useState(true);
  const [visitorId, setVisitorId] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [welcomeMessage, setWelcomeMessage] = useState(DEFAULT_WELCOME);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sendMessage = useCallback(
    async (text: string) => {
      const clean = text.trim();
      if (!clean || isLoading) return;
      const userMsg: ChatMessage = {
        id: "u_" + Date.now(),
        role: "user",
        content: clean,
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsLoading(true);

      try {
        const res = await fetch(CHAT_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "chat",
            session_id: sessionId,
            visitor_id: visitorId || "occ_anon",
            page_url:
              typeof window !== "undefined" ? window.location.href : "/",
            message: clean,
          }),
        });
        const data = await res.json();
        if (data?.session_id) {
          setSessionId(data.session_id);
          try {
            window.localStorage.setItem("occ_chat_session_id", data.session_id);
          } catch {
            // ignore
          }
        }
        const botMsg: ChatMessage = {
          id: "a_" + Date.now(),
          role: "assistant",
          content:
            data?.reply ||
            "Could not calculate right now. Please try again with your sq ft, restroom count, and frequency.",
          recommended_articles: data?.recommended_articles || [],
          recommended_products: data?.recommended_products || [],
          suggested_options: data?.suggested_options || [],
        };
        setMessages((prev) => [...prev, botMsg]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: "err_" + Date.now(),
            role: "assistant",
            content:
              "Temporary connection hiccup. Please ask again or use our Office Cleaning Cost Calculator.",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, sessionId, visitorId]
  );

  const sendRef = useRef(sendMessage);
  useEffect(() => {
    sendRef.current = sendMessage;
  }, [sendMessage]);

  useEffect(() => {
    let vid = "occ_anon";
    let savedSid: string | null = null;
    try {
      vid =
        window.localStorage.getItem("occ_visitor_id") ||
        "occ_" +
          Math.random().toString(36).slice(2, 10) +
          Date.now().toString(36);
      window.localStorage.setItem("occ_visitor_id", vid);
      savedSid = window.localStorage.getItem("occ_chat_session_id");
    } catch {
      // ignore
    }
    const timer = window.setTimeout(() => {
      setVisitorId(vid);
      if (savedSid) setSessionId(savedSid);
    }, 0);

    fetch(CHAT_ENDPOINT)
      .then((r) => r.json())
      .then((cfg) => {
        if (typeof cfg?.is_enabled === "boolean") setIsEnabled(cfg.is_enabled);
        if (cfg?.welcome_message) setWelcomeMessage(cfg.welcome_message);
      })
      .catch(() => {});

    const onOpenEvent = (e: Event) => {
      const custom = e as CustomEvent<{ prompt?: string }>;
      setIsOpen(true);
      setShowTeaser(false);
      if (custom?.detail?.prompt) {
        window.setTimeout(() => sendRef.current(custom.detail.prompt!), 120);
      }
    };
    window.addEventListener("occ-open-chat", onOpenEvent);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("occ-open-chat", onOpenEvent);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  if (!isEnabled) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2.5 sm:bottom-5 sm:right-5">
      {!isOpen && showTeaser && (
        <div className="hidden sm:flex items-center gap-2.5 rounded-2xl border border-[#d6e4ee] bg-white px-4 py-2.5 shadow-xl">
          <button
            type="button"
            onClick={() => {
              setIsOpen(true);
              setShowTeaser(false);
            }}
            className="text-left cursor-pointer"
          >
            <p className="text-xs font-extrabold text-[#0f172a]">
              Need a quick cleaning quote?
            </p>
            <p className="text-[11px] text-[#526575]">
              Ask AI Estimator (sq ft · city · bids)
            </p>
          </button>
          <button
            type="button"
            onClick={() => setShowTeaser(false)}
            className="text-xs text-slate-400 hover:text-slate-700 cursor-pointer"
            aria-label="Dismiss chat prompt"
          >
            ✕
          </button>
        </div>
      )}

      {isOpen && (
        <div
          role="dialog"
          aria-label="OfficeCleaningCost.com AI Estimator Chat"
          className="flex h-[520px] max-h-[82vh] w-[calc(100vw-2rem)] sm:w-[390px] flex-col overflow-hidden rounded-3xl border border-[#d6e4ee] bg-white shadow-[0_28px_70px_-20px_rgba(7,25,35,0.45)]"
        >
          <div className="flex items-center justify-between gap-2 bg-gradient-to-r from-[#071923] via-[#0d2838] to-[#0369a1] px-4 py-3 text-white">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-display font-extrabold text-[15px] leading-tight truncate text-white">
                  Office Cleaning AI
                </p>
                <span className="inline-flex items-center whitespace-nowrap shrink-0 leading-none text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-[#ecfccb] text-[#162903]">
                  Online
                </span>
              </div>
              <p className="text-[11px] text-sky-200 truncate">
                US Rates · Quote Audits · Amazon Gear
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/10 text-sm text-white hover:bg-white/20 cursor-pointer"
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 bg-[#f6fafd] p-4 text-[13.5px]">
            <div className="rounded-2xl rounded-tl-sm border border-[#d6e4ee] bg-white p-3.5 text-[#0f172a] shadow-2xs">
              <p className="leading-relaxed">{welcomeMessage}</p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {[
                  "5,000 sq ft 3x/week in Dallas",
                  "Audit a $1,400 cleaning quote",
                  "Best quiet daytime office vacuum",
                ].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => sendMessage(chip)}
                    className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[11px] font-semibold text-sky-900 hover:bg-sky-100 cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${
                  m.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 leading-relaxed whitespace-pre-wrap ${
                    m.role === "user"
                      ? "rounded-tr-sm bg-[#0284c7] text-white"
                      : "rounded-tl-sm border border-[#d6e4ee] bg-white text-[#0f172a]"
                  }`}
                >
                  {m.content}
                </div>

                {m.recommended_products &&
                  m.recommended_products.length > 0 && (
                    <div className="mt-2 w-full max-w-[92%] space-y-2">
                      {m.recommended_products.map((prod) => (
                        <a
                          key={prod.id}
                          href={prod.urlUS}
                          target="_blank"
                          rel="sponsored nofollow noopener noreferrer"
                          onClick={() =>
                            trackClick("chat-product", {
                              article_slug: prod.id,
                              article_title: prod.title,
                              category: "amazon",
                              target_url: prod.urlUS,
                            })
                          }
                          className="block rounded-xl border border-amber-300 bg-amber-50/70 p-2.5 hover:bg-amber-50 transition"
                        >
                          <p className="text-[10px] font-bold uppercase text-amber-800">
                            {prod.badge} · Amazon US
                          </p>
                          <p className="text-xs font-extrabold text-slate-900">
                            {prod.title}
                          </p>
                          <span className="mt-1 inline-block text-[11px] font-bold text-orange-700">
                            Check Price on Amazon →
                          </span>
                        </a>
                      ))}
                    </div>
                  )}

                {m.recommended_articles &&
                  m.recommended_articles.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5 max-w-[92%]">
                      {m.recommended_articles.map((art) => (
                        <a
                          key={art.slug}
                          href={art.url}
                          onClick={() =>
                            trackClick("chat-article", {
                              article_slug: art.slug,
                              article_title: art.title,
                              category: art.category,
                              target_url: art.url,
                            })
                          }
                          className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-900 hover:bg-emerald-100"
                        >
                          📄 {art.title}
                        </a>
                      ))}
                    </div>
                  )}

                {m.suggested_options && m.suggested_options.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5 max-w-[92%]">
                    {m.suggested_options.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => sendMessage(opt)}
                        className="rounded-full border border-[#d6e4ee] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#0369a1] hover:border-[#0284c7] cursor-pointer"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="inline-block rounded-2xl border border-[#d6e4ee] bg-white px-3.5 py-2 text-xs font-semibold text-[#526575]">
                Calculating estimate…
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 border-t border-[#d6e4ee] bg-white p-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask sq ft cost, city rates, or supplies..."
              className="flex-1 rounded-full border border-[#d6e4ee] bg-[#f6fafd] px-4 py-2 text-[13px] text-[#0f172a] placeholder:text-[#526575] focus:outline-none focus:border-[#0284c7]"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="rounded-full bg-[#0284c7] px-4 py-2 text-xs font-extrabold text-white disabled:opacity-50 hover:bg-[#0369a1] cursor-pointer"
            >
              Send
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => {
          setIsOpen((v) => !v);
          setShowTeaser(false);
        }}
        className="flex items-center gap-2.5 rounded-full bg-gradient-to-r from-[#071923] to-[#0284c7] px-4 py-3 text-sm font-extrabold text-white shadow-[0_18px_40px_-10px_rgba(2,132,199,0.7)] hover:brightness-110 transition cursor-pointer"
        aria-label={isOpen ? "Minimize AI Estimator Chat" : "Open AI Estimator Chat"}
      >
        <span className="h-2.5 w-2.5 rounded-full bg-[#bef264] animate-pulse" />
        <span>{isOpen ? "Close Chat" : "AI Cost Estimator"}</span>
      </button>
    </div>
  );
}
