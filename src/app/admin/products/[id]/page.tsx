import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ErrorState, PageHeader } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/product-form";
import { requireAdmin } from "@/lib/auth/admin";
import { isUuid } from "@/lib/admin/validation";

export const metadata: Metadata = { title: "Admin · Edit product" };

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin(`/admin/products/${id}`);
  if (!isUuid(id)) notFound();

  const [{ data: product, error }, { data: categories }] = await Promise.all([
    supabase
      .from("products")
      .select("id, name, slug, description, price, stock, category_id, image_url, is_featured")
      .eq("id", id)
      .maybeSingle(),
    supabase.from("categories").select("id, name").order("name"),
  ]);
  if (error)
    return <ErrorState>We couldn&apos;t load this product. Refresh to try again.</ErrorState>;
  if (!product) notFound();

  return (
    <div className="space-y-8">
      <PageHeader title="Edit product" subtitle={product.name} />
      <ProductForm
        productId={product.id}
        categories={categories ?? []}
        imageUrl={product.image_url}
        initial={{
          name: product.name,
          slug: product.slug,
          description: product.description ?? "",
          price: product.price.toFixed(2),
          stock: String(product.stock),
          categoryId: product.category_id ?? "",
          isFeatured: product.is_featured,
        }}
      />
    </div>
  );
}
