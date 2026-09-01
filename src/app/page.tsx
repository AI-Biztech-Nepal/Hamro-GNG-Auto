import { HomeClient } from '@/components/home/HomeClient';
import { fetchInventory, fetchSettings } from '@/lib/inventory-api';

export const dynamic = 'force-dynamic';

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

  // Snoozed (photoless) entries never make the homepage highlights.
  const featuredVehicles = vehicles.filter(v => v.has_photos).slice(0, 8);

  return <HomeClient featuredVehicles={featuredVehicles} settings={settings} />;
}
