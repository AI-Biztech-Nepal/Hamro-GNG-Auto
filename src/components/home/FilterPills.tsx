"use client"

import { FILTERS, type FilterId } from '@/components/home/home-data';
import { cn } from '@/lib/utils';

interface FilterPillsProps {
  active: FilterId;
  onSelect: (id: FilterId) => void;
}

/** One row of quick filters; scrolls sideways on a phone instead of wrapping. */
export function FilterPills({ active, onSelect }: FilterPillsProps) {
  return (
    <div className="-mx-4 px-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="tablist" aria-label="Quick filters">
      <div className="flex items-center gap-2 w-max sm:w-auto sm:flex-wrap">
        {FILTERS.map(f => {
          const isActive = active === f.id;
          return (
            <button
              key={f.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelect(f.id)}
              className={cn(
                'whitespace-nowrap px-4 py-2 rounded-full text-xs md:text-sm font-medium border transition-colors',
                isActive
                  ? 'bg-brand text-brand-foreground border-brand font-semibold shadow-sm'
                  : 'bg-background text-muted-foreground border-border hover:text-foreground hover:border-foreground/30',
              )}
            >
              {f.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
