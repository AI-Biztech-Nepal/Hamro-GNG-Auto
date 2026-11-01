import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sell My Bike or Scooter in Kathmandu — Same-Day Price',
  description:
    'Sell your second-hand two-wheeler to G&G Auto Enterprises. Upload a few photos and details and get a straight, fair price — usually the same day. Free doorstep inspection, immediate payment.',
  alternates: { canonical: '/sell' },
};

export default function SellLayout({ children }: { children: React.ReactNode }) {
  return children;
}
