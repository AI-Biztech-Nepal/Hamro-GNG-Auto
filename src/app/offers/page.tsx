import type { Metadata } from 'next';
import { QrCode, Star, User, Gift } from 'lucide-react';
import { DashainSpin } from '@/components/offers/DashainSpin';
import { OfferPoster } from '@/components/offers/OfferPoster';
import { fetchDashainOffer, fetchSettings } from '@/lib/inventory-api';
import { SITE_URL } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Dashain Offer — Spin & Win with Every Bike or Scooter',
  description:
    'Bought a bike or scooter from G&G Auto Enterprises this Dashain? Scan the QR code, leave a Google review, add your bike number and spin the wheel on your phone for petrol, a helmet, riding gear and more.',
  alternates: { canonical: '/offers' },
};

const steps = [
  { icon: QrCode, title: 'Scan the QR code', text: 'Point your phone camera at the code shown at our showroom.' },
  { icon: Star, title: 'Tell us how we did', text: 'Leave a quick Google review of your experience.' },
  { icon: User, title: 'Add your details', text: 'Your name, mobile number and the number plate of the bike or scooter you bought.' },
  { icon: Gift, title: 'Spin and collect', text: 'Spin the wheel on your phone, then show the winning screen to our staff and take your gift home.' },
];

export default async function OffersPage() {
  const [offer, settings] = await Promise.all([
    fetchDashainOffer().catch((err) => {
      console.error('Failed to load the Dashain offer:', err);
      return null;
    }),
    fetchSettings().catch(() => null),
  ]);

  return (
    <>
      {/* Laptops and showroom screens: just the poster with the QR code. Nothing plays here. */}
      <div className="hidden mouse:block">
        <OfferPoster joinUrl={`${SITE_URL}/offers`} phone={settings?.contact_phone} />
      </div>

      {/* Phones: the review -> details -> wheel flow, which runs on the customer's own phone. */}
      <div className="mouse:hidden max-w-6xl mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* On phones (QR scans) the spin card comes first; the explainer follows. */}
          <div className="order-2 lg:order-1 lg:col-span-5 space-y-8">
            <div className="space-y-5">
              <span aria-hidden className="block w-8 h-1 bg-brand" />
              <p className="text-sm font-semibold text-brand">विजया दशमीको हार्दिक मंगलमय शुभकामना</p>
              <h1 className="font-headline font-bold text-4xl md:text-5xl leading-tight tracking-tight">Dashain Spin &amp; Win</h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Every bike or scooter bought from our showroom this Dashain comes with one spin of the gift wheel.
              </p>
            </div>

            <div className="border-t border-border">
              {steps.map(({ icon: Icon, title, text }) => (
                <div key={title} className="flex items-start gap-3 border-b border-border py-4">
                  <Icon className="w-5 h-5 mt-0.5 shrink-0 text-brand" strokeWidth={2} />
                  <div>
                    <p className="font-semibold">{title}</p>
                    <p className="text-sm text-muted-foreground">{text}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground">One spin per vehicle purchase. Gifts are subject to availability.</p>
          </div>

          <div className="order-1 lg:order-2 lg:col-span-7">
            {offer && offer.prizes.length > 0 ? (
              <DashainSpin prizes={offer.prizes} reviewUrl={offer.review_url} />
            ) : (
              <div className="bg-white p-10 rounded-xl border border-border text-center space-y-2">
                <h2 className="text-2xl font-bold font-headline">The gift wheel is taking a short break</h2>
                <p className="text-muted-foreground">Please try again in a few minutes, or ask our staff at the showroom.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
