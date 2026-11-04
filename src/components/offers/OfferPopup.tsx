"use client"

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';

/**
 * A welcome popup with the "Our Inventory" banner, shown ONCE to a first-time visitor on the home
 * page. The moment it opens, this browser is remembered (localStorage) and it never opens again,
 * not on reload, not on a later visit. If storage is blocked it falls back to once per page load.
 */
const ART_W = 1672;
const ART_H = 941;
const POSTER = '/welcome-popup.jpg';
const SHOW_DELAY_MS = 700;
const SEEN_KEY = 'hamro_welcome_seen';
let shownThisLoad = false;

function alreadySeen(): boolean {
  if (shownThisLoad) return true;
  try {
    return localStorage.getItem(SEEN_KEY) === '1';
  } catch {
    return false;
  }
}

function markSeen() {
  shownThisLoad = true;
  try {
    localStorage.setItem(SEEN_KEY, '1');
  } catch {
    /* storage blocked: shownThisLoad still stops a repeat within this page load */
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
    // Fetch the picture first and open once it is ready, so the popup never appears half-drawn.
    const img = new window.Image();
    img.onload = () => {
      if (cancelled) return;
      timer = setTimeout(() => {
        if (cancelled) return;
        markSeen();
        setOpen(true);
      }, SHOW_DELAY_MS);
    };
    img.onerror = () => { /* picture unavailable: skip the popup rather than show a broken image */ };
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
        <DialogTitle className="sr-only">Hamro G&amp;G Auto Enterprises: our inventory</DialogTitle>
        <DialogDescription className="sr-only">
          A wide range of second-hand bikes and scooters under one roof in Nayabasti, Boudha, Kathmandu.
        </DialogDescription>

        <div
          className="relative overflow-hidden rounded-xl bg-white shadow-2xl"
          style={{ width: 'min(94vw, calc(86dvh * 1672 / 941))', aspectRatio: `${ART_W} / ${ART_H}` }}
        >
          <Image
            src={POSTER}
            alt="Hamro G&G Auto Enterprises: our inventory, a wide range of second-hand bikes and scooters under one roof. Quality checked, repair and maintenance, engine warranty."
            fill
            unoptimized
            className="object-fill"
          />
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

      </DialogContent>
    </Dialog>
  );
}
