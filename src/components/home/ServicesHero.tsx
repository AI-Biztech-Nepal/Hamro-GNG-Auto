"use client"

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { CONTACT_INFO } from '@/lib/constants';

const DWELL_MS = 4000;
const WHATSAPP_URL = `https://wa.me/${CONTACT_INFO.whatsapp}`;

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
        <nav aria-label="Services" className="lg:border lg:border-neutral-200 lg:bg-white">
          <h1 className="font-headline text-lg font-extrabold uppercase tracking-tight text-neutral-950 lg:border-b lg:border-neutral-200 lg:px-4 lg:py-3.5">
            What we <span className="text-[#DC2626]">do</span>
          </h1>
          <ul className="hidden lg:block">
            {SERVICES.map((s, i) => {
              const on = i === index;
              return (
                <li key={s.tab}>
                  <button
                    type="button"
                    onClick={() => go(i)}
                    aria-current={on}
                    className={`group flex w-full items-center justify-between px-4 py-3 text-left text-[14px] font-medium transition-colors ${on ? 'bg-red-50 text-[#DC2626]' : 'text-neutral-700 hover:bg-neutral-50 hover:text-[#DC2626]'}`}
                  >
                    {s.tab}
                    <ChevronRight className={`size-4 transition-transform ${on ? 'translate-x-0.5' : 'text-neutral-300 group-hover:translate-x-0.5 group-hover:text-[#DC2626]'}`} />
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Banner */}
        <div
          className="group/banner relative overflow-hidden border border-neutral-200 bg-white"
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
                  className={`col-start-1 row-start-1 grid will-change-transform lg:h-[min(60svh,27rem)] lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] ${on ? 'opacity-100 transition-transform duration-[500ms] ease-[cubic-bezier(0.65,0,0.15,1)] motion-reduce:duration-0' : near ? 'pointer-events-none opacity-0 [transition:transform_500ms_cubic-bezier(0.65,0,0.15,1),opacity_0s_linear_500ms] motion-reduce:[transition:none]' : 'pointer-events-none opacity-0'}`}
                  style={{ transform: `translate3d(${offset * 100}%,0,0)` }}
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

          {/* Side arrows, shown on hover like a shop banner */}
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Previous service"
            className="absolute left-0 top-1/2 z-10 grid h-14 w-9 -translate-y-1/2 place-items-center bg-black/35 text-white opacity-100 transition hover:bg-black/60 lg:opacity-0 lg:group-hover/banner:opacity-100"
          >
            <ChevronLeft className="size-6" />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Next service"
            className="absolute right-0 top-1/2 z-10 grid h-14 w-9 -translate-y-1/2 place-items-center bg-black/35 text-white opacity-100 transition hover:bg-black/60 lg:opacity-0 lg:group-hover/banner:opacity-100"
          >
            <ChevronRight className="size-6" />
          </button>

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
