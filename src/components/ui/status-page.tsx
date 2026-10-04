import { Leaf } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";

// Shared layout for error / not-found screens: calm, centred, one clear next step.
export function StatusPage({
  eyebrow,
  title,
  children,
  actions,
}: {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <main className="flex flex-1 items-center bg-cream">
      <div className="mx-auto w-full max-w-6xl px-5 py-24 sm:px-8 md:py-32">
        <Leaf className="size-8 text-matcha" strokeWidth={1.25} aria-hidden />
        <Eyebrow className="mt-6">{eyebrow}</Eyebrow>
        <h1 className="mt-4 max-w-2xl text-5xl leading-[1.05] font-medium text-forest sm:text-6xl">
          {title}
        </h1>
        {children && (
          <p className="mt-5 max-w-md text-lg leading-relaxed text-forest/70">{children}</p>
        )}
        {actions && <div className="mt-10 flex flex-wrap gap-3">{actions}</div>}
      </div>
    </main>
  );
}

export const statusButton =
  "inline-flex h-12 items-center justify-center rounded-md bg-matcha px-8 text-sm font-medium tracking-wide text-white transition-colors hover:bg-forest";
export const statusButtonOutline =
  "inline-flex h-12 items-center justify-center rounded-md border border-forest/30 px-8 text-sm font-medium tracking-wide text-forest transition-colors hover:border-forest hover:bg-forest hover:text-cream";
