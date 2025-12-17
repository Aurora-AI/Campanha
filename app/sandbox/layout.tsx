import { Inter, Playfair_Display } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata = {
  title: 'Sandbox - Exo Ape Clone',
  description: 'Editorial design shell',
};

export default function SandboxLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-stone-50 text-stone-900 selection:bg-stone-900 selection:text-white`}>
       {/* Sandbox scoped global styles could go here or via utility classes */}
      <main className="min-h-screen relative overflow-hidden">
        {children}
      </main>
    </div>
  );
}
