import type { Metadata } from 'next';
import { LegalPage, type LegalSection } from '@/components/legal/LegalPage';
import { CONTACT_INFO } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'What personal information Hamro G&G Auto Enterprises collects on this website, why we collect it, who sees it, and how to ask us to change or delete it.',
  alternates: { canonical: '/privacy' },
};

const sections: LegalSection[] = [
  {
    id: 'who-we-are',
    title: 'Who we are',
    body: [
      `${CONTACT_INFO.businessName} is a second-hand bike and scooter showroom in ${CONTACT_INFO.address}, ${CONTACT_INFO.addressLocality}, Nepal. We run this website (hamroauto.com.np) and decide what happens to the information collected through it. In this policy, "we" and "us" mean ${CONTACT_INFO.businessName}.`,
    ],
  },
  {
    id: 'what-we-collect',
    title: 'What we collect',
    body: [
      'We collect only what we need to answer you and run the site:',
      {
        list: [
          'Enquiry forms. When you use the Sell, Exchange or Book Service forms, or the contact prompt on a bike, we receive your name, phone number and email, plus whatever you add: your message, vehicle details, a preferred date and any photos you upload.',
          'Google sign-in. If you choose to sign in on the Account page, Google gives us your name, email address and profile photo. We save your name and email as an account record for our team. We never see your Google password.',
          'Your phone number. If you add it when you create an account (on the Account page, or in the prompt that appears before the Call and WhatsApp buttons), we save it together with your name, your email and anything you tell us you are looking for, as an enquiry for our team.',
          'Offers. If you join an offer such as the Dashain gift wheel, we receive the contact details you enter and the result of your spin.',
          'Visit data. We note which pages are opened, using a random visit ID stored in your browser, and we use Google Analytics to see how the site is used. Neither identifies you by name.',
        ],
      },
      'We do not ask for payment card details, banking details or citizenship numbers on this website.',
    ],
  },
  {
    id: 'how-we-use-it',
    title: 'How we use it',
    body: [
      {
        list: [
          'To reply to your enquiry by phone, WhatsApp or email.',
          'To arrange a viewing, a valuation of the bike you want to sell or exchange, or a service slot.',
          'To call or WhatsApp you about bikes, offers and servicing, if you gave us your number when you created an account. You can ask us to stop at any time.',
          'To keep you signed in if you use Google sign-in.',
          'To understand which pages are useful and fix what is not.',
          'To keep records of our sales and enquiries, and to protect the site from spam and misuse.',
        ],
      },
      'We do not sell your information, and we do not hand it to advertisers.',
    ],
  },
  {
    id: 'cookies-and-storage',
    title: 'Cookies and browser storage',
    body: [
      {
        list: [
          'gg_session: set only if you sign in with Google, so you stay signed in. It holds your name, email and, if you add it, your phone number. It lasts up to 30 days and is removed when you sign out.',
          'Browser storage: a random visit ID, your last contact details (so forms are quicker next time) and the result of an offer you played. These stay on your device.',
          'Google Analytics: sets its own cookies to measure site usage.',
        ],
      },
      'You can clear cookies and site data any time in your browser settings. The site still works afterwards; you will just be asked for your details again.',
    ],
  },
  {
    id: 'who-sees-it',
    title: 'Who can see it',
    body: [
      'Our team at the showroom sees what you send us. A few providers handle data for us so the site works:',
      {
        list: [
          'Our backend service, where enquiries are stored for the team to read.',
          'Our website hosting provider.',
          'Google, for sign-in and Google Analytics.',
        ],
      },
      'They may process the data only to provide that service. We share your details with anyone else only if the law requires it. Because some of these providers run servers outside Nepal, your data may be handled abroad.',
    ],
  },
  {
    id: 'keeping-it-safe',
    title: 'Keeping it safe',
    body: [
      'The site uses HTTPS, our sign-in cookie is signed and cannot be read by scripts on the page, and form submissions are checked and rate-limited. No website can promise perfect security, so please do not send us anything you would not want us to hold.',
    ],
  },
  {
    id: 'how-long-we-keep-it',
    title: 'How long we keep it',
    body: [
      'We keep an enquiry for as long as we need it to deal with your request and for our sales and service records, then delete it. Your account record (name and email), and any phone number you add to your account, are kept with our enquiries until you ask us to delete them. Your profile photo is not stored in a database: it lives in your cookie until it expires or you sign out.',
    ],
  },
  {
    id: 'your-choices',
    title: 'Your choices',
    body: [
      'You can ask us to show you what we hold about you, correct it, or delete it. You can also tell us to stop contacting you. Call or email us using the details below and we will act on it as soon as we can.',
      "This website is for adults. If you are under 18 and used a form, ask a parent or guardian to contact us and we will remove your details.",
    ],
  },
  {
    id: 'changes',
    title: 'Changes to this policy',
    body: [
      'If we change what we collect or how we use it, we will update this page and the date at the top. Using the site after a change means you accept the updated policy.',
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

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro="What we collect when you use this website, why, who sees it, and how to have it changed or deleted. Short and in plain words."
      updated="3 November 2026"
      sections={sections}
      sibling={{ href: '/terms', label: 'Read the Terms of Service' }}
    />
  );
}
