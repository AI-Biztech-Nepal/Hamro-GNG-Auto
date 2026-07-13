import { HomeClient } from '@/components/home/HomeClient';
import { fetchInventory, fetchSettings } from '@/lib/inventory-api';

export const revalidate = 60;

export default async function Home() {
  const [vehicles, settings] = await Promise.all([
    fetchInventory().catch(err => {
      console.error('Failed to load featured inventory:', err);
      return [];
    }),
    fetchSettings().catch(err => {
      console.error('Failed to load site settings:', err);
      return {};
    }),
  ]);

  return <HomeClient featuredVehicles={vehicles.slice(0, 8)} settings={settings} />;
}
