import type { Metadata } from "next";
import { EmptyState, ErrorState, PageHeader, Table, td, th } from "@/components/admin/ui";
import { formatDate } from "@/lib/account/status";
import { requireAdmin } from "@/lib/auth/admin";
import { formatPrice } from "@/lib/shop/format";

export const metadata: Metadata = { title: "Admin · Customers" };

export default async function AdminCustomers() {
  const { supabase } = await requireAdmin("/admin/customers");
  const { data: customers, error } = await supabase.rpc("admin_list_customers");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        subtitle="Newest 500 accounts. Spend counts paid orders and beyond."
      />
      {error ? (
        <ErrorState>We couldn&apos;t load customers. Refresh to try again.</ErrorState>
      ) : !customers?.length ? (
        <EmptyState>No customers yet.</EmptyState>
      ) : (
        <Table>
          <thead>
            <tr>
              <th className={th}>Name</th>
              <th className={th}>Email</th>
              <th className={th}>Phone</th>
              <th className={th}>Joined</th>
              <th className={`${th} text-right`}>Orders</th>
              <th className={`${th} text-right`}>Spent</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {customers.map((c) => (
              <tr key={c.id}>
                <td data-label="Name" className={td}>
                  <span className="font-medium">{c.full_name ?? "—"}</span>
                  {c.role === "admin" && (
                    <span className="ml-2 rounded-full bg-matcha/40 px-2 py-0.5 text-xs">
                      Admin
                    </span>
                  )}
                </td>
                <td data-label="Email" className={td}>{c.email}</td>
                <td data-label="Phone" className={td}>{c.phone ?? "—"}</td>
                <td data-label="Joined" className={td}>{formatDate(c.created_at)}</td>
                <td data-label="Orders" className={`${td} text-right`}>{Number(c.order_count)}</td>
                <td data-label="Spent" className={`${td} text-right`}>{formatPrice(Number(c.total_spent))}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
