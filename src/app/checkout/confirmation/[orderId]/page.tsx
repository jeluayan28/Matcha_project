import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CircleCheck } from "lucide-react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { formatPrice } from "@/lib/shop/format";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Order confirmed" };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Address = {
  full_name?: string;
  email?: string;
  line1?: string;
  line2?: string | null;
  city?: string;
  state?: string | null;
  postal_code?: string;
  country?: string;
};

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  if (!UUID_RE.test(orderId)) notFound();

  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (!userId) redirect(`/login?next=${encodeURIComponent(`/checkout/confirmation/${orderId}`)}`);

  // RLS only returns the order if it belongs to the signed-in user.
  const { data: order } = await supabase
    .from("orders")
    .select(
      "id, total_amount, status, shipping_address, created_at, order_items(id, quantity, price, products(name))"
    )
    .eq("id", orderId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!order) notFound();

  const address = (order.shipping_address ?? {}) as Address;
  const shortId = order.id.slice(0, 8).toUpperCase();

  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-cream">
        <div className="mx-auto w-full max-w-3xl px-5 py-14 sm:px-8 md:py-20">
          <CircleCheck className="size-10 text-matcha" strokeWidth={1.5} aria-hidden />
          <h1 className="mt-4 text-5xl font-medium text-forest sm:text-6xl">
            Thank you for your order
          </h1>
          <p className="mt-4 text-lg text-forest/70">
            Order <span className="font-medium text-forest">#{shortId}</span> is
            confirmed. We&apos;ll send updates to {address.email}.
          </p>
          <p className="mt-2 text-sm text-forest/60">
            Status: {order.status}. Payments aren&apos;t live yet, so you haven&apos;t been charged.
          </p>

          <section aria-labelledby="items" className="mt-10 rounded-3xl border border-border bg-card p-6">
            <h2 id="items" className="text-2xl font-medium text-forest">
              Your items
            </h2>
            <ul className="mt-4 divide-y divide-border">
              {order.order_items.map((item) => (
                <li key={item.id} className="flex justify-between gap-4 py-3 text-sm">
                  <span className="text-forest">
                    {item.products?.name ?? "Product"}{" "}
                    <span className="text-forest/60">× {item.quantity}</span>
                  </span>
                  <span className="font-medium text-forest">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex justify-between border-t border-border pt-4 text-base font-medium text-forest">
              <span>Total</span>
              <span>{formatPrice(order.total_amount)}</span>
            </div>
          </section>

          <section aria-labelledby="ship" className="mt-6 rounded-3xl border border-border bg-card p-6">
            <h2 id="ship" className="text-2xl font-medium text-forest">
              Shipping to
            </h2>
            <address className="mt-3 text-sm leading-relaxed text-forest/80 not-italic">
              {address.full_name}
              <br />
              {address.line1}
              {address.line2 && (
                <>
                  <br />
                  {address.line2}
                </>
              )}
              <br />
              {[address.city, address.state, address.postal_code].filter(Boolean).join(", ")}
              <br />
              {address.country}
            </address>
          </section>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href={`/account/orders/${order.id}`}
              className="inline-flex h-11 items-center rounded-full bg-matcha px-7 text-sm font-medium text-forest hover:bg-matcha/85"
            >
              View order
            </Link>
            <Link
              href="/shop"
              className="inline-flex h-11 items-center rounded-full border border-forest/25 px-7 text-sm font-medium text-forest hover:bg-sage/30"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
