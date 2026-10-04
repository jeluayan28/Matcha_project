import type { Metadata } from "next";
import Link from "next/link";
import { StockForm } from "@/components/admin/admin-actions";
import { EmptyState, ErrorState, PageHeader, Table, td, th } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata: Metadata = { title: "Admin · Inventory" };

const LOW = 5;
const chip = (active: boolean) =>
  `inline-flex h-11 items-center rounded-full sm:h-9 border px-4 text-sm transition-colors ${
    active ? "border-forest bg-forest text-cream" : "border-forest/20 text-forest hover:bg-sage/70"
  }`;

export default async function AdminInventory({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { supabase } = await requireAdmin("/admin/inventory");
  const low = (await searchParams).filter === "low";

  let query = supabase
    .from("products")
    .select("id, name, slug, stock, categories(name)")
    .order("stock", { ascending: true })
    .order("name");
  if (low) query = query.lte("stock", LOW);
  const { data: products, error } = await query;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory"
        subtitle={`Update stock levels. Low stock is ${LOW} or fewer.`}
      />
      <nav aria-label="Filter" className="flex gap-2">
        <Link href="/admin/inventory" className={chip(!low)}>
          All
        </Link>
        <Link href="/admin/inventory?filter=low" className={chip(low)}>
          Low stock
        </Link>
      </nav>
      {error ? (
        <ErrorState>We couldn&apos;t load inventory. Refresh to try again.</ErrorState>
      ) : !products?.length ? (
        <EmptyState>{low ? "Nothing is running low." : "No products yet."}</EmptyState>
      ) : (
        <Table>
          <thead>
            <tr>
              <th className={th}>Product</th>
              <th className={th}>Category</th>
              <th className={th}>Status</th>
              <th className={th}>Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((p) => (
              <tr key={p.id}>
                <td data-label="Product" className={td}>
                  <Link href={`/admin/products/${p.id}`} className="font-medium hover:underline">
                    {p.name}
                  </Link>
                </td>
                <td data-label="Category" className={td}>{p.categories?.name ?? "—"}</td>
                <td data-label="Status" className={td}>
                  {p.stock === 0 ? (
                    <span className="text-destructive">Sold out</span>
                  ) : p.stock <= LOW ? (
                    <span className="text-destructive">Low</span>
                  ) : (
                    "In stock"
                  )}
                </td>
                <td data-label="Stock" className={td}>
                  <StockForm productId={p.id} stock={p.stock} name={p.name} />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
