
"use client"

import { VehicleBrowser } from '@/components/inventory/VehicleBrowser';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Vehicle } from '@/types/vehicle';
import type { SiteSettings } from '@/lib/inventory-api';

const elsewhere = [
  { title: 'Service your bike', body: 'Same-day general servicing and repairs for every major brand.', href: '/book-service' },
  { title: 'Sell or exchange', body: 'Send photos and details, get a fair valuation the same day.', href: '/sell' },
];

export function HomeClient({ vehicles, settings }: { vehicles: Vehicle[]; settings: SiteSettings }) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12 pb-24">
      {/* Brief introduction */}
      <header className="max-w-2xl">
        <span aria-hidden className="block w-8 h-1 bg-brand mb-4" />
        <h1 className="font-headline font-bold text-3xl md:text-[2.75rem] leading-[1.1] tracking-tight">
          Second-hand bikes &amp; scooters, ready to ride.
        </h1>
        <p className="mt-4 text-[15px] md:text-base text-muted-foreground leading-relaxed">
          G&amp;G Auto is a used two-wheeler showroom in Nayabasti, Boudha. Every bike on the
          floor has passed our 40-point inspection, carries genuine paperwork, and is priced
          fixed &mdash; no haggling. Browse the full stock below.
        </p>
      </header>

      <div className="mt-10">
        <VehicleBrowser vehicles={vehicles} layout="sidebar" priorityCount={6} />
      </div>

      {/* Everything else — one quiet row */}
      <section className="mt-20 border-t border-border pt-10 grid gap-px bg-border sm:grid-cols-2 overflow-hidden rounded-lg">
        {elsewhere.map(({ title, body, href }) => (
          <Link
            key={href}
            href={href}
            className="group bg-background p-6 sm:p-8 hover:bg-muted transition-colors"
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-headline font-bold text-lg">{title}</h2>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand" />
            </div>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{body}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
