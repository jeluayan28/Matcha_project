import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Leaf } from "lucide-react";
import {
  formatDate,
  orderNumber,
  STATUS_LABEL,
  STATUS_TONE,
} from "@/lib/account/status";
import { requireUser } from "@/lib/auth/session";
import { formatPrice } from "@/lib/shop/format";

export const metadata: Metadata = { title: "My orders" };

export default async function OrdersPage() {
  const { supabase, user } = await requireUser("/account/orders");

  // RLS limits rows to the signed-in user; the filter makes it explicit.
  const { data: orders, error } = await supabase
    .from("orders")
    .select("id, status, total_amount, created_at, order_items(quantity)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error)
    return (
      <Notice
        title="We couldn't load your orders"
        text="Refresh the page in a moment. Your orders are safe."
      />
    );

  if (!orders || orders.length === 0)
    return (
      <Notice
        title="No orders yet"
        text="When you place an order, it will show up here."
        action={{ href: "/shop", label: "Browse the shop" }}
      />
    );

  return (
    <section aria-label="Orders">
      <ul className="space-y-4">
        {orders.map((order) => {
          const count = order.order_items.reduce((n, i) => n + i.quantity, 0);
          return (
            <li key={order.id}>
              <Link
                href={`/account/orders/${order.id}`}
                className="flex items-center gap-4 rounded-3xl border border-border bg-card p-5 transition-colors hover:bg-sage/20 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none sm:p-6"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-xl font-medium text-forest">
                      Order {orderNumber(order.id)}
                    </p>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_TONE[order.status]}`}
                    >
                      {STATUS_LABEL[order.status]}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-forest/60">
                    {formatDate(order.created_at)} · {count} {count === 1 ? "item" : "items"}
                  </p>
                </div>
                <p className="font-medium text-forest">{formatPrice(order.total_amount)}</p>
                <ChevronRight className="size-5 text-forest/40" aria-hidden />
              </Link>
            </li>
          );
        })}
      </ul>
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
    <div className="flex flex-col items-start gap-3 rounded-3xl border border-dashed border-forest/25 bg-card px-6 py-10 sm:px-10">
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
