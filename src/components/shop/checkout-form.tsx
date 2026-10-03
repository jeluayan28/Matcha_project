"use client";

import { useActionState } from "react";
import { placeOrder, type CheckoutState } from "@/app/actions/checkout";
import { Field, FormAlert } from "@/components/auth/form-parts";
import type { CheckoutValues } from "@/lib/checkout/validation";

export function CheckoutForm({
  email,
  defaults,
}: {
  email: string;
  defaults: Pick<CheckoutValues, "fullName" | "phone">;
}) {
  const [state, action, pending] = useActionState<CheckoutState, FormData>(
    placeOrder,
    {}
  );
  const v = { country: "United States", ...defaults, ...state.values };
  const e = state.fieldErrors ?? {};

  return (
    <form action={action} id="checkout-form" className="space-y-10" noValidate>
      {state.error && <FormAlert variant="error">{state.error}</FormAlert>}

      <fieldset className="space-y-4">
        <legend className="mb-2 text-2xl font-medium text-forest">
          Customer information
        </legend>
        <Field label="Full name" name="fullName" autoComplete="name" required defaultValue={v.fullName} error={e.fullName} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Email" name="email" type="email" value={email} readOnly autoComplete="email" />
          <Field label="Phone (optional)" name="phone" type="tel" autoComplete="tel" defaultValue={v.phone} error={e.phone} />
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="mb-2 text-2xl font-medium text-forest">
          Shipping address
        </legend>
        <Field label="Address" name="line1" autoComplete="address-line1" required defaultValue={v.line1} error={e.line1} />
        <Field label="Apartment, suite, etc. (optional)" name="line2" autoComplete="address-line2" defaultValue={v.line2} error={e.line2} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="City" name="city" autoComplete="address-level2" required defaultValue={v.city} error={e.city} />
          <Field label="State / region" name="state" autoComplete="address-level1" defaultValue={v.state} error={e.state} />
          <Field label="Postal code" name="postalCode" autoComplete="postal-code" required defaultValue={v.postalCode} error={e.postalCode} />
          <Field label="Country" name="country" autoComplete="country-name" required defaultValue={v.country} error={e.country} />
        </div>
      </fieldset>

      <section aria-labelledby="payment-heading">
        <h2 id="payment-heading" className="text-2xl font-medium text-forest">
          Payment
        </h2>
        <p className="mt-2 rounded-2xl border border-dashed border-forest/25 bg-card px-4 py-3 text-sm text-forest/70">
          Payments aren&apos;t live yet. Placing an order reserves your matcha and
          you won&apos;t be charged.
        </p>
      </section>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-12 w-full items-center justify-center rounded-full bg-matcha text-base font-medium text-forest transition-colors hover:bg-matcha/85 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Placing order…" : "Place order"}
      </button>
    </form>
  );
}
