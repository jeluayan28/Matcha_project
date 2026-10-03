import Link from "next/link";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export default function ProductNotFound() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-cream">
        <div className="mx-auto w-full max-w-6xl px-5 py-24 sm:px-8">
          <h1 className="text-5xl font-medium text-forest">
            We couldn&apos;t find that matcha
          </h1>
          <p className="mt-4 max-w-md text-forest/70">
            It may have sold out for good, or the link may be mistyped.
          </p>
          <Link
            href="/shop"
            className="mt-8 inline-flex h-11 items-center rounded-full bg-matcha px-7 text-sm font-medium text-forest hover:bg-matcha/85"
          >
            Browse the shop
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
