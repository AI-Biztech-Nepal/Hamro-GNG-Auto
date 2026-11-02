import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronDown, MessageCircle, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BRANDS, CONTACT_INFO } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Second Hand Bike & Scooter FAQ — Kathmandu',
  description:
    'Answers on buying, selling and exchanging second hand bikes and scooters in Kathmandu: inspection, fixed prices, payment, paperwork, servicing and opening hours.',
  alternates: { canonical: '/faq' },
};

type Faq = { q: string; a: string; link?: { href: string; label: string } };
type FaqGroup = { id: string; title: string; items: Faq[] };

const brandList = `${BRANDS.slice(0, -1).join(', ')} and ${BRANDS[BRANDS.length - 1]}`;
const where = `${CONTACT_INFO.address}, ${CONTACT_INFO.addressLocality}`;

// Every answer here is also sent to search engines as FAQPage data, so keep each one plain text and true to how the
// showroom works (the 40-point inspection, fixed prices and paperwork are the site's own promises, see PRODUCT.md).
const groups: FaqGroup[] = [
  {
    id: 'buying',
    title: 'Buying a second hand bike or scooter',
    items: [
      {
        q: 'Where can I buy a second hand bike or scooter in Kathmandu?',
        a: `At G&G Auto Enterprises in ${where}. We sell inspected second hand bikes and scooters across every budget. See what is in stock right now on our inventory page, then call, WhatsApp or visit the showroom.`,
        link: { href: '/inventory', label: 'Browse available bikes' },
      },
      {
        q: 'Do you sell second hand scooters (scooty) as well as bikes?',
        a: `Yes. We sell second hand bikes and second hand scooters, which many people in Nepal call a scooty. Brands we handle include ${brandList}. Stock changes quickly, so check the inventory page for what is available today.`,
        link: { href: '/inventory', label: 'See bikes and scooters in stock' },
      },
      {
        q: 'Are your second hand bikes inspected?',
        a: 'Yes. Every bike passes a 40-point inspection and comes with genuine paperwork. We still suggest you see the bike in person, take a test ride and check the paperwork before you pay.',
      },
      {
        q: 'What is a reconditioned bike?',
        a: 'A reconditioned bike is a second hand bike that has been checked over and put back into good working order before it is sold. Every bike we sell also passes our 40-point inspection. Ask our team what was checked on any bike you like.',
      },
      {
        q: 'Can I bargain on the price?',
        a: 'No. Prices are fixed and shown on each bike, so everyone pays the same fair price and there is no haggling. The price confirmed at the showroom when you buy is the price that applies.',
      },
      {
        q: 'Can I test ride a bike before I buy it?',
        a: 'Yes, please do. See the bike in person, take a test ride and check the paperwork before you pay.',
      },
      {
        q: 'How can I pay?',
        a: 'By cash or bank transfer. A sale is completed at the showroom, when payment is made and the paperwork for the bike is handled.',
      },
      {
        q: 'Can I reserve a bike I like?',
        a: `An enquiry or a call does not reserve a bike on its own, and a bike is held for you only when our team confirms it with you. Stock moves quickly, so call or WhatsApp us on ${CONTACT_INFO.phone} as soon as you find one you like.`,
      },
    ],
  },
  {
    id: 'selling',
    title: 'Selling or exchanging your bike',
    items: [
      {
        q: 'How do I sell my second hand bike or scooter in Kathmandu?',
        a: 'Send us a few photos and details of your bike with the Sell form. We give a fair valuation from the photos, usually the same day, and can inspect the bike free at your door. The final offer depends on that in-person inspection, the condition of the bike and its papers, and you are paid immediately when the deal is agreed.',
        link: { href: '/sell', label: 'Sell your bike' },
      },
      {
        q: 'How much is my second hand bike or scooter worth?',
        a: 'It depends on the make, model, year, condition and papers. Send photos with the Sell form, or bring the bike in, and we will give you a straight valuation at no cost.',
        link: { href: '/sell', label: 'Get a valuation' },
      },
      {
        q: 'Can I exchange my old bike for another one?',
        a: 'Yes. We take your current two-wheeler towards a better one at honest market rates. Send its details with the Exchange form for a valuation. As with a sale, the final value depends on an in-person inspection, and neither side is bound until you accept our final offer at the showroom and the paperwork is signed.',
        link: { href: '/exchange', label: 'Exchange your bike' },
      },
      {
        q: 'What do I need when I sell or exchange a bike?',
        a: 'You need to be the owner of the bike, or be authorised by the owner, and bring its papers, such as the bluebook. Please tell us honestly about any accidents and repairs. Our team will tell you if anything else is needed.',
      },
    ],
  },
  {
    id: 'service',
    title: 'Servicing, insurance and paperwork',
    items: [
      {
        q: 'Do you service bikes and scooters?',
        a: 'Yes. Our workshop does full services, oil changes, brake repair, engine work and electrical repair, with mechanics who know every major brand. Book a slot online or call us. Most jobs are done the same day, and the price and time for a job are confirmed after we look at the bike.',
        link: { href: '/book-service', label: 'Book a service' },
      },
      {
        q: 'Can I renew my bike insurance at G&G Auto?',
        a: 'Yes. You can renew your two-wheeler insurance on the spot at the showroom.',
      },
      {
        q: 'Do you handle ownership transfer (naamsari)?',
        a: 'Yes. We handle the full paperwork for a clean, legal transfer of ownership, following the rules of the relevant Nepali authorities. Ask our team at the showroom.',
        link: { href: '/services', label: 'See all our services' },
      },
    ],
  },
  {
    id: 'visit',
    title: 'Visiting us',
    items: [
      {
        q: 'Where is G&G Auto located?',
        a: `In ${where}. Our head office is opposite Everest Petrol Pump, and our branch is about 50 m away on the same road.`,
        link: { href: CONTACT_INFO.mapsLink, label: 'Get directions on Google Maps' },
      },
      {
        q: 'What are your opening hours?',
        a: 'We are open every day, from 9 AM to 7 PM.',
      },
    ],
  },
];

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: groups.flatMap((g) =>
    g.items.map((i) => ({
      '@type': 'Question',
      name: i.q,
      acceptedAnswer: { '@type': 'Answer', text: i.a },
    })),
  ),
};

const focusRing = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-sm';

export default function FaqPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 sm:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, '\\u003c') }}
      />

      <header>
        <span aria-hidden className="block w-8 h-1 bg-brand mb-4" />
        <h1 className="font-headline font-bold text-3xl md:text-4xl tracking-tight text-balance">
          Second hand bike &amp; scooter FAQ
        </h1>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          Answers to what people ask us most about buying, selling, exchanging and servicing a two-wheeler at our
          showroom in {where}.
        </p>
        <nav aria-label="Question topics" className="mt-6 flex flex-wrap gap-2">
          {groups.map((g) => (
            <a
              key={g.id}
              href={`#${g.id}`}
              className={`px-3.5 py-1.5 border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors ${focusRing}`}
            >
              {g.title}
            </a>
          ))}
        </nav>
      </header>

      {groups.map((g) => (
        <section key={g.id} id={g.id} className="mt-12 scroll-mt-28" aria-labelledby={`${g.id}-heading`}>
          <h2 id={`${g.id}-heading`} className="font-headline font-bold text-xl md:text-2xl tracking-tight text-balance">
            {g.title}
          </h2>
          <div className="mt-4 border-t border-border">
            {g.items.map(({ q, a, link }) => (
              <details key={q} className="group border-b border-border">
                <summary
                  className={`flex items-start justify-between gap-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden py-5 font-headline font-semibold text-base sm:text-lg leading-snug ${focusRing}`}
                >
                  <span>{q}</span>
                  <ChevronDown
                    className="w-5 h-5 mt-0.5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                    aria-hidden
                  />
                </summary>
                <div className="pb-6 pr-9 text-[15px] leading-7 text-muted-foreground">
                  <p>{a}</p>
                  {link &&
                    (link.href.startsWith('http') ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`mt-3 inline-block text-sm font-semibold text-foreground hover:text-brand transition-colors ${focusRing}`}
                      >
                        {link.label} &rarr;
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className={`mt-3 inline-block text-sm font-semibold text-foreground hover:text-brand transition-colors ${focusRing}`}
                      >
                        {link.label} &rarr;
                      </Link>
                    ))}
                </div>
              </details>
            ))}
          </div>
        </section>
      ))}

      <section className="mt-16 bg-secondary text-white rounded-xl px-6 sm:px-10 py-12">
        <div className="max-w-xl">
          <span aria-hidden className="block w-8 h-1 bg-brand mb-4" />
          <h2 className="font-headline font-bold text-2xl md:text-3xl tracking-tight">Still have a question?</h2>
          <p className="mt-3 text-white/70 leading-relaxed">
            Call or WhatsApp the showroom and we will answer in plain language, or drop in and see the bikes yourself.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            <Button size="lg" className="h-12 px-7 bg-white text-secondary hover:bg-white/90 font-semibold" asChild>
              <a href={`tel:${CONTACT_INFO.phone}`}>
                <Phone className="w-4 h-4" aria-hidden /> Call {CONTACT_INFO.phone}
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 px-7 border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white font-semibold"
              asChild
            >
              <a href={`https://wa.me/${CONTACT_INFO.whatsapp}`} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="w-4 h-4" aria-hidden /> WhatsApp us
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
