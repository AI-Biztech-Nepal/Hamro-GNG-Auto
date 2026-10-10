import type {Metadata} from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { StickyBottomBar } from '@/components/layout/StickyBottomBar';
import { Toaster } from '@/components/ui/toaster';
import { TransitionProvider } from '@/components/layout/TransitionProvider';
import { OfferPopup } from '@/components/offers/OfferPopup';
import { fetchSettings, type SiteSettings } from '@/lib/inventory-api';
import { CONTACT_INFO, SITE_URL } from '@/lib/constants';

// Render at request time so a slow/unreachable backend never blocks the build.
// Per-fetch `next: { revalidate, tags }` in inventory-api still caches responses
// and keeps on-demand revalidation (revalidateTag) working.
export const dynamic = 'force-dynamic';

const TITLE = 'Secondhand & Reconditioned Honda Bikes and Scooters in Boudha, Kathmandu | G&G Auto';
const DESCRIPTION =
  'Buy secondhand and reconditioned Honda Dio, Activa, Shine and more at G&G Auto Enterprises, Nayabasti, Boudha, Kathmandu. ' +
  'Every used bike and scooter is inspected on 40 points, comes with genuine paperwork, ' +
  'and is sold at a fixed fair price. Buy, sell, exchange and service two-wheelers in one place.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: '%s | G&G Auto Enterprises',
  },
  description: DESCRIPTION,
  applicationName: 'G&G Auto Enterprises',
  keywords: [
    'secondhand Honda Kathmandu',
    'second hand Honda bike Nepal',
    'reconditioned Honda scooter Kathmandu',
    'reconditioned bikes Nepal',
    'used Honda Dio Nepal',
    'second hand scooter Boudha',
    'second hand bikes Kathmandu',
    'used scooters Nepal',
    'used motorcycle Kathmandu',
    'bike showroom Nayabasti Boudha',
    'bike exchange Nepal',
    'sell my bike Kathmandu',
    'bike servicing Boudha',
    'G&G Auto Enterprises',
    'Hamro G&G Auto',
  ],
  authors: [{ name: 'G&G Auto Enterprises' }],
  creator: 'G&G Auto Enterprises',
  publisher: 'G&G Auto Enterprises',
  alternates: { canonical: '/' },
  category: 'automotive',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  openGraph: {
    type: 'website',
    siteName: 'G&G Auto Enterprises',
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    locale: 'en_NP',
    images: [{ url: '/og.jpg', width: 1200, height: 630, alt: 'G&G Auto Enterprises' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/og.jpg'],
  },
};

const orgJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'AutomotiveBusiness',
  '@id': `${SITE_URL}/#business`,
  name: CONTACT_INFO.businessName,
  alternateName: 'Hamro G&G Auto',
  description: DESCRIPTION,
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  image: `${SITE_URL}/og.jpg`,
  telephone: `+977${CONTACT_INFO.phone}`,
  email: CONTACT_INFO.email,
  priceRange: 'NPR',
  currenciesAccepted: 'NPR',
  paymentAccepted: 'Cash, Bank transfer',
  address: {
    '@type': 'PostalAddress',
    streetAddress: CONTACT_INFO.address,
    addressLocality: CONTACT_INFO.addressLocality,
    addressRegion: CONTACT_INFO.region,
    addressCountry: CONTACT_INFO.country,
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: CONTACT_INFO.geo.lat,
    longitude: CONTACT_INFO.geo.lng,
  },
  hasMap: CONTACT_INFO.mapsLink,
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '09:00',
      closes: '19:00',
    },
  ],
  sameAs: [CONTACT_INFO.facebook],
  makesOffer: {
    '@type': 'Offer',
    itemOffered: { '@type': 'Service', name: 'Used two-wheeler sales, exchange and servicing' },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await fetchSettings().catch((err): SiteSettings => {
    console.error('Failed to load site settings:', err);
    return {};
  });

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Montserrat:wght@400;500;600&display=swap" rel="stylesheet" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://picsum.photos" />

        {/* Preload the brand mark shown in the header */}
        <link rel="preload" as="image" href="/logo.png" fetchPriority="high" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      </head>
      <body className="font-body antialiased min-h-screen">
        <Navbar settings={settings} />
        <TransitionProvider>
          <main className="flex-grow pb-16 md:pb-0">
            {children}
          </main>
        </TransitionProvider>
        <Footer settings={settings} />
        <StickyBottomBar />
        <OfferPopup />
        <Toaster />
      </body>
    </html>
  );
}
