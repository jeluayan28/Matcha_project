"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const SLIDES = [
  { src: "/m1.png", alt: "Matcha, whisked and ready to drink" },
  { src: "/m3.png", alt: "A calm matcha moment" },
  { src: "/m2.png", alt: "Matcha powder and tea leaves" },
];

const INTERVAL_MS = 5000;

export function WhyMatchaSlideshow() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % SLIDES.length),
      INTERVAL_MS
    );
    return () => clearInterval(id);
  }, [paused, index]);

  return (
    <div
      className="relative min-h-72 overflow-hidden bg-forest/10 sm:min-h-96 lg:min-h-[28rem]"
      role="group"
      aria-roledescription="carousel"
      aria-label="Matcha photos"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {SLIDES.map((slide, i) => (
        <Image
          key={slide.src}
          src={slide.src}
          alt={slide.alt}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          priority={i === 0}
          aria-hidden={i !== index}
          className={`object-cover transition-opacity duration-1000 ease-in-out ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      <div className="absolute inset-x-0 bottom-5 flex justify-center gap-2.5">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.src}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Show photo ${i + 1} of ${SLIDES.length}`}
            aria-current={i === index}
            className={`h-2 rounded-full transition-all duration-300 focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none ${
              i === index ? "w-7 bg-cream" : "w-2 bg-cream/60 hover:bg-cream"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
