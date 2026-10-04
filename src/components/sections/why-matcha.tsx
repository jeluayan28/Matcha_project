import { Reveal } from "@/components/motion/reveal";
import { Eyebrow } from "@/components/ui/eyebrow";

const REASONS = [
  {
    title: "Grown in the shade",
    text: "Tea plants are shaded for weeks before harvest. It deepens the colour and gives matcha its smooth, savoury sweetness.",
  },
  {
    title: "Calm focus, not jitters",
    text: "Matcha pairs caffeine with L-theanine, an amino acid found in tea. Many people find it keeps them alert and settled at once.",
  },
  {
    title: "The whole leaf",
    text: "Instead of steeping and discarding the leaf, you whisk the finely ground leaf into water or milk and drink all of it.",
  },
];

export function WhyMatcha() {
  return (
    <section
      id="why-matcha"
      className="scroll-mt-16 bg-sage py-20 md:py-28"
    >
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <Reveal className="max-w-md">
          <Eyebrow>Why matcha</Eyebrow>
          <h2 className="mt-4 text-4xl leading-[1.05] font-medium text-forest sm:text-5xl lg:text-6xl">
            Why matcha, and why now
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-forest/70">
            For centuries, matcha has been the centre of the Japanese tea
            ceremony. It still works as a daily pause: a few quiet minutes, one
            bowl, no screens.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
        <dl className="divide-y divide-forest/15 border-y border-forest/20">
          {REASONS.map((reason) => (
            <div key={reason.title} className="py-7 sm:grid sm:grid-cols-[11rem_1fr] sm:gap-8">
              <dt className="font-heading text-2xl font-medium text-forest">
                {reason.title}
              </dt>
              <dd className="mt-2 leading-relaxed text-forest/75 sm:mt-0">
                {reason.text}
              </dd>
            </div>
          ))}
        </dl>
        </Reveal>
      </div>
    </section>
  );
}
