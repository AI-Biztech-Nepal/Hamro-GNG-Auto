"use client"

import { Phone, MessageCircle } from 'lucide-react';
import { CONTACT_INFO } from '@/lib/constants';

export function StickyBottomBar() {
  const whatsappUrl = `https://wa.me/${CONTACT_INFO.whatsapp}?text=${encodeURIComponent("Hello Hamro G&G Auto, I am interested in your bikes.")}`;

  return (
    <div className="sticky-bottom-bar shadow-xl">
      <a 
        href={`tel:${CONTACT_INFO.phone}`}
        className="flex flex-col items-center justify-center w-1/2 py-2 border-r gap-1 text-primary font-semibold"
      >
        <Phone className="w-5 h-5" />
        <span className="text-xs">Call Us</span>
      </a>
      <a 
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center justify-center w-1/2 py-2 gap-1 text-[#25D366] font-semibold"
      >
        <MessageCircle className="w-5 h-5" />
        <span className="text-xs">WhatsApp</span>
      </a>
    </div>
  );
}
