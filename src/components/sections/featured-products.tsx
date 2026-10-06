import Image from "next/image";
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
    .limit(3);
}

export async function FeaturedProducts() {
  const { data: products, error } = await getFeaturedProducts();

  return (
    <section id="featured" className="scroll-mt-16 bg-cream py-20 md:py-28">
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 sm:px-8 lg:grid-cols-[0.8fr_2.2fr] lg:gap-14">
        <Reveal className="max-w-sm self-center">
          <Eyebrow>Our collection</Eyebrow>
          <h2 className="mt-4 text-4xl leading-[1.05] font-medium text-forest sm:text-5xl">
            Find Your Perfect Matcha
          </h2>
          <p className="mt-4 leading-relaxed text-forest/70">
            Small-batch blends for your whisk, your latte and your baking.
          </p>
          <Link
            href="/shop"
            className="mt-8 inline-flex h-12 items-center gap-2 rounded-full border border-forest/30 px-8 text-sm font-medium tracking-wide text-forest transition-colors hover:border-forest hover:bg-forest hover:text-cream"
          >
            View All Products
            <span aria-hidden>→</span>
          </Link>
        </Reveal>

        <div>
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
            image={{ src: "/matcha%20tin.png", alt: "Matchelli premium matcha tin with a bamboo whisk and scoop" }}
          />
        ) : (
          <Reveal>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} returnTo="/" />
              ))}
            </ul>
          </Reveal>
        )}

        </div>
      </div>
    </section>
  );
}

function Notice({
  title,
  text,
  action,
  image,
}: {
  title: string;
  text: string;
  action?: { href: string; label: string };
  image?: { src: string; alt: string };
}) {
  return (
    <div
      className={`mt-12 overflow-hidden rounded-3xl border border-dashed border-forest/25 bg-card ${
        image ? "grid sm:grid-cols-[0.9fr_1.1fr] sm:items-stretch" : ""
      }`}
    >
      {image && (
        <div className="relative aspect-square sm:aspect-auto sm:min-h-72">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(min-width: 1024px) 28vw, (min-width: 640px) 40vw, 100vw"
            className="object-cover"
          />
        </div>
      )}
      <div className="flex flex-col items-start justify-center gap-3 px-6 py-10 sm:px-10">
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
    </div>
  );
}
