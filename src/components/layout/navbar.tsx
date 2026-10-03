"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
  "relative inline-flex size-10 items-center justify-center rounded-full text-forest transition-colors hover:bg-sage/30 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none";

export function Navbar({
  signedIn,
  cartCount,
}: {
  signedIn: boolean;
  cartCount: number;
}) {
  const router = useRouter();
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
      className={`sticky top-0 z-40 border-b transition-[background-color,border-color,box-shadow] duration-300 ${
        scrolled
          ? "border-border/70 bg-cream/90 shadow-sm shadow-forest/5 backdrop-blur"
          : "border-transparent bg-cream"
      }`}
    >
      <div className="mx-auto grid h-16 w-full max-w-6xl grid-cols-[1fr_auto_1fr] items-center px-5 sm:px-8">
        <Link
          href="/"
          className="justify-self-start font-heading text-3xl leading-none font-semibold tracking-[0.04em] text-forest"
        >
          mori
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-9 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm text-forest/75 transition-colors hover:text-forest"
            >
              {item.label}
            </Link>
          ))}
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
                className="absolute top-0.5 right-0 flex min-w-4.5 items-center justify-center rounded-full bg-matcha px-1 text-[0.65rem] leading-[1.15rem] font-semibold text-forest"
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
            <SheetContent side="right" className="bg-cream px-6 pt-16">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <nav aria-label="Mobile" className="flex flex-col">
                {NAV.map((item) => (
                  <SheetClose
                    key={item.label}
                    render={
                      <Link
                        href={item.href}
                        className="border-b border-border/70 py-4 font-heading text-3xl text-forest"
                      />
                    }
                  >
                    {item.label}
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
              className="h-10 min-w-0 flex-1 bg-transparent font-heading text-2xl text-forest outline-none placeholder:text-forest/40"
            />
            <button
              type="submit"
              className="h-10 rounded-full bg-matcha px-6 text-sm font-medium text-forest transition-colors hover:bg-matcha/85"
            >
              Search
            </button>
          </form>
        </div>
      )}
    </header>
  );
}
