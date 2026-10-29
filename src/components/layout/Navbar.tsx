
"use client"

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CONTACT_INFO } from '@/lib/constants';
import type { SiteSettings } from '@/lib/inventory-api';

export function Navbar({ settings }: { settings: SiteSettings }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Backend `settings.logo_url` is a stock placeholder; the real brand mark ships in /public.
  const logoImage = CONTACT_INFO.logoUrl;

  const links = [
    { name: 'Home', href: '/' },
    { name: 'Inventory', href: '/inventory' },
    { name: 'About us', href: '/about' },
    { name: 'Sell Bike', href: '/sell' },
    { name: 'Exchange', href: '/exchange' },
    { name: 'Offers', href: '/offers' },
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

            <div className="flex items-center gap-2 pl-1">
              <Button size="sm" className="font-semibold gap-2 px-4 bg-brand text-brand-foreground hover:bg-brand/90" asChild>
                <Link href="/book-service"><Wrench className="w-4 h-4" /> Book service</Link>
              </Button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
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

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-border p-3">
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
          <Link href="/book-service" onClick={() => setIsOpen(false)} className="block px-3 py-2.5 rounded-md text-sm font-semibold text-brand">
            Book service
          </Link>
        </div>
      )}
    </nav>
  );
}
