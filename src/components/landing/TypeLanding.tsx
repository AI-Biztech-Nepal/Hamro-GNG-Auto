import Link from 'next/link';
import { Phone, ShieldCheck, FileCheck, BadgeDollarSign, Repeat, MapPin, ArrowRight } from 'lucide-react';
import { BikeCard } from '@/components/home/BikeCard';
import { WhatsAppIcon } from '@/components/ui/whatsapp-icon';
import { formatNpr } from '@/components/home/home-data';
import { CONTACT_INFO, SITE_URL } from '@/lib/constants';
import type { Vehicle, VehicleType } from '@/types/vehicle';

export interface Faq { q: string; a: string }

export interface LandingContent {
  kind: VehicleType;
  path: string;
  /** "scooters" / "bikes" */
  plural: string;
  h1: string;
  intro: string[];
  /** Section heading and text about what to check when buying one. */
  checklistTitle: string;
  checklist: string[];
  faqs: Faq[];
  otherPage: { href: string; label: string };
}

const GRID = 'grid grid-cols-2 gap-x-4 gap-y-8 md:gap-x-6 lg:grid-cols-3 xl:grid-cols-4';

/**
 * An SEO landing page for one kind of vehicle ("second hand scooters in Nepal"). Every number on it
 * (how many are in stock, the prices, the per-brand table) is computed from the live inventory, so
 * nothing can go stale or be invented. The FAQ is also published as FAQPage structured data.
 */
export function TypeLanding({ content, vehicles }: { content: LandingContent; vehicles: Vehicle[] }) {
  const inStock = vehicles.filter(v => v.type === content.kind && v.status !== 'sold' && v.has_photos);
  const prices = inStock.map(v => v.price).filter(p => p > 0);
  const years = inStock.map(v => v.year).filter(Boolean);
  const cheapest = prices.length ? Math.min(...prices) : null;
  const dearest = prices.length ? Math.max(...prices) : null;
  const shown = inStock.slice(0, 12);

  // One row per brand: how many, and the price range. Brands with no priced stock are left out.
  const byBrand = Object.values(
    inStock.reduce<Record<string, { brand: string; count: number; min: number; max: number }>>((acc, v) => {
      if (!v.brand || !(v.price > 0)) return acc;
      const row = acc[v.brand] ?? (acc[v.brand] = { brand: v.brand, count: 0, min: v.price, max: v.price });
      row.count += 1; row.min = Math.min(row.min, v.price); row.max = Math.max(row.max, v.price);
      return acc;
    }, {}),
  ).sort((a, b) => b.count - a.count);

  const url = `${SITE_URL}${content.path}`;
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: content.faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Inventory', item: `${SITE_URL}/inventory` },
        { '@type': 'ListItem', position: 3, name: content.h1, item: url },
      ],
    },
  ];

  const waText = encodeURIComponent(`Namaste! I found you on hamroauto.com.np and I'm looking for a second hand ${content.kind}.`);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
      {jsonLd.map((d, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(d) }} />
      ))}

      <nav aria-label="Breadcrumb" className="mb-5 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link> <span aria-hidden>/</span>{' '}
        <Link href="/inventory" className="hover:text-foreground">Inventory</Link> <span aria-hidden>/</span>{' '}
        <span className="text-foreground">{content.h1}</span>
      </nav>

      <header className="max-w-3xl">
        <span aria-hidden className="mb-4 block h-1 w-8 bg-brand" />
        <h1 className="font-headline text-3xl font-bold tracking-tight md:text-5xl">{content.h1}</h1>
        {content.intro.map((p, i) => (
          <p key={i} className="mt-4 leading-relaxed text-muted-foreground">{p}</p>
        ))}
      </header>

      {/* Live facts from the inventory */}
      {inStock.length > 0 && (
        <dl className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { k: `${content.plural} in stock now`, v: String(inStock.length) },
            cheapest != null && { k: 'Prices start from', v: formatNpr(cheapest) },
            dearest != null && { k: 'Up to', v: formatNpr(dearest) },
            years.length > 0 && { k: 'Model years', v: Math.min(...years) === Math.max(...years) ? String(years[0]) : `${Math.min(...years)} to ${Math.max(...years)}` },
          ].filter(Boolean).map(item => {
            const { k, v } = item as { k: string; v: string };
            return (
              <div key={k} className="rounded-lg border border-border bg-muted/40 p-4">
                <dd className="font-headline text-xl font-bold tabular-nums md:text-2xl">{v}</dd>
                <dt className="mt-0.5 text-xs text-muted-foreground">{k}</dt>
              </div>
            );
          })}
        </dl>
      )}

      {/* Stock */}
      <section aria-labelledby="stock" className="mt-12">
        <div className="mb-5 flex items-end justify-between gap-3 border-b border-border pb-2">
          <h2 id="stock" className="font-headline text-xl font-bold tracking-tight md:text-2xl">Second hand {content.plural} available now</h2>
          <Link href={`/inventory?type=${content.kind}`} className="flex shrink-0 items-center gap-1 text-sm font-semibold text-brand hover:underline">
            See all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {shown.length > 0 ? (
          <div className={GRID}>
            {shown.map((v, i) => <BikeCard key={v.id} vehicle={v} isPriority={i < 4} keepRatio />)}
          </div>
        ) : (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No {content.plural} are listed right now. Call us on {CONTACT_INFO.phone}: stock changes every day.
          </p>
        )}
      </section>

      {/* Price guide, built from the stock above */}
      {byBrand.length > 0 && (
        <section aria-labelledby="prices" className="mt-14 max-w-3xl">
          <h2 id="prices" className="font-headline text-xl font-bold tracking-tight md:text-2xl">Second hand {content.kind} price in Nepal</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            What our {content.plural} cost today, by make. These are the real, fixed prices of the {content.plural} on our floor,
            and they update as stock is sold and added.
          </p>
          <div className="mt-4 overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr><th className="px-4 py-2.5 font-semibold">Make</th><th className="px-4 py-2.5 font-semibold">In stock</th><th className="px-4 py-2.5 text-right font-semibold">Price range (NPR)</th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {byBrand.map(r => (
                  <tr key={r.brand}>
                    <td className="px-4 py-2.5 font-semibold">{r.brand}</td>
                    <td className="px-4 py-2.5 tabular-nums">{r.count}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{r.min === r.max ? r.min.toLocaleString('en-IN') : `${r.min.toLocaleString('en-IN')} to ${r.max.toLocaleString('en-IN')}`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Why us */}
      <section aria-labelledby="why" className="mt-14">
        <h2 id="why" className="font-headline text-xl font-bold tracking-tight md:text-2xl">Why buy a second hand {content.kind} from G&amp;G Auto</h2>
        <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { Icon: ShieldCheck, t: 'Inspected', d: `Every ${content.kind} goes through a 40-point inspection before it is listed.` },
            { Icon: FileCheck, t: 'Genuine paperwork', d: 'Ownership transfer is handled for you, so the paperwork is clean on the day of delivery.' },
            { Icon: BadgeDollarSign, t: 'Fixed, fair price', d: 'The price on the listing is the price. No bargaining games.' },
            { Icon: Repeat, t: 'Exchange accepted', d: `Trade in the ${content.kind} you ride today towards one from our floor.` },
          ].map(({ Icon, t, d }) => (
            <li key={t} className="rounded-lg border border-border p-4">
              <Icon className="h-5 w-5 text-brand" strokeWidth={2} />
              <h3 className="mt-2 font-headline font-semibold">{t}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{d}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Buying guide */}
      <section aria-labelledby="guide" className="mt-14 max-w-3xl">
        <h2 id="guide" className="font-headline text-xl font-bold tracking-tight md:text-2xl">{content.checklistTitle}</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground marker:font-semibold marker:text-foreground">
          {content.checklist.map(item => <li key={item}>{item}</li>)}
        </ol>
      </section>

      {/* FAQ */}
      <section aria-labelledby="faq" className="mt-14 max-w-3xl">
        <h2 id="faq" className="font-headline text-xl font-bold tracking-tight md:text-2xl">Questions about buying a second hand {content.kind} in Nepal</h2>
        <div className="mt-4 divide-y divide-border rounded-lg border border-border">
          {content.faqs.map(f => (
            <details key={f.q} className="group px-4 py-3">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold marker:hidden [&::-webkit-details-marker]:hidden">
                {f.q}
                <span aria-hidden className="text-brand transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Call to action */}
      <section className="mt-14 rounded-xl bg-secondary px-6 py-10 text-white sm:px-10">
        <div className="max-w-xl">
          <span aria-hidden className="mb-4 block h-1 w-8 bg-brand" />
          <h2 className="font-headline text-2xl font-bold tracking-tight md:text-3xl">Come and see them in person</h2>
          <p className="mt-3 flex items-start gap-2 leading-relaxed text-white/75">
            <MapPin className="mt-1 h-4 w-4 shrink-0" />
            Hamro G&amp;G Auto Enterprises, {CONTACT_INFO.address}, {CONTACT_INFO.addressLocality}. Open every day, 9 am to 7 pm.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a href={`https://wa.me/${CONTACT_INFO.whatsapp}?text=${waText}`} target="_blank" rel="noopener noreferrer"
               className="flex h-12 items-center justify-center gap-2 rounded-lg bg-[#25D366] px-6 font-bold text-white hover:bg-[#1ebe5a]">
              <WhatsAppIcon className="h-5 w-5" /> WhatsApp us
            </a>
            <a href={`tel:${CONTACT_INFO.phone}`} className="flex h-12 items-center justify-center gap-2 rounded-lg border border-white/30 px-6 font-bold hover:bg-white/10">
              <Phone className="h-4 w-4" /> Call {CONTACT_INFO.phone}
            </a>
          </div>
          <p className="mt-6 text-sm text-white/60">
            Looking for something else?{' '}
            <Link href={content.otherPage.href} className="font-semibold text-white underline underline-offset-2">{content.otherPage.label}</Link>,{' '}
            <Link href="/sell" className="font-semibold text-white underline underline-offset-2">sell your bike</Link> or{' '}
            <Link href="/exchange" className="font-semibold text-white underline underline-offset-2">exchange it</Link>.
          </p>
        </div>
      </section>
    </div>
  );
}
