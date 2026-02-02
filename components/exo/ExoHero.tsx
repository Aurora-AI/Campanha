"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export default function ExoHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const videoRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // 1. Title Reveal (Staggered)
      // We assume the title is split into chars or lines.
      // For simplicity in this v1, we animate lines.
      const tl = gsap.timeline();

      tl.from(".exo-title-line", {
        yPercent: 120,
        rotationZ: 3,
        opacity: 0,
        duration: 1.2,
        ease: "power4.out",
        stagger: 0.1,
      });

      // 2. Parallax Media
      gsap.to(videoRef.current, {
        yPercent: 20, // Move slower than scroll (parallax)
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      // 3. Scale Effect on Scroll
      gsap.to(videoRef.current, {
        scale: 1,
        startAt: { scale: 1.1 },
        ease: "none",
        scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true
        }
      });
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[120vh] bg-exo-black text-exo-white overflow-hidden"
    >
      {/* Navbar Placeholder */}
      <nav className="absolute top-0 left-0 w-full p-8 flex justify-between items-center z-50 text-xs uppercase tracking-widest mix-blend-difference">
        <span>Exo Ape Clone</span>
        <span>Menu</span>
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col justify-center items-center h-screen px-4">
        {/* H1 - Massive Typography */}
        <h1
          ref={titleRef}
          className="font-sans font-normal leading-[0.9] text-center tracking-tighter"
          style={{
            fontSize: "clamp(3rem, 15vw, 12rem)",
          }}
        >
          <div className="overflow-hidden">
            <div className="exo-title-line block">Digital</div>
          </div>
          <div className="overflow-hidden">
            <div className="exo-title-line block">Design</div>
          </div>
          <div className="overflow-hidden">
            <div className="exo-title-line block text-exo-gray">Experience</div>
          </div>
        </h1>

        {/* Floating CTA */}
        <div className="mt-24 text-sm uppercase tracking-widest opacity-0 animate-[fadeIn_1s_ease-out_1.5s_forwards]">
          Scroll to Explore
        </div>
      </div>

      {/* Background Media (Parallax) */}
      <div
        ref={videoRef}
        className="absolute inset-0 w-full h-[120%] z-0"
        style={{ willChange: "transform" }}
      >
        {/* Overlay for contrast */}
        <div className="absolute inset-0 bg-black/30 z-10" />

        {/* Placeholder Video/Image */}
        <img
          src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop"
          alt="Abstract Background"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
