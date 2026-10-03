import Image from "next/image";
import Link from "next/link";
import { Leaf } from "lucide-react";
import { formatPrice, isAllowedImage, shortDescription } from "@/lib/shop/format";
import type { ProductListItem } from "@/lib/shop/products";
import { AddToCartButton } from "./add-to-cart-form";

export function ProductCard({
  product,
  returnTo,
}: {
  product: ProductListItem;
  returnTo: string;
}) {
  const href = `/shop/${product.slug}`;
  const soldOut = product.stock < 1;
  const blurb = shortDescription(product.description);

  return (
    <li className="group flex flex-col">
      <Link href={href} className="block focus-visible:outline-none">
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-sage/40 group-focus-within:ring-3 group-focus-within:ring-ring/50">
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
          <div className="absolute top-3 left-3 flex gap-2">
            {product.is_featured && (
              <span className="rounded-full bg-matcha px-3 py-1 text-xs font-medium text-forest">
                Featured
              </span>
            )}
            {soldOut && (
              <span className="rounded-full bg-cream px-3 py-1 text-xs font-medium text-forest">
                Sold out
              </span>
            )}
          </div>
        </div>
        <div className="mt-4 flex items-baseline justify-between gap-4">
          <h3 className="text-2xl leading-tight font-medium text-forest">
            {product.name}
          </h3>
          <p className="shrink-0 text-base font-medium text-forest">
            {formatPrice(product.price)}
          </p>
        </div>
      </Link>
      {product.categories?.name && (
        <p className="mt-1 text-sm text-forest/60">{product.categories.name}</p>
      )}
      {blurb && (
        <p className="mt-2 text-sm leading-relaxed text-forest/70">{blurb}</p>
      )}
      <div className="mt-auto">
        <AddToCartButton productId={product.id} soldOut={soldOut} next={returnTo} />
      </div>
    </li>
  );
}
