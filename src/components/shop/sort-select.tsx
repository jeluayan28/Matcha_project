"use client";

import { SORT_OPTIONS, type SortValue } from "@/lib/shop/params";

// Submits the surrounding GET form on change; the form still works without JS.
export function SortSelect({ value }: { value: SortValue }) {
  return (
    <select
      id="shop-sort"
      name="sort"
      defaultValue={value}
      onChange={(e) => e.currentTarget.form?.requestSubmit()}
      className="h-11 rounded-full border border-forest/20 bg-card px-4 text-base text-forest sm:text-sm focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      {SORT_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
