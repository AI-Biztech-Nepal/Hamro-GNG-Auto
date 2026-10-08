
"use client"

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Pause, Play, Phone, MessageCircle, Share2, ShieldCheck, FileCheck, MapPin } from 'lucide-react';
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
import { useEffect, useRef, useState } from 'react';

const SLIDE_MS = 4500;

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

  const thumbsRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = useState(false);
  const [inView, setInView] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);
  const [stopped, setStopped] = useState(false); // visitor took over or pressed pause
  const [reducedMotion, setReducedMotion] = useState(true);

  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener('change', onChange);
    const onVisibility = () => setTabVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.4 });
    if (galleryRef.current) io.observe(galleryRef.current);
    return () => {
      mq.removeEventListener('change', onChange);
      document.removeEventListener('visibilitychange', onVisibility);
      io.disconnect();
    };
  }, []);

  // Keep the active thumbnail in view inside the strip without scrolling the page.
  useEffect(() => {
    const strip = thumbsRef.current;
    const el = strip?.children[current] as HTMLElement | undefined;
    if (!strip || !el) return;
    strip.scrollTo({ left: el.offsetLeft - (strip.clientWidth - el.clientWidth) / 2, behavior: reducedMotion ? 'auto' : 'smooth' });
  }, [current, reducedMotion]);

  const whatsappMessage = `Hello Hamro G&G Auto, I am interested in the ${vehicle.title} (${vehicle.year} model) priced at NPR ${vehicle.price.toLocaleString()}. Is it still available?`;
  const whatsappUrl = `https://wa.me/${CONTACT_INFO.whatsapp}?text=${encodeURIComponent(whatsappMessage)}`;
  const images = vehicle.image_urls?.length ? vehicle.image_urls : ['https://picsum.photos/seed/vehicle/800/600'];
  const isSold = vehicle.status === 'sold';
  const autoplay = images.length > 1 && !reducedMotion && !stopped;
  const running = autoplay && inView && tabVisible && !hovering;

  const specs = (
    [
      { label: 'Brand', value: vehicle.brand },
      { label: 'Model', value: [vehicle.model || vehicle.title, vehicle.variant].filter(Boolean).join(' ') },
      { label: 'Year', value: String(vehicle.year) },
      { label: 'Type', value: vehicle.type === 'scooter' ? 'Scooter' : 'Bike' },
      vehicle.engine_cc ? { label: 'Engine', value: `${vehicle.engine_cc} cc` } : null,
      vehicle.fuel_type ? { label: 'Fuel', value: vehicle.fuel_type } : null,
      { label: 'Kilometres run', value: vehicle.km_run != null ? `${vehicle.km_run.toLocaleString()} km` : 'Ask at the showroom' },
      vehicle.owners ? { label: 'Owners', value: vehicle.owners === 1 ? 'First owner' : `${vehicle.owners} previous owners` } : null,
      vehicle.color ? { label: 'Colour', value: vehicle.color } : null,
      vehicle.registration_number ? { label: 'Registration', value: vehicle.registration_number } : null,
      { label: 'Condition', value: vehicle.condition },
    ] as ({ label: string; value: string } | null)[]
  ).filter((s): s is { label: string; value: string } => s !== null && s.value !== '');

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
        <div className="lg:col-start-1 lg:row-start-1" ref={galleryRef}>
          <div
            className="relative overflow-hidden rounded-lg border border-border bg-neutral-100 group"
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            onPointerDown={() => setStopped(true)}
          >
            <Carousel setApi={setApi} className="w-full" opts={{ loop: true }}>
              <CarouselContent>
                {images.map((url, index) => (
                  <CarouselItem key={index}>
                    <div className="relative aspect-[4/3] w-full overflow-hidden">
                      <Image
                        src={url}
                        alt=""
                        aria-hidden="true"
                        fill
                        sizes="(max-width: 1024px) 100vw, 55vw"
                        className="object-cover object-center scale-110 blur-xl opacity-60"
                      />
                      <Image
                        src={url}
                        alt={`${vehicle.title} — photo ${index + 1}`}
                        fill
                        priority={index === 0}
                        sizes="(max-width: 1024px) 100vw, 55vw"
                        className="object-contain object-center"
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

            {images.length > 1 && !reducedMotion && (
              <button
                onPointerDown={e => e.stopPropagation()}
                onClick={() => setStopped(v => !v)}
                aria-label={autoplay ? 'Pause slideshow' : 'Play slideshow'}
                className="absolute bottom-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 border border-border shadow-sm text-foreground hover:bg-white"
              >
                {autoplay ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              </button>
            )}

            {isSold && (
              <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                <span className="text-white font-bold text-3xl md:text-5xl tracking-[0.2em] border-2 border-white px-6 py-3">SOLD</span>
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div ref={thumbsRef} className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
              {images.map((url, i) => (
                <button
                  key={i}
                  onClick={() => { setStopped(true); api?.scrollTo(i); }}
                  aria-label={`View photo ${i + 1}`}
                  className={`relative h-14 w-[74px] shrink-0 overflow-hidden rounded border bg-neutral-100 transition-colors ${
                    current === i ? 'border-brand ring-1 ring-brand' : 'border-border hover:border-foreground/40'
                  }`}
                >
                  <Image src={url} alt="" fill sizes="80px" className="object-cover object-center" />
                  {autoplay && current === i && (
                    <span
                      key={`${i}-${current}`}
                      aria-hidden="true"
                      onAnimationEnd={() => api?.scrollNext()}
                      className="absolute inset-x-0 bottom-0 h-[3px] origin-left bg-brand"
                      style={{ animation: `gallery-progress ${SLIDE_MS}ms linear forwards`, animationPlayState: running ? 'running' : 'paused' }}
                    />
                  )}
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
