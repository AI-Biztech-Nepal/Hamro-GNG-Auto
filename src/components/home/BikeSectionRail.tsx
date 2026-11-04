"use client"

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import type { Vehicle } from '@/types/vehicle';
import { BikeCard } from '@/components/home/BikeCard';
import type { Badge } from '@/components/home/home-data';

interface BikeSectionRailProps {
  title: string;
  subtitle?: string;
  bikes: Vehicle[];
  badges: Map<string, Badge>;
  viewAllLink: string;
  /** Load the first cards eagerly when this rail is near the top of the page. */
  priority?: boolean;
}

/** A titled, sideways-scrolling row of bike cards, with arrows on larger screens. */
export function BikeSectionRail({ title, subtitle, bikes, badges, viewAllLink, priority = false }: BikeSectionRailProps) {
  const scroller = useRef<HTMLDivElement>(null);
  // Which arrows make sense: none to the left at the start of the row, none to the right at its end.
  const [edge, setEdge] = useState({ atStart: true, atEnd: false });
  const measure = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    setEdge({ atStart: el.scrollLeft <= 4, atEnd: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
  }, []);
  useEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure, bikes.length]);
  if (!bikes.length) return null;

  const scroll = (dir: 'left' | 'right') =>
    scroller.current && scroller.current.scrollBy({ left: (dir === 'left' ? -1 : 1) * scroller.current.clientWidth * 0.9, behavior: 'smooth' });

  return (
    <section className="py-6">
      <div className="mb-4 flex items-end justify-between gap-3 border-b border-border pb-2">
        <div className="min-w-0">
          <h2 className="font-headline text-xl font-bold tracking-tight text-foreground md:text-2xl">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-muted-foreground md:text-sm">{subtitle}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Link href={viewAllLink} className="flex items-center gap-1 text-xs font-semibold text-brand hover:underline md:text-sm">
            See all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <div className="group/rail relative">
        <div ref={scroller} onScroll={measure} className="-mx-4 flex snap-x gap-3 sm:gap-4 overflow-x-auto scroll-smooth px-4 pb-3 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {bikes.map((bike, i) => (
            <div key={bike.id} className="w-[calc((100%-0.75rem)/2)] shrink-0 snap-start sm:w-[275px] md:w-[290px] lg:w-[calc((100%-3rem)/4)]">
              <BikeCard vehicle={bike} badge={badges.get(bike.id)} isPriority={priority && i < 4} />
            </div>
          ))}
        </div>
        {bikes.length > 1 && (['left', 'right'] as const).map(dir => {
          const hidden = dir === 'left' ? edge.atStart : edge.atEnd;
          return (
            <button
              key={dir}
              type="button"
              onClick={() => scroll(dir)}
              aria-label={dir === 'left' ? 'Scroll left' : 'Scroll right'}
              tabIndex={hidden ? -1 : 0}
              className={`absolute top-[26%] z-10 flex h-10 w-10 -translate-y-1/2 touch-manipulation items-center justify-center rounded-full bg-white text-brand shadow-[0_4px_14px_rgba(0,0,0,0.3)] ring-1 ring-black/10 transition-all duration-200 hover:bg-brand hover:text-brand-foreground active:scale-90 md:top-[38%] md:h-12 md:w-12 ${dir === 'left' ? '-left-1 md:left-1' : '-right-1 md:right-1'} ${hidden ? 'pointer-events-none scale-75 opacity-0' : 'opacity-100'}`}
            >
              {dir === 'left' ? <ChevronLeft className="h-6 w-6 md:h-7 md:w-7" /> : <ChevronRight className="h-6 w-6 md:h-7 md:w-7" />}
            </button>
          );
        })}
      </div>
    </section>
  );
}
