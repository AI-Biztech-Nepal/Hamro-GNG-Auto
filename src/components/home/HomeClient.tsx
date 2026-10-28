
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
import { BikeFinder, matchesQuery, type FinderQuery } from '@/components/home/BikeFinder';
import { buildRails, matchesFilter, formatNpr, BUDGET_CAP, type FilterId } from '@/components/home/home-data';
import { ServicesHero } from '@/components/home/ServicesHero';

const elsewhere = [
  { title: 'Service your bike', body: 'Same-day general servicing and repairs for every major brand.', href: '/book-service' },
  { title: 'Sell or exchange', body: 'Send photos and details, get a fair valuation the same day.', href: '/sell' },
];

const handsLabel = { any: '', '1': '1st hand', '2': '2nd hand', '3': '3rd hand or more' } as const;

function describe(q: FinderQuery): string {
  return [
    q.budget != null ? `up to ${formatNpr(q.budget)}` : null,
    q.brand !== 'any' ? q.brand : null,
    handsLabel[q.hands] || null,
  ].filter(Boolean).join(', ') || 'any bike';
}

export function HomeClient({ vehicles }: { vehicles: Vehicle[]; settings: SiteSettings }) {
  const [filter, setFilter] = useState<FilterId>('all');
  const [query, setQuery] = useState<FinderQuery | null>(null);

  // The brand tiles always show the whole stock; the quick filter only narrows the rails.
  const inStock = useMemo(() => vehicles.filter(v => v.has_photos && v.status === 'available'), [vehicles]);
  const filtered = useMemo(() => inStock.filter(v => matchesFilter(v, filter)), [inStock, filter]);
  const rails = useMemo(() => buildRails(filtered), [filtered]);

  const brands = useMemo(() => {
    const counts = new Map<string, number>();
    for (const v of inStock) if (v.brand?.trim()) counts.set(v.brand, (counts.get(v.brand) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => (a[0] === 'Other' ? 1 : b[0] === 'Other' ? -1 : b[1] - a[1])).map(([b]) => b);
  }, [inStock]);

  const results = useMemo(
    () => (query ? inStock.filter(v => matchesQuery(v, query)).sort((a, b) => a.price - b.price) : []),
    [inStock, query],
  );
  const handsKnown = useMemo(() => inStock.filter(v => v.owners != null).length, [inStock]);

  return (
    <>
    <ServicesHero />
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12 pb-24">
      {/* The hero above carries the page title; this is just the proof, in one line. */}
      <ul className="flex flex-wrap gap-x-6 gap-y-2 text-[13px] font-medium text-neutral-700 sm:text-sm">
        {['40-point inspection', 'Genuine paperwork', 'Fixed prices, no haggling', 'Nayabasti, Boudha'].map(t => (
          <li key={t} className="flex items-center gap-2">
            <span aria-hidden className="size-1.5 rounded-full bg-brand" />
            {t}
          </li>
        ))}
      </ul>

      <div className="mt-8">
        <BikeFinder brands={brands} onSearch={setQuery} onClear={() => setQuery(null)} active={query !== null} />
      </div>

      {query ? (
        <section className="mt-8" aria-live="polite">
          <h2 className="font-headline text-xl font-bold md:text-2xl">
            {results.length} {results.length === 1 ? 'bike matches' : 'bikes match'}
            <span className="ml-2 text-base font-normal text-muted-foreground">{describe(query)}</span>
          </h2>
          {query.hands !== 'any' && (
            <p className="mt-1 text-xs text-muted-foreground">
              The number of hands is recorded for {handsKnown} of our {inStock.length} bikes, so a bike with no owner record is not listed for this choice. Choose &ldquo;Any&rdquo; to include them.
            </p>
          )}

          {results.length === 0 ? (
            <div className="mt-6 rounded-xl border border-border p-8 text-center">
              <p className="text-sm text-muted-foreground">Nothing matches exactly. Try widening the search:</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {query.hands !== 'any' && (
                  <button className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:border-brand hover:text-brand" onClick={() => setQuery({ ...query, hands: 'any' })}>Any number of hands</button>
                )}
                {query.brand !== 'any' && (
                  <button className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:border-brand hover:text-brand" onClick={() => setQuery({ ...query, brand: 'any' })}>Any brand</button>
                )}
                {query.budget != null && (
                  <button className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:border-brand hover:text-brand" onClick={() => setQuery({ ...query, budget: Math.round((query.budget as number) * 1.2) })}>
                    Budget +20% ({formatNpr(Math.round((query.budget as number) * 1.2))})
                  </button>
                )}
                <Link href="/sell" className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:opacity-90">Tell us what you want</Link>
              </div>
            </div>
          ) : (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {results.map((v, i) => <BikeCard key={v.id} vehicle={v} isPriority={i < 4} />)}
            </div>
          )}
        </section>
      ) : (
        <>
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
