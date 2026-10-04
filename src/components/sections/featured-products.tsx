import Link from "next/link";
import { Leaf } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Eyebrow } from "@/components/ui/eyebrow";
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
        <Reveal className="max-w-xl">
          <Eyebrow>The collection</Eyebrow>
          <h2 className="mt-4 text-4xl font-medium text-forest sm:text-5xl lg:text-6xl">
            Featured matcha
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-forest/70">
            Small-batch blends for your whisk, your latte and your baking.
          </p>
        </Reveal>

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
          <Reveal>
            <ul className="mt-14 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-14 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} returnTo="/" />
              ))}
            </ul>
          </Reveal>
        )}

        <Link
          href="/shop"
          className="mt-14 inline-flex h-12 items-center rounded-full border border-forest/30 px-8 text-sm font-medium tracking-wide text-forest transition-colors hover:border-forest hover:bg-forest hover:text-cream"
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
          className="mt-2 inline-flex h-11 items-center rounded-full bg-matcha px-7 text-sm font-medium text-white transition-colors hover:bg-forest"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
