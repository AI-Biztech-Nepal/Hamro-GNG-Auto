import type { Metadata } from 'next';
import { InventoryClient } from '@/components/inventory/InventoryClient';
import { fetchInventory } from '@/lib/inventory-api';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Second Hand Bikes & Scooters for Sale in Nepal — Honda, Yamaha, TVS',
  description:
    'Browse every second hand and reconditioned Honda, Yamaha, Suzuki and TVS bike and scooter in stock in Kathmandu, Nepal. ' +
    'Filter by make, type and budget — all inspected, all fixed-price.',
  alternates: { canonical: '/inventory' },
};

export default async function InventoryPage() {
  const vehicles = await fetchInventory().catch(err => {
    console.error('Failed to load inventory:', err);
    return [];
  });

  return <InventoryClient vehicles={vehicles} />;
}
