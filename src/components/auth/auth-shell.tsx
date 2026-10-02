import Link from "next/link";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-cream px-5 py-14">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-10 block text-center font-heading text-3xl font-semibold tracking-[0.04em] text-forest"
        >
          mori
        </Link>
        <div className="rounded-3xl border border-border bg-card px-6 py-9 shadow-sm shadow-forest/5 sm:px-10">
          <h1 className="text-center text-4xl font-medium text-forest">
            {title}
          </h1>
          <p className="mt-2 mb-8 text-center text-sm text-muted-foreground">
            {subtitle}
          </p>
          {children}
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {footer}
        </p>
      </div>
    </main>
  );
}
