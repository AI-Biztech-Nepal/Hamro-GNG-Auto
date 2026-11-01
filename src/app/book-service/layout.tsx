import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bike & Scooter Servicing in Kathmandu — Book Online',
  description:
    'Book a servicing slot at the G&G Auto workshop in Nayabasti, Boudha. General servicing in under 90 minutes, genuine OEM parts, every major brand.',
  alternates: { canonical: '/book-service' },
};

export default function BookServiceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
