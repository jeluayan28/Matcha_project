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
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-sage ring-1 ring-forest/5 group-focus-within:ring-2 group-focus-within:ring-gold">
          {isAllowedImage(product.image_url) ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className={`object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03] ${
                soldOut ? "opacity-70" : ""
              }`}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-matcha/30">
              <Leaf className="size-12" strokeWidth={1} aria-hidden />
            </div>
          )}
          {(product.is_featured || soldOut) && (
            <div className="absolute top-2 left-2 flex flex-wrap gap-1.5 sm:top-3 sm:left-3 sm:gap-2">
              {product.is_featured && (
                <span className="rounded-full bg-gold px-2.5 py-1 text-[0.68rem] font-medium tracking-[0.14em] text-forest uppercase">
                  Featured
                </span>
              )}
              {soldOut && (
                <span className="rounded-full bg-cream px-2.5 py-1 text-[0.68rem] font-medium tracking-[0.14em] text-forest uppercase">
                  Sold out
                </span>
              )}
            </div>
          )}
        </div>
        <div className="mt-4 flex flex-col gap-1 sm:mt-5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
          <h3 className="text-xl leading-tight sm:text-2xl font-medium text-forest transition-colors group-hover:text-matcha">
            {product.name}
          </h3>
          <p className="shrink-0 text-sm font-medium text-forest tabular-nums sm:text-base">
            {formatPrice(product.price)}
          </p>
        </div>
      </Link>
      {product.categories?.name && (
        <p className="mt-1.5 text-[0.68rem] tracking-[0.16em] sm:text-xs text-forest/55 uppercase">
          {product.categories.name}
        </p>
      )}
      {blurb && (
        <p className="mt-3 hidden text-sm leading-relaxed text-forest/70 sm:block">{blurb}</p>
      )}
      <div className="mt-auto">
        <AddToCartButton productId={product.id} soldOut={soldOut} next={returnTo} />
      </div>
    </li>
  );
}
