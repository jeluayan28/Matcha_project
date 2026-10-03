import Link from "next/link";

export const adminButton =
  "inline-flex h-10 items-center justify-center rounded-full bg-matcha px-6 text-sm font-medium text-forest transition-colors hover:bg-matcha/85 disabled:cursor-not-allowed disabled:opacity-60";
export const adminButtonOutline =
  "inline-flex h-10 items-center justify-center rounded-full border border-forest/25 px-6 text-sm font-medium text-forest transition-colors hover:bg-sage/30 disabled:opacity-60";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-4xl font-medium text-forest sm:text-5xl">{title}</h1>
        {subtitle && <p className="mt-2 text-forest/70">{subtitle}</p>}
      </div>
      {action && (
        <Link href={action.href} className={adminButton}>
          {action.label}
        </Link>
      )}
    </div>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-3xl border border-border bg-card p-5 sm:p-6 ${className}`}>
      {children}
    </div>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-dashed border-forest/25 bg-card px-6 py-10 text-forest/70">
      {children}
    </div>
  );
}

export function ErrorState({ children }: { children: React.ReactNode }) {
  return (
    <div role="alert" className="rounded-3xl border border-destructive/30 bg-destructive/10 px-6 py-6 text-sm text-destructive">
      {children}
    </div>
  );
}

export const th = "px-4 py-3 text-left text-xs font-medium tracking-wide text-forest/60 uppercase";
export const td = "px-4 py-3 align-middle";

export function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-3xl border border-border bg-card">
      <table className="w-full min-w-[40rem] text-sm text-forest">{children}</table>
    </div>
  );
}
