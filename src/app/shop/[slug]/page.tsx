import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Leaf } from "lucide-react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { AddToCartForm } from "@/components/shop/add-to-cart-form";
import { ProductCard } from "@/components/shop/product-card";
import { formatPrice, isAllowedImage, shortDescription } from "@/lib/shop/format";
import { getProductBySlug, getRelatedProducts } from "@/lib/shop/products";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { data: product } = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: shortDescription(product.description, 160) ?? undefined,
  };
}

function availability(stock: number) {
  if (stock < 1) return { label: "Sold out", tone: "text-forest/60" };
  if (stock <= 5) return { label: `Only ${stock} left`, tone: "text-destructive" };
  return { label: `In stock · ${stock} available`, tone: "text-forest" };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const { data: product, error } = await getProductBySlug(slug);
  if (error) throw new Error("Failed to load product");
  if (!product) notFound();

  const { data: related } = await getRelatedProducts(product.id, product.category_id);
  const stock = availability(product.stock);
  const path = `/shop/${product.slug}`;

  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-cream">
        <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 md:py-14">
          <Link
            href="/shop"
            className="-ml-2 inline-flex h-11 items-center gap-1 px-2 text-sm text-forest/70 hover:text-forest"
          >
            <ChevronLeft className="size-4" aria-hidden />
            Back to shop
          </Link>

          <div className="mt-2 grid gap-8 md:mt-6 md:grid-cols-2 md:gap-14">
            <div className="relative aspect-square overflow-hidden rounded-3xl bg-sage">
              {isAllowedImage(product.image_url) ? (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  priority
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-forest/30">
                  <Leaf className="size-20" strokeWidth={1} aria-hidden />
                </div>
              )}
            </div>

            <div className="md:py-4">
              {product.categories && (
                <Link
                  href={`/shop?category=${product.categories.slug}`}
                  className="inline-block py-2 text-sm text-forest/60 hover:text-forest"
                >
                  {product.categories.name}
                </Link>
              )}
              <h1 className="mt-2 text-4xl leading-tight font-medium text-forest sm:text-5xl lg:text-6xl">
                {product.name}
              </h1>
              <p className="mt-3 text-2xl text-forest sm:mt-4 sm:text-3xl">{formatPrice(product.price)}</p>
              <p className={`mt-3 text-sm font-medium ${stock.tone}`}>{stock.label}</p>

              {product.description && (
                <p className="mt-6 text-lg leading-relaxed whitespace-pre-line text-forest/75">
                  {product.description}
                </p>
              )}

              <AddToCartForm productId={product.id} stock={product.stock} next={path} />

              <section
                aria-labelledby="product-info"
                className="mt-10 border-t border-border pt-6"
              >
                <h2 id="product-info" className="text-2xl font-medium text-forest">
                  Product information
                </h2>
                <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm sm:gap-x-8">
                  <dt className="text-forest/60">Category</dt>
                  <dd className="text-forest">{product.categories?.name ?? "—"}</dd>
                  <dt className="text-forest/60">Availability</dt>
                  <dd className="text-forest">{stock.label}</dd>
                  <dt className="text-forest/60">Price</dt>
                  <dd className="text-forest">{formatPrice(product.price)}</dd>
                  <dt className="text-forest/60">Added</dt>
                  <dd className="text-forest">
                    {new Date(product.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </dd>
                </dl>
              </section>
            </div>
          </div>

          {related && related.length > 0 && (
            <section aria-labelledby="related" className="mt-16 sm:mt-20">
              <h2 id="related" className="text-3xl font-medium text-forest">
                You may also like
              </h2>
              <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-14 lg:grid-cols-4">
                {related.map((p) => (
                  <ProductCard key={p.id} product={p} returnTo={path} />
                ))}
              </ul>
            </section>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
