import { HomeClient } from '@/components/home/HomeClient';
import { fetchInventory } from '@/lib/inventory-api';

export const revalidate = 60;

export default async function Home() {
  const vehicles = await fetchInventory().catch(err => {
    console.error('Failed to load featured inventory:', err);
    return [];
  });

  return <HomeClient featuredVehicles={vehicles.slice(0, 8)} />;
}
