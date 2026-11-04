
"use client"

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, User, X } from 'lucide-react';
import { CONTACT_INFO } from '@/lib/constants';
import type { SiteSettings } from '@/lib/inventory-api';

export function Navbar({ settings }: { settings: SiteSettings }) {
  const [isOpen, setIsOpen] = useState(false);
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

          {/* Mobile account + menu button */}
          <div className="md:hidden flex items-center gap-2">
            <Link href="/account" aria-label="Account" className={accountClass}>
              {picture ? (
                <img src={picture} alt="" referrerPolicy="no-referrer" className="h-full w-full rounded-full object-cover" />
              ) : (
                <User className="h-5 w-5" strokeWidth={2.25} />
              )}
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              className="p-2 rounded-md border border-border"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav. Its padding makes the link text start exactly under the logo: the header uses px-4 (px-6 from sm) and each link adds px-3. */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-border px-1 py-3 sm:px-3">
          {links.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`block px-3 py-2.5 rounded-md text-sm font-semibold ${
                pathname === link.href ? 'bg-accent text-foreground' : 'text-muted-foreground'
              }`}
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
