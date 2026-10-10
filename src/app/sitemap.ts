import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/constants';
import { fetchInventory } from '@/lib/inventory-api';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/inventory`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/services`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/sell`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/exchange`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/book-service`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/offers`, lastModified: now, changeFrequency: 'weekly', priority: 0.5 },
  ];

  const vehicles = await fetchInventory().catch(() => []);
  const vehicleRoutes: MetadataRoute.Sitemap = vehicles
    .filter((v) => v.status !== 'sold')
    .map((v) => ({
      url: `${SITE_URL}/inventory/${v.id}`,
      lastModified: v.created_at ? new Date(v.created_at) : now,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

  return [...staticRoutes, ...vehicleRoutes];
}
