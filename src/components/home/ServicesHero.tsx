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
    tab: 'Free valuation',
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
      <div className="mx-auto max-w-[76rem] px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
        <div ref={fitRef} className="hero-fit-box">
        <div ref={deskRef} className="hero-fit grid grid-cols-1 gap-4 lg:grid-cols-[16.5rem_minmax(0,1fr)]">
          {/* Service menu */}
          <nav aria-label="Services" className="hidden border border-neutral-300 lg:block bg-neutral-100 p-3 shadow-inner">
            <div aria-hidden className="relative -rotate-1 bg-white px-4 py-3.5 font-headline text-lg font-extrabold uppercase tracking-tight text-neutral-950 shadow-[0_2px_6px_rgba(0,0,0,0.18)]">
              <span className="absolute left-1/2 top-1.5 size-2.5 -translate-x-1/2 rounded-full bg-[#DC2626] shadow-[0_1px_2px_rgba(0,0,0,0.5)]" />
              <span className="block pt-2">What we <span className="text-[#DC2626]">do</span></span>
            </div>
            <ul className="mt-4 space-y-2.5">
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
                      className={`group relative block w-full px-4 py-3 pr-8 text-left text-[14px] font-medium transition-[transform,box-shadow,background-color,color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${tilt} ${on ? 'scale-[1.03] bg-[#FFF3B0] text-[#DC2626] shadow-[0_8px_16px_-6px_rgba(0,0,0,0.35)]' : 'bg-white text-neutral-700 shadow-[0_1px_3px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 hover:rotate-0 hover:text-[#DC2626] hover:shadow-[0_6px_12px_-6px_rgba(0,0,0,0.3)]'}`}
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
                    className={`col-start-1 row-start-1 grid h-[27rem] grid-cols-[minmax(0,5fr)_minmax(0,6fr)] will-change-[transform,opacity] lg:h-[min(60svh,27rem)] ${on ? '' : 'pointer-events-none'}`}
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
                    <div className="flex flex-col justify-center px-10">
                      <span aria-hidden className="block h-[3px] w-8 bg-[#DC2626]" />
                      <p className="hero-title mt-3 font-headline text-[clamp(1.5rem,2.8vw,2.4rem)] font-extrabold uppercase leading-[1.05] tracking-tight text-neutral-950">
                        {s.tab}
                      </p>
                      <p className="hero-lead mt-3 max-w-md text-base leading-relaxed text-neutral-600">{s.lead}</p>
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
                    <div className="relative">
                      <Image
                        src={s.image}
                        alt={s.alt}
                        fill
                        priority={i === 0}
                        sizes="(max-width: 1024px) 60vw, 40vw"
                        className="object-cover"
                        style={{ objectPosition: s.focus }}
                      />
                      <div aria-hidden className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-white to-transparent" />
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
