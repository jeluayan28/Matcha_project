"use client";

import { useActionState } from "react";
import {
  createCategory,
  deleteCategory,
  deleteProduct,
  setOrderStatus,
  updateCategory,
  updateStock,
  type CategoryState,
  type SimpleState,
} from "@/app/actions/admin";
import { Field } from "@/components/auth/form-parts";
import { adminButton } from "@/components/admin/ui";
import { STATUS_LABEL } from "@/lib/account/status";
import type { OrderStatus } from "@/types/database";

const msg = (s: { status?: string; message?: string }) =>
  s.message && (
    <p
      role={s.status === "error" ? "alert" : "status"}
      className={`mt-1 text-xs ${s.status === "error" ? "text-destructive" : "text-forest/70"}`}
    >
      {s.message}
    </p>
  );

export function DeleteButton({
  kind,
  id,
  label,
}: {
  kind: "product" | "category";
  id: string;
  label: string;
}) {
  const [state, action, pending] = useActionState<SimpleState, FormData>(
    kind === "product" ? deleteProduct : deleteCategory,
    {}
  );
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(`Delete “${label}”? This can't be undone.`)) e.preventDefault();
      }}
    >
      <input type="hidden" name={kind === "product" ? "productId" : "categoryId"} value={id} />
      <button
        type="submit"
        disabled={pending}
        className="text-sm text-destructive underline underline-offset-4 disabled:opacity-50"
      >
        {pending ? "Deleting…" : "Delete"}
      </button>
      {state.status === "error" && msg(state)}
    </form>
  );
}

export function StockForm({ productId, stock, name }: { productId: string; stock: number; name: string }) {
  const [state, action, pending] = useActionState<SimpleState, FormData>(updateStock, {});
  return (
    <form action={action}>
      <input type="hidden" name="productId" value={productId} />
      <div className="flex items-center gap-2">
        <label htmlFor={`stock-${productId}`} className="sr-only">
          Stock for {name}
        </label>
        <input
          id={`stock-${productId}`}
          name="stock"
          type="number"
          min={0}
          step={1}
          defaultValue={stock}
          className="h-10 w-24 rounded-xl border border-input bg-cream/60 px-3 text-forest outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        <button type="submit" disabled={pending} className={`${adminButton} h-10 px-5`}>
          {pending ? "Saving…" : "Save"}
        </button>
      </div>
      {msg(state)}
    </form>
  );
}

export function CategoryCreateForm() {
  const [state, action, pending] = useActionState<CategoryState, FormData>(createCategory, {});
  const e = state.fieldErrors ?? {};
  return (
    // Remount on success to clear the fields.
    <form key={state.status === "success" ? "ok" : "form"} action={action} className="grid gap-4 sm:grid-cols-2" noValidate>
      <Field label="Name" name="name" required defaultValue={state.values?.name} error={e.name} />
      <Field label="Slug (optional)" name="slug" defaultValue={state.values?.slug} error={e.slug} />
      <div className="sm:col-span-2">
        <Field label="Description (optional)" name="description" defaultValue={state.values?.description} error={e.description} />
      </div>
      <div className="sm:col-span-2">
        <button type="submit" disabled={pending} className={adminButton}>
          {pending ? "Creating…" : "Add category"}
        </button>
        {msg(state)}
      </div>
    </form>
  );
}

export function CategoryEditForm({
  id,
  name,
  slug,
  description,
}: {
  id: string;
  name: string;
  slug: string;
  description: string;
}) {
  const [state, action, pending] = useActionState<CategoryState, FormData>(updateCategory, {});
  const v = state.values ?? { name, slug, description };
  const e = state.fieldErrors ?? {};
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2" noValidate>
      <input type="hidden" name="categoryId" value={id} />
      <Field label="Name" name={`name`} id={`name-${id}`} required defaultValue={v.name} error={e.name} />
      <Field label="Slug" name="slug" id={`slug-${id}`} defaultValue={v.slug} error={e.slug} />
      <div className="sm:col-span-2">
        <Field label="Description" name="description" id={`desc-${id}`} defaultValue={v.description} error={e.description} />
      </div>
      <div className="sm:col-span-2">
        <button type="submit" disabled={pending} className={adminButton}>
          {pending ? "Saving…" : "Save changes"}
        </button>
        {msg(state)}
      </div>
    </form>
  );
}

export function OrderStatusForm({
  orderId,
  current,
  options,
}: {
  orderId: string;
  current: OrderStatus;
  options: OrderStatus[];
}) {
  const [state, action, pending] = useActionState<SimpleState, FormData>(setOrderStatus, {});
  if (options.length === 0)
    return (
      <p className="text-sm text-forest/70">
        This order is {STATUS_LABEL[current].toLowerCase()} and can&apos;t be changed.
      </p>
    );
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="orderId" value={orderId} />
      <label htmlFor="status" className="block text-sm font-medium text-forest">
        Change status
      </label>
      <select
        id="status"
        name="status"
        defaultValue={options[0]}
        className="h-11 w-full rounded-2xl border border-input bg-cream/60 px-4 text-forest outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {STATUS_LABEL[o]}
          </option>
        ))}
      </select>
      <button type="submit" disabled={pending} className={adminButton}>
        {pending ? "Updating…" : "Update status"}
      </button>
      {msg(state)}
      <p className="text-xs text-forest/60">
        Cancelling returns the items to stock. Cancelled and refunded orders are final.
      </p>
    </form>
  );
}
