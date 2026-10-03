"use client";

import { useActionState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { clearCart, updateCartLine } from "@/app/actions/cart";

export function CartLineControls({
  itemId,
  quantity,
  stock,
  name,
}: {
  itemId: string;
  quantity: number;
  stock: number;
  name: string;
}) {
  const [state, action, pending] = useActionState(updateCartLine, {});
  const unavailable = stock < 1;
  const short = !unavailable && quantity > stock;
  const step =
    "flex size-10 items-center justify-center rounded-full text-forest hover:bg-sage/30 disabled:opacity-40";

  return (
    <form action={action} aria-busy={pending}>
      <input type="hidden" name="itemId" value={itemId} />
      {(unavailable || short) && (
        <div className="mb-3">
          <p role="alert" className="text-sm text-destructive">
            {unavailable
              ? "This product is currently unavailable."
              : `Only ${stock} in stock — you have ${quantity} in your cart.`}
          </p>
          <button
            type="submit"
            name="intent"
            value="fix"
            disabled={pending}
            className="mt-1 text-sm font-medium text-forest underline underline-offset-4 disabled:opacity-50"
          >
            {unavailable ? "Remove from cart" : `Update to ${stock}`}
          </button>
        </div>
      )}
      <div className="flex items-center gap-3">
        {!unavailable && (
          <div
            role="group"
            aria-label={`Quantity of ${name}`}
            className="inline-flex h-10 items-center rounded-full border border-forest/20 bg-card"
          >
            <button
              type="submit"
              name="intent"
              value="dec"
              aria-label={`Decrease quantity of ${name}`}
              disabled={pending || quantity <= 1}
              className={step}
            >
              <Minus className="size-4" aria-hidden />
            </button>
            <span
              aria-live="polite"
              className="w-8 text-center text-sm font-medium text-forest"
            >
              {quantity}
            </span>
            <button
              type="submit"
              name="intent"
              value="inc"
              aria-label={`Increase quantity of ${name}`}
              disabled={pending || quantity >= stock}
              className={step}
            >
              <Plus className="size-4" aria-hidden />
            </button>
          </div>
        )}
        <button
          type="submit"
          name="intent"
          value="remove"
          disabled={pending}
          className="inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-sm text-forest/70 hover:bg-sage/30 hover:text-forest disabled:opacity-50"
        >
          <Trash2 className="size-4" aria-hidden />
          Remove
        </button>
      </div>
      {state.status === "error" && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {state.message}
        </p>
      )}
      {state.status === "success" && (
        <p role="status" className="mt-2 text-sm text-forest/70">
          {state.message}
        </p>
      )}
    </form>
  );
}

export function ClearCartButton() {
  const [state, action, pending] = useActionState(clearCart, {});
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm("Remove everything from your cart?")) e.preventDefault();
      }}
    >
      <button
        type="submit"
        disabled={pending}
        className="text-sm text-forest/70 underline underline-offset-4 hover:text-forest disabled:opacity-50"
      >
        {pending ? "Clearing…" : "Clear cart"}
      </button>
      {state.status === "error" && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {state.message}
        </p>
      )}
    </form>
  );
}
