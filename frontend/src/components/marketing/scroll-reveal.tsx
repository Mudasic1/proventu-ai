"use client";

import { useRef } from "react";
import { LazyMotion, m, useInView, MotionConfig } from "framer-motion";

const loadMotionFeatures = () =>
  import("./motion-features").then((module) => module.default);

export function ScrollReveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={loadMotionFeatures} strict>
        <m.div
          ref={ref}
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
          transition={{
            duration: 0.7,
            delay,
            ease: [0.22, 1, 0.36, 1],
          }}
          className={className}
        >
          {children}
        </m.div>
      </LazyMotion>
    </MotionConfig>
  );
}
