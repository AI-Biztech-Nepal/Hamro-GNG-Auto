
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://hamroauto.com.np'
).replace(/\/$/, '');

/** The showroom's Google review page (same link the Offers backend hands out as `review_url`). */
export const GOOGLE_REVIEW_URL =
  'https://search.google.com/local/writereview?placeid=ChIJcRmLdk4b6zkRI2pToermlUw';

export const CONTACT_INFO = {
  phone: '9860087161',
  whatsapp: '9779808027608', // wa.me wants the country code; without +977 it dials a wrong number
  email: 'info@ggautonp.com',
  address: 'Nayabasti, Boudha',
  addressLocality: 'Kathmandu',
  region: 'Bagmati Province',
  country: 'NP',
  geo: { lat: 27.7114563, lng: 85.3689337 }, // showroom pin on Google Maps
  mapsLink: 'https://maps.app.goo.gl/HVmWQXMgEefpc5rP7',
  businessName: 'G&G AUTO Enterprises',
  facebook: 'https://www.facebook.com/hamrogngauto',
  logoUrl: '/logo.png',
  heroUrl: 'https://images.unsplash.com/photo-1622185135505-2d795003994a?q=80&w=1470&auto=format&fit=crop'
};

/** Both outlets sit about 50 m apart on the same road in Nayabasti. Coordinates are the Google Maps pins. */
export const OUTLETS = [
  { name: 'Head office', where: 'Opposite Everest Petrol Pump', lat: 27.71136, lng: 85.36945 },
  { name: 'Branch', where: 'Hamro G&G Auto Enterprise', lat: 27.71098, lng: 85.36849 },
];

export const BRANDS = [
  'Honda', 'Yamaha', 'Suzuki', 'TVS', 'Bajaj', 'Royal Enfield', 'KTM', 'Hero', 'Vespa', 'Aprilia'
];

export const VEHICLE_TYPES = [
  { label: 'All', value: 'all' },
  { label: 'Bikes', value: 'bike' },
  { label: 'Scooters', value: 'scooter' }
];
