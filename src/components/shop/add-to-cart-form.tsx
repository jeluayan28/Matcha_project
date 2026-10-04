"use client";

import { useActionState, useState } from "react";
import { Check, Minus, Plus, ShoppingBag } from "lucide-react";
import { addToCart, type CartState } from "@/app/actions/cart";

const pill =
  "inline-flex items-center justify-center gap-2 rounded-full bg-matcha font-medium text-white transition-colors hover:bg-forest focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-matcha";

// Quieter button for product grids: fills in on hover so a row of cards stays calm.
const outline =
  "inline-flex items-center justify-center gap-2 rounded-full border border-forest/30 bg-transparent font-medium text-forest transition-colors hover:border-matcha hover:bg-matcha hover:text-white focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-forest/30 disabled:hover:bg-transparent disabled:hover:text-forest";

function Feedback({ state }: { state: CartState }) {
  return (
    <p
      role="status"
      className={`min-h-5 text-sm ${
        state.status === "error" ? "text-destructive" : "text-forest/70"
      }`}
    >
      {state.status === "success" && (
        <Check className="mr-1 inline size-4 text-matcha" aria-hidden />
      )}
      {state.message}
    </p>
  );
}

// Compact button for product cards (quantity 1).
export function AddToCartButton({
  productId,
  soldOut,
  next,
}: {
  productId: string;
  soldOut: boolean;
  next: string;
}) {
  const [state, action, pending] = useActionState(addToCart, {});
  return (
    <form action={action} className="mt-3 sm:mt-4">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="quantity" value="1" />
      <input type="hidden" name="next" value={next} />
      <button
        type="submit"
        disabled={soldOut || pending}
        className={`${outline} h-11 w-full px-2 text-sm`}
      >
        <ShoppingBag className="size-4" aria-hidden />
        {soldOut ? "Sold out" : pending ? "Adding…" : "Add to cart"}
      </button>
      <Feedback state={state} />
    </form>
  );
}

// Detail-page form with a quantity selector capped at available stock.
export function AddToCartForm({
  productId,
  stock,
  next,
}: {
  productId: string;
  stock: number;
  next: string;
}) {
  const [state, action, pending] = useActionState(addToCart, {});
  const [qty, setQty] = useState(1);
  const soldOut = stock < 1;
  const clamp = (n: number) => Math.min(Math.max(n, 1), Math.max(stock, 1));

  return (
    <form action={action} className="mt-8">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="next" value={next} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div
          role="group"
          aria-label="Quantity"
          className="inline-flex h-12 w-fit items-center rounded-full border border-forest/20 bg-card"
        >
          <button
            type="button"
            aria-label="Decrease quantity"
            disabled={soldOut || qty <= 1}
            onClick={() => setQty((q) => clamp(q - 1))}
            className="flex size-12 items-center justify-center rounded-full text-forest hover:bg-sage/70 disabled:opacity-40"
          >
            <Minus className="size-4" aria-hidden />
          </button>
          <input
            name="quantity"
            type="number"
            inputMode="numeric"
            min={1}
            max={Math.max(stock, 1)}
            value={qty}
            disabled={soldOut}
            aria-label="Quantity"
            onChange={(e) => setQty(clamp(Math.trunc(Number(e.target.value)) || 1))}
            className="h-12 w-12 [appearance:textfield] bg-transparent text-center text-base font-medium text-forest outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <button
            type="button"
            aria-label="Increase quantity"
            disabled={soldOut || qty >= stock}
            onClick={() => setQty((q) => clamp(q + 1))}
            className="flex size-12 items-center justify-center rounded-full text-forest hover:bg-sage/70 disabled:opacity-40"
          >
            <Plus className="size-4" aria-hidden />
          </button>
        </div>
        <button
          type="submit"
          disabled={soldOut || pending}
          className={`${pill} h-12 w-full px-8 text-base sm:w-auto`}
        >
          <ShoppingBag className="size-5" aria-hidden />
          {soldOut ? "Sold out" : pending ? "Adding…" : "Add to cart"}
        </button>
      </div>
      <div className="mt-3">
        <Feedback state={state} />
      </div>
    </form>
  );
}
