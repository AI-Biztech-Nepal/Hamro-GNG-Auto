
"use client"

import Link from 'next/link';
import { Phone, Mail, MapPin, Facebook, MessageCircle } from 'lucide-react';
import { CONTACT_INFO } from '@/lib/constants';
import type { SiteSettings } from '@/lib/inventory-api';

export function Footer({ settings }: { settings: SiteSettings }) {
  const logoImage = CONTACT_INFO.logoUrl;
  const businessName = settings?.business_name || CONTACT_INFO.businessName;
  const contactPhone = CONTACT_INFO.phone;
  const contactEmail = settings?.contact_email || CONTACT_INFO.email;
  const address = settings?.address || CONTACT_INFO.address;

  const whatsappUrl = `https://wa.me/${CONTACT_INFO.whatsapp}`;

  return (
    <footer className="bg-secondary text-white pt-16 pb-10">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
        <div className="space-y-6">
          <Link href="/" className="inline-flex bg-white rounded-md p-3 w-fit" aria-label="Hamro G&G Auto Enterprises — home">
            <img
              src={logoImage}
              alt="Hamro G&G Auto Enterprises"
              className="h-14 w-auto object-contain"
              loading="lazy"
            />
          </Link>
          <p className="text-sm text-white/70 leading-relaxed">
            Second-hand bikes and scooters in {address.split(',')[0]} &mdash; sales, exchange and servicing under one roof.
          </p>
          <div className="flex gap-4">
            <a href={CONTACT_INFO.facebook} target="_blank" rel="noopener noreferrer" className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors">
              <Facebook className="w-5 h-5" />
            </a>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors">
              <MessageCircle className="w-5 h-5" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold mb-4 uppercase tracking-[0.14em] text-white/50">Quick Links</h4>
          <ul className="space-y-2.5 text-sm text-white/75 font-medium">
            <li><Link href="/inventory" className="hover:text-white transition-colors">All Inventory</Link></li>
            <li><Link href="/sell" className="hover:text-white transition-colors">Sell Your Bike</Link></li>
            <li><Link href="/exchange" className="hover:text-white transition-colors">Exchange Offers</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold mb-4 uppercase tracking-[0.14em] text-white/50">Services</h4>
          <ul className="space-y-2.5 text-sm text-white/75 font-medium">
            <li className="hover:text-white transition-colors">Second-hand Bike Sales</li>
            <li className="hover:text-white transition-colors">Easy Exchange</li>
            <li className="hover:text-white transition-colors">Insurance Renewal</li>
            <li className="hover:text-white transition-colors">Workshop Services</li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold mb-4 uppercase tracking-[0.14em] text-white/50">Contact Us</h4>
          <ul className="space-y-3 text-sm text-white/75 font-medium">
            <li className="flex items-start gap-3">
              <MapPin className="w-4 h-4 mt-1 shrink-0" />
              <span>{address}</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="w-4 h-4 shrink-0" />
              <a href={`tel:${contactPhone}`} className="hover:text-white">{contactPhone}</a>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="w-4 h-4 shrink-0" />
              <a href={`mailto:${contactEmail}`} className="hover:text-white">{contactEmail}</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 mt-14 pt-8 border-t border-white/10 text-[11px] text-white/45 tracking-wide uppercase font-semibold">
        <p>&copy; {new Date().getFullYear()} {businessName}</p>
      </div>
    </footer>
  );
}
