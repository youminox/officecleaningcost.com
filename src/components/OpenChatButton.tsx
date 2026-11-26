"use client";

export default function OpenChatButton({
  prompt,
  className = "btn btn-buy",
  children,
}: {
  prompt?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        window.dispatchEvent(
          new CustomEvent("occ-open-chat", { detail: { prompt } })
        );
      }}
      className={className}
    >
      {children}
    </button>
  );
}
