import Image from "next/image";
import Link from "next/link";
import { Leaf } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

const priceFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

// next/image only serves hosts allowed in next.config.ts (Supabase Storage).
function isAllowedImage(url: string | null): url is string {
  if (!url || !supabaseHost) return false;
  try {
    const { hostname, pathname } = new URL(url);
    return (
      hostname === supabaseHost &&
      pathname.startsWith("/storage/v1/object/public/")
    );
  } catch {
    return false;
  }
}

async function getFeaturedProducts() {
  const supabase = await createClient();
  return supabase
    .from("products")
    .select("id, name, slug, description, price, image_url, stock, categories(name)")
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(4);
}

export async function FeaturedProducts() {
  const { data: products, error } = await getFeaturedProducts();

  return (
    <section id="featured" className="scroll-mt-16 bg-cream py-20 md:py-28">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="max-w-xl">
          <h2 className="text-4xl font-medium text-forest sm:text-5xl">
            Featured matcha
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-forest/70">
            Small-batch blends for your whisk, your latte and your baking.
          </p>
        </div>

        {error ? (
          <Notice
            title="We couldn't load the shop"
            text="Refresh the page in a moment. If it keeps happening, check back soon."
          />
        ) : !products || products.length === 0 ? (
          <Notice
            title="Our first harvest is being packed"
            text="Products will appear here as soon as they're ready."
            action={{ href: "#newsletter", label: "Get notified at launch" }}
          />
        ) : (
          <ul className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <li key={product.id} className="group">
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-sage/40">
                  {isAllowedImage(product.image_url) ? (
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-forest/30">
                      <Leaf className="size-12" strokeWidth={1.25} aria-hidden />
                    </div>
                  )}
                  {product.stock === 0 && (
                    <span className="absolute top-3 left-3 rounded-full bg-cream px-3 py-1 text-xs font-medium text-forest">
                      Sold out
                    </span>
                  )}
                </div>
                <div className="mt-4 flex items-baseline justify-between gap-4">
                  <h3 className="text-2xl leading-tight font-medium text-forest">
                    {product.name}
                  </h3>
                  <p className="shrink-0 text-base font-medium text-forest">
                    {priceFormat.format(product.price)}
                  </p>
                </div>
                {product.categories?.name && (
                  <p className="mt-1 text-sm text-forest/60">
                    {product.categories.name}
                  </p>
                )}
                {product.description && (
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-forest/70">
                    {product.description}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
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
    <div className="mt-12 flex flex-col items-start gap-3 rounded-3xl border border-dashed border-forest/25 bg-card px-6 py-10 sm:px-10">
      <Leaf className="size-7 text-matcha" strokeWidth={1.5} aria-hidden />
      <h3 className="text-2xl font-medium text-forest">{title}</h3>
      <p className="max-w-md text-forest/70">{text}</p>
      {action && (
        <Link
          href={action.href}
          className="mt-2 inline-flex h-11 items-center rounded-full bg-matcha px-7 text-sm font-medium text-forest transition-colors hover:bg-matcha/85"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
