
"use client"

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { Vehicle } from '@/types/vehicle';
import type { SiteSettings } from '@/lib/inventory-api';
import { FilterPills } from '@/components/home/FilterPills';
import { BrandGrid } from '@/components/home/BrandGrid';
import { BikeSectionRail } from '@/components/home/BikeSectionRail';
import { BikeCard } from '@/components/home/BikeCard';
import { buildRails, matchesFilter, formatNpr, BUDGET_CAP, type FilterId } from '@/components/home/home-data';
import { ServicesHero } from '@/components/home/ServicesHero';

const elsewhere = [
  { title: 'Service your bike', body: 'Same-day general servicing and repairs for every major brand.', href: '/book-service' },
  { title: 'Sell or exchange', body: 'Send photos and details, get a fair valuation the same day.', href: '/sell' },
];

export function HomeClient({ vehicles }: { vehicles: Vehicle[]; settings: SiteSettings }) {
  const [filter, setFilter] = useState<FilterId>('all');

  // The brand tiles always show the whole stock; the quick filter only narrows the rails.
  const inStock = useMemo(() => vehicles.filter(v => v.has_photos && v.status === 'available'), [vehicles]);
  const filtered = useMemo(() => inStock.filter(v => matchesFilter(v, filter)), [inStock, filter]);
  const rails = useMemo(() => buildRails(filtered), [filtered]);

  return (
    <>
    <ServicesHero />
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12 pb-24">
      {/* The hero above carries the page title; this is just the proof, in one line. */}
      <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-[13px] font-medium text-neutral-700 sm:flex sm:flex-wrap sm:gap-x-6 sm:text-sm">
        {['40-point inspection', 'Genuine paperwork', 'Fixed prices, no haggling', 'Nayabasti, Boudha'].map(t => (
          <li key={t} className="flex items-center gap-2">
            <span aria-hidden className="size-1.5 rounded-full bg-brand" />
            {t}
          </li>
        ))}
      </ul>

      <div className="mt-6"><FilterPills active={filter} onSelect={setFilter} /></div>

      <BrandGrid vehicles={inStock} />

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          No bikes match this filter right now. <button className="text-brand underline" onClick={() => setFilter('all')}>Show everything</button>
        </p>
      ) : (
        <>
          <BikeSectionRail
            title="Most popular"
            subtitle="The bikes people are opening most, over the last 30 days"
            bikes={rails.popular}
            badges={rails.badges}
            viewAllLink="/inventory"
            priority
          />
          <BikeSectionRail
            title={`Budget deals: under ${formatNpr(BUDGET_CAP)}`}
            subtitle="The most affordable bikes on the floor, cheapest first"
            bikes={rails.budget}
            badges={rails.badges}
            viewAllLink="/inventory?sort=price-low"
          />
          <BikeSectionRail
            title="Fresh arrivals"
            subtitle="The newest bikes added to the showroom"
            bikes={rails.fresh}
            badges={rails.badges}
            viewAllLink="/inventory?sort=latest"
          />
        </>
      )}

      <div className="mt-6 text-center">
        <Link href="/inventory" className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-semibold hover:border-brand hover:text-brand transition-colors">
          Browse all {inStock.length} bikes &amp; scooters <ArrowUpRight className="w-4 h-4" />
        </Link>
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
    </>
  );
}
