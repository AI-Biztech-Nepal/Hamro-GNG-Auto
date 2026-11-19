import type { Metadata } from 'next';
import { TypeLanding, type LandingContent } from '@/components/landing/TypeLanding';
import { fetchInventory } from '@/lib/inventory-api';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Second Hand Scooters in Nepal: Price, Honda Dio, Vespa',
  description:
    'Buy a second hand scooter in Kathmandu, Nepal. Inspected Honda Dio, Aviator, Yamaha RayZR, Vespa and more at fixed prices, with genuine paperwork and exchange. See today\'s prices at G&G Auto, Boudha.',
  alternates: { canonical: '/second-hand-scooters-nepal' },
  openGraph: { title: 'Second Hand Scooters in Nepal | G&G Auto Enterprises', url: '/second-hand-scooters-nepal', type: 'website' },
};

const content: LandingContent = {
  kind: 'scooter',
  path: '/second-hand-scooters-nepal',
  plural: 'scooters',
  h1: 'Second Hand Scooters in Nepal',
  intro: [
    'Looking for a second hand scooter in Kathmandu? Hamro G&G Auto Enterprises in Nayabasti, Boudha, sells inspected, reconditioned scooters at fixed, fair prices. Every scooter on this page is on our showroom floor today.',
    'Scooters are the easiest way to get around Kathmandu: light in traffic, easy on fuel and simple to ride. Below you can see what is in stock, what second hand scooters cost in Nepal right now, and what to check before you buy.',
  ],
  checklistTitle: 'How to check a second hand scooter before you buy',
  checklist: [
    'Ask for the paperwork first: the bluebook, the owner\'s citizenship copy and the tax and insurance receipts. A scooter with unclear papers is not worth buying at any price.',
    'Match the registration number and the chassis and engine numbers with the bluebook.',
    'Start it cold. A healthy engine starts easily and idles smoothly, without knocking or heavy smoke.',
    'Ride it. Listen for noise from the engine and the CVT, feel for the brakes pulling to one side, and check that it accelerates smoothly.',
    'Look at the tyres, the brakes, the lights and indicators, and the front forks for oil leaks.',
    'Check the body for signs of an accident: uneven panel gaps, bent handlebars or mismatched paint.',
    'Ask how many owners it has had and how far it has run, and be wary when the story and the condition do not match.',
  ],
  faqs: [
    { q: 'Where can I buy a second hand scooter in Kathmandu?', a: 'At Hamro G&G Auto Enterprises in Nayabasti, Boudha, Kathmandu. We keep inspected, reconditioned scooters on our showroom floor and you can see and ride them in person, every day from 9 am to 7 pm.' },
    { q: 'What is the price of a second hand scooter in Nepal?', a: 'It depends on the make, model year and condition. The table on this page shows the real price range of the scooters we have in stock today, by make. Every price is fixed, with no bargaining.' },
    { q: 'Are your second hand scooters inspected?', a: 'Yes. Every scooter goes through a 40-point inspection before it is listed on our showroom floor and website.' },
    { q: 'Do you handle the ownership transfer?', a: 'Yes. We guide you through the transfer paperwork so the scooter is yours, with clean papers, on the day of delivery.' },
    { q: 'Can I exchange my old scooter or bike?', a: 'Yes. Bring the one you ride today for a free valuation and put its value towards a scooter from our floor, settled in a single visit. You can also send photos online for a valuation.' },
    { q: 'Which second hand scooters do you sell?', a: 'Our stock changes as scooters are sold and new ones arrive. It has included Honda Dio and Aviator, Yamaha RayZR and Vespa. The list above always shows what is available today.' },
    { q: 'Can I sell my scooter to you?', a: 'Yes. Send us photos and details on our Sell Bike page and we will give you a fair valuation the same day, with no charge and no obligation.' },
  ],
  otherPage: { href: '/second-hand-bikes-nepal', label: 'See second hand bikes' },
};

export default async function SecondHandScootersPage() {
  const vehicles = await fetchInventory().catch(err => {
    console.error('Failed to load inventory:', err);
    return [];
  });
  return <TypeLanding content={content} vehicles={vehicles} />;
}
