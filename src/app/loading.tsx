import { Leaf } from "lucide-react";

export default function Loading() {
  return (
    <main className="flex flex-1 items-center justify-center bg-cream" aria-busy="true">
      <p className="sr-only" role="status">
        Loading
      </p>
      <Leaf className="size-8 animate-pulse text-matcha/60" strokeWidth={1.25} aria-hidden />
    </main>
  );
}
