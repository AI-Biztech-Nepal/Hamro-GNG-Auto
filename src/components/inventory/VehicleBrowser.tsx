"use client"

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { BikeCard } from '@/components/home/BikeCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X } from 'lucide-react';
import { BRANDS } from '@/lib/constants';
import { Vehicle } from '@/types/vehicle';
import { cn } from '@/lib/utils';

interface VehicleBrowserProps {
  vehicles: Vehicle[];
  /** How many leading cards load their image eagerly (above-the-fold LCP). */
  priorityCount?: number;
  /** 'bar' = filter row on top (homepage). 'sidebar' = left filter rail (inventory page). */
  layout?: 'bar' | 'sidebar';
}

const SORTS = [
  { value: 'latest', label: 'Newest first' },
  { value: 'price-low', label: 'Price: low to high' },
  { value: 'price-high', label: 'Price: high to low' },
  { value: 'name-asc', label: 'Name: A–Z' },
  { value: 'name-desc', label: 'Name: Z–A' },
];

/**
 * Filter + results grid shared by the homepage and /inventory. Owns its own
 * filter state and sorting; callers supply the surrounding heading and choose
 * the filter layout.
 */
export function VehicleBrowser({ vehicles, priorityCount = 0, layout = 'bar' }: VehicleBrowserProps) {
  const params = useSearchParams();
  const [search, setSearch] = useState(() => (params.get('q') || '').slice(0, 60));
  const [typeFilter, setTypeFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  // Links such as /inventory?brand=Honda or ?sort=price-low open the page already filtered.
  const [brandFilter, setBrandFilter] = useState(() => {
    const wanted = (params.get('brand') || '').toLowerCase();
    return BRANDS.find(b => b.toLowerCase() === wanted) ?? 'all';
  });
  const [sortOrder, setSortOrder] = useState(() => {
    const wanted = params.get('sort');
    return SORTS.some(s => s.value === wanted) ? (wanted as string) : 'latest';
  });

  const yearsInStock = useMemo(() => Array.from(new Set(vehicles.map(v => v.year))).sort((a, b) => b - a), [vehicles]);

  const filteredVehicles = useMemo(() => {
    const q = search.trim().toLowerCase();
    const min = minPrice ? Number(minPrice) : 0;
    const max = maxPrice ? Number(maxPrice) : Infinity;
    return vehicles.filter(v => {
      const matchesSearch = !q || [v.title, v.brand, v.model].some(s => s.toLowerCase().includes(q));
      const matchesYear = yearFilter === 'all' || v.year === Number(yearFilter);
      const matchesPrice = v.price >= min && v.price <= max;
      const matchesType = typeFilter === 'all' || v.type === typeFilter;
      const matchesBrand = brandFilter === 'all' || v.brand === brandFilter;
      return matchesSearch && matchesType && matchesBrand && matchesYear && matchesPrice;
    }).sort((a, b) => {
      // Snoozed (photoless) entries always sink to the bottom, whatever the sort.
      if (a.has_photos !== b.has_photos) return a.has_photos ? -1 : 1;
      // Sold bikes stay listed, after everything still available.
      if ((a.status === 'sold') !== (b.status === 'sold')) return a.status === 'sold' ? 1 : -1;
      if (sortOrder === 'price-low') return a.price - b.price;
      if (sortOrder === 'price-high') return b.price - a.price;
      if (sortOrder === 'name-asc') return a.title.localeCompare(b.title);
      if (sortOrder === 'name-desc') return b.title.localeCompare(a.title);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [vehicles, search, typeFilter, brandFilter, yearFilter, minPrice, maxPrice, sortOrder]);

  const isFiltered = filteredVehicles.length !== vehicles.length;
  const sidebar = layout === 'sidebar';

  const clearFilters = () => {
    setSearch('');
    setTypeFilter('all');
    setBrandFilter('all');
    setYearFilter('all');
    setMinPrice('');
    setMaxPrice('');
    setSortOrder('latest');
  };

  const digits = (s: string) => s.replace(/\D/g, '').slice(0, 9);

  // One set of controls, drawn the same way on phones (the card above the list) and on laptops (the left rail):
  // Search, Type, Sort, Year, Price, always in this order and under the same headings.
  const heading = 'mb-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-brand';
  const field = (label: string, node: React.ReactNode) => (
    <div>
      <h4 className={heading}>{label}</h4>
      {node}
    </div>
  );

  const searchBox = (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search by brand or model..."
        aria-label="Search by brand or model"
        className="h-11 rounded-md pl-10"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  );

  const typeTabs = (
    <div role="tablist" aria-label="Vehicle type" className="grid grid-cols-3 gap-1 rounded-lg bg-muted p-1">
      {[{ value: 'all', label: 'All' }, { value: 'bike', label: 'Bikes' }, { value: 'scooter', label: 'Scooters' }].map(t => (
        <button
          key={t.value}
          type="button"
          role="tab"
          aria-selected={typeFilter === t.value}
          onClick={() => setTypeFilter(t.value)}
          className={cn(
            'h-9 touch-manipulation rounded-md text-sm font-semibold transition-colors',
            typeFilter === t.value ? 'bg-brand text-brand-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );

  const sortSelect = (
    <Select value={sortOrder} onValueChange={setSortOrder}>
      <SelectTrigger className="h-11 rounded-md" aria-label="Sort by"><SelectValue placeholder="Sort by" /></SelectTrigger>
      <SelectContent>
        {SORTS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
      </SelectContent>
    </Select>
  );

  const yearSelect = (
    <Select value={yearFilter} onValueChange={setYearFilter}>
      <SelectTrigger className="h-11 rounded-md" aria-label="Model year"><SelectValue placeholder="Year" /></SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Any year</SelectItem>
        {yearsInStock.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
      </SelectContent>
    </Select>
  );

  const priceInputs = (
    <div className="grid grid-cols-2 gap-2">
      <Input inputMode="numeric" placeholder="Min" aria-label="Minimum price in NPR" className="h-11 rounded-md" value={minPrice} onChange={(e) => setMinPrice(digits(e.target.value))} />
      <Input inputMode="numeric" placeholder="Max" aria-label="Maximum price in NPR" className="h-11 rounded-md" value={maxPrice} onChange={(e) => setMaxPrice(digits(e.target.value))} />
    </div>
  );

  // A brand picked from a "Shop by brand" tile has no dropdown of its own, so it shows here and can be removed.
  const brandChip = brandFilter !== 'all' && (
    <button
      type="button"
      onClick={() => setBrandFilter('all')}
      className="flex w-fit items-center gap-1.5 rounded-full border border-brand/40 bg-brand/5 px-3 py-1 text-xs font-semibold text-brand"
      aria-label={`Remove the ${brandFilter} filter`}
    >
      {brandFilter} <X className="h-3.5 w-3.5" />
    </button>
  );

  const clearButton = isFiltered && (
    <button type="button" onClick={clearFilters} className="text-sm font-semibold text-foreground underline underline-offset-2 hover:no-underline">
      Clear all filters
    </button>
  );

  const controls = (
    <div className="space-y-5">
      {searchBox}
      {field('Type', typeTabs)}
      {field('Sort', sortSelect)}
      {field('Year', yearSelect)}
      {field('Price (NPR)', priceInputs)}
      {brandChip}
      {clearButton}
    </div>
  );

  // Phones and tablets: the controls in a card above the list. Laptops (sidebar layout): the same controls in the left rail.
  const bar = <div className="rounded-lg border border-border bg-card p-4">{controls}</div>;
  const rail = controls;

  const countLine = isFiltered && vehicles.length > 0 && (
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm text-muted-foreground">
        {filteredVehicles.length === 0
          ? 'No matches'
          : `${filteredVehicles.length} ${filteredVehicles.length === 1 ? 'match' : 'matches'}`}
      </p>
      {!sidebar && (
        <button onClick={clearFilters} className="text-sm font-semibold text-foreground underline underline-offset-2 hover:no-underline shrink-0">
          Clear filters
        </button>
      )}
    </div>
  );

  const grid = (
    <div className={cn(
      'grid gap-x-4 gap-y-8 md:gap-x-6 min-h-[520px]',
      sidebar ? 'grid-cols-2 xl:grid-cols-3' : 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    )}>
      {filteredVehicles.length > 0 ? (
        filteredVehicles.map((vehicle, index) => (
          <BikeCard key={vehicle.id} vehicle={vehicle} isPriority={index < priorityCount} keepRatio />
        ))
      ) : (
        <div className="col-span-full py-20 text-center space-y-3">
          <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto">
            <Search className="w-7 h-7 text-muted-foreground" />
          </div>
          <h3 className="font-headline font-bold text-xl">
            {vehicles.length === 0 ? 'No vehicles yet' : 'Nothing matches those filters'}
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            {vehicles.length === 0
              ? 'Check back soon for new inventory.'
              : 'Try widening your search or clearing a filter.'}
          </p>
          {vehicles.length > 0 && (
            <button onClick={clearFilters} className="text-sm font-semibold text-foreground underline underline-offset-2 hover:no-underline">
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );

  if (sidebar) {
    return (
      <div>
        <div className="lg:hidden mb-6">{bar}</div>
        <div className="lg:grid lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-10">
          <aside className="hidden lg:block lg:sticky lg:top-24 lg:self-start">{rail}</aside>
          <div className="space-y-5">
            {countLine}
            {grid}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {bar}
      {countLine}
      {grid}
    </div>
  );
}
