'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Image from 'next/image';

export default function Hero() {
  const container = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const imageWrapperRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.registerPlugin(ScrollTrigger);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container.current,
        start: 'top top',
        end: '+=2000',
        scrub: 1.5,
        pin: true,
      },
    });

    tl.to(
      imageWrapperRef.current,
      {
        scale: 0.7,
        y: -100,
        borderRadius: '3rem',
        ease: 'power2.inOut',
      },
      0
    );

    tl.fromTo(
      textRef.current,
      {
        y: 100,
        opacity: 0,
        scale: 0.8,
      },
      {
        y: 50,
        opacity: 1,
        scale: 1.2,
        color: '#000000',
        ease: 'power2.inOut',
      },
      0
    );
  }, { scope: container });

  return (
    <section
      ref={container}
      className="relative h-screen w-full bg-white overflow-hidden flex flex-col items-center justify-center"
    >
      <h1
        ref={textRef}
        className="absolute z-20 text-[18vw] font-black tracking-tighter text-black select-none leading-none text-center"
      >
        CALCE
        <br />
        LEVE
      </h1>

      <div
        ref={imageWrapperRef}
        className="relative z-10 shadow-xl"
        style={{
          width: 'auto',
          height: '65vh',
          aspectRatio: '3/4',
          borderRadius: '2rem',
        }}
      >
        <Image
          src="/images/hero-final.png"
          alt="Campaign Hero"
          fill
          className="object-cover"
          priority
        />
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 text-gray-300 text-[10px] font-bold tracking-[0.3em] uppercase animate-pulse">
        Role
      </div>
    </section>
  );
}
