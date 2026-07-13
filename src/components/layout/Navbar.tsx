
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

  const logoImage = settings?.logo_url || CONTACT_INFO.logoUrl;

  const links = [
    { name: 'Home', href: '/' },
    { name: 'Inventory', href: '/inventory' },
    { name: 'Services', href: '/services' },
    { name: 'Sell Bike', href: '/sell' },
    { name: 'Exchange', href: '/exchange' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-12 h-12 bg-white rounded-full group-hover:scale-105 transition-transform duration-300 shadow-sm border overflow-hidden flex items-center justify-center relative shrink-0">
              <img 
                src={logoImage} 
                alt="Logo" 
                className="w-full h-full object-cover"
                loading="eager"
                fetchPriority="high"
              />
            </div>
            <div className="flex flex-col space-y-[1px]">
              <span className="text-[9px] font-bold tracking-tight text-muted-foreground/80 leading-none uppercase">
                Hamro
              </span>
              <span className="font-headline font-black text-lg md:text-xl tracking-normal leading-none text-primary uppercase whitespace-nowrap">
                G&G AUTO
              </span>
              <span className="text-[9px] font-bold tracking-tight text-foreground/40 leading-none uppercase">
                Enterprises
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6">
            {links.map((link) => (
              <Link 
                key={link.name} 
                href={link.href}
                className={`text-sm font-bold transition-colors flex items-center gap-2 ${
                  pathname === link.href ? 'text-primary' : 'text-foreground/70 hover:text-primary'
                }`}
              >
                {link.name}
              </Link>
            ))}

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="font-bold text-primary gap-2" asChild>
                <Link href="/book-service"><Wrench className="w-4 h-4" /> Service</Link>
              </Button>
              <Button size="sm" className="font-bold rounded-full px-4 shadow-lg shadow-primary/20" asChild>
                <Link href="/inventory">Browse</Link>
              </Button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg bg-gray-50"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 p-4 space-y-2">
          {links.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="block px-4 py-2 rounded-lg text-sm font-bold text-foreground/80"
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
