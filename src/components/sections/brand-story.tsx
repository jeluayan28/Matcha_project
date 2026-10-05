import { Reveal } from "@/components/motion/reveal";
import { Eyebrow } from "@/components/ui/eyebrow";

export function BrandStory() {
  return (
    <section id="story" className="scroll-mt-16 bg-cream py-20 md:py-28">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 sm:px-8 md:grid-cols-[0.8fr_1.2fr] md:gap-16">
        <div className="mx-auto w-full max-w-xs md:max-w-sm">
          {/* ensō: the hand-drawn circle of Zen calligraphy */}
          <svg
            viewBox="0 0 200 200"
            role="img"
            aria-label="Ink brush circle"
            className="w-full text-forest"
          >
            <path
              d="M158 56 C132 22 80 18 49 48 C18 78 18 130 50 158 C82 184 134 178 160 144 C174 126 178 104 174 84"
              fill="none"
              stroke="currentColor"
              strokeWidth="13"
              strokeLinecap="round"
            />
            <circle cx="100" cy="100" r="6" fill="#FF788D" />
          </svg>
        </div>

        <Reveal className="max-w-xl">
          <Eyebrow>Our story</Eyebrow>
          <h2 className="mt-4 text-4xl leading-[1.05] font-medium text-forest sm:text-5xl lg:text-6xl">
            A slower way to start the day
          </h2>
          <div className="mt-6 space-y-5 text-lg leading-relaxed text-forest/75">
            <p>
              We started with a simple belief: a good morning begins with
              attention. Whisking matcha asks for a minute of it, and gives
              back a calmer, clearer head.
            </p>
            <p>
              So we keep things simple. Premium Japanese matcha, stone-ground
              and packed fresh, with nothing between you and the leaf.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
