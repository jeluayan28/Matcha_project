import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronDown, Leaf } from "lucide-react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { CheckoutForm } from "@/components/shop/checkout-form";
import { getCartLines } from "@/lib/shop/cart";
import { formatPrice, isAllowedImage } from "@/lib/shop/format";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  const email = claims?.claims?.email;
  if (!userId || typeof email !== "string") redirect("/login?next=%2Fcheckout");

  const [cart, { data: profile }] = await Promise.all([
    getCartLines(supabase, userId),
    supabase.from("profiles").select("full_name, phone").eq("id", userId).maybeSingle(),
  ]);

  if (!cart.error && cart.lines.length === 0) redirect("/cart");

  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-cream">
        <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 md:py-20">
          <h1 className="text-5xl font-medium text-forest sm:text-6xl">Checkout</h1>

          {cart.error ? (
            <Blocker
              title="We couldn't load your order"
              text="Refresh the page in a moment. Your cart is safe."
            />
          ) : cart.issues > 0 ? (
            <Blocker
              title="Some items need your attention"
              text="One or more items in your cart are unavailable or low on stock. Update your cart, then come back."
              action={{ href: "/cart", label: "Review your cart" }}
            />
          ) : (
            <div className="mt-8 grid gap-8 lg:mt-10 lg:grid-cols-[1fr_24rem] lg:gap-12">
              {/* Mobile: collapsed summary above the form, so the total is visible while filling it in. */}
              <details className="group rounded-3xl border border-border bg-card lg:hidden">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-3 [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center gap-2 text-sm font-medium text-forest">
                    Order summary
                    <ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden />
                  </span>
                  <span className="font-medium text-forest tabular-nums">{formatPrice(cart.subtotal)}</span>
                </summary>
                <div className="border-t border-border px-5 pb-5">
                  <SummaryBody cart={cart} />
                </div>
              </details>

              <CheckoutForm
                email={email}
                defaults={{
                  fullName: profile?.full_name ?? "",
                  phone: profile?.phone ?? "",
                }}
              />

              <aside
                aria-labelledby="summary"
                className="hidden h-fit rounded-3xl border border-border bg-card p-6 lg:sticky lg:top-24 lg:block"
              >
                <h2 id="summary" className="text-2xl font-medium text-forest">
                  Order summary
                </h2>
                <SummaryBody cart={cart} />
              </aside>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

type Cart = Awaited<ReturnType<typeof getCartLines>>;

// Line items + totals, shared by the mobile (collapsible) and desktop (sticky card) summaries.
function SummaryBody({ cart }: { cart: Cart }) {
  return (
    <>
      <ul className="mt-5 divide-y divide-border">
        {cart.lines.map((line) => (
          <li key={line.id} className="flex gap-4 py-4">
            <div className="relative size-16 shrink-0 overflow-hidden rounded-2xl bg-sage">
              {isAllowedImage(line.product?.image_url ?? null) ? (
                <Image src={line.product!.image_url!} alt="" fill sizes="64px" className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-forest/30">
                  <Leaf className="size-6" strokeWidth={1.25} aria-hidden />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium break-words text-forest">{line.product?.name}</p>
              <p className="text-sm text-forest/60">Qty {line.quantity}</p>
            </div>
            <p className="text-sm font-medium text-forest tabular-nums">
              {formatPrice((line.product?.price ?? 0) * line.quantity)}
            </p>
          </li>
        ))}
      </ul>
      <dl className="mt-2 space-y-3 border-t border-border pt-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-forest/70">Items</dt>
          <dd className="text-forest">{cart.totalQuantity}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-forest/70">Subtotal</dt>
          <dd className="text-forest">{formatPrice(cart.subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-forest/70">Shipping</dt>
          <dd className="text-forest">Free</dd>
        </div>
        <div className="flex justify-between border-t border-border pt-3 text-base">
          <dt className="font-medium text-forest">Total</dt>
          <dd className="font-medium text-forest">{formatPrice(cart.subtotal)}</dd>
        </div>
      </dl>
      <Link
        href="/cart"
        className="mt-2 inline-flex h-11 items-center text-sm text-forest/70 underline underline-offset-4 hover:text-forest"
      >
        Edit cart
      </Link>
    </>
  );
}

function Blocker({
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
          className="mt-2 inline-flex h-11 items-center rounded-full bg-matcha px-7 text-sm font-medium text-white hover:bg-forest"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
