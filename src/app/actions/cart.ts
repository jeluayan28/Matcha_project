"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isUuid } from "@/lib/admin/validation";
import { safeNext } from "@/lib/auth/redirect";
import { createClient } from "@/lib/supabase/server";

export type CartState = {
  status?: "success" | "error";
  message?: string;
};

export async function addToCart(
  _prev: CartState,
  formData: FormData
): Promise<CartState> {
  const productId = formData.get("productId");
  const rawQty = Number(formData.get("quantity") ?? 1);
  const next = safeNext(String(formData.get("next") ?? ""), "/shop");

  if (typeof productId !== "string" || !isUuid(productId))
    return { status: "error", message: "Product not found." };
  if (!Number.isInteger(rawQty) || rawQty < 1 || rawQty > 1000)
    return { status: "error", message: "Choose a valid quantity." };

  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (!userId) redirect(`/login?next=${encodeURIComponent(next)}`);

  // Stock and price always come from the database, never from the client.
  const { data: product } = await supabase
    .from("products")
    .select("id, name, stock")
    .eq("id", productId)
    .maybeSingle();
  if (!product) return { status: "error", message: "This product is no longer available." };
  if (product.stock < 1) return { status: "error", message: "Sorry, this is sold out." };

  const { data: existing } = await supabase
    .from("cart_items")
    .select("quantity")
    .eq("user_id", userId)
    .eq("product_id", product.id)
    .maybeSingle();

  const inCart = existing?.quantity ?? 0;
  const room = product.stock - inCart;
  if (room < 1)
    return {
      status: "error",
      message: `You already have all ${product.stock} in your cart.`,
    };

  const added = Math.min(rawQty, room);
  const { error } = await supabase.from("cart_items").upsert(
    { user_id: userId, product_id: product.id, quantity: inCart + added },
    { onConflict: "user_id,product_id" }
  );
  if (error)
    return { status: "error", message: "We couldn't update your cart. Please try again." };

  revalidatePath("/", "layout");
  return {
    status: "success",
    message:
      added < rawQty
        ? `Added ${added} — that's all we have in stock.`
        : "Added to your cart.",
  };
}

export type CartLineIntent = "inc" | "dec" | "remove" | "fix";

// Mutates one of the signed-in user's own cart lines. The line is always looked up by
// (id, user_id) and the new quantity derived from the database, never from the client.
export async function updateCartLine(
  _prev: CartState,
  formData: FormData
): Promise<CartState> {
  const itemId = formData.get("itemId");
  const intent = formData.get("intent");
  if (
    typeof itemId !== "string" ||
    !isUuid(itemId) ||
    !["inc", "dec", "remove", "fix"].includes(String(intent))
  )
    return { status: "error", message: "Something went wrong. Please try again." };

  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (!userId) redirect("/login?next=%2Fcart");

  const { data: item, error: readError } = await supabase
    .from("cart_items")
    .select("id, quantity, products(stock)")
    .eq("id", itemId)
    .eq("user_id", userId)
    .maybeSingle();
  if (readError)
    return { status: "error", message: "We couldn't update your cart. Please try again." };
  if (!item) {
    revalidatePath("/cart");
    return { status: "error", message: "That item is no longer in your cart." };
  }

  const stock = item.products?.stock ?? 0;
  let result: { error: unknown };
  let message: string | undefined;

  if (intent === "remove" || (intent === "fix" && stock < 1)) {
    result = await supabase.from("cart_items").delete().eq("id", item.id).eq("user_id", userId);
  } else {
    let next = item.quantity;
    if (intent === "inc") {
      if (item.quantity >= stock)
        return { status: "error", message: `Only ${stock} in stock.` };
      next = item.quantity + 1;
    } else if (intent === "dec") {
      next = Math.max(1, item.quantity - 1);
    } else {
      next = Math.min(item.quantity, stock);
      message = `Updated to ${next} — all we have in stock.`;
    }
    result = await supabase
      .from("cart_items")
      .update({ quantity: next })
      .eq("id", item.id)
      .eq("user_id", userId);
  }

  if (result.error)
    return { status: "error", message: "We couldn't update your cart. Please try again." };
  revalidatePath("/", "layout");
  return message ? { status: "success", message } : {};
}

export async function clearCart(): Promise<CartState> {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (!userId) redirect("/login?next=%2Fcart");

  const { error } = await supabase.from("cart_items").delete().eq("user_id", userId);
  if (error)
    return { status: "error", message: "We couldn't clear your cart. Please try again." };
  revalidatePath("/", "layout");
  return {};
}
