import { createClient } from "@/lib/supabase/server";
import { Navbar } from "./navbar";

export async function SiteHeader() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims);

  let cartCount = 0;
  if (signedIn) {
    // RLS limits this to the signed-in user's own cart.
    const { data: items } = await supabase
      .from("cart_items")
      .select("quantity");
    cartCount = items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  }

  return <Navbar signedIn={signedIn} cartCount={cartCount} />;
}
