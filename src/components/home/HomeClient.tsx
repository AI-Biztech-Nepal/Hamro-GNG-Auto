
"use client"

import { useMemo } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { Vehicle } from '@/types/vehicle';
import type { SiteSettings } from '@/lib/inventory-api';
import { BrandGrid } from '@/components/home/BrandGrid';
import { BikeSectionRail } from '@/components/home/BikeSectionRail';
import { buildRails, formatNpr, BUDGET_CAP, UPPER_CAP } from '@/components/home/home-data';
import { ServicesHero } from '@/components/home/ServicesHero';

const elsewhere = [
  { title: 'Service your bike', body: 'Same-day general servicing and repairs for every major brand.', href: '/book-service' },
  { title: 'Sell or exchange', body: 'Send photos and details, get a fair valuation the same day.', href: '/sell' },
];

export function HomeClient({ vehicles }: { vehicles: Vehicle[]; settings: SiteSettings }) {
  const inStock = useMemo(() => vehicles.filter(v => v.has_photos), [vehicles]);
  const rails = useMemo(() => buildRails(inStock), [inStock]);

  return (
    <>
    <ServicesHero />
    <div className="max-w-7xl mx-auto px-4 pt-0 pb-24">
      <BrandGrid vehicles={inStock.filter(v => v.status !== 'sold')} />

      {inStock.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">No bikes are listed right now. Please check back soon.</p>
      ) : (
        <>
          <BikeSectionRail
            title="Most popular"
            subtitle="The bikes people are opening most, over the last 30 days"
            bikes={rails.popular}
            badges={rails.badges}
            viewAllLink="/inventory"
            withSearch
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
            title={`Budget deals: under ${formatNpr(UPPER_CAP)}`}
            subtitle="Step up a little, cheapest first"
            bikes={rails.budget2}
            badges={rails.badges}
            viewAllLink="/inventory?sort=price-low"
          />
          <BikeSectionRail
            title="Second hand scooters"
            subtitle="Inspected scooters on our showroom floor, newest first"
            bikes={rails.scooters}
            badges={rails.badges}
            viewAllLink="/second-hand-scooters-nepal"
          />
          <BikeSectionRail
            title="Second hand bikes"
            subtitle="Inspected motorcycles on our showroom floor, newest first"
            bikes={rails.bikes}
            badges={rails.badges}
            viewAllLink="/second-hand-bikes-nepal"
          />
        </>
      )}

      <div className="mt-6 text-center">
        <Link href="/inventory" className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-semibold hover:border-brand hover:text-brand transition-colors">
          Browse all {inStock.filter(v => v.status !== 'sold').length} bikes &amp; scooters <ArrowUpRight className="w-4 h-4" />
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
