import type { OrderStatus } from "@/types/database";

export const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Pending",
  paid: "Paid",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export const STATUS_TONE: Record<OrderStatus, string> = {
  pending: "bg-cream text-forest ring-1 ring-forest/20",
  paid: "bg-sage text-forest",
  processing: "bg-sage text-forest",
  shipped: "bg-matcha/40 text-forest",
  delivered: "bg-matcha text-white",
  cancelled: "bg-destructive/10 text-destructive",
  refunded: "bg-destructive/10 text-destructive",
};

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function orderNumber(id: string) {
  return `#${id.slice(0, 8).toUpperCase()}`;
}
