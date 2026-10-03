import Link from "next/link";
import { Leaf } from "lucide-react";
import { ProductCard } from "@/components/shop/product-card";
import { createClient } from "@/lib/supabase/server";

async function getFeaturedProducts() {
  const supabase = await createClient();
  return supabase
    .from("products")
    .select(
      "id, name, slug, description, price, image_url, stock, is_featured, categories(name, slug)"
    )
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
              <ProductCard key={product.id} product={product} returnTo="/" />
            ))}
          </ul>
        )}

        <Link
          href="/shop"
          className="mt-12 inline-flex h-11 items-center rounded-full border border-forest/25 px-7 text-sm font-medium text-forest transition-colors hover:bg-sage/30"
        >
          Shop all matcha
        </Link>
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
