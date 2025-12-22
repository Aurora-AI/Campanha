import { NAV_LINKS } from '@/lib/campaign/mock';
import Link from 'next/link';
import FadeIn from './FadeIn';

export default function Footer() {
  return (
    <footer className="bg-stone-900 px-6 py-20 text-stone-300 md:py-24">
      <FadeIn className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-12 md:flex-row md:items-end">
        <div className="flex flex-col gap-4">
          <h2 className="font-serif text-4xl text-white">Mycelium · Campanha</h2>
          <p className="max-w-sm text-sm leading-relaxed text-stone-400">
            Leitura editorial do ritmo diário. Dados entram pelo CSV; a Home permanece um molde fixo.
          </p>
        </div>

        <nav className="flex flex-wrap items-center gap-5">
          {NAV_LINKS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-xs uppercase tracking-[0.24em] text-stone-400 transition-colors hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </FadeIn>

      <div className="mx-auto mt-16 flex w-full max-w-6xl items-center justify-between border-t border-stone-800 pt-6 text-xs uppercase tracking-widest text-stone-500">
        <span>© 2025 Aurora</span>
        <Link href="/admin/login" className="transition-colors hover:text-white">
          Admin
        </Link>
      </div>
    </footer>
  );
}
