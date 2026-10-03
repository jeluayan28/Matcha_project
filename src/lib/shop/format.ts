const priceFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function formatPrice(value: number) {
  return priceFormat.format(value);
}

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

// next/image only serves hosts allowed in next.config.ts (Supabase Storage).
export function isAllowedImage(url: string | null): url is string {
  if (!url || !supabaseHost) return false;
  try {
    const { hostname, pathname } = new URL(url);
    return (
      hostname === supabaseHost &&
      pathname.startsWith("/storage/v1/object/public/")
    );
  } catch {
    return false;
  }
}

// Products have a single description column; cards show the first sentence(s).
export function shortDescription(text: string | null, max = 110) {
  if (!text) return null;
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(" ") > 40 ? cut.lastIndexOf(" ") : max)}…`;
}
