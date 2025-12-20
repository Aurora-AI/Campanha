'use client';

import Link from 'next/link';
import NavLink from '@/components/nav/NavLink';

export default function EditorialNav() {
  return (
    <nav className="pointer-events-auto fixed left-0 right-0 top-0 z-50">
      <div className="mx-auto flex w-[min(1400px,92vw)] items-center justify-between py-6">
        <Link href="/" className="text-[11px] font-semibold uppercase tracking-[0.28em] text-black/70">
          Calceleve
        </Link>

        <div className="flex items-center gap-8">
          <NavLink href="/" label="Home" />
          <NavLink href="/groups" label="Grupos" />
          <NavLink href="/stores" label="Lojas" />
          <NavLink href="/timeline" label="Linha do tempo" />
        </div>
      </div>
    </nav>
  );
}
