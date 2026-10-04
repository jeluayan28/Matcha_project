"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/account", label: "Profile" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/settings", label: "Settings" },
];

export function AccountNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Account" className="mt-8 flex gap-2 overflow-x-auto pb-1">
      {TABS.map((tab) => {
        const active =
          tab.href === "/account"
            ? pathname === "/account"
            : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={`inline-flex h-11 shrink-0 items-center rounded-full border px-5 text-sm transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none ${
              active
                ? "border-forest bg-forest text-cream"
                : "border-forest/20 text-forest hover:bg-sage/70"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
