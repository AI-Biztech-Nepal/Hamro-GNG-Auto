import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Exchange Your Two-wheeler',
  description:
    'Trade your current bike or scooter towards a better one at G&G Auto Enterprises, Nayabasti, Boudha. Send photos and details for a straight exchange valuation.',
  alternates: { canonical: '/exchange' },
};

export default function ExchangeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
