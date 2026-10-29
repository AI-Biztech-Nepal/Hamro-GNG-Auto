"use client"

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { HeroSlide } from '@/lib/hero-photos';

const DWELL_MS = 3000;

export function HeroSlideshow({ slides }: { slides: HeroSlide[] }) {
  const count = slides.length;
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

  // Restarting on `index` resets the dwell timer (and the pager fill) after any manual move.
  useEffect(() => {
    if (count < 2 || paused || reduceMotion) return;
    const t = window.setTimeout(() => go(index + 1), DWELL_MS);
    return () => window.clearTimeout(t);
  }, [index, count, paused, reduceMotion, go]);

  if (count === 0) return null;
  const autoplaying = count > 1 && !paused && !reduceMotion;

  return (
    <div className="mx-4 sm:mx-6 lg:mx-8 min-[1280px]:mx-auto max-w-[76rem] pt-6 sm:pt-10">
      <header className="hero-head relative pb-4 sm:pb-6 overflow-x-clip">
        <div aria-hidden className="hero-hatch pointer-events-none absolute inset-y-0 right-0 w-1/2" />
        <h1 className="relative font-display font-extrabold uppercase leading-[0.98] tracking-[-0.03em] text-[clamp(1.6rem,4.2vw,3.25rem)] text-neutral-950">
          <span className="sr-only">Second-hand bikes and scooters in Boudha, Kathmandu. </span>
          <span aria-hidden className="hero-slash mr-[0.18em]"><i /><i /><i /></span>
          <span aria-hidden className="hero-word"><span style={{ ['--d' as string]: '0ms' }}>Ready</span></span>{' '}
          <span aria-hidden className="hero-word hero-outline"><span style={{ ['--d' as string]: '120ms' }}>to roll.</span></span>
          <span aria-hidden className="hero-ride">
            <span className="hero-ride-line" />
            <span className="hero-ride-bike">
              <span className="hero-ride-exit">
                <svg viewBox="-44 0 166 62" className="block h-[0.8em] w-auto" fill="currentColor">
                  <defs>
                    <linearGradient id="hero-streak" x1="0" x2="1">
                      <stop offset="0" stopColor="currentColor" stopOpacity="0" />
                      <stop offset="1" stopColor="currentColor" stopOpacity="0.9" />
                    </linearGradient>
                  </defs>
                  <rect x="-44" y="24" width="38" height="2.4" fill="url(#hero-streak)" />
                  <rect x="-34" y="32" width="30" height="2.4" fill="url(#hero-streak)" />
                  <rect x="-40" y="40" width="34" height="2.4" fill="url(#hero-streak)" />
                  <path d="M6 37 C4 22 16 17 32 17 L52 17 C58 17 60 21 58 27 L56 36 L38 41 L10 45 Z" />
                  <path d="M38 36 L76 36 L79 45 L38 45 Z" />
                  <path d="M69 38 L77 8 L86 10 L88 40 Z" />
                  <path d="M70 7 L94 4 L96 11 L74 15 Z" />
                  <path d="M87 38 C100 28 114 33 118 44 L113 46 L89 45 Z" />
                  <circle cx="95" cy="12" r="4.2" className="text-brand" fill="currentColor" />
                  {[24, 100].map(cx => (
                    <g key={cx}>
                      <circle cx={cx} cy={50} r={11} fill="none" stroke="currentColor" strokeWidth={4} />
                      <g className="hero-wheel" style={{ transformOrigin: `${cx}px 50px` }}>
                        <rect x={cx - 0.9} y={40} width={1.8} height={20} />
                        <rect x={cx - 10} y={49.1} width={20} height={1.8} />
                      </g>
                    </g>
                  ))}
                </svg>
              </span>
            </span>
          </span>
        </h1>
      </header>

    <section
      aria-roledescription="carousel"
      aria-label="Featured bikes and scooters"
      className="relative isolate overflow-hidden bg-neutral-950 group/hero aspect-[4/3] sm:aspect-[16/9]"
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; setPaused(true); }}
      onTouchEnd={(e) => {
        const start = touchStartX.current;
        touchStartX.current = null;
        setPaused(false);
        if (start == null) return;
        const dx = e.changedTouches[0].clientX - start;
        if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
      }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') go(index + 1);
        if (e.key === 'ArrowLeft') go(index - 1);
      }}
    >
      <h1 className="sr-only">Second-hand bikes &amp; scooters at G&amp;G Auto, Boudha</h1>

      {slides.map((s, i) => {
        const active = i === index;
        // Signed, wrapped distance from the active slide: the track loops and always glides the same direction.
        let offset = (((i - index) % count) + count) % count;
        if (offset > count / 2) offset -= count;
        const visible = Math.abs(offset) <= 1;
        return (
          <Link
            key={s.key}
            href={`/inventory/${s.vehicleId}`}
            tabIndex={active ? 0 : -1}
            aria-hidden={!active}
            aria-label={`${s.title} — NPR ${s.price.toLocaleString()}`}
            className={`absolute inset-0 block will-change-transform ${visible ? 'transition-transform duration-[650ms] ease-[cubic-bezier(0.65,0,0.15,1)] motion-reduce:duration-0' : 'opacity-0 pointer-events-none'} ${active ? 'z-10' : ''}`}
            style={{ transform: `translate3d(${offset * 100}%,0,0)` }}
          >
            <Image
              src={s.src}
              alt={s.title}
              fill
              priority={i === 0}
              loading={i === 0 ? 'eager' : 'lazy'}
              sizes="(max-width: 1280px) 100vw, 76rem"
              className={`object-cover ${reduceMotion ? '' : 'hero-drift'} ${active ? '' : 'hero-drift-off'}`}
            />
          </Link>
        );
      })}

      {/* Floor for the pager and a touch of depth at the top under the navbar */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-t from-black/55 via-transparent to-black/15" />

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Previous bike"
            className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-30 hidden sm:grid place-items-center size-12 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-md text-white ring-1 ring-white/25 opacity-0 group-hover/hero:opacity-100 focus-visible:opacity-100 transition-opacity"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Next bike"
            className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-30 hidden sm:grid place-items-center size-12 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-md text-white ring-1 ring-white/25 opacity-0 group-hover/hero:opacity-100 focus-visible:opacity-100 transition-opacity"
          >
            <ChevronRight className="size-5" />
          </button>

          {/* Pager — one hairline per bike; the active one fills over the dwell time */}
          <div role="group" aria-label="Choose a bike" className="absolute z-30 inset-x-0 bottom-3 sm:bottom-6 mx-auto flex gap-2 w-[min(26rem,calc(100%-2rem))]">
            {slides.map((s, i) => (
              <button
                key={s.key}
                type="button"
                onClick={() => go(i)}
                aria-label={`Show ${s.title}`}
                aria-current={i === index}
                className="group relative flex-1 h-7 flex items-center"
              >
                <span className="relative block w-full h-[3px] rounded-full bg-white/35 overflow-hidden group-hover:bg-white/55 transition-colors">
                  <span
                    key={i === index ? `fill-${index}` : `idle-${i}`}
                    className={`absolute inset-y-0 left-0 bg-white rounded-full ${i < index ? 'w-full' : i === index ? (reduceMotion ? 'w-full' : 'hero-fill') : 'w-0'}`}
                    style={i === index ? { animationDuration: `${DWELL_MS}ms`, animationPlayState: autoplaying ? 'running' : 'paused' } : undefined}
                  />
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </section>
    </div>
  );
}
