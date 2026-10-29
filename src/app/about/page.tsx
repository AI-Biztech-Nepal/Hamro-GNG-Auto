import type { Metadata } from 'next';
import { AboutClient } from '@/components/about/AboutClient';

export const metadata: Metadata = {
  title: 'About G&G Auto: Good and Genuine Second-hand Bikes in Boudha',
  description:
    'G&G stands for Good and Genuine. Meet the three co-founders behind Hamro G&G Auto Enterprises in Nayabasti, Boudha, and the promises every bike we sell is held to.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return <AboutClient />;
}
