export const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name-asc", label: "Name: A to Z" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

export type ShopParams = {
  q: string;
  category: string;
  sort: SortValue;
  featured: boolean;
};

type RawParams = { [key: string]: string | string[] | undefined };

function first(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export function parseShopParams(raw: RawParams): ShopParams {
  const sort = first(raw.sort);
  return {
    q: first(raw.q).trim().slice(0, 80),
    category: first(raw.category).trim().slice(0, 80),
    sort: SORT_OPTIONS.some((o) => o.value === sort)
      ? (sort as SortValue)
      : "featured",
    featured: first(raw.featured) === "1",
  };
}
