import { Leaf, Recycle, Sparkle, Zap, type LucideIcon } from "lucide-react";

const BENEFITS: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: Leaf,
    title: "100% Pure Matcha",
    text: "Stone-ground tea leaf. Nothing added, nothing filtered out.",
  },
  {
    icon: Sparkle,
    title: "Rich in Antioxidants",
    text: "Whole-leaf powder, so you drink the leaf itself.",
  },
  {
    icon: Zap,
    title: "Clean Energy",
    text: "Gentle, steady focus without the coffee crash.",
  },
  {
    icon: Recycle,
    title: "Sustainable Choices",
    text: "Considered sourcing and packaging that respects the land.",
  },
];

export function Benefits() {
  return (
    <section aria-label="Why choose us" className="bg-forest text-cream">
      <ul className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-y-10 px-5 py-14 sm:grid-cols-2 sm:px-8 lg:grid-cols-4 lg:gap-y-0 lg:divide-x lg:divide-cream/15">
        {BENEFITS.map(({ icon: Icon, title, text }) => (
          <li key={title} className="lg:px-8 lg:first:pl-0 lg:last:pr-0">
            <Icon className="size-7 text-gold" strokeWidth={1.5} aria-hidden />
            <h2 className="mt-5 text-2xl font-medium">{title}</h2>
            <p className="mt-2 max-w-[18rem] text-sm leading-relaxed text-cream/70">
              {text}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
