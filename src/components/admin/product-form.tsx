"use client";

import Link from "next/link";
import { useActionState } from "react";
import { createProduct, updateProduct, type ProductState } from "@/app/actions/admin";
import { Field, FormAlert } from "@/components/auth/form-parts";
import { adminButton, adminButtonOutline } from "@/components/admin/ui";
import type { ProductValues } from "@/lib/admin/validation";

export type ProductFormProps = {
  productId?: string;
  categories: { id: string; name: string }[];
  imageUrl?: string | null;
  initial: ProductValues;
};

const control =
  "w-full rounded-2xl border border-input bg-cream/60 px-4 py-3 text-base text-forest outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function ProductForm({ productId, categories, imageUrl, initial }: ProductFormProps) {
  const [state, action, pending] = useActionState<ProductState, FormData>(
    productId ? updateProduct : createProduct,
    {}
  );
  const v = state.values ?? initial;
  const e = state.fieldErrors ?? {};

  return (
    <form action={action} className="max-w-2xl space-y-5" noValidate>
      {productId && <input type="hidden" name="productId" value={productId} />}
      {state.error && <FormAlert variant="error">{state.error}</FormAlert>}

      <Field label="Name" name="name" required defaultValue={v.name} error={e.name} />
      <Field
        label="URL slug (optional — generated from the name)"
        name="slug"
        defaultValue={v.slug}
        error={e.slug}
      />

      <div className="space-y-1.5">
        <label htmlFor="description" className="block text-sm font-medium text-forest">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={5}
          defaultValue={v.description}
          aria-invalid={e.description ? true : undefined}
          className={control}
        />
        {e.description && <p className="text-sm text-destructive">{e.description}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Price (USD)" name="price" type="number" inputMode="decimal" step="0.01" min="0" required defaultValue={v.price} error={e.price} />
        <Field label="Stock" name="stock" type="number" inputMode="numeric" step="1" min="0" required defaultValue={v.stock} error={e.stock} />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="categoryId" className="block text-sm font-medium text-forest">
          Category
        </label>
        <select id="categoryId" name="categoryId" defaultValue={v.categoryId} className={control}>
          <option value="">No category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {e.categoryId && <p className="text-sm text-destructive">{e.categoryId}</p>}
      </div>

      <label className="flex items-center gap-3 text-sm text-forest">
        <input type="checkbox" name="isFeatured" defaultChecked={v.isFeatured} className="size-4 accent-[var(--forest)]" />
        Featured product
      </label>

      <div className="space-y-2">
        <label htmlFor="image" className="block text-sm font-medium text-forest">
          Product image
        </label>
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- admin preview of a Storage URL
          <img src={imageUrl} alt="Current product" className="size-32 rounded-2xl bg-sage/40 object-cover" />
        )}
        <input
          id="image"
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          aria-invalid={e.image ? true : undefined}
          className="block w-full text-sm text-forest file:mr-4 file:rounded-full file:border-0 file:bg-sage/50 file:px-5 file:py-2 file:text-sm file:font-medium file:text-forest"
        />
        <p className="text-xs text-forest/60">JPG, PNG, WebP or AVIF, up to 5 MB.</p>
        {e.image && <p className="text-sm text-destructive">{e.image}</p>}
        {imageUrl && (
          <label className="flex items-center gap-2 text-sm text-forest/80">
            <input type="checkbox" name="removeImage" className="size-4 accent-[var(--forest)]" />
            Remove current image
          </label>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={pending} className={adminButton}>
          {pending ? "Saving…" : productId ? "Save changes" : "Create product"}
        </button>
        <Link href="/admin/products" className={adminButtonOutline}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
