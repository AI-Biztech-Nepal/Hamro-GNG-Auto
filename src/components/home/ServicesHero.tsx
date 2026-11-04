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
    tab: 'Second-hand sales',
    lead: 'Walk the floor at our Nayabasti, Boudha showroom. Inspected bikes and scooters, genuine paperwork, fixed prices.',
    cta: 'Browse the floor',
    href: '#stock',
    image: '/hero/showroom-gg.jpg',
    focus: '50% 40%',
    alt: 'A smiling Hamro G&G Auto team member welcoming visitors on the showroom floor',
  },
  {
    tab: 'Exchange facility',
    lead: 'Trade in the bike you ride today and put its value toward one from our floor, settled in a single visit.',
    cta: 'Get an appraisal',
    href: '/exchange',
    image: '/hero/handover-gg.jpg',
    focus: '50% 50%',
    alt: 'Two people shaking hands over a set of keys in the showroom',
  },
  {
    tab: 'Servicing and repair',
    lead: 'Same-day general servicing and repairs for every major brand, done by our own mechanics.',
    cta: 'Book a slot',
    href: '/book-service',
    image: '/hero/grazia.jpg',
    bands: ['#d2c6b8', '#ab9d8d'],
    alt: 'A red Honda scooter shown in a studio',
  },
  {
    tab: 'Insurance renewal',
    lead: 'Bring your papers to the counter and we will help you renew your insurance without the running around.',
    cta: 'Ask at the counter',
    href: '/services',
    image: '/hero/vespa.jpg',
    bands: ['#e9dfd3', '#afa395'],
    alt: 'A light blue Vespa scooter in a studio',
  },
  {
    tab: 'Ownership transfer',
    lead: 'We guide you through the transfer paperwork so the bike is yours on the day of delivery.',
    cta: 'Talk to us',
    href: WHATSAPP_URL,
    image: '/hero/ray.jpg',
    bands: ['#fcf3e8', '#c8b29c'],
    alt: 'An orange and black Yamaha scooter in a studio',
  },
  {
    tab: 'Free valuation',
    lead: 'Send photos and details and get a fair valuation the same day. No charge and no obligation.',
    cta: 'Value my bike',
    href: '/sell',
    image: '/hero/dio.jpg',
    bands: ['#fbf5ea', '#c1af9a'],
    alt: 'A black and gold Honda Dio scooter in a studio',
  },
];

export function ServicesHero() {
  const count = SERVICES.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
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
      {/* Same box as the sections below (max-w-7xl, px-4) so the hero, brands and rails share one left and right edge. */}
      <div className="mx-auto max-w-7xl px-4 py-4 sm:py-5">
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
                    className={`col-start-1 row-start-1 grid h-[28rem] grid-rows-[minmax(0,7fr)_minmax(0,3fr)] will-change-[transform,opacity] lg:h-[min(60svh,27rem)] lg:grid-cols-[minmax(0,3fr)_minmax(0,7fr)] lg:grid-rows-1 ${on ? '' : 'pointer-events-none'}`}
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
                    <div className="order-2 flex min-w-0 flex-col justify-center px-4 py-2 lg:order-1 lg:px-6 lg:py-0">
                      <span aria-hidden className="hidden h-[3px] w-8 bg-[#DC2626] lg:block" />
                      <p className="font-headline text-[clamp(1.05rem,4.4vw,1.4rem)] font-extrabold uppercase leading-[1.05] tracking-tight text-neutral-950 lg:mt-3 lg:text-[clamp(1.25rem,2.3vw,2rem)]">
                        {s.tab}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs leading-snug text-neutral-600 sm:text-sm lg:mt-3 lg:line-clamp-none lg:text-[15px] lg:leading-relaxed">{s.lead}</p>
                      <Link
                        href={s.href}
                        tabIndex={on ? 0 : -1}
                        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                        className="group mt-2 inline-flex h-9 w-fit items-center gap-1.5 bg-[#DC2626] px-4 text-xs font-semibold uppercase tracking-wide lg:mt-5 lg:h-11 lg:gap-2 lg:px-5 lg:text-[14px] text-white shadow-[0_8px_20px_-8px_rgba(220,38,38,0.8)] transition-colors hover:bg-[#c42020]"
                      >
                        {s.cta}
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </div>

                    {/* Photo */}
                    <div className="relative order-1 lg:order-2" style={s.bands ? { background: `linear-gradient(${s.bands[0]} 50%, ${s.bands[1]} 50%)` } : undefined}>
                      <Image
                        src={s.image}
                        alt={s.alt}
                        fill
                        priority={i === 0}
                        sizes="(max-width: 1024px) 100vw, 70vw"
                        className={s.bands ? 'object-contain' : 'object-cover'}
                        style={s.bands ? undefined : { objectPosition: s.focus }}
                      />
                      <div aria-hidden className={`absolute inset-y-0 left-0 hidden bg-gradient-to-r from-white to-transparent lg:block ${s.bands ? 'w-[8%]' : 'w-[16%]'}`} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Dots */}
            <div role="group" aria-label="Choose a service" className="absolute inset-x-0 bottom-[calc(30%+0.5rem)] z-10 flex justify-center gap-2 lg:bottom-3">
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
    </section>
  );
}
