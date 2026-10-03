const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(v: string) {
  return UUID_RE.test(v);
}

export function slugify(text: string) {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

export type ProductValues = {
  name: string;
  slug: string;
  description: string;
  price: string;
  stock: string;
  categoryId: string;
  isFeatured: boolean;
};
export type ProductErrors = Partial<Record<keyof ProductValues | "image", string>>;

export function readProduct(formData: FormData): ProductValues {
  const s = (k: string) => {
    const v = formData.get(k);
    return typeof v === "string" ? v.trim() : "";
  };
  return {
    name: s("name"),
    slug: s("slug"),
    description: s("description"),
    price: s("price"),
    stock: s("stock"),
    categoryId: s("categoryId"),
    isFeatured: formData.get("isFeatured") === "on",
  };
}

export function validateProduct(v: ProductValues) {
  const errors: ProductErrors = {};
  if (!v.name) errors.name = "Enter a name.";
  else if (v.name.length > 120) errors.name = "Name is too long.";

  const slug = v.slug || slugify(v.name);
  if (!slug || !SLUG_RE.test(slug) || slug.length > 120)
    errors.slug = "Use lowercase letters, numbers and hyphens.";

  const price = Number(v.price);
  if (!v.price || !Number.isFinite(price) || price < 0 || price > 100000)
    errors.price = "Enter a price between 0 and 100,000.";

  const stock = Number(v.stock);
  if (v.stock === "" || !Number.isInteger(stock) || stock < 0 || stock > 1_000_000)
    errors.stock = "Enter a whole number, 0 or more.";

  if (v.description.length > 5000) errors.description = "Description is too long.";
  if (v.categoryId && !isUuid(v.categoryId)) errors.categoryId = "Choose a valid category.";

  return {
    errors,
    clean: {
      name: v.name,
      slug,
      description: v.description || null,
      price: Math.round(price * 100) / 100,
      stock,
      category_id: v.categoryId || null,
      is_featured: v.isFeatured,
    },
  };
}

export type CategoryValues = { name: string; slug: string; description: string };
export type CategoryErrors = Partial<Record<keyof CategoryValues, string>>;

export function validateCategory(v: CategoryValues) {
  const errors: CategoryErrors = {};
  if (!v.name) errors.name = "Enter a name.";
  else if (v.name.length > 80) errors.name = "Name is too long.";
  const slug = v.slug || slugify(v.name);
  if (!slug || !SLUG_RE.test(slug) || slug.length > 80)
    errors.slug = "Use lowercase letters, numbers and hyphens.";
  if (v.description.length > 500) errors.description = "Description is too long.";
  return {
    errors,
    clean: { name: v.name, slug, description: v.description || null },
  };
}

// Detect image type from file bytes: the browser-supplied MIME type can't be trusted.
export function sniffImage(bytes: Uint8Array): { mime: string; ext: string } | null {
  const hex = (n: number) => Array.from(bytes.slice(0, n), (b) => b.toString(16).padStart(2, "0")).join("");
  if (hex(3) === "ffd8ff") return { mime: "image/jpeg", ext: "jpg" };
  if (hex(8) === "89504e470d0a1a0a") return { mime: "image/png", ext: "png" };
  const ascii = (a: number, b: number) => String.fromCharCode(...bytes.slice(a, b));
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return { mime: "image/webp", ext: "webp" };
  if (ascii(4, 12) === "ftypavif") return { mime: "image/avif", ext: "avif" };
  return null;
}
