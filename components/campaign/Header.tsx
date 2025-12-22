import Link from 'next/link';
import React from 'react';
import { NAV_LINKS } from '@/lib/campaign/mock';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/5 bg-white/70 px-6 py-4 text-stone-900 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
        <Link href="/" className="font-serif text-xl font-semibold tracking-tight">
          Campanha
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-[11px] uppercase tracking-[0.24em] text-black/55 transition-colors hover:text-black"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
