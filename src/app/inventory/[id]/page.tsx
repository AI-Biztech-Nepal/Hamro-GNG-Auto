import type { Metadata } from 'next';
import { VehicleDetailClient } from '@/components/inventory/VehicleDetailClient';
import { fetchVehicleById } from '@/lib/inventory-api';
import { Button } from '@/components/ui/button';
import { CONTACT_INFO, SITE_URL } from '@/lib/constants';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const vehicle = await fetchVehicleById(id).catch(() => null);
  if (!vehicle) {
    return { title: 'Vehicle not found', robots: { index: false, follow: true } };
  }

  const name = vehicle.title.replace(/\s+/g, ' ').trim();
  const price = `NPR ${vehicle.price.toLocaleString()}`;
  const title = `${name} — ${price}`;
  const description =
    `${vehicle.year} ${name}, ${vehicle.condition.toLowerCase()} condition` +
    (vehicle.km_run > 0 ? `, ${vehicle.km_run.toLocaleString()} km` : '') +
    `. Inspected and priced at ${price} at G&G Auto Enterprises, Nayabasti, Boudha, Kathmandu.`;
  const image = vehicle.image_urls?.[0];
  const url = `${SITE_URL}/inventory/${vehicle.id}`;

  return {
    title,
    description,
    alternates: { canonical: `/inventory/${vehicle.id}` },
    robots: { index: vehicle.status !== 'sold', follow: true },
    openGraph: {
      type: 'website',
      title,
      description,
      url,
      images: image ? [{ url: image, alt: vehicle.title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

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

  const vehicleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Vehicle',
    name: vehicle.title,
    description: vehicle.description || `${vehicle.year} ${vehicle.title}`,
    vehicleModelDate: String(vehicle.year),
    brand: { '@type': 'Brand', name: vehicle.brand },
    model: vehicle.model || vehicle.title,
    bodyType: vehicle.type === 'scooter' ? 'Scooter' : 'Motorcycle',
    itemCondition: 'https://schema.org/UsedCondition',
    image: vehicle.image_urls?.slice(0, 5),
    ...(vehicle.km_run > 0 && {
      mileageFromOdometer: { '@type': 'QuantitativeValue', value: vehicle.km_run, unitCode: 'KMT' },
    }),
    offers: {
      '@type': 'Offer',
      priceCurrency: 'NPR',
      price: vehicle.price,
      availability:
        vehicle.status === 'sold'
          ? 'https://schema.org/SoldOut'
          : 'https://schema.org/InStock',
      url: `${SITE_URL}/inventory/${vehicle.id}`,
      seller: { '@type': 'AutomotiveBusiness', name: CONTACT_INFO.businessName },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(vehicleJsonLd) }}
      />
      <VehicleDetailClient vehicle={vehicle} />
    </>
  );
}
