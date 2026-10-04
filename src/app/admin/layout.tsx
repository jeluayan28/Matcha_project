import Link from "next/link";
import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdmin } from "@/lib/auth/admin";

// First line of defence for the whole /admin tree. Layouts don't re-run on client-side
// navigation, so every page and server action ALSO calls requireAdmin().
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin("/admin");
  return (
    <div className="flex min-h-full flex-1 flex-col bg-cream">
      <header className="border-b border-border bg-cream">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/admin" className="font-heading text-2xl font-semibold tracking-[0.04em] text-forest">
            mori <span className="text-sm font-normal tracking-normal text-forest/60">admin</span>
          </Link>
          <Link href="/" className="inline-flex h-11 items-center text-sm text-forest/70 hover:text-forest">
            View store →
          </Link>
        </div>
      </header>
      <div className="mx-auto grid w-full max-w-7xl flex-1 gap-6 px-5 py-6 sm:px-8 sm:py-8 lg:gap-8 lg:grid-cols-[13rem_1fr]">
        <aside className="lg:sticky lg:top-6 lg:h-fit">
          <AdminNav />
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
