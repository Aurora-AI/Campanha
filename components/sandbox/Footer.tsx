import { NAV_LINKS } from '@/lib/sandbox/mock';
import Link from 'next/link';
import FadeIn from './FadeIn';

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-400 py-24 px-8 md:px-16">
      <FadeIn className="flex flex-col md:flex-row justify-between items-end gap-12">
        
        <div className="flex flex-col gap-4">
           <h2 className="text-white font-serif text-4xl">Exo Ape Clone</h2>
           <p className="max-w-xs text-sm leading-relaxed">
             A digital design sandbox exploring editorial layouts and interactions.
           </p>
        </div>

        <nav className="flex flex-col md:flex-row gap-8 md:gap-16">
            <div className="flex flex-col gap-4">
                <span className="text-xs uppercase tracking-widest text-white mb-2">Sitemap</span>
                {NAV_LINKS.map(link => (
                    <Link key={link.label} href={link.href} className="text-sm hover:text-white transition-colors">
                        {link.label}
                    </Link>
                ))}
            </div>
            <div className="flex flex-col gap-4">
                <span className="text-xs uppercase tracking-widest text-white mb-2">Socials</span>
                <Link href="#" className="text-sm hover:text-white transition-colors">Twitter/X</Link>
                <Link href="#" className="text-sm hover:text-white transition-colors">Instagram</Link>
                <Link href="#" className="text-sm hover:text-white transition-colors">LinkedIn</Link>
            </div>
        </nav>
      </FadeIn>
      
      <div className="mt-24 pt-8 border-t border-stone-800 flex justify-between items-center text-xs uppercase tracking-widest">
         <span>© 2024 Sandbox</span>
         <span>Aurora AI</span>
      </div>
    </footer>
  );
}
