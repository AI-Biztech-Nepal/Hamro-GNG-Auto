
"use client"

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Phone, MessageCircle, Share2, ShieldCheck, FileCheck, MapPin } from 'lucide-react';
import { CONTACT_INFO } from '@/lib/constants';
import { Vehicle } from '@/types/vehicle';
import { useToast } from '@/hooks/use-toast';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { useEffect, useState } from 'react';

/*
  VEHICLE DETAIL — "One sheet"
  THESIS: a single spec sheet that scrolls as one object. No sticky sidebar, no
    floating panels drifting past each other — gallery, summary and details sit
    on one hairline-ruled page.
  OWN-WORLD: Ink & Paper. Contained column, ink price, plain spec table with
    row rules, no nested cards.
*/

export function VehicleDetailClient({ vehicle }: { vehicle: Vehicle }) {
  const router = useRouter();
  const { toast } = useToast();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  const whatsappMessage = `Hello Hamro G&G Auto, I am interested in the ${vehicle.title} (${vehicle.year} model) priced at NPR ${vehicle.price.toLocaleString()}. Is it still available?`;
  const whatsappUrl = `https://wa.me/${CONTACT_INFO.whatsapp}?text=${encodeURIComponent(whatsappMessage)}`;
  const images = vehicle.image_urls?.length ? vehicle.image_urls : ['https://picsum.photos/seed/vehicle/800/600'];
  const isSold = vehicle.status === 'sold';

  const specs: { label: string; value: string }[] = [
    { label: 'Brand', value: vehicle.brand },
    { label: 'Model', value: vehicle.model || vehicle.title },
    { label: 'Year', value: String(vehicle.year) },
    { label: 'Kilometres run', value: `${vehicle.km_run.toLocaleString()} km` },
    { label: 'Type', value: vehicle.type === 'scooter' ? 'Scooter' : 'Bike' },
    { label: 'Condition', value: vehicle.condition },
  ];

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const shareData = {
      title: vehicle.title,
      text: `${vehicle.title} — NPR ${vehicle.price.toLocaleString()} at Hamro G&G Auto`,
      url,
    };
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share(shareData);
        return;
      }
      await navigator.clipboard.writeText(url);
      toast({ title: 'Link copied', description: 'Vehicle link copied to your clipboard.' });
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      toast({ variant: 'destructive', title: "Couldn't share", description: 'Please copy the link from your address bar.' });
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-10">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="w-4 h-4" /> Back to inventory
      </button>

      <div className="mt-6 lg:grid lg:grid-cols-[1.35fr_1fr] lg:gap-x-12 lg:gap-y-10">
        {/* Gallery */}
        <div className="lg:col-start-1 lg:row-start-1">
          <div className="relative overflow-hidden rounded-lg border border-border bg-neutral-100 group">
            <Carousel setApi={setApi} className="w-full">
              <CarouselContent>
                {images.map((url, index) => (
                  <CarouselItem key={index}>
                    <div className="relative aspect-[4/3] w-full">
                      <Image
                        src={url}
                        alt={`${vehicle.title} — photo ${index + 1}`}
                        fill
                        priority={index === 0}
                        sizes="(max-width: 1024px) 100vw, 55vw"
                        className="object-cover object-center"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {images.length > 1 && (
                <>
                  <CarouselPrevious className="left-3 opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-border shadow-sm h-10 w-10" />
                  <CarouselNext className="right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-border shadow-sm h-10 w-10" />
                </>
              )}
            </Carousel>

            {isSold && (
              <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                <span className="text-white font-bold text-3xl md:text-5xl tracking-[0.2em] border-2 border-white px-6 py-3">SOLD</span>
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
              {images.map((url, i) => (
                <button
                  key={i}
                  onClick={() => api?.scrollTo(i)}
                  aria-label={`View photo ${i + 1}`}
                  className={`relative h-14 w-[74px] shrink-0 overflow-hidden rounded border bg-neutral-100 transition-colors ${
                    current === i ? 'border-brand ring-1 ring-brand' : 'border-border hover:border-foreground/40'
                  }`}
                >
                  <Image src={url} alt="" fill sizes="80px" className="object-cover object-center" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Summary — title, price, actions, specs */}
        <div className="mt-8 lg:mt-0 lg:col-start-2 lg:row-start-1 lg:row-span-2">
          <div className="flex items-start justify-between gap-4">
            <h1 className="font-headline font-bold text-2xl sm:text-3xl md:text-4xl tracking-tight leading-tight">
              {vehicle.title}
            </h1>
            <Button
              variant="outline"
              size="icon"
              onClick={handleShare}
              aria-label="Share this vehicle"
              className="rounded-md h-10 w-10 shrink-0"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-sm font-semibold text-muted-foreground">NPR</span>
            <span className="font-headline text-3xl sm:text-4xl font-bold tracking-tight tabular-nums">
              {vehicle.price.toLocaleString()}
            </span>
          </div>
          <p className="mt-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-brand">
            {isSold ? 'Sold' : 'Available now'}
            <span className="ml-2 font-normal normal-case tracking-normal text-muted-foreground">
              {isSold ? '' : 'Fixed price · genuine paperwork'}
            </span>
          </p>

          {!isSold && (
            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button className="h-12 text-base font-semibold gap-2" asChild>
                <a href={`tel:${CONTACT_INFO.phone}`}>
                  <Phone className="w-4 h-4" /> Call
                </a>
              </Button>
              <Button
                className="h-12 text-base font-semibold gap-2 bg-[#25D366] hover:bg-[#25D366]/90 text-white border-none"
                asChild
              >
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </a>
              </Button>
            </div>
          )}

          <dl className="mt-8 border-t border-border">
            {specs.map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between gap-4 border-b border-border py-3">
                <dt className="text-sm text-muted-foreground">{label}</dt>
                <dd className="text-sm font-semibold text-right">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Description + reassurance */}
        <div className="mt-10 lg:mt-0 lg:col-start-1 lg:row-start-2">
          {vehicle.description?.trim() && (
            <section>
              <h2 className="font-headline font-bold text-xl">Description</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground whitespace-pre-wrap">
                {vehicle.description}
              </p>
            </section>
          )}

          <div className="mt-8 border-t border-border pt-6 flex flex-wrap gap-x-8 gap-y-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 text-brand" /> Passed our 40-point inspection
            </span>
            <span className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 shrink-0 text-brand" /> Genuine paperwork, transfer handled
            </span>
            <a
              href={CONTACT_INFO.mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-foreground"
            >
              <MapPin className="w-4 h-4 shrink-0 text-brand" /> {CONTACT_INFO.address}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
