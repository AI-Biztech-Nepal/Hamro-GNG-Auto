import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'G&G Auto Enterprises',
    short_name: 'G&G Auto',
    description:
      'Second-hand bikes and scooters in Nayabasti, Boudha, Kathmandu — inspected, fixed-price, with genuine paperwork.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#c11f1f',
    icons: [
      { src: '/mark.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    ],
  };
}
