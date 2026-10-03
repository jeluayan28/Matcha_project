"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import {
  isUuid,
  readProduct,
  sniffImage,
  validateCategory,
  validateProduct,
  type CategoryErrors,
  type CategoryValues,
  type ProductErrors,
  type ProductValues,
} from "@/lib/admin/validation";
import type { createClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/types/database";

// Every action below starts with requireAdmin(): server actions are public POST endpoints,
// so the role is re-checked on each call. RLS in the database is the second layer.

type Supabase = Awaited<ReturnType<typeof createClient>>;

export type ProductState = {
  error?: string;
  fieldErrors?: ProductErrors;
  values?: ProductValues;
};
export type CategoryState = {
  status?: "success" | "error";
  message?: string;
  fieldErrors?: CategoryErrors;
  values?: CategoryValues;
};
export type SimpleState = { status?: "success" | "error"; message?: string };

const BUCKET = "product-images";
const MAX_IMAGE = 5 * 1024 * 1024;
const GENERIC = "Something went wrong. Please try again.";

function str(formData: FormData, key: string) {
  const v = formData.get(key);
  return typeof v === "string" ? v.trim() : "";
}

function storagePath(url: string | null) {
  if (!url) return null;
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const i = url.indexOf(marker);
  return i === -1 ? null : decodeURIComponent(url.slice(i + marker.length));
}

async function removeImage(supabase: Supabase, url: string | null) {
  const path = storagePath(url);
  if (path) await supabase.storage.from(BUCKET).remove([path]);
}

async function uploadImage(
  supabase: Supabase,
  file: File
): Promise<{ url: string } | { error: string }> {
  if (file.size > MAX_IMAGE) return { error: "Image must be 5 MB or smaller." };
  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = sniffImage(bytes);
  if (!type) return { error: "Use a JPG, PNG, WebP or AVIF image." };

  // Server-generated name: never trust the uploaded file name.
  const path = `${crypto.randomUUID()}.${type.ext}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, bytes, { contentType: type.mime, upsert: false });
  if (error) return { error: "We couldn't upload the image. Please try again." };
  return { url: supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl };
}

function pickFile(formData: FormData) {
  const f = formData.get("image");
  return f instanceof File && f.size > 0 ? f : null;
}

function refresh() {
  revalidatePath("/admin", "layout");
}

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

export async function createProduct(
  _prev: ProductState,
  formData: FormData
): Promise<ProductState> {
  const { supabase } = await requireAdmin("/admin/products");
  const values = readProduct(formData);
  const { errors, clean } = validateProduct(values);
  if (Object.keys(errors).length > 0)
    return { values, fieldErrors: errors, error: "Please fix the highlighted fields." };

  let image_url: string | null = null;
  const file = pickFile(formData);
  if (file) {
    const up = await uploadImage(supabase, file);
    if ("error" in up) return { values, fieldErrors: { image: up.error } };
    image_url = up.url;
  }

  const { error } = await supabase.from("products").insert({ ...clean, image_url });
  if (error) {
    await removeImage(supabase, image_url);
    return error.code === "23505"
      ? { values, fieldErrors: { slug: "That URL slug is already in use." } }
      : { values, error: GENERIC };
  }

  refresh();
  redirect("/admin/products");
}

export async function updateProduct(
  _prev: ProductState,
  formData: FormData
): Promise<ProductState> {
  const id = str(formData, "productId");
  const { supabase } = await requireAdmin(`/admin/products/${id}`);
  if (!isUuid(id)) return { error: "Product not found." };

  const values = readProduct(formData);
  const { errors, clean } = validateProduct(values);
  if (Object.keys(errors).length > 0)
    return { values, fieldErrors: errors, error: "Please fix the highlighted fields." };

  const { data: current } = await supabase
    .from("products")
    .select("image_url")
    .eq("id", id)
    .maybeSingle();
  if (!current) return { values, error: "Product not found." };

  let image_url = current.image_url;
  let uploaded: string | null = null;
  const file = pickFile(formData);
  if (file) {
    const up = await uploadImage(supabase, file);
    if ("error" in up) return { values, fieldErrors: { image: up.error } };
    image_url = uploaded = up.url;
  } else if (formData.get("removeImage") === "on") {
    image_url = null;
  }

  const { error } = await supabase
    .from("products")
    .update({ ...clean, image_url })
    .eq("id", id);
  if (error) {
    await removeImage(supabase, uploaded);
    return error.code === "23505"
      ? { values, fieldErrors: { slug: "That URL slug is already in use." } }
      : { values, error: GENERIC };
  }

  if (image_url !== current.image_url) await removeImage(supabase, current.image_url);
  refresh();
  redirect("/admin/products");
}

export async function deleteProduct(
  _prev: SimpleState,
  formData: FormData
): Promise<SimpleState> {
  const { supabase } = await requireAdmin("/admin/products");
  const id = str(formData, "productId");
  if (!isUuid(id)) return { status: "error", message: "Product not found." };

  const { data: current } = await supabase
    .from("products")
    .select("image_url")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error)
    return {
      status: "error",
      message:
        error.code === "23503"
          ? "This product is part of past orders, so it can't be deleted. Set its stock to 0 instead."
          : GENERIC,
    };

  await removeImage(supabase, current?.image_url ?? null);
  refresh();
  return { status: "success", message: "Product deleted." };
}

export async function updateStock(
  _prev: SimpleState,
  formData: FormData
): Promise<SimpleState> {
  const { supabase } = await requireAdmin("/admin/inventory");
  const id = str(formData, "productId");
  const raw = str(formData, "stock");
  const stock = Number(raw);
  if (!isUuid(id)) return { status: "error", message: "Product not found." };
  if (raw === "" || !Number.isInteger(stock) || stock < 0 || stock > 1_000_000)
    return { status: "error", message: "Enter a whole number, 0 or more." };

  const { data, error } = await supabase
    .from("products")
    .update({ stock })
    .eq("id", id)
    .select("id");
  if (error || !data?.length) return { status: "error", message: GENERIC };

  refresh();
  return { status: "success", message: "Saved." };
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

function readCategory(formData: FormData): CategoryValues {
  return {
    name: str(formData, "name"),
    slug: str(formData, "slug"),
    description: str(formData, "description"),
  };
}

export async function createCategory(
  _prev: CategoryState,
  formData: FormData
): Promise<CategoryState> {
  const { supabase } = await requireAdmin("/admin/categories");
  const values = readCategory(formData);
  const { errors, clean } = validateCategory(values);
  if (Object.keys(errors).length > 0)
    return { status: "error", fieldErrors: errors, values };

  const { error } = await supabase.from("categories").insert(clean);
  if (error)
    return error.code === "23505"
      ? { status: "error", values, fieldErrors: { name: "That name or slug already exists." } }
      : { status: "error", values, message: GENERIC };

  refresh();
  return { status: "success", message: "Category created." };
}

export async function updateCategory(
  _prev: CategoryState,
  formData: FormData
): Promise<CategoryState> {
  const { supabase } = await requireAdmin("/admin/categories");
  const id = str(formData, "categoryId");
  if (!isUuid(id)) return { status: "error", message: "Category not found." };
  const values = readCategory(formData);
  const { errors, clean } = validateCategory(values);
  if (Object.keys(errors).length > 0)
    return { status: "error", fieldErrors: errors, values };

  const { error } = await supabase.from("categories").update(clean).eq("id", id);
  if (error)
    return error.code === "23505"
      ? { status: "error", values, fieldErrors: { name: "That name or slug already exists." } }
      : { status: "error", values, message: GENERIC };

  refresh();
  return { status: "success", values, message: "Saved." };
}

export async function deleteCategory(
  _prev: SimpleState,
  formData: FormData
): Promise<SimpleState> {
  const { supabase } = await requireAdmin("/admin/categories");
  const id = str(formData, "categoryId");
  if (!isUuid(id)) return { status: "error", message: "Category not found." };

  // Products in this category keep existing (category_id is set to null by the FK).
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return { status: "error", message: GENERIC };

  refresh();
  return { status: "success", message: "Category deleted." };
}

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

const STATUSES: OrderStatus[] = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];

const ORDER_ERRORS: Record<string, string> = {
  order_closed: "This order is cancelled or refunded and can't be changed.",
  invalid_transition: "That status change isn't allowed from the current status.",
  order_not_found: "Order not found.",
  invalid_status: "Choose a valid status.",
};

export async function setOrderStatus(
  _prev: SimpleState,
  formData: FormData
): Promise<SimpleState> {
  const id = str(formData, "orderId");
  const status = str(formData, "status") as OrderStatus;
  const { supabase } = await requireAdmin(`/admin/orders/${id}`);
  if (!isUuid(id) || !STATUSES.includes(status))
    return { status: "error", message: "Choose a valid status." };

  // Validation, locking and restock-on-cancel happen in the database function.
  const { error } = await supabase.rpc("admin_set_order_status", {
    p_order: id,
    p_status: status,
  });
  if (error)
    return { status: "error", message: ORDER_ERRORS[error.message] ?? GENERIC };

  refresh();
  return { status: "success", message: "Order status updated." };
}
