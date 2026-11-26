/* eslint-disable @next/next/no-img-element */
export default function ResponsiveImg({
  src,
  src640,
  alt,
  width = 1200,
  height = 800,
  sizes = "(max-width: 768px) 100vw, 600px",
  className = "",
  priority = false,
}: {
  src: string;
  src640?: string;
  alt: string;
  width?: number;
  height?: number;
  sizes?: string;
  className?: string;
  priority?: boolean;
}) {
  const srcSet = src640 && src640 !== src ? `${src640} 640w, ${src} 1200w` : undefined;
  return (
    <img
      src={src}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding={priority ? "sync" : "async"}
      className={className}
    />
  );
}
