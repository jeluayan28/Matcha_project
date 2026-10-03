import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/product-form";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata: Metadata = { title: "Admin · New product" };

export default async function NewProduct() {
  const { supabase } = await requireAdmin("/admin/products/new");
  const { data: categories } = await supabase.from("categories").select("id, name").order("name");

  return (
    <div className="space-y-8">
      <PageHeader title="New product" />
      <ProductForm
        categories={categories ?? []}
        initial={{ name: "", slug: "", description: "", price: "", stock: "0", categoryId: "", isFeatured: false }}
      />
    </div>
  );
}
