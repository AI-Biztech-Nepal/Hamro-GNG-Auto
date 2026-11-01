import type { Metadata } from 'next';
import { LegalPage, type LegalSection } from '@/components/legal/LegalPage';
import { CONTACT_INFO } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'The terms for using the Hamro G&G Auto Enterprises website: vehicle listings and prices, enquiries, selling and exchanging a bike, service bookings, offers and sign-in.',
  alternates: { canonical: '/terms' },
};

const sections: LegalSection[] = [
  {
    id: 'about-these-terms',
    title: 'About these terms',
    body: [
      `These terms apply when you use hamroauto.com.np, which is run by ${CONTACT_INFO.businessName}, ${CONTACT_INFO.address}, ${CONTACT_INFO.addressLocality}, Nepal ("we", "us"). By using the site you agree to them. If you do not agree, please do not use the site. How we handle your personal information is explained in our Privacy Policy.`,
    ],
  },
  {
    id: 'using-the-site',
    title: 'Using the site',
    body: [
      'You may browse the site, send enquiries and use the features on it for your own lawful purposes. Please do not:',
      {
        list: [
          'give false names, phone numbers or details in a form, or send spam;',
          'try to break, overload or gain unauthorised access to the site or its systems;',
          'copy the stock listings or photos in bulk, for example with a scraper, or reuse them elsewhere without our written permission;',
          'pretend to be someone else, or use the site to harass anyone.',
        ],
      },
      'We may block access if the site is being misused.',
    ],
  },
  {
    id: 'bikes-and-prices',
    title: 'Bikes, prices and availability',
    body: [
      'The bikes and scooters shown are real stock at our showroom. We work to keep photos, specifications, prices and availability correct, but a listing is information, not a binding offer to sell.',
      {
        list: [
          'Stock moves quickly. A bike may be sold or reserved before the site updates, and we may take a listing down at any time.',
          'Prices are fixed, as shown on the bike, and can change. The price confirmed at the showroom when you buy is the price that applies.',
          'Photos and descriptions are meant to be accurate, but please see the bike in person, take a test ride and check the paperwork before you pay.',
          'An enquiry or a call does not reserve a bike. A bike is held for you only when our team confirms it with you.',
        ],
      },
      'A sale is complete only at the showroom, when payment is made and the paperwork for the bike is handled. Ownership transfer follows the rules of the relevant Nepali authorities.',
    ],
  },
  {
    id: 'selling-and-exchange',
    title: 'Selling or exchanging your bike',
    body: [
      'The Sell and Exchange forms ask us to look at your bike. Any figure we mention beforehand is an estimate.',
      {
        list: [
          'The final offer depends on an in-person inspection, the condition of the bike and its papers.',
          'You must be the owner, or authorised by the owner, and must tell us honestly about the bike, including accidents and repairs.',
          'Neither side is bound until you accept our final offer at the showroom and the paperwork is signed.',
        ],
      },
    ],
  },
  {
    id: 'service-bookings',
    title: 'Service bookings',
    body: [
      'A booking form is a request for a slot, not a confirmed appointment. We confirm by phone, WhatsApp or email, and we may suggest another time if the workshop is full. The price and time for a job are confirmed after we look at the bike.',
    ],
  },
  {
    id: 'offers',
    title: 'Offers and gifts',
    body: [
      'Offers such as the Dashain gift wheel are run by the showroom for customers who buy a vehicle from us. Each offer follows the conditions stated on its page, for example one spin per vehicle purchase, and gifts are subject to availability. We can change or end an offer at any time, and gifts have no cash value.',
    ],
  },
  {
    id: 'google-sign-in',
    title: 'Signing in with Google',
    body: [
      'Signing in is optional. It uses your Google account to show who you are on the site, and you do not need it to browse or enquire. Keep your Google account secure: you are responsible for what happens while you are signed in on your device. You can sign out at any time, and we may disable sign-in for an account that is misused.',
    ],
  },
  {
    id: 'our-content',
    title: 'Our content',
    body: [
      `The ${CONTACT_INFO.businessName} name, logo, photos, text and design on this site belong to us or are used with permission. You may view them and share a link to the site, but please do not copy or republish them without asking us first.`,
    ],
  },
  {
    id: 'links-to-other-sites',
    title: 'Links to other sites',
    body: [
      'The site links to services we do not run, such as Google Maps, WhatsApp and Facebook. They have their own terms and privacy practices, and we are not responsible for them.',
    ],
  },
  {
    id: 'our-responsibility',
    title: 'Our responsibility',
    body: [
      'We provide the site as it is and do not promise that it will always be available or free of errors. To the extent the law allows, we are not liable for loss that comes from relying on information on the site, for example a listing that is out of date, or from the site being unavailable. Nothing in these terms limits your rights under Nepali consumer law, or our responsibility for matters the law does not allow us to limit. The terms of any sale are those you agree with us at the showroom.',
    ],
  },
  {
    id: 'governing-law',
    title: 'Governing law',
    body: [
      'These terms are governed by the laws of Nepal. If we cannot settle a disagreement by talking it through, the courts of Kathmandu will handle it.',
    ],
  },
  {
    id: 'changes',
    title: 'Changes to these terms',
    body: [
      'We may update these terms. The date at the top shows the latest version, and using the site after a change means you accept it.',
    ],
  },
  {
    id: 'contact',
    title: 'Contact',
    body: [
      `${CONTACT_INFO.businessName}, ${CONTACT_INFO.address}, ${CONTACT_INFO.addressLocality}. Phone ${CONTACT_INFO.phone}. Email ${CONTACT_INFO.email}.`,
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      intro="The ground rules for using this website, and what to expect when you enquire about, sell, exchange or service a bike with us."
      updated="1 November 2026"
      sections={sections}
      sibling={{ href: '/privacy', label: 'Read the Privacy Policy' }}
    />
  );
}
