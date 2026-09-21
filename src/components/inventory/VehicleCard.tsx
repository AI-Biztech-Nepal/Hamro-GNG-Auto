
"use client"

import Link from 'next/link';
import Image from 'next/image';
import { Vehicle } from '@/types/vehicle';

interface VehicleCardProps {
  vehicle: Vehicle;
  isPriority?: boolean;
}

export function VehicleCard({ vehicle, isPriority = false }: VehicleCardProps) {
  const isSold = vehicle.status === 'sold';
  const meta = [
    String(vehicle.year),
    vehicle.engine_cc ? `${vehicle.engine_cc}cc` : null,
    vehicle.km_run != null ? `${vehicle.km_run.toLocaleString()} km` : null,
    vehicle.condition,
  ].filter(Boolean).join('  ·  ');

  return (
    <Link href={`/inventory/${vehicle.id}`} className="group block">
      <div className="relative aspect-[4/3] transition-transform duration-1200 ease-cinematic group-hover:z-20 group-hover:scale-110">
        <div className="absolute inset-0 overflow-hidden rounded-md border border-border bg-neutral-100 transition-shadow duration-1200 ease-cinematic group-hover:shadow-2xl">
          {/* Always fills the 4:3 frame (cropped) — the slow zoom-out on hover is purely a scale animation, never a reveal of the full photo */}
          <Image
            src={vehicle.image_urls[0]}
            alt={vehicle.title}
            fill
            priority={isPriority}
            loading={isPriority ? "eager" : "lazy"}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover object-center scale-125 transition-transform duration-1200 ease-cinematic group-hover:scale-100"
          />
          {isSold && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="bg-destructive text-destructive-foreground text-xs md:text-sm font-bold tracking-wide px-3 py-1 rounded">
                SOLD
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="pt-2.5">
        <h3 className="font-semibold text-[13px] md:text-sm leading-snug text-brand group-hover:underline underline-offset-2 line-clamp-2">
          {vehicle.title}
        </h3>
        <p className="mt-1 font-headline font-bold text-base md:text-lg tracking-tight tabular-nums text-foreground">
          <span className="text-[0.7em] font-semibold text-muted-foreground align-[0.15em] mr-1">NPR</span>
          {vehicle.price.toLocaleString()}
        </p>
        <p className="mt-0.5 text-[11px] md:text-xs text-muted-foreground">
          {meta}
        </p>
      </div>
    </Link>
  );
}
