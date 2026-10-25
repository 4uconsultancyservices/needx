'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const SECTIONS = [
  {
    title: 'Marketplace',
    links: [
      { href: '/explore', label: 'Explore needs' },
      { href: '/listings', label: 'Browse listings' },
      { href: '/providers', label: 'Find providers' },
      { href: '/needs/new', label: 'Post a need' },
      { href: '/categories/electronics', label: 'Categories' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/about', label: 'About NEEDX' },
      { href: '/how-it-works', label: 'How it works' },
      { href: '/contact', label: 'Contact us' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/terms', label: 'Terms of service' },
      { href: '/privacy', label: 'Privacy policy' },
    ],
  },
];

export function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="hidden border-t border-border bg-canvas-alt/60 md:block">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#0f294a] via-[#1e40af] to-[#0d9488] font-display text-sm font-bold text-white shadow-sm ring-1 ring-white/20">
                N
              </span>
              <div className="flex flex-col">
                <span className="font-display text-lg font-bold text-ink leading-none">NEEDX</span>
                <span className="text-[9px] font-semibold tracking-wider uppercase text-hope mt-0.5">Hope · Faith · Trust</span>
              </div>
            </Link>
            <p className="mt-3.5 max-w-xs text-sm text-ink-soft leading-relaxed">
              Built on Hope. Guided by Faith. Earned Through Trust. Say what you need — NEEDX connects you with real people who can help.
            </p>
          </div>
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <p className="text-sm font-semibold text-ink">{section.title}</p>
              <ul className="mt-3 space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-ink-soft hover:text-ink">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
          <p className="text-xs text-ink-faint">© {new Date().getFullYear()} NEEDX. Built as a demonstration marketplace.</p>
          <p className="text-xs text-ink-faint">Made for India 🇮🇳 — Delhi · Gurgaon · Mumbai · Bangalore · Hyderabad · Pune</p>
        </div>
      </div>
    </footer>
  );
}
