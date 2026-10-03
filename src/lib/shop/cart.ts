import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// Loads the user's own cart lines (RLS limits rows; the filter makes it explicit)
// and works out which lines can actually be bought right now.
export async function getCartLines(
  supabase: SupabaseClient<Database>,
  userId: string
) {
  const { data, error } = await supabase
    .from("cart_items")
    .select("id, quantity, products(id, name, slug, price, image_url, stock)")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  const lines = (data ?? []).map((item) => {
    const product = item.products;
    const stock = product?.stock ?? 0;
    return {
      ...item,
      product,
      stock,
      ok: Boolean(product) && stock >= 1 && item.quantity <= stock,
    };
  });
  const valid = lines.filter((l) => l.ok);

  return {
    error,
    lines,
    issues: lines.length - valid.length,
    totalQuantity: valid.reduce((n, l) => n + l.quantity, 0),
    subtotal: valid.reduce((sum, l) => sum + l.quantity * (l.product?.price ?? 0), 0),
  };
}
