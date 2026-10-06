import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { Eyebrow } from "@/components/ui/eyebrow";

export function WhyMatcha() {
  return (
    <section id="why-matcha" className="scroll-mt-16 bg-sage">
      <div className="grid lg:grid-cols-2">
        {/* Photo slot: leave blank for now. To fill it, add
            <Image src="/why-matcha.jpg" alt="..." fill sizes="50vw" className="object-cover" />
            inside this div. */}
        <div
          aria-hidden
          className="relative min-h-72 bg-forest/10 sm:min-h-96 lg:min-h-[28rem]"
        />

        <div className="relative flex items-center overflow-hidden px-5 py-16 sm:px-8 lg:py-24 lg:pl-16 lg:pr-[max(2rem,calc((100vw-72rem)/2+2rem))]">
          <Reveal className="max-w-lg">
            <Eyebrow>Why matcha</Eyebrow>
            <h2 className="mt-4 text-4xl leading-[1.05] font-medium text-forest sm:text-5xl">
              More Than Just a Drink
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-forest/70">
              Matcha is a mindful choice: a simple way to nourish your body,
              boost your focus, and bring more balance to your day. For
              centuries it has been the centre of the Japanese tea ceremony, and
              it still works as a daily pause: one bowl, no screens.
            </p>
            <Link
              href="#story"
              className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-forest px-8 text-sm font-medium tracking-wide text-cream transition-colors hover:bg-matcha"
            >
              Learn More
              <span aria-hidden>→</span>
            </Link>
          </Reveal>

          <svg
            viewBox="0 0 120 220"
            aria-hidden
            className="pointer-events-none absolute -right-6 bottom-0 hidden h-64 text-forest/40 sm:block"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          >
            <path d="M110 220 C95 160 70 100 30 30" />
            <path d="M30 30 C10 50 12 85 40 95 C48 70 42 48 30 30Z" />
            <path d="M62 85 C40 100 42 135 72 140 C78 115 72 98 62 85Z" />
            <path d="M92 150 C70 165 74 195 100 196 C104 178 100 162 92 150Z" />
            <path d="M62 85 C85 80 100 95 98 118 C78 118 66 104 62 85Z" />
            <path d="M92 150 C112 140 124 150 122 172 C106 174 94 166 92 150Z" />
          </svg>
        </div>
      </div>
    </section>
  );
}
