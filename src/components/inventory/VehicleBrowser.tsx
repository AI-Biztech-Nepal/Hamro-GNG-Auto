"use client"

import { useState, useMemo } from 'react';
import { VehicleCard } from '@/components/inventory/VehicleCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
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
];

/**
 * Filter + results grid shared by the homepage and /inventory. Owns its own
 * filter state and sorting; callers supply the surrounding heading and choose
 * the filter layout.
 */
export function VehicleBrowser({ vehicles, priorityCount = 0, layout = 'bar' }: VehicleBrowserProps) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('latest');

  const brandsInStock = useMemo(() => {
    const present = new Set(vehicles.map(v => v.brand));
    return BRANDS.filter(b => present.has(b));
  }, [vehicles]);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      const matchesSearch = v.title.toLowerCase().includes(search.toLowerCase()) ||
                           v.brand.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === 'all' || v.type === typeFilter;
      const matchesBrand = brandFilter === 'all' || v.brand === brandFilter;
      return matchesSearch && matchesType && matchesBrand;
    }).sort((a, b) => {
      // Snoozed (photoless) entries always sink to the bottom, whatever the sort.
      if (a.has_photos !== b.has_photos) return a.has_photos ? -1 : 1;
      if (sortOrder === 'price-low') return a.price - b.price;
      if (sortOrder === 'price-high') return b.price - a.price;
      if (sortOrder === 'name-asc') return a.title.localeCompare(b.title);
      if (sortOrder === 'name-desc') return b.title.localeCompare(a.title);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [vehicles, search, typeFilter, brandFilter, sortOrder]);

  const isFiltered = filteredVehicles.length !== vehicles.length;
  const sidebar = layout === 'sidebar';

  const clearFilters = () => {
    setSearch('');
    setTypeFilter('all');
    setBrandFilter('all');
    setSortOrder('latest');
  };

  const railItem = (active: boolean, onClick: () => void, label: string) => (
    <button
      key={label}
      onClick={onClick}
      className={cn(
        'block w-full text-left text-sm py-1 transition-colors',
        active ? 'text-brand font-semibold' : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {label}
    </button>
  );

  const railHeading = 'text-[11px] font-bold uppercase tracking-[0.16em] text-brand mb-2';

  const rail = (
    <div className="space-y-7">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search…"
          className="pl-9 h-10 rounded-md"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div>
        <h4 className={railHeading}>Make</h4>
        {railItem(brandFilter === 'all', () => setBrandFilter('all'), 'All makes')}
        {brandsInStock.map(b => railItem(brandFilter === b, () => setBrandFilter(b), b))}
      </div>

      <div>
        <h4 className={railHeading}>Type</h4>
        {railItem(typeFilter === 'all', () => setTypeFilter('all'), 'All types')}
        {railItem(typeFilter === 'bike', () => setTypeFilter('bike'), 'Bikes')}
        {railItem(typeFilter === 'scooter', () => setTypeFilter('scooter'), 'Scooters')}
      </div>

      <div>
        <h4 className={railHeading}>Sort</h4>
        {SORTS.map(s => railItem(sortOrder === s.value, () => setSortOrder(s.value), s.label))}
      </div>

      {isFiltered && (
        <button onClick={clearFilters} className="text-sm font-semibold text-foreground underline underline-offset-2 hover:no-underline">
          Clear all filters
        </button>
      )}
    </div>
  );

  const bar = (
    <div className="bg-card p-3 rounded-lg border border-border grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-3">
      <div className="relative col-span-1 md:col-span-1 lg:col-span-2">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by brand or model..."
          className="pl-10 h-11 rounded-md"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Select value={typeFilter} onValueChange={setTypeFilter}>
        <SelectTrigger className="h-11 rounded-md"><SelectValue placeholder="Vehicle Type" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="bike">Bikes</SelectItem>
          <SelectItem value="scooter">Scooters</SelectItem>
        </SelectContent>
      </Select>

      <Select value={brandFilter} onValueChange={setBrandFilter}>
        <SelectTrigger className="h-11 rounded-md"><SelectValue placeholder="Brand" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Brands</SelectItem>
          {BRANDS.map(brand => (
            <SelectItem key={brand} value={brand}>{brand}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={sortOrder} onValueChange={setSortOrder}>
        <SelectTrigger className="h-11 rounded-md"><SelectValue placeholder="Sort By" /></SelectTrigger>
        <SelectContent>
          {SORTS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          <SelectItem value="name-desc">Name: Z–A</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

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
          <VehicleCard key={vehicle.id} vehicle={vehicle} isPriority={index < priorityCount} />
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
        <div className="lg:grid lg:grid-cols-[180px_minmax(0,1fr)] lg:gap-12">
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
