
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://hamroauto.com.np'
).replace(/\/$/, '');

/** The showroom's Google review page (same link the Offers backend hands out as `review_url`). */
export const GOOGLE_REVIEW_URL =
  'https://search.google.com/local/writereview?placeid=ChIJcRmLdk4b6zkRI2pToermlUw';

export const CONTACT_INFO = {
  phone: '9860087161',
  whatsapp: '9808027608',
  email: 'info@ggautonp.com',
  address: 'Nayabasti, Boudha',
  addressLocality: 'Kathmandu',
  region: 'Bagmati Province',
  country: 'NP',
  geo: { lat: 27.7211, lng: 85.3620 },
  mapsLink: 'https://maps.app.goo.gl/HVmWQXMgEefpc5rP7',
  businessName: 'G&G AUTO Enterprises',
  facebook: 'https://www.facebook.com/hamrogngauto',
  logoUrl: '/logo.png',
  heroUrl: 'https://images.unsplash.com/photo-1622185135505-2d795003994a?q=80&w=1470&auto=format&fit=crop'
};

export const BRANDS = [
  'Honda', 'Yamaha', 'Suzuki', 'TVS', 'Bajaj', 'Royal Enfield', 'KTM', 'Hero', 'Vespa', 'Aprilia'
];

export const VEHICLE_TYPES = [
  { label: 'All', value: 'all' },
  { label: 'Bikes', value: 'bike' },
  { label: 'Scooters', value: 'scooter' }
];
