import { AccountNav } from "@/components/account/account-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

// Auth is enforced in each page (requireUser): layouts don't re-render on client navigation.
export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-cream">
        <div className="mx-auto w-full max-w-4xl px-5 py-14 sm:px-8 md:py-20">
          <h1 className="text-5xl font-medium text-forest sm:text-6xl">My account</h1>
          <AccountNav />
          <div className="mt-10">{children}</div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
