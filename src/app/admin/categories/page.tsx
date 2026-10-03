import type { Metadata } from "next";
import { CategoryCreateForm, CategoryEditForm, DeleteButton } from "@/components/admin/admin-actions";
import { Card, EmptyState, ErrorState, PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata: Metadata = { title: "Admin · Categories" };

export default async function AdminCategories() {
  const { supabase } = await requireAdmin("/admin/categories");
  const { data: categories, error } = await supabase
    .from("categories")
    .select("id, name, slug, description, products(count)")
    .order("name");

  return (
    <div className="space-y-8">
      <PageHeader title="Categories" subtitle="Group products so customers can browse." />

      <Card>
        <h2 className="mb-4 text-2xl font-medium text-forest">Add a category</h2>
        <CategoryCreateForm />
      </Card>

      {error ? (
        <ErrorState>We couldn&apos;t load categories. Refresh to try again.</ErrorState>
      ) : !categories?.length ? (
        <EmptyState>No categories yet.</EmptyState>
      ) : (
        <ul className="space-y-3">
          {categories.map((c) => {
            const count = c.products[0]?.count ?? 0;
            return (
              <li key={c.id}>
                <Card>
                  <details>
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-forest">
                      <span>
                        <span className="text-xl font-medium">{c.name}</span>
                        <span className="ml-3 text-sm text-forest/60">
                          /{c.slug} · {count} {count === 1 ? "product" : "products"}
                        </span>
                      </span>
                      <span className="text-sm underline underline-offset-4">Edit</span>
                    </summary>
                    <div className="mt-5 space-y-4 border-t border-border pt-5">
                      <CategoryEditForm id={c.id} name={c.name} slug={c.slug} description={c.description ?? ""} />
                      <DeleteButton kind="category" id={c.id} label={c.name} />
                      {count > 0 && (
                        <p className="text-xs text-forest/60">
                          Its {count} {count === 1 ? "product stays" : "products stay"} in the shop, uncategorised.
                        </p>
                      )}
                    </div>
                  </details>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
