import Link from "next/link";
import { HeroArch, HeroItem, HeroMotion } from "@/components/motion/hero-motion";
import { Eyebrow } from "@/components/ui/eyebrow";
import { HeroVisual } from "./hero-visual";

export function Hero() {
  return (
    <section className="bg-cream">
      <HeroMotion className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 pt-12 pb-16 sm:px-8 md:grid-cols-[1.1fr_0.9fr] md:gap-10 md:pt-16 md:pb-24 lg:gap-16">
        <div className="max-w-xl">
          <HeroItem>
            <Eyebrow>Pure · Natural · Mindful</Eyebrow>
          </HeroItem>
          <HeroItem>
            <h1 className="mt-6 text-6xl leading-[0.95] font-medium tracking-tight text-forest sm:text-7xl lg:text-8xl">
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
              className="group mt-10 inline-flex h-13 items-center justify-center gap-2 rounded-full bg-matcha px-9 text-base font-medium tracking-wide text-white transition-colors hover:bg-forest focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              Shop Matcha
              <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </HeroItem>
        </div>

        <HeroArch className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-t-full bg-sage md:max-w-none">
          <HeroVisual />
        </HeroArch>
      </HeroMotion>
    </section>
  );
}
