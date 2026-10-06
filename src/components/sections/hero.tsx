import Link from "next/link";
import Image from "next/image";
import { HeroItem, HeroMotion } from "@/components/motion/hero-motion";
import { Eyebrow } from "@/components/ui/eyebrow";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-cream">
      <div aria-hidden className="absolute inset-0">
        <Image
          src="/bg.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[75%_center]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--cream)_0%,var(--cream)_28%,color-mix(in_srgb,var(--cream)_80%,transparent)_40%,color-mix(in_srgb,var(--cream)_35%,transparent)_52%,transparent_68%)] max-md:bg-[linear-gradient(to_right,color-mix(in_srgb,var(--cream)_92%,transparent),color-mix(in_srgb,var(--cream)_60%,transparent))]" />
      </div>
      <HeroMotion className="relative mx-auto flex min-h-[560px] w-full max-w-6xl items-center px-5 pt-12 pb-16 sm:px-8 md:min-h-[640px] md:pt-16 md:pb-24">
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

      </HeroMotion>
      <a
        href="#benefits"
        className="absolute bottom-8 left-1/2 hidden w-full max-w-6xl -translate-x-1/2 items-center gap-3 px-8 text-[0.65rem] tracking-[0.25em] text-forest/60 uppercase md:flex"
      >
        <span aria-hidden className="flex h-9 w-5 justify-center rounded-full border border-forest/50 pt-1.5">
          <span className="h-1.5 w-px rounded-full bg-forest/60" />
        </span>
        Scroll
      </a>
    </section>
  );
}
