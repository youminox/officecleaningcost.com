import type { CSSProperties } from "react";

export default function SplitHeading({
  as = "h2",
  text,
  accent,
  accentClass = "text-occblue",
  className = "section-title",
}: {
  as?: "h1" | "h2" | "h3";
  text: string;
  accent?: string;
  accentClass?: string;
  className?: string;
}) {
  const Tag = as;
  const words = text.split(" ");
  const accentWords = accent ? accent.split(" ") : [];
  return (
    <Tag className={`split ${className}`}>
      {words.map((w, i) => (
        <span key={i} style={{ "--i": i } as CSSProperties}>
          {w}
          {i < words.length - 1 || accentWords.length > 0 ? "\u00A0" : ""}
        </span>
      ))}
      {accentWords.map((w, j) => (
        <span
          key={`a-${j}`}
          className={accentClass}
          style={{ "--i": words.length + j } as CSSProperties}
        >
          {w}
          {j < accentWords.length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </Tag>
  );
}
