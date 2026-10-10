"use client"

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { Gift, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { SITE_URL } from '@/lib/constants';

/**
 * The Dashain & Tihar offer poster, shown once per visit as a popup when the home page opens.
 *
 * - Laptops / showroom screens (mouse or trackpad): a crisp live QR code is set over the poster's
 *   own QR, so a customer can scan it with their phone.
 * - Phones can't scan their own screen, so the poster itself links to the Offers page and a
 *   "Spin the wheel" button sits under it.
 *
 * The overlay is positioned in fractions of the artwork (and sized in cqw), so it stays glued to
 * the poster at any size. If /public/offers-popup.jpg is replaced, re-measure QR_BOX below.
 */
const ART_W = 1024;
const ART_H = 765;
const POSTER = '/offers-popup.jpg';
/** Remembered per browser session, so closing the popup keeps it away until the next visit. */
const SEEN_KEY = 'gng-offer-popup-seen-v1';
const SHOW_DELAY_MS = 700;

const frac = (px: number, of: number) => `${((px / of) * 100).toFixed(3)}%`;
/** A white box that covers the QR code printed on the poster, in artwork pixels. */
const QR_BOX = { x: 582.5, y: 382, w: 124, h: 124 };

function alreadySeen(): boolean {
  try {
    return sessionStorage.getItem(SEEN_KEY) === '1';
  } catch {
    return false;
  }
}
function markSeen() {
  try {
    sessionStorage.setItem(SEEN_KEY, '1');
  } catch {
    /* storage blocked -- worst case it shows again on the next page load */
  }
}

export function OfferPopup() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const onHome = pathname === '/';

  useEffect(() => {
    if (!onHome || alreadySeen()) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    // Fetch the poster first and open once it is ready, so the popup never appears half-drawn.
    const img = new window.Image();
    const show = () => {
      if (cancelled) return;
      timer = setTimeout(() => {
        if (cancelled) return;
        markSeen();
        setOpen(true);
      }, SHOW_DELAY_MS);
    };
    img.onload = show;
    img.onerror = () => { /* poster unavailable: skip the popup rather than show a broken image */ };
    img.src = POSTER;
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [onHome]);

  if (!onHome) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="w-auto max-w-none gap-0 border-0 bg-transparent p-0 shadow-none sm:rounded-none [&>button]:hidden"
        data-testid="offer-popup"
      >
        <DialogTitle className="sr-only">Dashain &amp; Tihar Maha-Festive Offer</DialogTitle>
        <DialogDescription className="sr-only">
          Every bike or scooter bought from our showroom this Dashain comes with one spin of the gift wheel.
        </DialogDescription>

        <div
          // Phones keep room under the poster for the "Spin the wheel" button.
          className="relative overflow-hidden rounded-xl bg-[#1b1030] shadow-2xl [--ph:78dvh] mouse:[--ph:86dvh]"
          style={{
            width: 'min(92vw, calc(var(--ph) * 1024 / 765))',
            aspectRatio: `${ART_W} / ${ART_H}`,
            containerType: 'inline-size',
          }}
        >
          <Image
            src={POSTER}
            alt="Dashain and Tihar Maha-Festive Offer from Hamro G&G Auto Enterprises: every bike or scooter bought this Dashain comes with one spin of the gift wheel. Scan the QR code to spin the wheel."
            fill
            unoptimized
            className="object-fill"
          />

          {/* Phones: the whole poster is the way in to the Offers page. */}
          <Link href="/offers" onClick={() => setOpen(false)} aria-label="Open the Dashain Spin & Win offer" className="absolute inset-0 mouse:hidden" />

          {/* Laptops: a crisp live QR over the poster's own, for customers to scan with their phone. */}
          <div
            className="absolute hidden bg-white mouse:block"
            style={{
              left: frac(QR_BOX.x, ART_W),
              top: frac(QR_BOX.y, ART_H),
              width: frac(QR_BOX.w, ART_W),
              height: frac(QR_BOX.h, ART_H),
              padding: '0.6cqw',
              borderRadius: '0.7cqw',
            }}
            data-testid="popup-qr"
          >
            <QRCodeSVG
              value={`${SITE_URL}/offers`}
              size={256}
              level="L"
              marginSize={0}
              bgColor="#ffffff"
              fgColor="#000000"
              title="Scan to join the G&G Auto Enterprises Dashain Spin & Win"
              className="block h-full w-full"
            />
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <Link
          href="/offers"
          onClick={() => setOpen(false)}
          className="mx-auto mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-brand font-bold text-brand-foreground hover:bg-brand/90 mouse:hidden"
          style={{ maxWidth: 'min(92vw, 420px)' }}
        >
          <Gift className="h-5 w-5" /> Spin the wheel
        </Link>
      </DialogContent>
    </Dialog>
  );
}
