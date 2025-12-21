import Link from 'next/link';
import React from 'react';

export default function Header() {
  return (
        <header className="w-full px-8 py-6 text-stone-900 flex justify-between items-center">
            <Link href="/" className="font-serif text-2xl font-bold tracking-tighter">
                EXO.
            </Link>

            <nav className="hidden md:flex gap-8">
                {['Overview', 'Timeline', 'Groups', 'KPIs'].map((item) => (
                    <a key={item} href={`#${item.toLowerCase()}`} className="text-xs uppercase tracking-widest hover:opacity-70 transition-opacity">
                        {item}
                    </a>
                ))}
            </nav>
        </header>
  );
}
