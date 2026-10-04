import type { Metadata } from "next";
import Link from "next/link";
import { Card, EmptyState, ErrorState, PageHeader, Table, td, th } from "@/components/admin/ui";
import { formatDate, orderNumber, STATUS_LABEL, STATUS_TONE } from "@/lib/account/status";
import { requireAdmin } from "@/lib/auth/admin";
import { formatPrice } from "@/lib/shop/format";

export const metadata: Metadata = { title: "Admin dashboard" };

type Stats = {
  total_products: number;
  total_orders: number;
  total_customers: number;
  pending_orders: number;
  revenue: number;
};

export default async function AdminDashboard() {
  const { supabase } = await requireAdmin("/admin");

  const [statsRes, recentRes, lowRes] = await Promise.all([
    supabase.rpc("admin_stats"),
    supabase
      .from("orders")
      .select("id, status, total_amount, created_at, shipping_address")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("products")
      .select("id, name, stock")
      .lte("stock", 5)
      .order("stock", { ascending: true })
      .limit(5),
  ]);

  if (statsRes.error)
    return (
      <>
        <PageHeader title="Dashboard" />
        <div className="mt-8">
          <ErrorState>We couldn&apos;t load the dashboard. Refresh to try again.</ErrorState>
        </div>
      </>
    );

  const stats = statsRes.data as Stats;
  const cards = [
    { label: "Total products", value: String(stats.total_products), href: "/admin/products" },
    { label: "Total orders", value: String(stats.total_orders), href: "/admin/orders" },
    { label: "Customers", value: String(stats.total_customers), href: "/admin/customers" },
    { label: "Pending orders", value: String(stats.pending_orders), href: "/admin/orders?status=pending" },
    { label: "Revenue", value: formatPrice(Number(stats.revenue)), href: "/admin/orders" },
  ];

  return (
    <div className="space-y-10">
      <PageHeader title="Dashboard" subtitle="How the shop is doing." />

      <ul className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map((c) => (
          <li key={c.label}>
            <Link
              href={c.href}
              className="block h-full rounded-3xl border border-border bg-card p-5 transition-colors hover:bg-sage/20"
            >
              <p className="text-sm text-forest/60">{c.label}</p>
              <p className="mt-2 text-3xl font-medium text-forest">{c.value}</p>
            </Link>
          </li>
        ))}
      </ul>
      <p className="-mt-6 text-xs text-forest/60">
        Revenue counts orders that are paid, processing, shipped or delivered.
      </p>

      <section aria-labelledby="recent" className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 id="recent" className="text-2xl font-medium text-forest">Recent orders</h2>
          <Link href="/admin/orders" className="text-sm text-forest/70 underline underline-offset-4">View all</Link>
        </div>
        {recentRes.error ? (
          <ErrorState>We couldn&apos;t load recent orders.</ErrorState>
        ) : !recentRes.data?.length ? (
          <EmptyState>No orders yet.</EmptyState>
        ) : (
          <Table>
            <thead>
              <tr>
                <th className={th}>Order</th>
                <th className={th}>Customer</th>
                <th className={th}>Date</th>
                <th className={th}>Status</th>
                <th className={`${th} text-right`}>Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentRes.data.map((o) => (
                <tr key={o.id}>
                  <td data-label="Order" className={td}>
                    <Link href={`/admin/orders/${o.id}`} className="font-medium underline-offset-4 hover:underline">
                      {orderNumber(o.id)}
                    </Link>
                  </td>
                  <td data-label="Customer" className={td}>{(o.shipping_address as { full_name?: string } | null)?.full_name ?? "—"}</td>
                  <td data-label="Date" className={td}>{formatDate(o.created_at)}</td>
                  <td data-label="Status" className={td}>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_TONE[o.status]}`}>
                      {STATUS_LABEL[o.status]}
                    </span>
                  </td>
                  <td data-label="Total" className={`${td} text-right font-medium`}>{formatPrice(o.total_amount)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </section>

      <section aria-labelledby="low" className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 id="low" className="text-2xl font-medium text-forest">Low stock</h2>
          <Link href="/admin/inventory" className="text-sm text-forest/70 underline underline-offset-4">Inventory</Link>
        </div>
        {lowRes.error ? (
          <ErrorState>We couldn&apos;t load stock levels.</ErrorState>
        ) : !lowRes.data?.length ? (
          <EmptyState>Everything is well stocked.</EmptyState>
        ) : (
          <Card>
            <ul className="divide-y divide-border">
              {lowRes.data.map((p) => (
                <li key={p.id} className="flex justify-between py-2 text-sm text-forest">
                  <Link href={`/admin/products/${p.id}`} className="hover:underline">{p.name}</Link>
                  <span className={p.stock === 0 ? "font-medium text-destructive" : ""}>
                    {p.stock === 0 ? "Sold out" : `${p.stock} left`}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </section>
    </div>
  );
}
