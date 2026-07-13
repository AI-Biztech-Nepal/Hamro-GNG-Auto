
"use client"

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X, Wrench, Bike, Settings, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFirestore, useDoc, useMemoFirebase, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';
import { CONTACT_INFO } from '@/lib/constants';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');
  const { user } = useUser();
  const db = useFirestore();

  const roleRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'roles_admin', user.uid);
  }, [db, user?.uid]);

  const { data: roleData } = useDoc(roleRef);
  const isSuperAdmin = roleData?.role === 'super_admin';

  const settingsRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, 'settings', 'general');
  }, [db]);
  const { data: settings } = useDoc(settingsRef);

  const logoImage = settings?.logo_url || CONTACT_INFO.logoUrl;

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Inventory', href: '/inventory' },
    { name: 'Services', href: '/services' },
    { name: 'Sell Bike', href: '/sell' },
    { name: 'Exchange', href: '/exchange' },
  ];

  const adminLinks = [
    { name: 'Inventory', href: '/admin/dashboard' },
    { name: 'Leads', href: '/admin/inquiries' },
    ...(isSuperAdmin ? [
      { name: 'Roles', href: '/admin/roles', icon: <Users className="w-4 h-4" /> },
      { name: 'Settings', href: '/admin/settings', icon: <Settings className="w-4 h-4" /> }
    ] : [])
  ];

  const links = isAdminPage ? adminLinks : navLinks;

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
                {link.icon}
                {link.name}
              </Link>
            ))}
            
            <div className="flex items-center gap-3">
              {isAdminPage ? (
                <div className="flex items-center gap-3">
                  {isSuperAdmin && <Badge className="bg-primary/10 text-primary border-primary/20 font-black">SUPER ADMIN</Badge>}
                  <Button variant="outline" size="sm" className="font-bold gap-2 rounded-full" asChild>
                    <Link href="/"><Bike className="w-4 h-4" /> View Site</Link>
                  </Button>
                </div>
              ) : (
                <>
                  <Button variant="ghost" size="sm" className="font-bold text-primary gap-2" asChild>
                    <Link href="/book-service"><Wrench className="w-4 h-4" /> Service</Link>
                  </Button>
                  <Button size="sm" className="font-bold rounded-full px-4 shadow-lg shadow-primary/20" asChild>
                    <Link href="/inventory">Browse</Link>
                  </Button>
                </>
              )}
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
