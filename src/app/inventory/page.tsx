
"use client"

import { useState, useMemo } from 'react';
import { VehicleCard } from '@/components/inventory/VehicleCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Loader2 } from 'lucide-react';
import { BRANDS } from '@/lib/constants';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Vehicle } from '@/types/vehicle';

export default function InventoryPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('latest');

  const db = useFirestore();
  const vehiclesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, 'vehicles');
  }, [db]);

  const { data: dbVehicles, isLoading } = useCollection<Vehicle>(vehiclesQuery);

  const filteredVehicles = useMemo(() => {
    if (!dbVehicles) return [];
    
    return dbVehicles.filter(v => {
      const matchesSearch = v.title.toLowerCase().includes(search.toLowerCase()) || 
                           v.brand.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === 'all' || v.type === typeFilter;
      const matchesBrand = brandFilter === 'all' || v.brand === brandFilter;
      return matchesSearch && matchesType && matchesBrand;
    }).sort((a, b) => {
      if (sortOrder === 'price-low') return a.price - b.price;
      if (sortOrder === 'price-high') return b.price - a.price;
      if (sortOrder === 'name-asc') return a.title.localeCompare(b.title);
      if (sortOrder === 'name-desc') return b.title.localeCompare(a.title);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [dbVehicles, search, typeFilter, brandFilter, sortOrder]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-500">
      <div className="space-y-2">
        <h1 className="font-headline font-bold text-3xl md:text-4xl tracking-tight text-balance">Our Inventory</h1>
        <p className="text-muted-foreground">Find the perfect two-wheeler that fits your budget and lifestyle.</p>
      </div>

      {/* Filter Bar - Now Stable (Not Sticky) */}
      <div className="bg-white p-4 rounded-[2rem] shadow-sm border grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <div className="relative col-span-1 md:col-span-1 lg:col-span-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by brand or model..." 
            className="pl-10 h-12 rounded-xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="h-12 rounded-xl">
            <SelectValue placeholder="Vehicle Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="bike">Bikes</SelectItem>
            <SelectItem value="scooter">Scooters</SelectItem>
          </SelectContent>
        </Select>

        <Select value={brandFilter} onValueChange={setBrandFilter}>
          <SelectTrigger className="h-12 rounded-xl">
            <SelectValue placeholder="Brand" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Brands</SelectItem>
            {BRANDS.map(brand => (
              <SelectItem key={brand} value={brand}>{brand}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortOrder} onValueChange={setSortOrder}>
          <SelectTrigger className="h-12 rounded-xl">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latest">Latest Added</SelectItem>
            <SelectItem value="name-asc">Name: A-Z</SelectItem>
            <SelectItem value="name-desc">Name: Z-A</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8 min-h-[600px]">
        {isLoading ? (
          <div className="col-span-full py-40 flex flex-col items-center justify-center gap-6 bg-gray-50/50 rounded-[3rem] border border-dashed">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="text-2xl font-bold text-muted-foreground animate-pulse uppercase tracking-widest">Loading Inventory...</p>
          </div>
        ) : (
          filteredVehicles.length > 0 ? (
            filteredVehicles.map(vehicle => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))
          ) : (
            <div className="col-span-full py-24 text-center space-y-4">
              <div className="bg-muted w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                <Search className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="font-headline font-bold text-2xl">No vehicles found</h3>
              <p className="text-muted-foreground max-w-xs mx-auto">Try adjusting your filters or search terms to find what you're looking for.</p>
              <button 
                onClick={() => {setSearch(''); setTypeFilter('all'); setBrandFilter('all'); setSortOrder('latest');}}
                className="text-primary font-bold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
