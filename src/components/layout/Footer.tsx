
"use client"

import Link from 'next/link';
import { Phone, Mail, MapPin, Facebook, MessageCircle } from 'lucide-react';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { CONTACT_INFO } from '@/lib/constants';

export function Footer() {
  const db = useFirestore();
  const settingsRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, 'settings', 'general');
  }, [db]);
  const { data: settings } = useDoc(settingsRef);

  const logoImage = settings?.logo_url || CONTACT_INFO.logoUrl;
  const businessName = settings?.business_name || CONTACT_INFO.businessName;
  const contactPhone = settings?.contact_phone || CONTACT_INFO.phone;
  const contactEmail = settings?.contact_email || CONTACT_INFO.email;
  const address = settings?.address || CONTACT_INFO.address;

  const whatsappUrl = `https://wa.me/${CONTACT_INFO.whatsapp}`;

  return (
    <footer className="bg-primary text-white pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-12 h-12 bg-white rounded-full overflow-hidden flex items-center justify-center relative border shadow-sm shrink-0">
              <img 
                src={logoImage} 
                alt="Logo" 
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="flex flex-col space-y-[1px]">
              <span className="text-[9px] font-bold tracking-tight text-white/80 leading-none uppercase">
                Hamro
              </span>
              <span className="font-headline font-black text-lg md:text-xl tracking-normal leading-none text-white uppercase whitespace-nowrap">
                G&G AUTO
              </span>
              <span className="text-[9px] font-bold tracking-tight text-white/50 leading-none uppercase">
                Enterprises
              </span>
            </div>
          </Link>
          <p className="text-sm text-white/70 leading-relaxed font-medium">
            Reliable second-hand bikes and scooters showroom in {address.split(',')[0]}. 
            Sales, exchange, and servicing.
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
          <h4 className="font-bold text-lg mb-4 uppercase tracking-wider">Quick Links</h4>
          <ul className="space-y-2 text-sm text-white/70 font-medium">
            <li><Link href="/inventory" className="hover:text-white transition-colors">All Inventory</Link></li>
            <li><Link href="/sell" className="hover:text-white transition-colors">Sell Your Bike</Link></li>
            <li><Link href="/exchange" className="hover:text-white transition-colors">Exchange Offers</Link></li>
            <li><Link href="/admin/login" className="hover:text-white transition-colors">Staff Login</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-lg mb-4 uppercase tracking-wider">Services</h4>
          <ul className="space-y-2 text-sm text-white/70 font-medium">
            <li className="hover:text-white transition-colors">Used Bike Sales</li>
            <li className="hover:text-white transition-colors">Easy Exchange</li>
            <li className="hover:text-white transition-colors">Insurance Renewal</li>
            <li className="hover:text-white transition-colors">Workshop Services</li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-lg mb-4 uppercase tracking-wider">Contact Us</h4>
          <ul className="space-y-3 text-sm text-white/70 font-medium">
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
      <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-white/10 text-center text-[10px] text-white/30 tracking-widest uppercase font-bold">
        <p>&copy; {new Date().getFullYear()} {businessName}.</p>
      </div>
    </footer>
  );
}
