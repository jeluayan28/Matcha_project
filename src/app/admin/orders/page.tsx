import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState, ErrorState, PageHeader, Table, td, th } from "@/components/admin/ui";
import { formatDate, orderNumber, STATUS_LABEL, STATUS_TONE } from "@/lib/account/status";
import { ALL_STATUSES } from "@/lib/admin/orders";
import { requireAdmin } from "@/lib/auth/admin";
import { formatPrice } from "@/lib/shop/format";

export const metadata: Metadata = { title: "Admin · Orders" };

const chip = (active: boolean) =>
  `inline-flex h-9 items-center rounded-full border px-4 text-sm transition-colors ${
    active ? "border-forest bg-forest text-cream" : "border-forest/20 text-forest hover:bg-sage/30"
  }`;

export default async function AdminOrders({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { supabase } = await requireAdmin("/admin/orders");
  const raw = (await searchParams).status;
  const status = ALL_STATUSES.find((s) => s === raw);

  let query = supabase
    .from("orders")
    .select("id, status, total_amount, created_at, shipping_address, order_items(quantity)")
    .order("created_at", { ascending: false })
    .limit(100);
  if (status) query = query.eq("status", status);
  const { data: orders, error } = await query;

  return (
    <div className="space-y-6">
      <PageHeader title="Orders" subtitle="Latest 100 orders." />
      <nav aria-label="Filter by status" className="flex flex-wrap gap-2">
        <Link href="/admin/orders" className={chip(!status)}>
          All
        </Link>
        {ALL_STATUSES.map((s) => (
          <Link key={s} href={`/admin/orders?status=${s}`} className={chip(status === s)}>
            {STATUS_LABEL[s]}
          </Link>
        ))}
      </nav>
      {error ? (
        <ErrorState>We couldn&apos;t load orders. Refresh to try again.</ErrorState>
      ) : !orders?.length ? (
        <EmptyState>
          {status ? `No ${STATUS_LABEL[status].toLowerCase()} orders.` : "No orders yet."}
        </EmptyState>
      ) : (
        <Table>
          <thead>
            <tr>
              <th className={th}>Order</th>
              <th className={th}>Customer</th>
              <th className={th}>Date</th>
              <th className={th}>Items</th>
              <th className={th}>Status</th>
              <th className={`${th} text-right`}>Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.map((o) => (
              <tr key={o.id}>
                <td className={td}>
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="font-medium underline-offset-4 hover:underline"
                  >
                    {orderNumber(o.id)}
                  </Link>
                </td>
                <td className={td}>
                  {(o.shipping_address as { full_name?: string } | null)?.full_name ?? "—"}
                </td>
                <td className={td}>{formatDate(o.created_at)}</td>
                <td className={td}>{o.order_items.reduce((n, i) => n + i.quantity, 0)}</td>
                <td className={td}>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_TONE[o.status]}`}
                  >
                    {STATUS_LABEL[o.status]}
                  </span>
                </td>
                <td className={`${td} text-right font-medium`}>{formatPrice(o.total_amount)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
