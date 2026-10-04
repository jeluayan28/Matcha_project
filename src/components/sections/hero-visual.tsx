// Illustrated stand-in for the hero photograph: chawan bowl, chasen whisk,
// chashaku scoop and a mound of matcha powder. To use a real photo instead,
// replace this component's body with a next/image <Image fill className="object-cover" />.
export function HeroVisual() {
  return (
    <svg
      viewBox="0 0 400 500"
      role="img"
      aria-label="Ceramic bowl of whisked matcha with a bamboo whisk, scoop and matcha powder on a wooden table"
      className="absolute inset-0 h-full w-full"
      preserveAspectRatio="xMidYMax slice"
    >
      {/* sun */}
      <circle cx="200" cy="175" r="78" fill="#C7A86B" opacity="0.35" />
      {/* tea sprig */}
      <g fill="#2f5240">
        <ellipse cx="62" cy="120" rx="30" ry="12" transform="rotate(-35 62 120)" />
        <ellipse cx="96" cy="86" rx="26" ry="10" transform="rotate(-62 96 86)" />
        <ellipse cx="40" cy="160" rx="24" ry="9" transform="rotate(-8 40 160)" />
        <path d="M30 190 Q60 140 98 78" stroke="#2f5240" strokeWidth="3" fill="none" />
      </g>
      {/* table */}
      <rect x="0" y="410" width="400" height="90" fill="#d9c7a3" />
      <g stroke="#c8b48b" strokeWidth="2" opacity="0.7">
        <path d="M0 435 H400" />
        <path d="M0 462 H400" />
        <path d="M0 486 H400" />
      </g>
      {/* shadow */}
      <ellipse cx="200" cy="448" rx="135" ry="10" fill="#1f3a2d" opacity="0.18" />
      {/* powder dish */}
      <ellipse cx="78" cy="436" rx="52" ry="10" fill="#f3efe2" />
      <path d="M38 434 Q78 372 118 434 Z" fill="#8fb04a" />
      <path d="M58 430 Q78 398 98 430 Z" fill="#a6c468" />
      {/* scoop */}
      <path d="M118 424 L206 396" stroke="#b08a52" strokeWidth="5" strokeLinecap="round" />
      <path d="M118 424 Q108 432 122 436" stroke="#b08a52" strokeWidth="5" strokeLinecap="round" fill="none" />
      {/* bowl */}
      <path d="M82 345 Q88 438 205 444 Q322 438 328 345 Z" fill="#2c4a3a" />
      <ellipse cx="205" cy="346" rx="123" ry="23" fill="#35574a" />
      <ellipse cx="205" cy="348" rx="109" ry="17" fill="#8fb04a" />
      <ellipse cx="205" cy="347" rx="92" ry="12" fill="#a6c468" />
      <ellipse cx="190" cy="345" rx="40" ry="5" fill="#c4dc8e" opacity="0.8" />
      <rect x="168" y="440" width="74" height="8" rx="4" fill="#2c4a3a" />
      {/* whisk */}
      <rect x="338" y="296" width="34" height="76" rx="10" fill="#c9a96b" />
      <path d="M334 372 C312 402 314 436 340 438 L370 438 C396 436 398 402 376 372 Z" fill="#ecdfba" />
      <g stroke="#cdbb8d" strokeWidth="2" fill="none">
        <path d="M344 376 C334 400 336 424 345 436" />
        <path d="M355 376 V437" />
        <path d="M366 376 C376 400 374 424 365 436" />
      </g>
    </svg>
  );
}
