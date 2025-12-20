'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function Breadcrumbs() {
  const pathname = usePathname();
  const parts = pathname.split('/').filter(Boolean);

  if (parts.length === 0) return null;

  return (
    <nav className="mb-6 text-xs text-black/45">
      <Link href="/" className="hover:text-black">
        Home
      </Link>
      {parts.map((p, i) => {
        const href = '/' + parts.slice(0, i + 1).join('/');
        const isLast = i === parts.length - 1;
        return (
          <span key={href}>
            {' > '}
            {isLast ? (
              <span className="text-black/70 capitalize">{p}</span>
            ) : (
              <Link href={href} className="hover:text-black capitalize">
                {p}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
