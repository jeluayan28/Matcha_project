import { createClient } from "@/lib/supabase/server";
import type { ShopParams } from "./params";

const PRODUCT_FIELDS =
  "id, name, slug, description, price, image_url, stock, is_featured, categories(name, slug)";

const PAGE_LIMIT = 60;

export async function getCategories() {
  const supabase = await createClient();
  return supabase
    .from("categories")
    .select("id, name, slug")
    .order("name", { ascending: true });
}

export async function getProducts(
  params: ShopParams,
  categoryId: string | null
) {
  const supabase = await createClient();
  let query = supabase.from("products").select(PRODUCT_FIELDS);

  if (categoryId) query = query.eq("category_id", categoryId);
  if (params.featured) query = query.eq("is_featured", true);

  if (params.q) {
    // The term is interpolated into a PostgREST filter string, so strip everything that can
    // end a value or start a new condition (, ( ) " backslash) and LIKE wildcards (% _ *).
    const term = params.q.replace(/[%_,()*"\\]/g, " ").replace(/\s+/g, " ").trim();
    if (term) query = query.or(`name.ilike.%${term}%,description.ilike.%${term}%`);
  }

  switch (params.sort) {
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    case "price-asc":
      query = query.order("price", { ascending: true });
      break;
    case "price-desc":
      query = query.order("price", { ascending: false });
      break;
    case "name-asc":
      query = query.order("name", { ascending: true });
      break;
    default:
      query = query
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false });
  }

  return query.order("id").limit(PAGE_LIMIT);
}

export async function getProductBySlug(slug: string) {
  const supabase = await createClient();
  return supabase
    .from("products")
    .select(`${PRODUCT_FIELDS}, category_id, created_at`)
    .eq("slug", slug)
    .maybeSingle();
}

export async function getRelatedProducts(productId: string, categoryId: string | null) {
  const supabase = await createClient();
  let query = supabase.from("products").select(PRODUCT_FIELDS).neq("id", productId);
  if (categoryId) query = query.eq("category_id", categoryId);
  return query
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(4);
}

export type ProductListItem = NonNullable<
  Awaited<ReturnType<typeof getProducts>>["data"]
>[number];
