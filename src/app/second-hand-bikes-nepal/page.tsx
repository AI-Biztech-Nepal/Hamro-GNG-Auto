import type { Metadata } from 'next';
import { TypeLanding, type LandingContent } from '@/components/landing/TypeLanding';
import { fetchInventory } from '@/lib/inventory-api';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Second Hand Bikes in Nepal: Price, Honda, Yamaha, Bajaj',
  description:
    'Buy a second hand motorcycle in Kathmandu, Nepal. Inspected Honda, Yamaha, Bajaj, TVS and more at fixed prices, with genuine paperwork and exchange. See today\'s prices at G&G Auto, Boudha.',
  alternates: { canonical: '/second-hand-bikes-nepal' },
  openGraph: { title: 'Second Hand Bikes in Nepal | G&G Auto Enterprises', url: '/second-hand-bikes-nepal', type: 'website' },
};

const content: LandingContent = {
  kind: 'bike',
  path: '/second-hand-bikes-nepal',
  plural: 'bikes',
  h1: 'Second Hand Bikes in Nepal',
  intro: [
    'Looking for a second hand bike in Kathmandu? Hamro G&G Auto Enterprises in Nayabasti, Boudha, sells inspected, reconditioned motorcycles at fixed, fair prices. Every bike on this page is on our showroom floor today.',
    'Below you can see what is in stock, what second hand bikes cost in Nepal right now, and what to check before you buy.',
  ],
  checklistTitle: 'How to check a second hand bike before you buy',
  checklist: [
    'Ask for the paperwork first: the bluebook, the owner\'s citizenship copy and the tax and insurance receipts. A bike with unclear papers is not worth buying at any price.',
    'Match the registration number and the chassis and engine numbers with the bluebook.',
    'Start it cold. A healthy engine starts easily and idles smoothly, without knocking or heavy smoke.',
    'Ride it. Check the clutch and the gears for smooth changes, feel for the brakes pulling to one side, and listen for noise from the chain and the engine.',
    'Look at the tyres, the chain and sprockets, the brakes, the lights and indicators, and the front forks for oil leaks.',
    'Check the frame and body for signs of an accident: bent handlebars, uneven panel gaps or mismatched paint.',
    'Ask how many owners it has had and how far it has run, and be wary when the story and the condition do not match.',
  ],
  faqs: [
    { q: 'Where can I buy a second hand bike in Kathmandu?', a: 'At Hamro G&G Auto Enterprises in Nayabasti, Boudha, Kathmandu. We keep inspected, reconditioned bikes on our showroom floor and you can see and ride them in person, every day from 9 am to 7 pm.' },
    { q: 'What is the price of a second hand bike in Nepal?', a: 'It depends on the make, model year and condition. The table on this page shows the real price range of the bikes we have in stock today, by make. Every price is fixed, with no bargaining.' },
    { q: 'Are your second hand bikes inspected?', a: 'Yes. Every bike goes through a 40-point inspection before it is listed on our showroom floor and website.' },
    { q: 'Do you handle the ownership transfer?', a: 'Yes. We guide you through the transfer paperwork so the bike is yours, with clean papers, on the day of delivery.' },
    { q: 'Can I exchange my old bike?', a: 'Yes. Bring the one you ride today for a free valuation and put its value towards a bike from our floor, settled in a single visit. You can also send photos online for a valuation.' },
    { q: 'Which second hand bikes do you sell?', a: 'Our stock changes as bikes are sold and new ones arrive. We deal in Honda, Yamaha, Bajaj, TVS, Suzuki, Hero and other makes. The list above always shows what is available today.' },
    { q: 'Can I sell my bike to you?', a: 'Yes. Send us photos and details on our Sell Bike page and we will give you a fair valuation the same day, with no charge and no obligation.' },
  ],
  otherPage: { href: '/second-hand-scooters-nepal', label: 'See second hand scooters' },
};

export default async function SecondHandBikesPage() {
  const vehicles = await fetchInventory().catch(err => {
    console.error('Failed to load inventory:', err);
    return [];
  });
  return <TypeLanding content={content} vehicles={vehicles} />;
}
