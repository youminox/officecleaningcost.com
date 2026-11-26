import Link from "next/link";
import type { Article } from "@/lib/content";
import ResponsiveImg from "./ResponsiveImg";

export default function ArticleCard({ a }: { a: Article }) {
  return (
    <Link
      href={a.path}
      className="card group flex flex-col overflow-hidden"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-occsky">
        <ResponsiveImg
          src={a.imageUrl}
          src640={a.imageUrl640}
          alt={a.image.alt}
          width={640}
          height={427}
          sizes="(max-width: 768px) 100vw, 420px"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        {a.isTransactional && (
          <span className="absolute left-3 top-3 rounded-full bg-[#071923]/90 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#bef264]">
            Amazon Pick
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-occbluedeep">
            {a.pillar.replace(/-/g, " ")}
          </p>
          <h3 className="mt-1.5 font-display text-lg font-extrabold leading-snug text-occink group-hover:text-occblue transition">
            {a.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm text-[var(--muted)]">
            {a.excerpt}
          </p>
        </div>
        <div className="mt-4 flex items-center justify-between text-xs font-semibold text-occbluedeep">
          <span>{a.readingMinutes || 7} min read</span>
          <span>Read guide →</span>
        </div>
      </div>
    </Link>
  );
}
