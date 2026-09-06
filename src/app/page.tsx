import { HomeClient } from '@/components/home/HomeClient';
import { fetchInventory, fetchSettings } from '@/lib/inventory-api';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [vehicles, settings] = await Promise.all([
    fetchInventory().catch(err => {
      console.error('Failed to load inventory:', err);
      return [];
    }),
    fetchSettings().catch(err => {
      console.error('Failed to load site settings:', err);
      return {};
    }),
  ]);

  // The homepage lists the whole storefront; VehicleBrowser applies the same
  // filtering and sorting (photoless entries last) that /inventory uses.
  return <HomeClient vehicles={vehicles} settings={settings} />;
}
