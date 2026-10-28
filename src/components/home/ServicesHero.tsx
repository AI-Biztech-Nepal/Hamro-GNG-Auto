"use client"

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { CONTACT_INFO } from '@/lib/constants';

const DWELL_MS = 5500;
/** Sticky-note change: the current slide peels off up-left while the next one rolls up from below, together. */
const PEEL_MS = 1200;
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
  /** CSS object-position so the vehicle stays framed when the banner crops. */
  focus: string;
}

const SERVICES: Service[] = [
  {
    tab: 'Second-hand sales',
    lead: 'Walk the floor at our Nayabasti, Boudha showroom. Inspected bikes and scooters, genuine paperwork, fixed prices.',
    cta: 'Browse the floor',
    href: '#stock',
    image: '/hero/showroom.jpg',
    alt: 'A rider leaning on a scooter on the Hamro Auto showroom floor',
    focus: '40% 45%',
  },
  {
    tab: 'Exchange facility',
    lead: 'Trade in the bike you ride today and put its value toward one from our floor, settled in a single visit.',
    cta: 'Get an appraisal',
    href: '/exchange',
    image: '/hero/handover.jpg',
    alt: 'Two people shaking hands over a set of keys in the showroom',
    focus: '50% 50%',
  },
  {
    tab: 'Servicing and repair',
    lead: 'Same-day general servicing and repairs for every major brand, done by our own mechanics.',
    cta: 'Book a slot',
    href: '/book-service',
    image: '/hero/grazia.jpg',
    alt: 'A red Honda scooter shown in a studio',
    focus: '62% 50%',
  },
  {
    tab: 'Insurance renewal',
    lead: 'Bring your papers to the counter and we will help you renew your insurance without the running around.',
    cta: 'Ask at the counter',
    href: '/services',
    image: '/hero/vespa.jpg',
    alt: 'A light blue Vespa scooter in a studio',
    focus: '50% 50%',
  },
  {
    tab: 'Ownership transfer',
    lead: 'We guide you through the transfer paperwork so the bike is yours on the day of delivery.',
    cta: 'Talk to us',
    href: WHATSAPP_URL,
    image: '/hero/ray.jpg',
    alt: 'An orange and black Yamaha scooter in a studio',
    focus: '50% 50%',
  },
  {
    tab: 'Free appraisal',
    lead: 'Send photos and details and get a fair valuation the same day. No charge and no obligation.',
    cta: 'Value my bike',
    href: '/sell',
    image: '/hero/dio.jpg',
    alt: 'A black and gold Honda Dio scooter in a studio',
    focus: '50% 50%',
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
      <div className="mx-auto grid max-w-[76rem] gap-3 px-4 py-4 sm:px-6 sm:py-5 lg:grid-cols-[16.5rem_minmax(0,1fr)] lg:gap-4 lg:px-8">
        {/* Service menu */}
        <nav aria-label="Services" className="lg:border lg:border-neutral-300 lg:bg-neutral-100 lg:p-3 lg:shadow-inner">
          <h1 className="relative flex items-center gap-2 font-headline text-lg font-extrabold uppercase tracking-tight text-neutral-950 lg:-rotate-1 lg:bg-white lg:px-4 lg:py-3.5 lg:shadow-[0_2px_6px_rgba(0,0,0,0.18)]">
            <span aria-hidden className="size-2.5 shrink-0 rounded-full bg-[#DC2626] shadow-[0_1px_2px_rgba(0,0,0,0.5)] lg:absolute lg:left-1/2 lg:top-1.5 lg:-translate-x-1/2" />
            <span className="sr-only">Hamro G&amp;G Auto: second-hand bikes and scooters in Boudha, Kathmandu. </span>
            <span className="lg:block lg:pt-2">What we <span className="text-[#DC2626]">do</span></span>
          </h1>
          <ul className="mt-2 grid grid-cols-2 gap-2.5 py-2 lg:mt-4 lg:block lg:space-y-2.5 lg:py-0">
            {SERVICES.map((s, i) => {
              const on = i === index;
              // Each note sits at its own slight angle; the active one straightens, lifts and gets a pin.
              const tilt = on ? 'rotate-0' : i % 2 ? 'rotate-[0.9deg]' : '-rotate-[1.1deg]';
              return (
                <li key={s.tab}>
                  <button
                    type="button"
                    onClick={() => go(i)}
                    aria-current={on}
                    className={`group relative block h-full w-full px-4 py-3 pr-8 text-left text-[14px] font-medium transition-[transform,box-shadow,background-color,color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${tilt} ${on ? 'scale-[1.03] bg-[#FFF3B0] text-[#DC2626] shadow-[0_8px_16px_-6px_rgba(0,0,0,0.35)]' : 'bg-white text-neutral-700 shadow-[0_1px_3px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 hover:rotate-0 hover:text-[#DC2626] hover:shadow-[0_6px_12px_-6px_rgba(0,0,0,0.3)]'}`}
                  >
                    <span aria-hidden className={`absolute right-3 top-2.5 size-2 rounded-full bg-[#DC2626] shadow-[0_1px_2px_rgba(0,0,0,0.5)] transition-opacity duration-500 ${on ? 'opacity-100' : 'opacity-0'}`} />
                    {s.tab}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

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
                  className={`col-start-1 row-start-1 grid will-change-[transform,opacity] lg:h-[min(60svh,27rem)] lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] ${on ? '' : 'pointer-events-none'}`}
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
                  <div className="order-2 flex flex-col justify-center px-5 pb-12 pt-5 sm:px-8 lg:order-1 lg:px-10 lg:py-0">
                    <span aria-hidden className="block h-[3px] w-8 bg-[#DC2626]" />
                    <p className="mt-3 font-headline text-[clamp(1.5rem,2.8vw,2.4rem)] font-extrabold uppercase leading-[1.05] tracking-tight text-neutral-950">
                      {s.tab}
                    </p>
                    <p className="mt-3 max-w-md text-[15px] leading-relaxed text-neutral-600 sm:text-base">{s.lead}</p>
                    <Link
                      href={s.href}
                      tabIndex={on ? 0 : -1}
                      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      className="group mt-5 inline-flex h-11 w-fit items-center gap-2 bg-[#DC2626] px-5 text-[14px] font-semibold uppercase tracking-wide text-white shadow-[0_8px_20px_-8px_rgba(220,38,38,0.8)] transition-colors hover:bg-[#c42020]"
                    >
                      {s.cta}
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>

                  {/* Photo */}
                  <div className="relative order-1 aspect-[4/3] lg:order-2 lg:aspect-auto">
                    <Image
                      src={s.image}
                      alt={s.alt}
                      fill
                      priority={i === 0}
                      sizes="(max-width: 1024px) 100vw, 40vw"
                      className="object-cover"
                      style={{ objectPosition: s.focus }}
                    />
                    <div aria-hidden className="absolute inset-y-0 left-0 hidden w-1/3 bg-gradient-to-r from-white to-transparent lg:block" />
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
    </section>
  );
}
