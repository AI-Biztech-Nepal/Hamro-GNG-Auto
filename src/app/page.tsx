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

  // The homepage lists the whole storefront. Snoozed (photoless) entries still
  // sink to the bottom, same as on /inventory, instead of being dropped.
  const homeVehicles = [...vehicles].sort((a, b) => {
    if (a.has_photos !== b.has_photos) return a.has_photos ? -1 : 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return <HomeClient vehicles={homeVehicles} settings={settings} />;
}
