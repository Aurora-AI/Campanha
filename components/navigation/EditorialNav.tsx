import Link from 'next/link';

export default function EditorialNav() {
  return (
    <nav className="pointer-events-auto fixed left-0 right-0 top-0 z-50">
      <div className="mx-auto flex w-[min(1400px,92vw)] items-center justify-between py-6">
        <Link href="/" className="text-[11px] font-semibold uppercase tracking-[0.28em] text-black/70">
          Calceleve
        </Link>

        <div className="flex items-center gap-8">
          <Link href="/timeline" className="text-[11px] uppercase tracking-[0.28em] text-black/55 hover:text-black">
            Timeline
          </Link>
          <Link href="/groups" className="text-[11px] uppercase tracking-[0.28em] text-black/55 hover:text-black">
            Groups
          </Link>
          <Link href="/stores" className="text-[11px] uppercase tracking-[0.28em] text-black/55 hover:text-black">
            Stores
          </Link>
        </div>
      </div>
    </nav>
  );
}
