"use client";

import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion, easeInOut } from "framer-motion";
import { useMemo, useRef } from "react";

type Props = {
  src?: string;
  alt?: string;
  size?: number;
};

export default function PuzzlePhysicsHero({
  src = "/images/puzzle.png",
  alt = "Puzzle Hero",
  size = 400,
}: Props) {
  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  const sx = useSpring(mx, { stiffness: 140, damping: 18, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 140, damping: 18, mass: 0.6 });

  const rotateY = useTransform(sx, [-0.5, 0.5], [-8, 8]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [7, -7]);
  const tx = useTransform(sx, [-0.5, 0.5], [-10, 10]);
  const ty = useTransform(sy, [-0.5, 0.5], [-8, 8]);

  const shadowX = useTransform(sx, [-0.5, 0.5], [20, -20]);
  const shadowY = useTransform(sy, [-0.5, 0.5], [20, -20]);

  const floatAnim = useMemo(() => {
    if (reducedMotion) return {};
    return {
      y: [0, -8, 0],
      transition: { duration: 6, repeat: Infinity, ease: easeInOut },
    };
  }, [reducedMotion]);

  const onMove = (e: React.PointerEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <motion.div ref={ref} onPointerMove={onMove} onPointerLeave={onLeave} style={{ perspective: 1000 }} animate={floatAnim} className="cursor-grab active:cursor-grabbing">
      <motion.div
        className="relative overflow-hidden rounded-[40px]"
        style={{
          width: size, height: size,
          rotateX: reducedMotion ? 0 : rotateX,
          rotateY: reducedMotion ? 0 : rotateY,
          transformStyle: "preserve-3d",
        }}
      >
        <motion.div className="absolute inset-0 z-0 opacity-20" style={{
             boxShadow: useTransform([shadowX, shadowY], ([x, y]) => `${x}px ${y}px 60px rgba(0,0,0,0.2)`)
        }} />

        <motion.div className="absolute inset-0 z-10" style={{ x: tx, y: ty }}>
          <Image src={src} alt={alt} fill className="object-cover" priority sizes="(max-width: 768px) 100vw, 500px"/>
        </motion.div>

        {/* Brilho Sutil */}
        <motion.div className="absolute inset-0 z-20 pointer-events-none" style={{
          background: "linear-gradient(125deg, rgba(255,255,255,0.4) 0%, transparent 40%)",
        }} />
      </motion.div>
    </motion.div>
  );
}
