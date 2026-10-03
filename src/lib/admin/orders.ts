import type { OrderStatus } from "@/types/database";

export const ALL_STATUSES: OrderStatus[] = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];

const FLOW: OrderStatus[] = ["pending", "paid", "processing", "shipped", "delivered"];

// Mirrors admin_set_order_status() in the database, which is the real enforcement.
// This only decides which options to offer.
export function nextStatuses(current: OrderStatus): OrderStatus[] {
  if (current === "cancelled" || current === "refunded") return [];
  const options: OrderStatus[] = FLOW.slice(FLOW.indexOf(current) + 1);
  if (current !== "shipped" && current !== "delivered") options.push("cancelled");
  if (current !== "pending") options.push("refunded");
  return options;
}
