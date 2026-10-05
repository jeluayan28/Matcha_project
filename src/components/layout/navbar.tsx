"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, Search, ShoppingBag, User } from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/#story", label: "About" },
  { href: "/journal", label: "Journal" },
];

const iconButton =
  "relative inline-flex size-11 items-center justify-center rounded-full text-forest transition-colors hover:bg-sage/70 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none";

// Home matches exactly; hash links (About) never count as the current page.
function isActive(pathname: string, href: string) {
  if (href.includes("#")) return false;
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function Navbar({
  signedIn,
  cartCount,
}: {
  signedIn: boolean;
  cartCount: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  const account = signedIn
    ? { href: "/account", label: "Account" }
    : { href: "/login", label: "Sign in" };
  const cartLabel =
    cartCount > 0
      ? `Cart, ${cartCount} ${cartCount === 1 ? "item" : "items"}`
      : "Cart, empty";
  const badge = cartCount > 99 ? "99+" : String(cartCount);

  function onSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = inputRef.current?.value.trim();
    if (!query) return;
    setSearchOpen(false);
    router.push(`/shop?q=${encodeURIComponent(query)}`);
  }

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-[background-color,border-color] duration-300 ${
        scrolled
          ? "border-border bg-cream/90 backdrop-blur"
          : "border-transparent bg-cream"
      }`}
    >
      <div className="mx-auto grid h-16 w-full max-w-6xl grid-cols-[1fr_auto_1fr] items-center px-5 sm:px-8">
        <Link
          href="/"
          className="-ml-1 justify-self-start px-1 py-3 font-heading text-3xl leading-none font-semibold tracking-[0.08em] text-forest"
        >
          matchelli
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-9 md:flex">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`relative py-3 text-sm tracking-wide transition-colors after:absolute after:inset-x-0 after:bottom-2 after:h-px after:origin-left after:bg-gold after:transition-transform after:duration-300 ${
                  active
                    ? "text-forest after:scale-x-100"
                    : "text-forest/70 after:scale-x-0 hover:text-forest hover:after:scale-x-100"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="col-start-3 flex items-center gap-1 justify-self-end">
          <button
            type="button"
            aria-label={searchOpen ? "Close search" : "Search"}
            aria-expanded={searchOpen}
            aria-controls="site-search"
            onClick={() => setSearchOpen((open) => !open)}
            className={iconButton}
          >
            <Search className="size-5" strokeWidth={1.6} />
          </button>
          <Link
            href={account.href}
            aria-label={account.label}
            className={`${iconButton} hidden md:inline-flex`}
          >
            <User className="size-5" strokeWidth={1.6} />
          </Link>
          <Link href="/cart" aria-label={cartLabel} className={iconButton}>
            <ShoppingBag className="size-5" strokeWidth={1.6} />
            {cartCount > 0 && (
              <span
                aria-hidden
                className="absolute top-0.5 right-0 flex min-w-4.5 items-center justify-center rounded-full bg-gold px-1 text-[0.65rem] leading-[1.15rem] font-semibold text-forest"
              >
                {badge}
              </span>
            )}
          </Link>

          <Sheet>
            <SheetTrigger
              aria-label="Open menu"
              className={`${iconButton} md:hidden`}
            >
              <Menu className="size-5" strokeWidth={1.6} />
            </SheetTrigger>
            <SheetContent side="right" className="bg-cream px-7 pt-20">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <nav aria-label="Mobile" className="flex flex-col">
                {NAV.map((item) => (
                  <SheetClose
                    key={item.label}
                    render={
                      <Link
                        href={item.href}
                        aria-current={isActive(pathname, item.href) ? "page" : undefined}
                        className="flex items-center justify-between border-b border-border py-5 font-heading text-3xl text-forest transition-colors hover:text-matcha aria-[current=page]:text-matcha"
                      />
                    }
                  >
                    {item.label}
                    <span aria-hidden className="text-lg text-gold">
                      →
                    </span>
                  </SheetClose>
                ))}
                <SheetClose
                  render={
                    <Link
                      href={account.href}
                      className="flex items-center gap-3 py-5 text-base text-forest"
                    />
                  }
                >
                  <User className="size-5" strokeWidth={1.6} aria-hidden />
                  {account.label}
                </SheetClose>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {searchOpen && (
        <div id="site-search" className="border-t border-border/70 bg-cream">
          <form
            role="search"
            onSubmit={onSearch}
            className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-5 sm:px-8"
          >
            <Search
              className="size-5 shrink-0 text-forest/60"
              strokeWidth={1.6}
              aria-hidden
            />
            <label htmlFor="site-search-input" className="sr-only">
              Search matcha
            </label>
            <input
              id="site-search-input"
              ref={inputRef}
              type="search"
              placeholder="Search matcha"
              autoComplete="off"
              onKeyDown={(event) => {
                if (event.key === "Escape") setSearchOpen(false);
              }}
              className="h-11 min-w-0 flex-1 bg-transparent font-heading text-2xl text-forest outline-none placeholder:text-forest/40"
            />
            <button
              type="submit"
              className="h-11 rounded-full bg-matcha px-6 text-sm font-medium text-white transition-colors hover:bg-forest"
            >
              Search
            </button>
          </form>
        </div>
      )}
    </header>
  );
}
