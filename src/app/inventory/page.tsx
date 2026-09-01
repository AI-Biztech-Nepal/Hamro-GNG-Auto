import { InventoryClient } from '@/components/inventory/InventoryClient';
import { fetchInventory } from '@/lib/inventory-api';

export const dynamic = 'force-dynamic';

export default async function InventoryPage() {
  const vehicles = await fetchInventory().catch(err => {
    console.error('Failed to load inventory:', err);
    return [];
  });

  return <InventoryClient vehicles={vehicles} />;
}
