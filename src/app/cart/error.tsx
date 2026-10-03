"use client";

export default function CartError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex-1 bg-cream">
      <div className="mx-auto w-full max-w-6xl px-5 py-24 sm:px-8">
        <h1 className="text-5xl font-medium text-forest">Something went wrong</h1>
        <p className="mt-4 max-w-md text-forest/70">
          We couldn&apos;t show your cart. Your items are safe — please try again.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-8 inline-flex h-11 items-center rounded-full bg-matcha px-7 text-sm font-medium text-forest hover:bg-matcha/85"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
