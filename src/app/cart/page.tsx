import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Leaf } from "lucide-react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { CartLineControls, ClearCartButton } from "@/components/shop/cart-controls";
import { getCartLines } from "@/lib/shop/cart";
import { formatPrice, isAllowedImage } from "@/lib/shop/format";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Your cart" };

export default async function CartPage() {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (!userId) redirect("/login?next=%2Fcart");

  const { error, lines, issues, totalQuantity, subtotal } = await getCartLines(
    supabase,
    userId
  );

  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-cream">
        <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 md:py-20">
          <h1 className="text-5xl font-medium text-forest sm:text-6xl">Your cart</h1>

          {error ? (
            <Notice
              title="We couldn't load your cart"
              text="Refresh the page in a moment. Your items are safe."
            />
          ) : lines.length === 0 ? (
            <Notice
              title="Your cart is empty"
              text="Find something to whisk — your matcha is waiting."
              action={{ href: "/shop", label: "Browse the shop" }}
            />
          ) : (
            <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_22rem]">
              <section aria-label="Cart items">
                <ul className="divide-y divide-border border-y border-border">
                  {lines.map((line) => (
                    <li key={line.id} className="flex gap-4 py-5 sm:gap-5 sm:py-6">
                      <div className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-sage sm:size-32">
                        {isAllowedImage(line.product?.image_url ?? null) ? (
                          <Image
                            src={line.product!.image_url!}
                            alt={line.product!.name}
                            fill
                            sizes="128px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-forest/30">
                            <Leaf className="size-8" strokeWidth={1.25} aria-hidden />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                          <h2 className="text-xl leading-tight font-medium text-forest sm:text-2xl">
                            {line.product ? (
                              <Link href={`/shop/${line.product.slug}`} className="break-words hover:underline">
                                {line.product.name}
                              </Link>
                            ) : (
                              "Unavailable product"
                            )}
                          </h2>
                          {line.product && (
                            <p
                              className={`shrink-0 font-medium ${line.ok ? "text-forest" : "text-forest/40 line-through"}`}
                            >
                              {formatPrice(line.product.price * line.quantity)}
                            </p>
                          )}
                        </div>
                        {line.product && (
                          <p className="mt-1 text-sm text-forest/60">
                            {formatPrice(line.product.price)} each
                          </p>
                        )}
                        <div className="mt-4">
                          <CartLineControls
                            itemId={line.id}
                            quantity={line.quantity}
                            stock={line.stock}
                            name={line.product?.name ?? "item"}
                          />
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex items-center justify-between">
                  <Link href="/shop" className="inline-flex h-11 items-center text-sm text-forest/70 underline underline-offset-4 hover:text-forest">
                    Continue shopping
                  </Link>
                  <ClearCartButton />
                </div>
              </section>

              <aside
                aria-labelledby="summary"
                className="h-fit rounded-3xl border border-border bg-card p-6 lg:sticky lg:top-24"
              >
                <h2 id="summary" className="text-2xl font-medium text-forest">
                  Order summary
                </h2>
                <dl className="mt-5 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-forest/70">Items</dt>
                    <dd className="text-forest">{totalQuantity}</dd>
                  </div>
                  <div className="flex justify-between border-t border-border pt-3 text-base">
                    <dt className="font-medium text-forest">Subtotal</dt>
                    <dd className="font-medium text-forest">{formatPrice(subtotal)}</dd>
                  </div>
                </dl>
                <p className="mt-3 text-xs text-forest/60">
                  Shipping and taxes are calculated at checkout.
                </p>
                {issues > 0 && (
                  <p role="alert" className="mt-4 text-sm text-destructive">
                    {issues === 1 ? "1 item needs" : `${issues} items need`} your attention
                    before checkout. Unavailable items aren&apos;t included above.
                  </p>
                )}
                {issues === 0 && !error ? (
                  <Link
                    href="/checkout"
                    className="mt-5 hidden h-12 lg:inline-flex w-full items-center justify-center rounded-full bg-matcha text-base font-medium text-white transition-colors hover:bg-forest"
                  >
                    Proceed to checkout
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-full bg-matcha text-base font-medium text-white opacity-50"
                  >
                    Proceed to checkout
                  </button>
                )}
              </aside>
            </div>
          )}

          {!error && lines.length > 0 && issues === 0 && (
            // Mobile: subtotal + checkout stay within thumb reach while scrolling the list.
            <div className="sticky bottom-0 z-20 -mx-5 mt-8 flex items-center gap-4 border-t border-border bg-cream/95 px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur sm:-mx-8 sm:px-8 lg:hidden">
              <div>
                <p className="text-xs text-forest/60">Subtotal</p>
                <p className="text-lg font-medium text-forest tabular-nums">{formatPrice(subtotal)}</p>
              </div>
              <Link
                href="/checkout"
                className="inline-flex h-12 flex-1 items-center justify-center rounded-full bg-matcha text-base font-medium text-white transition-colors hover:bg-forest"
              >
                Checkout
              </Link>
            </div>
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
    <div className="mt-10 flex flex-col items-start gap-3 rounded-3xl border border-dashed border-forest/25 bg-card px-6 py-10 sm:px-10">
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
