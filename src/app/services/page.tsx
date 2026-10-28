import type { Metadata } from 'next';
import { Wrench, ShieldCheck, RefreshCw, FileText, BadgeCheck, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CONTACT_INFO } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Two-wheeler Services — Sales, Exchange, Servicing & Paperwork',
  description:
    'G&G Auto Enterprises handles second-hand bike sales, exchange, mechanical servicing, insurance renewal and ownership transfer for two-wheelers in Nayabasti, Boudha, Kathmandu.',
  alternates: { canonical: '/services' },
};

const services = [
  {
    title: 'Second-hand sales',
    description: 'Inspected bikes and scooters across every budget, with fixed fair pricing.',
    icon: BadgeCheck,
    link: '/inventory',
    cta: 'Browse the floor',
  },
  {
    title: 'Exchange facility',
    description: 'Trade your current two-wheeler towards a better one at honest market rates.',
    icon: RefreshCw,
    link: '/exchange',
    cta: 'Get an appraisal',
  },
  {
    title: 'Servicing & repair',
    description: 'A full mechanical workshop with mechanics who know every major brand.',
    icon: Wrench,
    link: '/book-service',
    cta: 'Book a slot',
  },
  {
    title: 'Insurance renewal',
    description: 'Renew your two-wheeler insurance on the spot at the showroom.',
    icon: ShieldCheck,
    link: '/services',
    cta: 'Ask at the counter',
  },
  {
    title: 'Ownership transfer',
    description: 'We handle the full paperwork for a clean, legal transfer of ownership.',
    icon: FileText,
    link: '/services',
    cta: 'Talk to us',
  },
  {
    title: 'Free valuation',
    description: 'Not sure what your bike is worth? Bring it in for a straight valuation.',
    icon: Phone,
    link: '/sell',
    cta: 'Value my bike',
  },
];

export default function ServicesPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 sm:py-14">
      <header className="max-w-2xl">
        <span aria-hidden className="block w-8 h-1 bg-brand mb-4" />
        <h1 className="font-headline font-bold text-3xl md:text-4xl tracking-tight">What we do</h1>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          More than a showroom &mdash; sales, exchange, servicing and paperwork for
          two-wheelers, all handled under one roof in Nayabasti, Boudha.
        </p>
      </header>

      <div className="mt-10 grid sm:grid-cols-2 border-t border-border">
        {services.map(({ title, description, icon: Icon, link, cta }) => (
          <Link
            key={title}
            href={link}
            className="group border-b border-border sm:odd:border-r py-7 sm:px-6 sm:first:pl-0 flex gap-4 hover:bg-muted transition-colors"
          >
            <Icon className="w-5 h-5 mt-0.5 shrink-0 text-brand" strokeWidth={2} />
            <div>
              <h2 className="font-headline font-semibold text-lg">{title}</h2>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{description}</p>
              <span className="mt-3 inline-block text-sm font-semibold text-foreground group-hover:text-brand transition-colors">
                {cta} &rarr;
              </span>
            </div>
          </Link>
        ))}
      </div>

      <section className="mt-16 bg-secondary text-white rounded-xl px-6 sm:px-10 py-12">
        <div className="max-w-xl">
          <span aria-hidden className="block w-8 h-1 bg-brand mb-4" />
          <h2 className="font-headline font-bold text-2xl md:text-3xl tracking-tight">
            Need your bike looked at?
          </h2>
          <p className="mt-3 text-white/70 leading-relaxed">
            Book a service slot online, or call the workshop and drop the bike in &mdash;
            most jobs are done the same day.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            <Button size="lg" className="h-12 px-7 bg-white text-secondary hover:bg-white/90 font-semibold" asChild>
              <Link href="/book-service">Book a service</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 px-7 border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white font-semibold"
              asChild
            >
              <a href={`tel:${CONTACT_INFO.phone}`}>Call {CONTACT_INFO.phone}</a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
