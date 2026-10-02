"use client";

import { motion, MotionConfig, type Variants } from "framer-motion";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const arch: Variants = {
  hidden: { opacity: 0, clipPath: "inset(18% 0% 0% 0% round 999px 999px 0 0)" },
  show: {
    opacity: 1,
    clipPath: "inset(0% 0% 0% 0% round 999px 999px 0 0)",
    transition: { duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.15 },
  },
};

// One orchestrated entrance for the hero; honours prefers-reduced-motion.
export function HeroMotion({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        className={className}
        initial="hidden"
        animate="show"
        variants={container}
      >
        {children}
      </motion.div>
    </MotionConfig>
  );
}

export function HeroItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div className={className} variants={item}>
      {children}
    </motion.div>
  );
}

export function HeroArch({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div className={className} variants={arch}>
      {children}
    </motion.div>
  );
}
