export const CHECKOUT_FIELDS = [
  "fullName",
  "phone",
  "line1",
  "line2",
  "city",
  "state",
  "postalCode",
  "country",
] as const;

export type CheckoutValues = Record<(typeof CHECKOUT_FIELDS)[number], string>;
export type CheckoutErrors = Partial<Record<keyof CheckoutValues, string>>;

const MAX = 120;
const PHONE_RE = /^[+()\d][\d\s().-]{5,19}$/;

export function readCheckoutValues(formData: FormData): CheckoutValues {
  const out = {} as CheckoutValues;
  for (const key of CHECKOUT_FIELDS) {
    const raw = formData.get(key);
    out[key] = typeof raw === "string" ? raw.trim().slice(0, 200) : "";
  }
  return out;
}

export function validateCheckout(v: CheckoutValues): CheckoutErrors {
  const e: CheckoutErrors = {};
  if (!v.fullName) e.fullName = "Enter your full name.";
  if (v.phone && !PHONE_RE.test(v.phone)) e.phone = "Enter a valid phone number.";
  if (!v.line1) e.line1 = "Enter your street address.";
  if (!v.city) e.city = "Enter your city.";
  if (!v.postalCode) e.postalCode = "Enter your postal code.";
  if (!v.country) e.country = "Enter your country.";
  for (const key of CHECKOUT_FIELDS)
    if (!e[key] && v[key].length > MAX && key !== "phone")
      e[key] = "That's too long.";
  return e;
}
