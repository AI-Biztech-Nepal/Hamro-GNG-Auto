"use client"

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeftRight, Phone, MessageCircle, ShieldCheck, Gauge, Calendar, Hash, Eye } from 'lucide-react';
import type { Vehicle } from '@/types/vehicle';
import { CONTACT_INFO } from '@/lib/constants';
import { vehiclePageUrl } from '@/lib/vehicle-link';
import { formatNpr, type Badge } from '@/components/home/home-data';
import { cn } from '@/lib/utils';

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
  // Only show what is actually recorded: an empty "0 km" or a made-up lot number would mislead.
  const specs = [
    { icon: Calendar, text: String(vehicle.year) },
    vehicle.registration_number ? { icon: Hash, text: vehicle.registration_number } : null,
    vehicle.km_run != null ? { icon: Gauge, text: `${vehicle.km_run.toLocaleString()} km` } : null,
  ].filter(Boolean) as { icon: typeof Calendar; text: string }[];

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
        {isSold && (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/30">
            <span className="rounded bg-red-600 px-4 py-1 text-sm font-bold uppercase tracking-[0.2em] text-white shadow-lg">Sold</span>
          </span>
        )}
        {isSold ? (
          <span className="absolute top-2.5 left-2.5 rounded bg-red-600 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
            Sold
          </span>
        ) : isReserved ? (
          <span className="absolute top-2.5 left-2.5 rounded bg-amber-500 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-black">
            Booked
          </span>
        ) : badge && (
          <span className={cn('absolute top-2.5 left-2.5 rounded px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide', BADGE_STYLE[badge])}>
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
              href="/exchange"
              className="flex shrink-0 items-center gap-1 rounded-md border border-brand/40 px-1.5 py-1 text-[11px] font-semibold leading-none text-brand transition-colors hover:bg-brand hover:text-brand-foreground"
            >
              <ArrowLeftRight className="h-3 w-3" /> Exchange
            </Link>}
          </div>

          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md bg-muted/60 px-2 py-1.5 text-[11px] text-muted-foreground">
            {specs.map(({ icon: Icon, text }) => (
              <span key={text} className="flex items-center gap-1"><Icon className="h-3 w-3" /> {text}</span>
            ))}
            {vehicle.engine_cc ? <span>{vehicle.engine_cc}cc</span> : null}
          </div>

          <div className="mt-3 flex items-baseline justify-between gap-2">
            <span className="font-headline text-lg font-bold tabular-nums text-foreground">{formatNpr(vehicle.price)}</span>
            {(vehicle.view_count ?? 0) > 0 && (
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground" title="Times this bike's page was opened in the last 30 days">
                <Eye className="h-3 w-3" /> {vehicle.view_count}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 border-t border-border pt-2">
          <Link href={href} className="flex-1 rounded-lg bg-brand px-3 py-2 text-center text-xs font-semibold tracking-tight text-brand-foreground transition-opacity hover:opacity-90">
            View Details
          </Link>
          {!isSold && <a
            href={`https://wa.me/${CONTACT_INFO.whatsapp}?text=${whatsappMessage}`}
            data-vehicle-id={vehicle.id}
            data-vehicle-title={vehicle.title}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp inquiry"
            className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2 text-emerald-600 transition-colors hover:bg-emerald-500/20"
          >
            <MessageCircle className="h-4 w-4" />
          </a>}
          {!isSold && <a
            href={`tel:${CONTACT_INFO.phone}`}
            data-vehicle-id={vehicle.id}
            data-vehicle-title={vehicle.title}
            aria-label="Call the showroom"
            className="rounded-lg bg-muted p-2 text-foreground transition-colors hover:bg-muted/70"
          >
            <Phone className="h-4 w-4" />
          </a>}
        </div>
      </div>
    </div>
  );
}
