import Link from "next/link";

const COLUMNS = [
  {
    title: "Shop",
    links: [
      { href: "/#featured", label: "Featured matcha" },
      { href: "/#why-matcha", label: "Why matcha" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/#story", label: "Our story" },
      { href: "/#newsletter", label: "Newsletter" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/login", label: "Sign in" },
      { href: "/register", label: "Create account" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-forest text-cream">
      <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 md:py-20">
        <div className="grid gap-12 md:grid-cols-[1.4fr_2fr]">
          <div className="max-w-xs">
            <p className="font-heading text-3xl font-semibold tracking-[0.08em]">
              matchelli
            </p>
            <p className="mt-3 text-sm leading-relaxed text-cream/70">
              Premium Japanese matcha for slow mornings and mindful afternoons.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {COLUMNS.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <h2 className="font-sans text-xs font-medium tracking-[0.22em] text-gold uppercase">
                  {col.title}
                </h2>
                <ul className="mt-3">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="inline-block py-3 text-sm text-cream/70 transition-colors hover:text-gold"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>
        <p className="mt-14 border-t border-cream/15 pt-6 text-xs tracking-wide text-cream/55">
          © {new Date().getFullYear()} matchelli. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
