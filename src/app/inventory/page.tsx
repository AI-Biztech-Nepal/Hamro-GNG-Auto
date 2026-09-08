import type { Metadata } from 'next';
import { InventoryClient } from '@/components/inventory/InventoryClient';
import { fetchInventory } from '@/lib/inventory-api';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Bikes & Scooters for Sale in Kathmandu',
  description:
    'Browse every second-hand bike and scooter currently in stock at G&G Auto Enterprises, Nayabasti, Boudha. ' +
    'Filter by make and type, sort by price — all inspected, all fixed-price.',
  alternates: { canonical: '/inventory' },
};

export default async function InventoryPage() {
  const vehicles = await fetchInventory().catch(err => {
    console.error('Failed to load inventory:', err);
    return [];
  });

  return <InventoryClient vehicles={vehicles} />;
}
