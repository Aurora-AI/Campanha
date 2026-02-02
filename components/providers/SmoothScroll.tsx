"use client";

import { ReactNode } from "react";
import { ReactLenis } from "lenis/react";

export default function SmoothScroll({ children }: { children: ReactNode }) {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.08,
        wheelMultiplier: 0.9,
        touchMultiplier: 2,
        smoothWheel: true,
        // duration removed as lerp handles the smoothing physics
      }}
    >
      {children}
    </ReactLenis>
  );
}
