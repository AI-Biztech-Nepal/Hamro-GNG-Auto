"use client"

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { CONTACT_INFO } from '@/lib/constants';

const DWELL_MS = 3000;
/** Sticky-note change: the current slide peels off up-left while the next one rolls up from below, together. */
const PEEL_MS = 800;
const PEEL_EASE = 'cubic-bezier(0.45, 0, 0.15, 1)';
const NOTE_OFF = 'translate3d(-105%,-8%,0) rotate(-10deg)';
const NOTE_WAIT = 'translate3d(0,14%,0) scale(0.94)';
const WHATSAPP_URL =`https://wa.me/${CONTACT_INFO.whatsapp}`;

interface Service {
  tab: string;
  lead: string;
  cta: string;
  href: string;
  image: string;
  alt: string;
  /** Studio shots are shown whole (never cropped through the vehicle); these are the photo's top and bottom edge colours, which fill any band around it. Showroom scenes fill the frame around `focus` instead. */
  bands?: [string, string];
  focus?: string;
}

const SERVICES: Service[] = [
  {
    tab: 'Sales and purchase',
    lead: 'Walk the floor at our Nayabasti, Boudha showroom. Inspected bikes and scooters, genuine paperwork, fixed prices.',
    cta: 'Browse the floor',
    href: '#stock',
    image: '/hero/handover-banner.jpg',
    focus: '82% 50%',
    alt: 'A Hamro G&G Auto team member handing a smiling customer the keys to a Honda Dio',
  },
  {
    tab: 'Exchange facility',
    lead: 'Trade in the bike you ride today and put its value toward one from our floor, settled in a single visit.',
    cta: 'Get an appraisal',
    href: '/exchange',
    image: '/hero/showroom-gg.jpg',
    focus: '50% 40%',
    alt: 'A smiling Hamro G&G Auto team member welcoming visitors on the showroom floor',
  },
  {
    tab: 'Servicing and repair',
    lead: 'Strange noise or weak brakes? Drop by and our own mechanics will look after your bike, often the same day.',
    cta: 'Book a slot',
    href: '/book-service',
    image: '/hero/service-banner.jpg',
    focus: '100% 50%',
    alt: 'A red Honda Grazia scooter in a bright showroom',
  },
  {
    tab: 'Ownership transfer',
    lead: 'Bought a bike from us? We guide you through every form, so it is in your name by the day you ride home.',
    cta: 'Talk to us',
    href: WHATSAPP_URL,
    image: '/hero/ownership-transfer.jpg',
    focus: '50% 30%',
    alt: 'A Hamro G&G Auto team member handing a customer the ownership transfer papers inside the showroom',
  },
  {
    tab: 'Our inventory',
    lead: 'Honda, Yamaha, Suzuki, Hero, Bajaj, TVS and more, all under one roof. Pick the brand you trust and find the bike or scooter that fits your ride and your budget.',
    cta: 'See all bikes',
    href: '/inventory',
    image: '/hero/showroom-yard.jpg',
    focus: '50% 60%',
    alt: 'Rows of used bikes and scooters in the Hamro G&G Auto yard in Nayabasti',
  },
  {
    tab: 'Free valuation',
    lead: 'Curious what your bike is worth? Send a few photos and we will tell you the same day. Free, no strings attached.',
    cta: 'Value my bike',
    href: '/sell',
    image: '/hero/valuation-showroom.jpg',
    focus: '50% 35%',
    alt: 'A smiling Hamro G&G Auto team member welcoming you inside the showroom, with bikes and the service counter behind her',
  },
];

export function ServicesHero() {
  const count = SERVICES.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const fitRef = useRef<HTMLDivElement>(null);
  const deskRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Below lg the desktop banner keeps the fixed width set by .hero-fit in globals.css and is shrunk to the phone's width.
  useEffect(() => {
    const fit = fitRef.current, desk = deskRef.current;
    if (!fit || !desk) return;
    const update = () => {
      fit.style.setProperty('--hero-scale', String(fit.clientWidth / desk.offsetWidth));
      fit.style.setProperty('--hero-h', `${desk.offsetHeight}px`);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(fit);
    ro.observe(desk);
    return () => ro.disconnect();
  }, []);

  const go = useCallback((next: number) => setIndex(((next % count) + count) % count), [count]);

  // Restarting on `index` resets the dwell timer after any manual move.
  useEffect(() => {
    if (paused || reduceMotion) return;
    const t = window.setTimeout(() => go(index + 1), DWELL_MS);
    return () => window.clearTimeout(t);
  }, [index, paused, reduceMotion, go]);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Our services"
      className="bg-white"
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') go(index + 1);
        if (e.key === 'ArrowLeft') go(index - 1);
      }}
    >
      <h1 className="sr-only">Hamro G&amp;G Auto: second-hand bikes and scooters in Boudha, Kathmandu. What we do.</h1>
      <div className="mx-auto max-w-7xl px-4 py-4 sm:py-5">
        <div ref={fitRef} className="hero-fit-box">
        <div ref={deskRef} className="hero-fit">
          {/* Banner */}
          <div
            className="relative overflow-hidden border border-neutral-200 bg-white"
            onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; setPaused(true); }}
            onTouchEnd={(e) => {
              const start = touchStartX.current;
              touchStartX.current = null;
              setPaused(false);
              if (start == null) return;
              const dx = e.changedTouches[0].clientX - start;
              if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
            }}
          >
            <div className="grid grid-cols-[minmax(0,1fr)]">
              {SERVICES.map((s, i) => {
                const on = i === index;
                // Signed, wrapped distance from the active banner so the track always glides left.
                let offset = (((i - index) % count) + count) % count;
                if (offset > count / 2) offset -= count;
                const near = Math.abs(offset) <= 1;
                const external = s.href.startsWith('http');
                return (
                  <div
                    key={s.tab}
                    aria-hidden={!on}
                    className={`hero-slide col-start-1 row-start-1 grid h-[27rem] grid-cols-[minmax(0,3fr)_minmax(0,7fr)] will-change-[transform,opacity] lg:h-[min(60svh,27rem)] ${on ? '' : 'pointer-events-none'}`}
                    style={{
                      transform: offset === 0 ? 'translate3d(0,0,0)' : offset < 0 ? NOTE_OFF : NOTE_WAIT,
                      opacity: on ? 1 : 0,
                      zIndex: on ? 10 : offset < 0 ? 20 : 0,
                      // Only the outgoing and incoming notes animate; the rest re-park unseen.
                      transition: reduceMotion || !near
                        ? 'none'
                        : on
                          ? `transform ${PEEL_MS}ms ${PEEL_EASE}, opacity 700ms ease-out`
                          : `transform ${PEEL_MS}ms ${PEEL_EASE}, opacity 700ms ease-in 300ms`,
                    }}
                  >
                    {/* Words */}
                    <div className="flex min-w-0 flex-col justify-center px-3 lg:px-6">
                      <span aria-hidden className="block h-[3px] w-8 bg-[#DC2626]" />
                      <p className="hero-title mt-3 font-headline text-[clamp(1.25rem,2.3vw,2rem)] font-extrabold uppercase leading-[1.05] tracking-tight text-neutral-950">
                        {s.tab}
                      </p>
                      <p className="hero-lead mt-3 text-[15px] leading-relaxed text-neutral-600">{s.lead}</p>
                      <Link
                        href={s.href}
                        tabIndex={on ? 0 : -1}
                        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                        className="hero-cta group mt-5 inline-flex h-11 w-fit items-center gap-2 bg-[#DC2626] px-5 text-[14px] font-semibold uppercase tracking-wide text-white shadow-[0_8px_20px_-8px_rgba(220,38,38,0.8)] transition-colors hover:bg-[#c42020]"
                      >
                        {s.cta}
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </div>

                    {/* Photo */}
                    <div className="relative" style={s.bands ? { background: `linear-gradient(${s.bands[0]} 50%, ${s.bands[1]} 50%)` } : undefined}>
                      <Image
                        src={s.image}
                        alt={s.alt}
                        fill
                        priority={i === 0}
                        sizes="(max-width: 1024px) 100vw, 70vw"
                        className={s.bands ? 'object-contain' : 'object-cover'}
                        style={s.bands ? undefined : { objectPosition: s.focus }}
                      />
                      <div aria-hidden className={`absolute inset-y-0 left-0 bg-gradient-to-r from-white to-transparent ${s.bands ? 'w-[8%]' : 'w-[16%]'}`} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Dots */}
            <div role="group" aria-label="Choose a service" className="absolute inset-x-0 bottom-3 z-10 flex justify-center gap-2">
              {SERVICES.map((s, i) => (
                <button
                  key={s.tab}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={s.tab}
                  aria-current={i === index}
                  className="flex h-5 items-center"
                >
                  <span className={`block h-2 rounded-full transition-all duration-300 ${i === index ? 'w-6 bg-[#DC2626]' : 'w-2 bg-neutral-400/70 hover:bg-neutral-500'}`} />
                </button>
              ))}
            </div>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}
