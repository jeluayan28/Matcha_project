import Link from "next/link";
import { HeroArch, HeroItem, HeroMotion } from "@/components/motion/hero-motion";
import { HeroVisual } from "./hero-visual";

export function Hero() {
  return (
    <section className="bg-cream">
      <HeroMotion className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 pt-12 pb-16 sm:px-8 md:grid-cols-[1.1fr_0.9fr] md:gap-10 md:pt-16 md:pb-24 lg:gap-16">
        <div className="max-w-xl">
          <HeroItem>
            <p className="text-xs font-medium tracking-[0.28em] text-forest/70 sm:text-sm">
              PURE • NATURAL • MINDFUL
            </p>
          </HeroItem>
          <HeroItem>
            <h1 className="mt-5 text-6xl leading-[0.95] font-medium tracking-tight text-forest sm:text-7xl lg:text-8xl">
              Good Things Brew Here
            </h1>
          </HeroItem>
          <HeroItem>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-forest/75">
              Discover the calm and clarity of premium Japanese matcha. Crafted
              for your daily rituals.
            </p>
          </HeroItem>
          <HeroItem>
            <Link
              href="#featured"
              className="mt-9 inline-flex h-13 items-center justify-center rounded-full bg-matcha px-9 text-base font-medium text-forest transition-colors hover:bg-matcha/85 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              Shop Matcha →
            </Link>
          </HeroItem>
        </div>

        <HeroArch className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-t-full bg-sage/60 md:max-w-none">
          <HeroVisual />
        </HeroArch>
      </HeroMotion>
    </section>
  );
}
