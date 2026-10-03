import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { OrderStatusForm } from "@/components/admin/admin-actions";
import { Card, ErrorState } from "@/components/admin/ui";
import { formatDate, orderNumber, STATUS_LABEL, STATUS_TONE } from "@/lib/account/status";
import { nextStatuses } from "@/lib/admin/orders";
import { isUuid } from "@/lib/admin/validation";
import { requireAdmin } from "@/lib/auth/admin";
import { formatPrice } from "@/lib/shop/format";

export const metadata: Metadata = { title: "Admin · Order" };

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

export default async function AdminOrderDetail({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const { supabase } = await requireAdmin(`/admin/orders/${orderId}`);
  if (!isUuid(orderId)) notFound();

  const { data: order, error } = await supabase
    .from("orders")
    .select(
      "id, status, total_amount, shipping_address, created_at, order_items(id, quantity, price, products(id, name))"
    )
    .eq("id", orderId)
    .maybeSingle();
  if (error)
    return <ErrorState>We couldn&apos;t load this order. Refresh to try again.</ErrorState>;
  if (!order) notFound();

  const a = (order.shipping_address ?? {}) as Address;

  return (
    <div className="space-y-6">
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-1 text-sm text-forest/70 hover:text-forest"
      >
        <ChevronLeft className="size-4" aria-hidden /> All orders
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-4xl font-medium text-forest">Order {orderNumber(order.id)}</h1>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_TONE[order.status]}`}
        >
          {STATUS_LABEL[order.status]}
        </span>
      </div>
      <p className="text-sm text-forest/60">Placed on {formatDate(order.created_at)}</p>

      <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
        <Card>
          <h2 className="text-2xl font-medium text-forest">Items</h2>
          <ul className="mt-2 divide-y divide-border">
            {order.order_items.map((i) => (
              <li key={i.id} className="flex justify-between gap-4 py-3 text-sm text-forest">
                <span>
                  {i.products ? (
                    <Link href={`/admin/products/${i.products.id}`} className="hover:underline">
                      {i.products.name}
                    </Link>
                  ) : (
                    "Product"
                  )}{" "}
                  <span className="text-forest/60">
                    {formatPrice(i.price)} × {i.quantity}
                  </span>
                </span>
                <span className="font-medium">{formatPrice(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex justify-between border-t border-border pt-4 text-base font-medium text-forest">
            <span>Total</span>
            <span>{formatPrice(order.total_amount)}</span>
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <OrderStatusForm
              orderId={order.id}
              current={order.status}
              options={nextStatuses(order.status)}
            />
          </Card>
          <Card>
            <h2 className="text-2xl font-medium text-forest">Customer</h2>
            <address className="mt-3 text-sm leading-relaxed text-forest/80 not-italic">
              {a.full_name}
              <br />
              {a.email}
              {a.phone && (
                <>
                  <br />
                  {a.phone}
                </>
              )}
              <br />
              <br />
              {a.line1}
              {a.line2 && (
                <>
                  <br />
                  {a.line2}
                </>
              )}
              <br />
              {[a.city, a.state, a.postal_code].filter(Boolean).join(", ")}
              <br />
              {a.country}
            </address>
          </Card>
        </div>
      </div>
    </div>
  );
}
