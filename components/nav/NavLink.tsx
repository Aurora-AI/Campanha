'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type Props = {
  href: string;
  label: string;
};

export default function NavLink({ href, label }: Props) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      className={[
        'px-3 py-2 text-sm transition-colors',
        active ? 'text-black font-medium border-b-2 border-black' : 'text-black/50 hover:text-black',
      ].join(' ')}
    >
      {label}
    </Link>
  );
}
