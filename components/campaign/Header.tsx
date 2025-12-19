import Link from 'next/link';
import React from 'react';

export default function Header() {
  return (
        <header className="fixed top-0 left-0 w-full z-50 px-8 py-6 mix-blend-difference text-white flex justify-between items-center pointer-events-none">
            <Link href="/" className="font-serif text-2xl font-bold tracking-tighter pointer-events-auto">
                EXO.
            </Link>

            <nav className="hidden md:flex gap-8 pointer-events-auto">
                {['Overview', 'Timeline', 'Groups', 'KPIs'].map((item) => (
                    <a key={item} href={`#${item.toLowerCase()}`} className="text-xs uppercase tracking-widest hover:opacity-70 transition-opacity">
                        {item}
                    </a>
                ))}
            </nav>
        </header>
  );
}
