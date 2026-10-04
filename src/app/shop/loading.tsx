import { SiteHeader } from "@/components/layout/site-header";

export default function ShopLoading() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-cream" aria-busy="true">
        <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 md:py-20">
          <h1 className="text-5xl font-medium text-forest sm:text-6xl">Shop matcha</h1>
          <p className="sr-only" role="status">
            Loading products
          </p>
          <div className="skeleton mt-10 h-11 w-full max-w-md rounded-full bg-sage" />
          <ul className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-14 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <li key={i} className="space-y-4">
                <div className="skeleton aspect-[4/5] rounded-2xl bg-sage" />
                <div className="skeleton h-6 w-2/3 rounded-full bg-sage" />
                <div className="skeleton h-4 w-full rounded-full bg-sage/70" />
              </li>
            ))}
          </ul>
        </div>
      </main>
    </>
  );
}
