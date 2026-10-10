"use client"

import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';

/**
 * The laptop / showroom-screen view of the Offers page: the Dashain & Tihar poster, sized to fit
 * the screen, with a live QR code set into its gold panel. Nothing is played here -- the form,
 * wheel and review all happen on the customer's phone after they scan.
 *
 * The QR code sits in fractions of the artwork and is sized in container-width units (cqw), so it
 * stays glued to the poster at any screen size. If /public/offers-poster-v2.jpg is replaced,
 * re-measure QR_BOX below (the empty row of the gold panel, in artwork pixels).
 */
const ART_W = 1024;
const ART_H = 765;
const frac = (px: number, of: number) => `${((px / of) * 100).toFixed(3)}%`;

/** The white box holding the QR code, in artwork pixels. Centred in the panel, between its title and ribbon. */
const QR_BOX = { x: 580.5, y: 380, w: 128, h: 128 };

export function OfferPoster({ joinUrl }: { joinUrl: string }) {
  return (
    <div className="relative flex w-full justify-center overflow-hidden bg-[#2a0f2e]" data-testid="scan-to-spin">
      {/* Soft blurred copy of the poster fills the screen either side of it (the poster is 4:3). */}
      <Image
        src="/offers-poster-v2.jpg"
        alt=""
        aria-hidden
        fill
        unoptimized
        className="scale-110 object-cover opacity-60 blur-2xl"
      />

      {/* As large as fits under the 5rem navbar without scrolling. */}
      <div
        className="relative"
        style={{
          width: 'min(100%, max(560px, calc((100dvh - 5rem) * 1024 / 765)))',
          aspectRatio: `${ART_W} / ${ART_H}`,
          containerType: 'inline-size',
        }}
      >
        <h1 className="sr-only">Dashain Spin &amp; Win</h1>
        <p className="sr-only">
          Every bike or scooter bought from our showroom this Dashain comes with one spin of the gift wheel. Scan the QR code
          with your phone, add your details, spin the wheel on your phone and leave a Google review.
        </p>

        <Image
          src="/offers-poster-v2.jpg"
          alt="Dashain and Tihar Maha-Festive Offer from Hamro G&G Auto Enterprises: scan the QR code to spin the wheel. Every bike or scooter bought this Dashain comes with one spin of the gift wheel."
          fill
          unoptimized
          className="object-fill"
        />

        <div
          className="absolute bg-white shadow-md"
          style={{
            left: frac(QR_BOX.x, ART_W),
            top: frac(QR_BOX.y, ART_H),
            width: frac(QR_BOX.w, ART_W),
            height: frac(QR_BOX.h, ART_H),
            padding: '0.7cqw',
            borderRadius: '0.7cqw',
          }}
          data-testid="join-qr"
        >
          <QRCodeSVG
            value={joinUrl}
            size={256}
            level="L"
            marginSize={0}
            bgColor="#ffffff"
            fgColor="#000000"
            title="Scan to join the G&G Auto Enterprises Dashain Spin & Win"
            className="block h-full w-full"
          />
        </div>
      </div>
    </div>
  );
}
