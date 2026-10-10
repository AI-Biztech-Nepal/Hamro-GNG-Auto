"use client"

import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';

/**
 * The laptop / showroom-screen view of the Offers page: the Dashain poster with a live QR code
 * set into its empty centre panel and the shop's phone number in its footer. Nothing is played
 * here -- the review, form and wheel all happen on the customer's phone after they scan.
 *
 * Everything on top of the artwork is positioned in fractions of the artwork and sized in
 * container-width units (cqw), so it stays glued to the poster at any screen width. If the
 * artwork in /public/offers-poster.jpg is replaced, re-measure PANEL and PHONE below.
 */
const ART_W = 1024;
const ART_H = 473;
const frac = (px: number, of: number) => `${((px / of) * 100).toFixed(3)}%`;

/** The empty white panel inside the bulb frame, in artwork pixels. */
const PANEL = { x: 410, y: 117, w: 213, h: 216 };
/** The slot in the footer bar where the phone number goes, in artwork pixels. */
const PHONE = { x: 338, y: 446, h: 24 };

function formatPhone(raw?: string): string {
  const digits = (raw || '').replace(/\D/g, '');
  const local = digits.startsWith('977') && digits.length > 10 ? digits.slice(3) : digits;
  return local ? `+977-${local}` : '';
}

export function OfferPoster({ joinUrl, phone }: { joinUrl: string; phone?: string }) {
  const phoneText = formatPhone(phone);

  return (
    <div
      className="relative w-full overflow-hidden bg-[#f6efe3]"
      style={{ aspectRatio: `${ART_W} / ${ART_H}`, containerType: 'inline-size' }}
      data-testid="scan-to-spin"
    >
      <h1 className="sr-only">Dashain Spin &amp; Win</h1>
      <p className="sr-only">
        Every bike or scooter bought from our showroom this Dashain comes with one spin of the gift wheel. Scan the QR code
        with your phone, add your details, spin the wheel on your phone and leave a Google review.
      </p>

      <Image
        src="/offers-poster.jpg"
        alt="Dashain and Tihar greetings from Hamro G&G Auto Enterprises: Dashain Spin & Win, one spin of the gift wheel with every bike or scooter"
        fill
        sizes="100vw"
        quality={90}
        className="object-fill"
      />

      <div
        className="absolute flex flex-col items-center justify-between text-center"
        style={{
          left: frac(PANEL.x, ART_W),
          top: frac(PANEL.y, ART_H),
          width: frac(PANEL.w, ART_W),
          height: frac(PANEL.h, ART_H),
          padding: '0.8cqw 1.1cqw',
        }}
      >
        <h2 className="font-headline font-bold leading-tight" style={{ fontSize: '1.25cqw' }}>Scan to spin the wheel</h2>
        <p className="text-muted-foreground" style={{ fontSize: '0.7cqw' }}>Add your details, spin, then review us</p>
        <div className="border border-neutral-300 bg-white" style={{ width: '15.4cqw', padding: '0.55cqw', borderRadius: '0.5cqw' }} data-testid="join-qr">
          <QRCodeSVG
            value={joinUrl}
            size={256}
            level="M"
            marginSize={0}
            bgColor="#ffffff"
            fgColor="#000000"
            title="Scan to join the G&G Auto Enterprises Dashain Spin & Win"
            className="block w-full h-auto"
          />
        </div>
        <p className="text-muted-foreground" style={{ fontSize: '0.66cqw' }}>
          or open <span className="font-mono font-semibold text-foreground">{joinUrl.replace(/^https?:\/\//, '')}</span> on your phone
        </p>
      </div>

      {phoneText && (
        <span
          className="absolute flex items-center whitespace-nowrap font-headline font-medium text-white"
          style={{ left: frac(PHONE.x, ART_W), top: frac(PHONE.y, ART_H), height: frac(PHONE.h, ART_H), fontSize: '1.42cqw' }}
        >
          {phoneText}
        </span>
      )}
    </div>
  );
}
