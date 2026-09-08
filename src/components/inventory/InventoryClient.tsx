
"use client"

import { VehicleBrowser } from '@/components/inventory/VehicleBrowser';
import { Vehicle } from '@/types/vehicle';

export function InventoryClient({ vehicles }: { vehicles: Vehicle[] }) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-10 space-y-8">
      <div className="max-w-xl">
        <span aria-hidden className="block w-8 h-1 bg-brand mb-4" />
        <h1 className="font-headline font-bold text-3xl md:text-4xl tracking-tight">Bikes for sale</h1>
        <p className="mt-2 text-muted-foreground">
          Every scooter and motorcycle currently on our floor in Nayabasti, Boudha.
        </p>
      </div>

      <VehicleBrowser vehicles={vehicles} layout="sidebar" priorityCount={6} />
    </div>
  );
}
