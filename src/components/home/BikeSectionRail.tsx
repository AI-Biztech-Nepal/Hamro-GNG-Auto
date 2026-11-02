"use client"

import { useRef } from 'react';
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
  if (!bikes.length) return null;

  const scroll = (dir: 'left' | 'right') =>
    scroller.current && scroller.current.scrollBy({ left: (dir === 'left' ? -1 : 1) * scroller.current.clientWidth, behavior: 'smooth' });

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
        <div ref={scroller} className="-mx-4 flex snap-x gap-4 overflow-x-auto scroll-smooth px-4 pb-3 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {bikes.map((bike, i) => (
            <div key={bike.id} className="w-[275px] shrink-0 snap-start md:w-[290px] lg:w-[calc((100%-3rem)/4)]">
              <BikeCard vehicle={bike} badge={badges.get(bike.id)} isPriority={priority && i < 4} />
            </div>
          ))}
        </div>
        {bikes.length > 1 && (['left', 'right'] as const).map(dir => (
          <button
            key={dir}
            onClick={() => scroll(dir)}
            aria-label={dir === 'left' ? 'Scroll left' : 'Scroll right'}
            className={`absolute top-[38%] z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/25 text-white opacity-60 backdrop-blur-sm transition hover:bg-black/55 hover:opacity-100 md:flex ${dir === 'left' ? 'left-1' : 'right-1'}`}
          >
            {dir === 'left' ? <ChevronLeft className="h-7 w-7" /> : <ChevronRight className="h-7 w-7" />}
          </button>
        ))}
      </div>
    </section>
  );
}
