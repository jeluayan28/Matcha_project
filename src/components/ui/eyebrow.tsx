export function Eyebrow({
  children,
  tone = "light",
  className = "",
}: {
  children: React.ReactNode;
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <p
      className={`flex items-center gap-3 text-xs font-medium tracking-[0.26em] uppercase ${
        tone === "dark" ? "text-cream/80" : "text-matcha"
      } ${className}`}
    >
      <span aria-hidden className="h-px w-8 bg-gold" />
      {children}
    </p>
  );
}
