"use client"

import Link from 'next/link';
import type { Vehicle } from '@/types/vehicle';

// Logo files live in /public/brands/<slug>.svg. A brand without a file shows its name instead,
// so adding a logo later is just dropping a file in and listing its slug here.
const LOGOS = new Set(['honda', 'yamaha', 'suzuki', 'hero', 'bajaj']);

const slugOf = (brand: string) => brand.toLowerCase().replace(/[^a-z0-9]+/g, '-');

/** Brand tiles with the real number of bikes in stock for each, most stocked first. */
export function BrandGrid({ vehicles }: { vehicles: Vehicle[] }) {
  const counts = new Map<string, number>();
  for (const v of vehicles) if (v.brand?.trim()) counts.set(v.brand, (counts.get(v.brand) ?? 0) + 1);
  // "Other" is a catch-all rather than a make, so it always goes last.
  const brands = [...counts.entries()].sort((a, b) => (a[0] === 'Other' ? 1 : b[0] === 'Other' ? -1 : b[1] - a[1]));
  if (!brands.length) return null;

  return (
    <section className="py-6">
      <h2 className="mb-3 font-headline text-lg font-bold text-foreground md:text-xl">Shop by brand</h2>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-7">
        {brands.map(([brand, count]) => {
          const slug = slugOf(brand);
          return (
            <Link
              key={brand}
              href={`/inventory?brand=${encodeURIComponent(brand)}`}
              className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-background px-3 py-4 text-center transition-all hover:border-brand hover:shadow-md"
            >
              <span className="flex h-9 w-full items-center justify-center">
                {LOGOS.has(slug) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={`/brands/${slug}.svg`} alt={brand} className="max-h-9 max-w-full object-contain" loading="lazy" />
                ) : (
                  <span className="font-headline text-base font-bold tracking-tight text-foreground">{brand === 'Other' ? 'Other brands' : brand}</span>
                )}
              </span>
              <span className="text-[11px] text-muted-foreground">{count} available</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
