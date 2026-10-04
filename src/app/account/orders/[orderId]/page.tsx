import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Leaf } from "lucide-react";
import {
  formatDate,
  orderNumber,
  STATUS_LABEL,
  STATUS_TONE,
} from "@/lib/account/status";
import { requireUser } from "@/lib/auth/session";
import { formatPrice, isAllowedImage } from "@/lib/shop/format";

export const metadata: Metadata = { title: "Order details" };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Address = {
  full_name?: string;
  email?: string;
  phone?: string | null;
  line1?: string;
  line2?: string | null;
  city?: string;
  state?: string | null;
  postal_code?: string;
  country?: string;
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  if (!UUID_RE.test(orderId)) notFound();
  const { supabase, user } = await requireUser(`/account/orders/${orderId}`);

  // Someone else's order id returns no row (RLS + user_id filter), i.e. a plain 404.
  const { data: order, error } = await supabase
    .from("orders")
    .select(
      "id, status, total_amount, shipping_address, created_at, order_items(id, quantity, price, products(name, slug, image_url))"
    )
    .eq("id", orderId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) throw new Error("Failed to load order");
  if (!order) notFound();

  const address = (order.shipping_address ?? {}) as Address;
  const subtotal = order.order_items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <div>
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-1 text-sm text-forest/70 hover:text-forest"
      >
        <ChevronLeft className="size-4" aria-hidden />
        All orders
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h2 className="text-4xl font-medium text-forest">Order {orderNumber(order.id)}</h2>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_TONE[order.status]}`}>
          {STATUS_LABEL[order.status]}
        </span>
      </div>
      <p className="mt-2 text-sm text-forest/60">Placed on {formatDate(order.created_at)}</p>

      <div className="mt-8 grid gap-8 md:grid-cols-[1fr_20rem]">
        <section aria-labelledby="items" className="rounded-3xl border border-border bg-card p-6">
          <h3 id="items" className="text-2xl font-medium text-forest">
            Items
          </h3>
          <ul className="mt-2 divide-y divide-border">
            {order.order_items.map((item) => (
              <li key={item.id} className="flex gap-4 py-4">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-3xl bg-sage">
                  {isAllowedImage(item.products?.image_url ?? null) ? (
                    <Image src={item.products!.image_url!} alt="" fill sizes="64px" className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-forest/30">
                      <Leaf className="size-6" strokeWidth={1.25} aria-hidden />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-forest">
                    {item.products ? (
                      <Link href={`/shop/${item.products.slug}`} className="hover:underline">
                        {item.products.name}
                      </Link>
                    ) : (
                      "Product"
                    )}
                  </p>
                  <p className="text-sm text-forest/60">
                    {formatPrice(item.price)} × {item.quantity}
                  </p>
                </div>
                <p className="text-sm font-medium text-forest">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </li>
            ))}
          </ul>
          <dl className="mt-2 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-forest/70">Subtotal</dt>
              <dd className="text-forest">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-3 text-base">
              <dt className="font-medium text-forest">Total</dt>
              <dd className="font-medium text-forest">{formatPrice(order.total_amount)}</dd>
            </div>
          </dl>
        </section>

        <section aria-labelledby="ship" className="h-fit rounded-3xl border border-border bg-card p-6">
          <h3 id="ship" className="text-2xl font-medium text-forest">
            Shipping to
          </h3>
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
          {address.email && <p className="mt-3 text-sm text-forest/60">{address.email}</p>}
        </section>
      </div>
    </div>
  );
}
