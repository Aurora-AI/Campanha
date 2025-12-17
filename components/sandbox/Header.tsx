import Link from 'next/link';
import { NAV_LINKS } from '@/lib/sandbox/mock';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-8 py-6 mix-blend-difference text-white pointer-events-none">
      <div className="pointer-events-auto">
        <Link href="/sandbox" className="text-xl font-serif tracking-tighter">
          EXO.
        </Link>
      </div>
      
      <nav className="hidden md:flex gap-8 pointer-events-auto">
        {NAV_LINKS.map((link) => (
          <Link 
            key={link.label} 
            href={link.href}
            className="text-xs uppercase tracking-widest hover:opacity-70 transition-opacity"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="md:hidden pointer-events-auto">
        <button className="text-xs uppercase tracking-widest">Menu</button>
      </div>
    </header>
  );
}
