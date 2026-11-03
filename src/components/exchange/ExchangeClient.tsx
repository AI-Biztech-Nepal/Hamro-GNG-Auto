"use client"

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BikeLeadForm } from '@/components/BikeLeadForm';
import { formatNpr } from '@/components/home/home-data';
import { vehiclePageUrl } from '@/lib/vehicle-link';
import type { Vehicle } from '@/types/vehicle';

/** Only what is actually recorded for the bike, worded as on its own page. */
function vehicleDetails(v: Vehicle) {
  return [
    v.year ? { label: 'Year', value: String(v.year) } : null,
    v.registration_number ? { label: 'Registration', value: v.registration_number } : null,
    v.km_run != null ? { label: 'Kilometres run', value: `${v.km_run.toLocaleString()} km` } : null,
    v.engine_cc ? { label: 'Engine', value: `${v.engine_cc} cc` } : null,
    v.fuel_type ? { label: 'Fuel', value: v.fuel_type } : null,
    v.owners ? { label: 'Owners', value: v.owners === 1 ? 'First owner' : `${v.owners} previous owners` } : null,
    v.color ? { label: 'Colour', value: v.color } : null,
    v.condition ? { label: 'Condition', value: v.condition } : null,
  ].filter(Boolean) as { label: string; value: string }[];
}

/** Same layout and form as Sell. `vehicle` is the bike whose Exchange button brought them here, if any. */
export function ExchangeClient({ vehicle }: { vehicle: Vehicle | null }) {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="font-headline font-bold text-4xl">Request Received!</h1>
        <p className="text-xl text-muted-foreground">Thank you. Our valuation expert will review your bike details and contact you shortly to discuss the best exchange price.</p>
        <Button size="lg" asChild className="rounded-full px-10">
          <a href="/">Return Home</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Content */}
        <div className="lg:col-span-5 space-y-8">
          <div className="space-y-6">
            <span aria-hidden className="block w-8 h-1 bg-brand" />
            <h1 className="font-headline font-bold text-4xl md:text-5xl leading-tight tracking-tight">Exchange your bike, <br />ride away on a better one.</h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Trade what you ride now towards something better. Send your current bike&rsquo;s
              photos and details for a straight valuation.
            </p>
          </div>

          <div className="border-t border-border">
            {['Share your bike’s details and photos', 'Get an estimated exchange value', 'Finalise at the showroom and swap the keys'].map(item => (
              <div key={item} className="flex items-center gap-3 border-b border-border py-3.5">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-brand" strokeWidth={2} />
                <p className="font-medium">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Form */}
        <div className="lg:col-span-7 space-y-6">
          {vehicle && (
            <div className="rounded-xl border border-brand/40 bg-white p-4 md:p-6">
              <div className="flex items-center gap-4">
                {vehicle.has_photos && (
                  <div className="relative aspect-[4/3] w-28 shrink-0 overflow-hidden rounded-md bg-muted md:w-36">
                    <Image src={vehicle.image_urls[0]} alt="" fill sizes="144px" className="object-cover" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Bike you want in exchange</p>
                  <Link href={`/inventory/${vehicle.id}`} className="mt-1 block font-headline text-lg font-bold leading-snug hover:text-brand md:text-xl">
                    {vehicle.title}
                  </Link>
                  <p className="mt-1 font-headline text-lg font-bold tabular-nums">{formatNpr(vehicle.price)}</p>
                </div>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-border pt-4 sm:grid-cols-3">
                {vehicleDetails(vehicle).map(({ label, value }) => (
                  <div key={label} className="min-w-0">
                    <dt className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{label}</dt>
                    <dd className="mt-0.5 break-words text-sm font-semibold">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          <BikeLeadForm
            type="exchange"
            heading={vehicle ? 'Your Current Bike' : 'Vehicle Details'}
            submitLabel="Request an exchange valuation"
            footnote="No obligation · we’ll call you back with an offer"
            askInterest={!vehicle}
            buildMessage={(details, values) => {
              // The bike's link goes in the message so the team can open exactly which one, as two can share a title.
              const wanted = vehicle
                ? `${vehicle.title}${vehicle.registration_number ? ` (${vehicle.registration_number})` : ''}, ${formatNpr(vehicle.price)}, ${vehiclePageUrl(vehicle.id)}`
                : values.interested_in;
              return `Exchange Inquiry: ${details} Wants: ${wanted}.`;
            }}
            successToast={{ title: 'Exchange Request Sent', description: "We'll review your bike details and photos and call you with an offer." }}
            onSubmitted={() => setSubmitted(true)}
          />
        </div>
      </div>
    </div>
  );
}
