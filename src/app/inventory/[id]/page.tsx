import { VehicleDetailClient } from '@/components/inventory/VehicleDetailClient';
import { fetchVehicleById } from '@/lib/inventory-api';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const revalidate = 60;

export default async function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vehicle = await fetchVehicleById(id).catch(err => {
    console.error('Failed to load vehicle:', err);
    return null;
  });

  if (!vehicle) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-6">
        <h1 className="text-3xl font-bold">Vehicle Not Found</h1>
        <Button asChild>
          <Link href="/inventory">Back to Inventory</Link>
        </Button>
      </div>
    );
  }

  return <VehicleDetailClient vehicle={vehicle} />;
}
