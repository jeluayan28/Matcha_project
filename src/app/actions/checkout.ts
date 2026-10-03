"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  readCheckoutValues,
  validateCheckout,
  type CheckoutErrors,
  type CheckoutValues,
} from "@/lib/checkout/validation";
import { getPaymentProvider } from "@/lib/payments";
import { createClient } from "@/lib/supabase/server";

export type CheckoutState = {
  error?: string;
  fieldErrors?: CheckoutErrors;
  values?: CheckoutValues;
};

export async function placeOrder(
  _prev: CheckoutState,
  formData: FormData
): Promise<CheckoutState> {
  // 1. Authentication
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  const email = claims?.claims?.email;
  if (!userId || typeof email !== "string")
    redirect("/login?next=%2Fcheckout");

  const values = readCheckoutValues(formData);
  const fieldErrors = validateCheckout(values);
  if (Object.keys(fieldErrors).length > 0)
    return { fieldErrors, values, error: "Please fix the highlighted fields." };

  // 2-6. Availability check, order, order_items, stock update and cart clearing all
  // happen in one database transaction (see place_order in supabase/migrations).
  // The email comes from the verified session, not from the form.
  const { data: orderId, error } = await supabase.rpc("place_order", {
    p_shipping: {
      full_name: values.fullName,
      email,
      phone: values.phone || null,
      line1: values.line1,
      line2: values.line2 || null,
      city: values.city,
      state: values.state || null,
      postal_code: values.postalCode,
      country: values.country,
    },
  });

  if (error || !orderId) {
    switch (error?.message) {
      case "empty_cart":
        redirect("/cart");
      case "insufficient_stock":
        return {
          values,
          error: `Sorry, "${error.details ?? "an item"}" no longer has enough stock. Review your cart and try again.`,
        };
      case "invalid_shipping":
        return { values, error: "Please check your shipping details." };
      default:
        return {
          values,
          error: "We couldn't place your order. You haven't been charged — please try again.",
        };
    }
  }

  // Payment hook. The mock provider charges nothing; a real provider may return a
  // redirectUrl (hosted payment page) which we follow instead of the confirmation.
  const { data: order } = await supabase
    .from("orders")
    .select("total_amount")
    .eq("id", orderId)
    .maybeSingle();
  const payment = await getPaymentProvider().createPayment({
    orderId,
    amount: order?.total_amount ?? 0,
    currency: "usd",
    customerEmail: email,
  });

  revalidatePath("/", "layout");
  if (payment.redirectUrl) redirect(payment.redirectUrl);
  redirect(`/checkout/confirmation/${orderId}`);
}
