
"use client"

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { User } from 'lucide-react';
import { CONTACT_INFO } from '@/lib/constants';
import type { SiteSettings } from '@/lib/inventory-api';

export function Navbar({ settings }: { settings: SiteSettings }) {
  const stripRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const [picture, setPicture] = useState<string | null>(null);

  // The account page fires 'gg-auth' after sign-in/out so the icon updates without a reload.
  useEffect(() => {
    const load = () =>
      fetch('/api/auth/me').then((r) => r.json()).then((u) => setPicture(u?.picture ?? null)).catch(() => setPicture(null));
    load();
    window.addEventListener('gg-auth', load);
    return () => window.removeEventListener('gg-auth', load);
  }, []);

  // On phones the links sit in a sideways-scrolling strip: scroll the current page's link into view.
  useEffect(() => {
    const active = stripRef.current?.querySelector<HTMLElement>('[aria-current="page"]');
    active?.scrollIntoView({ inline: 'center', block: 'nearest' });
  }, [pathname]);

  // Backend `settings.logo_url` is a stock placeholder; the real brand mark ships in /public.
  const logoImage = CONTACT_INFO.logoUrl;

  const accountClass = `inline-flex h-10 w-10 items-center justify-center rounded-full overflow-hidden bg-brand text-brand-foreground shadow-sm transition hover:bg-brand/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${
    pathname === '/account' ? 'ring-2 ring-brand ring-offset-2' : ''
  }`;

  const links = [
    { name: 'Home', href: '/' },
    { name: 'Inventory', href: '/inventory' },
    { name: 'Sell Bike', href: '/sell' },
    { name: 'Exchange', href: '/exchange' },
    { name: 'Offers', href: '/offers' },
    { name: 'Book service', href: '/book-service' },
    { name: 'About us', href: '/about' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link href="/" className="flex items-center shrink-0" aria-label="Hamro G&G Auto Enterprises — home">
            <img
              src={logoImage}
              alt="Hamro G&G Auto Enterprises"
              className="h-14 md:h-16 w-auto object-contain"
              loading="eager"
              fetchPriority="high"
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-4 lg:gap-7">
            {links.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-semibold transition-colors ${
                  pathname === link.href
                    ? 'text-foreground underline underline-offset-8 decoration-2 decoration-brand'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <Link href="/account" aria-label="Account" title="Account" className={accountClass}>
              {picture ? (
                <img src={picture} alt="" referrerPolicy="no-referrer" className="h-full w-full rounded-full object-cover" />
              ) : (
                <User className="h-5 w-5" strokeWidth={2.25} />
              )}
            </Link>
          </div>

          {/* Mobile account (the page links are in the strip below) */}
          <div className="md:hidden flex items-center gap-2">
            <Link href="/account" aria-label="Account" className={accountClass}>
              {picture ? (
                <img src={picture} alt="" referrerPolicy="no-referrer" className="h-full w-full rounded-full object-cover" />
              ) : (
                <User className="h-5 w-5" strokeWidth={2.25} />
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Phones: every page link stays on screen in one strip under the logo bar (it scrolls sideways when it does not fit).
          The padding puts the first word exactly under the logo: the bar above uses px-4 (px-6 from sm) and each link adds px-3. */}
      <div
        ref={stripRef}
        className="md:hidden flex gap-1 overflow-x-auto border-t border-border px-1 sm:px-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="navigation"
        aria-label="Pages"
      >
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              aria-current={active ? 'page' : undefined}
              className={`shrink-0 whitespace-nowrap px-3 py-3 text-sm font-semibold transition-colors ${
                active
                  ? 'text-foreground underline underline-offset-8 decoration-2 decoration-brand'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {link.name}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
