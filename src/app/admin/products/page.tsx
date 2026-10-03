import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Leaf } from "lucide-react";
import { DeleteButton } from "@/components/admin/admin-actions";
import { EmptyState, ErrorState, PageHeader, Table, td, th } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/admin";
import { formatPrice, isAllowedImage } from "@/lib/shop/format";

export const metadata: Metadata = { title: "Admin · Products" };

export default async function AdminProducts() {
  const { supabase } = await requireAdmin("/admin/products");
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, slug, price, stock, image_url, is_featured, categories(name)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Products"
        subtitle="Create, edit and remove what's for sale."
        action={{ href: "/admin/products/new", label: "New product" }}
      />
      {error ? (
        <ErrorState>We couldn&apos;t load products. Refresh to try again.</ErrorState>
      ) : !products?.length ? (
        <EmptyState>No products yet. Create your first one.</EmptyState>
      ) : (
        <Table>
          <thead>
            <tr>
              <th className={th}>Product</th>
              <th className={th}>Category</th>
              <th className={`${th} text-right`}>Price</th>
              <th className={`${th} text-right`}>Stock</th>
              <th className={th}><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((p) => (
              <tr key={p.id}>
                <td className={td}>
                  <div className="flex items-center gap-3">
                    <div className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-sage/40">
                      {isAllowedImage(p.image_url) ? (
                        <Image src={p.image_url} alt="" fill sizes="48px" className="object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-forest/30">
                          <Leaf className="size-5" strokeWidth={1.25} aria-hidden />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{p.name}</p>
                      {p.is_featured && <p className="text-xs text-forest/60">Featured</p>}
                    </div>
                  </div>
                </td>
                <td className={td}>{p.categories?.name ?? "—"}</td>
                <td className={`${td} text-right`}>{formatPrice(p.price)}</td>
                <td className={`${td} text-right ${p.stock === 0 ? "text-destructive" : ""}`}>{p.stock}</td>
                <td className={td}>
                  <div className="flex items-start justify-end gap-4">
                    <Link href={`/admin/products/${p.id}`} className="text-sm underline underline-offset-4">Edit</Link>
                    <DeleteButton kind="product" id={p.id} label={p.name} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
