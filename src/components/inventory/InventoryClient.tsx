
"use client"

import { VehicleBrowser } from '@/components/inventory/VehicleBrowser';
import { Vehicle } from '@/types/vehicle';

export function InventoryClient({ vehicles }: { vehicles: Vehicle[] }) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-500">
      <div className="space-y-2">
        <h1 className="font-headline font-bold text-3xl md:text-4xl tracking-tight text-balance">Our Inventory</h1>
        <p className="text-muted-foreground">Find the perfect two-wheeler that fits your budget and lifestyle.</p>
      </div>

      <VehicleBrowser vehicles={vehicles} />
    </div>
  );
}
