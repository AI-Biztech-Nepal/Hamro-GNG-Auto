"use client"

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeftRight, ArrowRight, Phone, ShieldCheck, Eye } from 'lucide-react';
import type { Vehicle } from '@/types/vehicle';
import { CONTACT_INFO } from '@/lib/constants';
import { vehiclePageUrl } from '@/lib/vehicle-link';
import { formatNpr, type Badge } from '@/components/home/home-data';
import { cn } from '@/lib/utils';
import { LogoBadge } from '@/components/ui/logo-badge';
import { WhatsAppIcon } from '@/components/ui/whatsapp-icon';

const BADGE_STYLE: Record<Badge, string> = {
  'Most Viewed': 'bg-brand text-brand-foreground',
  'Lowest Price': 'bg-emerald-600 text-white',
  'Fresh Arrival': 'bg-indigo-600 text-white',
};

interface BikeCardProps {
  vehicle: Vehicle;
  badge?: Badge;
  isPriority?: boolean;
  /** Show the whole photo at its own ratio (letterboxed over a soft blur) instead of cropping it to the frame. */
  keepRatio?: boolean;
}

/** A rail card: photo, a few real specs, price, and one-tap View / WhatsApp / Call. */
export function BikeCard({ vehicle, badge, isPriority = false, keepRatio = false }: BikeCardProps) {
  const isSold = vehicle.status === 'sold';
  const isReserved = vehicle.status === 'reserved';
  const href = `/inventory/${vehicle.id}`;
  const whatsappMessage = encodeURIComponent(
    `Namaste! 🙏 I found you through your website, hamroauto.com.np, and I'm interested in ${vehicle.title}${vehicle.registration_number ? ` (${vehicle.registration_number})` : ''}, ${formatNpr(vehicle.price)}. Is it still available?\n\n${vehiclePageUrl(vehicle.id)}`,
  );
  // Only show what is actually recorded: an empty "0 km" or a made-up number would mislead.
  const specs = [
    { label: 'Model', value: String(vehicle.year) },
    vehicle.registration_number ? { label: 'Vehicle No.', value: vehicle.registration_number } : null,
    vehicle.engine_cc ? { label: 'Power', value: `${vehicle.engine_cc}cc` } : null,
    vehicle.km_run != null ? { label: 'Driven', value: `${vehicle.km_run.toLocaleString()} km` } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className={cn('group relative flex h-full flex-col justify-between overflow-hidden border border-border bg-background transition-colors duration-200 hover:border-brand', isSold && 'opacity-90')}>
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        <Link href={href} aria-label={vehicle.title}>
          {keepRatio && (
            <Image
              src={vehicle.image_urls[0]}
              alt=""
              aria-hidden="true"
              fill
              loading="lazy"
              sizes="64px"
              className={cn('scale-125 object-cover opacity-70 blur-xl', isSold && 'grayscale')}
            />
          )}
          <Image
            src={vehicle.image_urls[0]}
            alt={vehicle.title}
            fill
            priority={isPriority}
            loading={isPriority ? 'eager' : 'lazy'}
            sizes={keepRatio ? '(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw' : '290px'}
            className={cn(
              keepRatio ? 'object-contain' : 'object-cover transition-transform duration-300 group-hover:scale-105',
              isSold && 'grayscale',
            )}
          />
        </Link>
        <LogoBadge />
        {isSold && (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/30">
            <span className="rounded bg-red-600 px-4 py-1 text-sm font-bold uppercase tracking-[0.2em] text-white shadow-lg">Sold</span>
          </span>
        )}
        {isSold ? (
          <span className="absolute top-2.5 right-2.5 rounded bg-red-600 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
            Sold
          </span>
        ) : isReserved ? (
          <span className="absolute top-2.5 right-2.5 rounded bg-amber-500 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-black">
            Booked
          </span>
        ) : badge && (
          <span className={cn('absolute top-2.5 right-2.5 rounded px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide', BADGE_STYLE[badge])}>
            {badge}
          </span>
        )}
        {!isSold && <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-black/75 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 backdrop-blur-sm">
          <ShieldCheck className="h-3 w-3" /> Inspected
        </span>}
      </div>

      <div className="flex flex-1 flex-col justify-between gap-3 p-3.5">
        <div>
          {/* On a narrow card (two columns on a phone) the button wraps under the name rather than squeezing it. */}
          <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5">
            <Link href={href} className="min-w-0">
              <h3 className="line-clamp-1 text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-brand md:text-base">
                {vehicle.title}
              </h3>
            </Link>
            {!isSold && <Link
              href={`/exchange?vehicle=${vehicle.id}`}
              className="flex shrink-0 items-center gap-1 rounded-md bg-brand px-2 py-1 text-[11px] font-semibold leading-none text-brand-foreground transition-opacity hover:opacity-90"
            >
              <ArrowLeftRight className="h-3 w-3" /> Exchange
            </Link>}
          </div>

          <dl className="mt-2.5 divide-y divide-border/70 overflow-hidden rounded-md border border-border/70 bg-muted/40 text-xs">
            {specs.map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between gap-2 px-2 py-1">
                <dt className="shrink-0 text-muted-foreground">{label}</dt>
                <dd className="min-w-0 truncate text-right font-semibold tabular-nums text-foreground">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-3 flex items-baseline justify-between gap-2">
            <span className="font-headline text-lg font-bold tabular-nums text-foreground">{formatNpr(vehicle.price)}</span>
            {(vehicle.view_count ?? 0) > 0 && (
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground" title="Times this bike's page was opened in the last 30 days">
                <Eye className="h-3 w-3" /> {vehicle.view_count}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2 border-t border-border pt-3">
          <Link href={href} className="flex h-10 w-full items-center justify-center gap-1.5 rounded-lg bg-brand text-sm font-bold tracking-tight text-brand-foreground shadow-sm transition-opacity hover:opacity-90">
            View Details <ArrowRight className="h-4 w-4" />
          </Link>
          {!isSold && (
            <div className="grid grid-cols-2 gap-2">
              <a
                href={`https://wa.me/${CONTACT_INFO.whatsapp}?text=${whatsappMessage}`}
                data-vehicle-id={vehicle.id}
                data-vehicle-title={vehicle.title}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp inquiry"
                className="flex h-10 items-center justify-center gap-1.5 rounded-lg bg-[#25D366] text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#1ebe5a]"
              >
                <WhatsAppIcon className="h-[18px] w-[18px]" /> WhatsApp
              </a>
              <a
                href={`tel:${CONTACT_INFO.phone}`}
                data-vehicle-id={vehicle.id}
                data-vehicle-title={vehicle.title}
                aria-label="Call the showroom"
                className="flex h-10 items-center justify-center gap-1.5 rounded-lg bg-blue-600 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700"
              >
                <Phone className="h-4 w-4" /> Call
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
