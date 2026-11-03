import { ExchangeClient } from '@/components/exchange/ExchangeClient';
import { fetchVehicleById } from '@/lib/inventory-api';

export default async function ExchangePage({ searchParams }: { searchParams: Promise<{ vehicle?: string | string[] }> }) {
  const { vehicle: id } = await searchParams;
  // Looked up here rather than trusting the URL for the name and price. An unknown or sold bike, or a backend problem, just means the plain form.
  const vehicle = typeof id === 'string' ? await fetchVehicleById(id).catch(() => null) : null;
  return <ExchangeClient vehicle={vehicle} />;
}
