export default function CartLoading() {
  return (
    <main className="flex-1 bg-cream" aria-busy="true">
      <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 md:py-20">
        <h1 className="text-5xl font-medium text-forest sm:text-6xl">Your cart</h1>
        <p className="sr-only" role="status">
          Loading your cart
        </p>
        <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_22rem]">
          <div className="divide-y divide-border border-y border-border">
            {[0, 1].map((i) => (
              <div key={i} className="flex gap-5 py-6">
                <div className="skeleton size-24 rounded-2xl bg-sage sm:size-32" />
                <div className="flex-1 space-y-3">
                  <div className="skeleton h-6 w-2/3 rounded-full bg-sage" />
                  <div className="skeleton h-4 w-1/4 rounded-full bg-sage/70" />
                  <div className="skeleton h-10 w-40 rounded-full bg-sage/70" />
                </div>
              </div>
            ))}
          </div>
          <div className="skeleton h-56 rounded-3xl bg-sage/70" />
        </div>
      </div>
    </main>
  );
}
