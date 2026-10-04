import type { Metadata } from "next";
import Link from "next/link";
import { Leaf, Search } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ProductCard } from "@/components/shop/product-card";
import { SortSelect } from "@/components/shop/sort-select";
import { parseShopParams, type ShopParams } from "@/lib/shop/params";
import { getCategories, getProducts } from "@/lib/shop/products";

export const metadata: Metadata = {
  title: "Shop matcha",
  description: "Browse our small-batch ceremonial and culinary matcha.",
};

function shopHref(params: Partial<ShopParams>) {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.category) sp.set("category", params.category);
  if (params.sort && params.sort !== "featured") sp.set("sort", params.sort);
  if (params.featured) sp.set("featured", "1");
  const qs = sp.toString();
  return qs ? `/shop?${qs}` : "/shop";
}

const chip = (active: boolean) =>
  `inline-flex h-11 items-center rounded-full border px-5 text-sm transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none ${
    active
      ? "border-forest bg-forest text-cream"
      : "border-forest/20 text-forest hover:border-forest/40 hover:bg-sage"
  }`;

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = parseShopParams(await searchParams);
  const { data: categories } = await getCategories();

  const activeCategory = categories?.find((c) => c.slug === params.category);
  // An unknown category slug matches nothing rather than silently showing everything.
  const unknownCategory = Boolean(params.category) && !activeCategory;

  const { data: products, error } = unknownCategory
    ? { data: [], error: null }
    : await getProducts(params, activeCategory?.id ?? null);

  const filtered = Boolean(params.q || params.category || params.featured);
  const returnTo = shopHref(params);

  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-cream">
        <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 md:py-20">
          <Eyebrow>The shop</Eyebrow>
          <h1 className="mt-4 text-5xl font-medium text-forest sm:text-6xl lg:text-7xl">
            {activeCategory ? activeCategory.name : "Shop matcha"}
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-forest/70">
            Small-batch blends for your whisk, your latte and your baking.
          </p>

          <form
            action="/shop"
            role="search"
            className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            {params.category && (
              <input type="hidden" name="category" value={params.category} />
            )}
            {params.featured && <input type="hidden" name="featured" value="1" />}
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-forest/50"
                strokeWidth={1.6}
                aria-hidden
              />
              <label htmlFor="shop-search" className="sr-only">
                Search products
              </label>
              <input
                id="shop-search"
                name="q"
                type="search"
                defaultValue={params.q}
                placeholder="Search matcha"
                autoComplete="off"
                className="h-11 w-full rounded-full border border-forest/20 bg-card pr-4 pl-12 text-forest outline-none placeholder:text-forest/40 focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </div>
            <label htmlFor="shop-sort" className="sr-only">
              Sort by
            </label>
            <SortSelect value={params.sort} />
            <noscript>
              <button type="submit" className={chip(true)}>
                Apply
              </button>
            </noscript>
          </form>

          <nav aria-label="Categories" className="mt-6 flex flex-wrap gap-2">
            <Link
              href={shopHref({ ...params, category: "" })}
              aria-current={!params.category ? "page" : undefined}
              className={chip(!params.category)}
            >
              All
            </Link>
            {categories?.map((c) => (
              <Link
                key={c.id}
                href={shopHref({ ...params, category: c.slug })}
                aria-current={params.category === c.slug ? "page" : undefined}
                className={chip(params.category === c.slug)}
              >
                {c.name}
              </Link>
            ))}
            <Link
              href={shopHref({ ...params, featured: !params.featured })}
              className={`${chip(params.featured)} sm:ml-auto`}
            >
              Featured only
            </Link>
          </nav>

          <p className="mt-8 text-sm text-forest/60" aria-live="polite">
            {error
              ? ""
              : `${products?.length ?? 0} ${products?.length === 1 ? "product" : "products"}${
                  params.q ? ` for “${params.q}”` : ""
                }`}
          </p>

          {error ? (
            <Notice
              title="We couldn't load the shop"
              text="Refresh the page in a moment. If it keeps happening, check back soon."
            />
          ) : !products || products.length === 0 ? (
            filtered ? (
              <Notice
                title="Nothing matches that"
                text="Try a different search or clear your filters."
                action={{ href: "/shop", label: "Clear filters" }}
              />
            ) : (
              <Notice
                title="Our first harvest is being packed"
                text="Products will appear here as soon as they're ready."
              />
            )
          ) : (
            <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-14 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} returnTo={returnTo} />
              ))}
            </ul>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function Notice({
  title,
  text,
  action,
}: {
  title: string;
  text: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="mt-6 flex flex-col items-start gap-3 rounded-3xl border border-dashed border-forest/25 bg-card px-6 py-10 sm:px-10">
      <Leaf className="size-7 text-matcha" strokeWidth={1.5} aria-hidden />
      <h2 className="text-2xl font-medium text-forest">{title}</h2>
      <p className="max-w-md text-forest/70">{text}</p>
      {action && (
        <Link
          href={action.href}
          className="mt-2 inline-flex h-11 items-center rounded-full bg-matcha px-7 text-sm font-medium text-white transition-colors hover:bg-forest"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
