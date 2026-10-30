"use client"

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';
import {
  Backpack, Banknote, CookingPot, Fuel, Gift, Hand, HardHat, Loader2, Shirt, Smartphone, Sparkles, Star, type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Step = 'details' | 'wheel' | 'result';

interface OfferReply {
  ok: boolean;
  msg?: string;
  used?: boolean;
  already?: boolean;
  prize?: string;
  prize_index?: number;
}

/** Icon for a prize, matched by keyword so it keeps working when prizes are renamed in the admin panel. */
const PRIZE_ICONS: [string, LucideIcon][] = [
  ['petrol', Fuel], ['fuel', Fuel], ['helmet', HardHat], ['induction', CookingPot], ['glove', Hand],
  ['bag', Backpack], ['jacket', Shirt], ['recharge', Smartphone], ['card', Smartphone],
  ['cash', Banknote], ['accessor', Sparkles],
];
function iconFor(prize: string): LucideIcon {
  const name = prize.toLowerCase();
  return PRIZE_ICONS.find(([key]) => name.includes(key))?.[1] ?? Gift;
}

const SPIN_MS = 7500;
const SPIN_TURNS = 7;
/**
 * Slows down at a steady rate, like a real wheel losing speed to friction: it starts fast and is
 * still visibly turning in the last seconds, then rolls gently to a stop. (The old curve dropped
 * its speed within the first third, so the last few seconds looked like it had already stopped.)
 */
const SPIN_EASE = 'cubic-bezier(0.5, 1, 0.89, 1)';

/**
 * The wheel is a picture (public/wheel-v2.webp) and its prizes are part of the artwork. The prize is
 * always picked by the backend; the wheel turns to land on the slice that shows that prize.
 * `centre` and `width` are in degrees clockwise from the top; "Rs. 2000 Cash" is printed on two
 * slices. If the artwork is replaced, re-measure this table.
 */
const PICTURE_SRC = '/wheel-v2.webp';
const PICTURE_SLICES = [
  { prize: 'petrol2', centre: 32.3, width: 49.9 },
  { prize: 'induction', centre: 82.9, width: 51.3 },
  { prize: 'cash2000', centre: 133.2, width: 49.4 },
  { prize: 'petrol5', centre: 183.8, width: 51.7 },
  { prize: 'cash2000', centre: 237.0, width: 54.9 },
  { prize: 'accessories', centre: 290.6, width: 52.3 },
  { prize: 'cash500', centre: 342.1, width: 50.6 },
] as const;
type PictureSlice = (typeof PICTURE_SLICES)[number];

/** Which prize on the picture a backend prize name stands for, by keyword; null if none does. */
function pictureKey(name: string): string | null {
  const n = name.toLowerCase().replace(/,/g, '');
  if (n.includes('induction')) return 'induction';
  if (n.includes('accessor')) return 'accessories';
  if (/petrol|fuel/.test(n)) {
    const litres = n.match(/(\d+)\s*(?:l|lt|ltr|ltrs|liters?|litres?)\b/);
    return litres?.[1] === '2' ? 'petrol2' : litres?.[1] === '5' ? 'petrol5' : null;
  }
  if (n.includes('cash')) {
    const amount = n.match(/\b(500|2000)\b/);
    return amount ? `cash${amount[1]}` : null;
  }
  return null;
}

/**
 * The slice(s) the wheel should land on for a prize. When the prize in the admin panel isn't one of
 * the six printed on the picture, the nearest printed one is used (fuel -> petrol, money or a
 * recharge -> cash, any gear -> accessories). The prize shown afterwards is always the real one.
 */
function slicesFor(prize: string): PictureSlice[] {
  const n = prize.toLowerCase();
  const nearest = /petrol|fuel/.test(n) ? 'petrol2' : /cash|recharge|card|rs\.?\s*\d/.test(n) ? 'cash500' : 'accessories';
  const key = pictureKey(prize) ?? nearest;
  return PICTURE_SLICES.filter((s) => s.prize === key);
}
/** Seconds the customer sees their prize before being taken to the Google review. */
const REVIEW_REDIRECT_SECS = 5;

// The result is remembered on this phone. Going off to the Google review can reload this page (or
// the browser restores it), and the customer should land back on their gift -- not the start.
const RESULT_KEY = 'gng-dashain-result';
const RESULT_TTL_MS = 6 * 60 * 60 * 1000;

interface SavedResult {
  prize: string;
  bikeNo: string;
  /** The customer has been sent to the Google review. */
  reviewSent: boolean;
  at: number;
}

function loadResult(): SavedResult | null {
  try {
    const saved = JSON.parse(localStorage.getItem(RESULT_KEY) || 'null') as SavedResult | null;
    return saved && saved.prize && Date.now() - saved.at < RESULT_TTL_MS ? saved : null;
  } catch {
    return null;
  }
}
function saveResult(r: Omit<SavedResult, 'at'> | null) {
  try {
    if (r) localStorage.setItem(RESULT_KEY, JSON.stringify({ ...r, at: Date.now() }));
    else localStorage.removeItem(RESULT_KEY);
  } catch {
    /* private mode / storage blocked -- the in-memory state below still works */
  }
}

async function callOffer(action: 'check' | 'spin', payload: Record<string, string>): Promise<OfferReply> {
  const res = await fetch('/api/offers/dashain', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...payload }),
  });
  return res.json();
}

function PictureWheel({ rotation, spinning, onSpin }: { rotation: number; spinning: boolean; onSpin: () => void }) {
  return (
    <div className="relative mx-auto w-full max-w-[360px] pt-4" style={{ containerType: 'inline-size' }} data-testid="picture-wheel">
      {/* warm glow behind the wheel */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-4 aspect-square scale-[1.18] rounded-full bg-[radial-gradient(circle,rgba(242,184,36,0.6)_0%,rgba(242,184,36,0)_66%)] motion-safe:animate-pulse"
      />
      <div className="relative aspect-square">
        <div
          className="h-full w-full drop-shadow-[0_10px_16px_rgba(0,0,0,0.32)]"
          style={{ transform: `rotate(${rotation}deg)`, transition: `transform ${SPIN_MS}ms ${SPIN_EASE}` }}
          data-testid="picture-wheel-disc"
        >
          <Image
            src={PICTURE_SRC}
            alt="Gift wheel: Rs. 500 Cash, Rs. 2000 Cash, 2 Liter Petrol, 5 Liter Petrol, Induction Stove and Accessories"
            width={900}
            height={900}
            unoptimized
            draggable={false}
            className="h-full w-full select-none"
          />
        </div>

        {/* The pointer and the hub stay still while the picture turns under them. */}
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 z-10 w-[14%] -translate-x-1/2 -translate-y-[28%]">
          <svg viewBox="0 0 64 84" className={`block w-full drop-shadow-[0_3px_3px_rgba(0,0,0,0.4)] ${spinning ? 'gng-wheel-tick' : ''}`}>
            <defs>
              <linearGradient id="gng-pin" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#fff2a8" />
                <stop offset="0.5" stopColor="#f2b824" />
                <stop offset="1" stopColor="#b97b06" />
              </linearGradient>
            </defs>
            <path d="M32 82 C26 66 6 52 6 30 A26 26 0 1 1 58 30 C58 52 38 66 32 82 Z" fill="url(#gng-pin)" stroke="#7f1d1d" strokeWidth="3" strokeLinejoin="round" />
            <circle cx="32" cy="30" r="11" fill="#c1121f" stroke="#7f1d1d" strokeWidth="2" />
            <circle cx="28" cy="26" r="3.5" fill="#ffffff" opacity="0.75" />
          </svg>
        </div>

        <button
          type="button"
          onClick={onSpin}
          disabled={spinning}
          aria-label="Spin the wheel"
          className={`absolute left-1/2 top-1/2 z-10 grid aspect-square w-[25.5%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[radial-gradient(circle_at_32%_26%,#fff6c2,#f7c948_52%,#c58a0b)] font-headline font-extrabold uppercase tracking-wide text-[#7a1010] shadow-[0_0_0_3px_#fff7d6,0_0_0_5px_#b97b06,0_6px_14px_rgba(0,0,0,0.4)] ${spinning ? 'opacity-90' : 'gng-hub-pulse'}`}
          style={{ fontSize: '7.4cqw' }}
        >
          Spin
        </button>
      </div>
    </div>
  );
}

const CONFETTI_COLORS = ['#c1121f', '#f2b824', '#1d4ed8', '#16a34a', '#7e22ce', '#f97316'];

/** A short burst of paper confetti over the prize screen. Decorative; off under reduced motion. */
function Confetti() {
  const pieces = useMemo(
    () => Array.from({ length: 46 }, (_, i) => ({
      left: Math.random() * 100,
      delay: Math.random() * 0.7,
      dur: 2.4 + Math.random() * 1.6,
      drift: (Math.random() - 0.5) * 140,
      spin: (Math.random() < 0.5 ? -1 : 1) * (360 + Math.random() * 540),
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      w: 6 + Math.random() * 6,
      h: 10 + Math.random() * 8,
    })),
    [],
  );
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden" data-testid="confetti">
      {pieces.map((c, i) => (
        <span
          key={i}
          className="gng-confetti"
          style={{
            left: `${c.left}%`,
            width: c.w,
            height: c.h,
            backgroundColor: c.color,
            borderRadius: 2,
            ['--gng-delay' as string]: `${c.delay}s`,
            ['--gng-dur' as string]: `${c.dur}s`,
            ['--gng-drift' as string]: `${c.drift}px`,
            ['--gng-spin' as string]: `${c.spin}deg`,
          }}
        />
      ))}
    </div>
  );
}

export function DashainSpin({ prizes, reviewUrl, joinUrl }: { prizes: string[]; reviewUrl: string; joinUrl: string }) {
  const [step, setStep] = useState<Step>('details');
  const wheelPreloaded = useRef(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [bikeNo, setBikeNo] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<{ prize: string; already: boolean } | null>(null);
  const [reviewState, setReviewState] = useState<'pending' | 'redirecting' | 'done'>('pending');
  /** Seconds left before the customer is sent to the review; null = no automatic redirect running. */
  const [countdown, setCountdown] = useState<number | null>(null);

  // The backend treats this as the one-spin-per-bike key (and reads it as `code` on the wire).
  const bikeNumber = bikeNo.trim().toUpperCase();

  // Back on this page after the review (reload, or the browser restored it): show the gift again.
  useEffect(() => {
    const saved = loadResult();
    if (!saved) return;
    setBikeNo(saved.bikeNo);
    setResult({ prize: saved.prize, already: true });
    setReviewState(saved.reviewSent ? 'done' : 'pending');
    setStep('result');
  }, []);

  // A heads-up for whoever is testing the page: the picture only shows six prizes, so any other
  // prize set in the admin panel can't be seen on the wheel (the wheel lands on the nearest one).
  useEffect(() => {
    const missing = prizes.filter((p) => !pictureKey(p));
    if (missing.length) {
      console.warn(`Gift wheel: these prizes are not printed on the wheel picture: ${missing.join(', ')}. Update the prizes in the admin Offers screen to match the picture.`);
    }
  }, [prizes]);

  // Count down on the prize screen, then take the customer to the Google review.
  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) {
      goToReview();
      return;
    }
    const t = setTimeout(() => setCountdown((c) => (c === null ? null : c - 1)), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // If the review opened in another app (e.g. Google Maps) this page stays alive underneath:
  // when the customer comes back to it, the review is finished.
  useEffect(() => {
    if (reviewState !== 'redirecting') return;
    const onReturn = () => {
      if (document.visibilityState === 'visible') setReviewState('done');
    };
    document.addEventListener('visibilitychange', onReturn);
    window.addEventListener('pageshow', onReturn);
    return () => {
      document.removeEventListener('visibilitychange', onReturn);
      window.removeEventListener('pageshow', onReturn);
    };
  }, [reviewState]);

  // Start fetching the wheel picture as soon as the customer begins typing, so it is ready by the wheel step.
  function preloadWheel() {
    if (wheelPreloaded.current) return;
    wheelPreloaded.current = true;
    const img = new window.Image();
    img.src = PICTURE_SRC;
  }

  function showResult(prize: string, already: boolean) {
    setResult({ prize, already });
    saveResult({ prize, bikeNo: bikeNumber, reviewSent: false });
    setReviewState('pending');
    setStep('result');
    // Only a fresh win is sent to the review by itself; someone checking an old gift is left alone.
    setCountdown(already ? null : REVIEW_REDIRECT_SECS);
  }

  function goToReview() {
    setCountdown(null);
    if (result) saveResult({ prize: result.prize, bikeNo: bikeNumber, reviewSent: true });
    setReviewState('redirecting');
    window.location.assign(reviewUrl);
  }

  function startAgain() {
    saveResult(null);
    setResult(null);
    setReviewState('pending');
    setCountdown(null);
    setName('');
    setPhone('');
    setBikeNo('');
    setRotation(0);
    setError('');
    setStep('details');
  }

  async function submitDetails(e: React.FormEvent) {
    e.preventDefault();
    const plate = bikeNumber.replace(/[^A-Z0-9ऀ-ॿ]/g, '');
    if (name.trim().length < 2) return setError('Please enter your name.');
    if (!/^9\d{9}$/.test(phone.trim())) return setError('Please enter a valid 10-digit mobile number.');
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError('Please enter a valid email address.');
    if (plate.length < 4 || !/[0-9०-९]/.test(plate)) {
      return setError('Please enter the number plate of your bike, e.g. Ba 70 Pa 1234.');
    }
    setError('');
    setBusy(true);
    try {
      // Has this bike already had its spin? If so show that gift instead of the wheel.
      const r = await callOffer('check', { code: bikeNumber });
      if (!r.ok) setError(r.msg || 'Please check the bike number and try again.');
      else if (r.used) showResult(r.prize || '', true);
      else setStep('wheel');
    } catch {
      setError('Connection problem. Please try again.');
    }
    setBusy(false);
  }

  async function spin() {
    setError('');
    setBusy(true);
    try {
      const r = await callOffer('spin', { code: bikeNumber, name: name.trim(), phone: phone.trim(), email: email.trim() });
      if (!r.ok || r.prize == null) {
        setError(r.msg || 'Something went wrong. Please ask our staff.');
        setBusy(false);
        return;
      }
      // The pointer sits at the top; turn the wheel so the middle of the winning slice lands under it.
      // A prize printed on two slices lands on either one, a little off-centre.
      const options = slicesFor(r.prize as string);
      const slice = options[Math.floor(Math.random() * options.length)];
      const landing = 360 - slice.centre + (Math.random() - 0.5) * slice.width * 0.5;
      setRotation((prev) => prev - (prev % 360) + 360 * SPIN_TURNS + landing);
      setTimeout(() => {
        showResult(r.prize as string, Boolean(r.already));
        setBusy(false);
      }, SPIN_MS + 600);
    } catch {
      setError('Connection problem. Please try again.');
      setBusy(false);
    }
  }

  const ResultIcon = result ? iconFor(result.prize) : Gift;

  return (
    <div className="relative overflow-hidden bg-white p-6 sm:p-10 rounded-xl border border-border" data-testid="dashain-spin">
      {/* A laptop or showroom screen only shows a code to scan -- the form, the wheel and the
          review all happen on the customer's own phone, so nothing spins on this screen. */}
      <div className="hidden mouse:block space-y-6 text-center" data-testid="scan-to-spin">
        <h2 className="text-3xl font-bold font-headline">Scan to spin the wheel</h2>
        <p className="text-muted-foreground leading-relaxed">
          Point your phone camera at this code. You&apos;ll add your details, spin the wheel and leave a quick Google review right on your phone.
        </p>
        <div className="mx-auto w-fit rounded-xl border border-border bg-white p-5" data-testid="join-qr">
          <QRCodeSVG
            value={joinUrl}
            size={260}
            level="M"
            marginSize={0}
            bgColor="#ffffff"
            fgColor="#000000"
            title="Scan to join the G&G Auto Enterprises Dashain Spin & Win"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          or open <span className="font-mono font-semibold text-foreground">{joinUrl.replace(/^https?:\/\//, '')}</span> on your phone
        </p>
      </div>

      <div className="mouse:hidden">
        {step === 'details' && (
          <form onSubmit={submitDetails} onFocusCapture={preloadWheel} className="space-y-6" noValidate>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold font-headline">Congratulations on your new ride!</h2>
              <p className="text-muted-foreground">Tell us who you are and which bike you bought to claim your spin of the gift wheel.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="offer-name" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Full Name</Label>
              <Input id="offer-name" autoComplete="name" maxLength={60} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name" className="h-11 rounded-md" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="offer-phone" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Mobile Number</Label>
              <Input id="offer-phone" type="tel" inputMode="numeric" autoComplete="tel" maxLength={10} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="98XXXXXXXX" className="h-11 rounded-md" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="offer-email" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Email</Label>
              <Input id="offer-email" type="email" autoComplete="email" maxLength={120} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="h-11 rounded-md" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="offer-bike" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Bike Lot No.</Label>
              <Input id="offer-bike" autoCapitalize="characters" autoComplete="off" maxLength={24} value={bikeNo} onChange={(e) => setBikeNo(e.target.value)} placeholder="Ba 70 Pa 1234" className="h-11 rounded-md font-mono uppercase" />
              <p className="text-xs text-muted-foreground">The number plate of the bike or scooter you bought.</p>
            </div>
            {error && <p role="alert" className="text-sm font-medium text-destructive">{error}</p>}
            <Button type="submit" size="lg" disabled={busy} className="w-full h-14 text-lg font-bold rounded-lg" data-testid="go-for-spin">
              {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Go for spin'}
            </Button>
          </form>
        )}

        {step === 'wheel' && (
          <div className="space-y-6 text-center">
            <h2 className="text-3xl font-bold font-headline">Spin the wheel!</h2>
            <PictureWheel rotation={rotation} spinning={busy} onSpin={spin} />
            {error && <p role="alert" className="text-sm font-medium text-destructive">{error}</p>}
            <Button size="lg" disabled={busy} onClick={spin} className="w-full h-14 text-lg font-bold rounded-lg bg-brand text-brand-foreground hover:bg-brand/90">
              {busy ? 'Spinning…' : 'SPIN'}
            </Button>
          </div>
        )}

        {step === 'result' && result && (
          <div className="space-y-6 text-center" data-testid="dashain-result">
          {!result.already && <Confetti />}
            <div className="mx-auto w-20 h-20 rounded-full bg-[#fff4dc] flex items-center justify-center">
              <ResultIcon className="w-10 h-10 text-brand" strokeWidth={1.75} />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{result.already ? 'Your gift' : 'You won'}</p>
              <h2 className="font-headline font-bold text-4xl md:text-5xl text-brand">{result.prize}</h2>
            </div>
            <p className="mx-auto w-fit rounded-md border-2 border-dashed border-border px-6 py-2 font-mono text-lg font-semibold tracking-wider">{bikeNumber}</p>

            {reviewState === 'done' ? (
              <div className="space-y-3" data-testid="dashain-finished">
                <p className="text-xl font-bold font-headline">Thank you for your review!</p>
                <p className="text-muted-foreground">Show this screen to our staff to collect your gift.</p>
                <p className="text-muted-foreground">Happy Dashain and safe riding!</p>
                <button type="button" className="text-sm text-muted-foreground underline underline-offset-4" onClick={startAgain}>
                  Bought another bike? Start again
                </button>
              </div>
            ) : (
              <div className="space-y-4 rounded-lg bg-[#fff4dc] p-5" data-testid="dashain-review-step">
                <p className="text-lg font-bold font-headline">One last step: tell us how we did</p>
                {countdown !== null && (
                  <p className="text-sm text-muted-foreground" aria-live="polite">Taking you to our Google review in {countdown}…</p>
                )}
                <Button
                  size="lg"
                  className="w-full h-14 text-lg font-bold rounded-lg bg-brand text-brand-foreground hover:bg-brand/90"
                  onClick={goToReview}
                  disabled={reviewState === 'redirecting'}
                >
                  <Star className="w-5 h-5" /> Leave a Google review
                </Button>
                {countdown !== null && (
                  <button type="button" className="text-sm text-muted-foreground underline underline-offset-4" onClick={() => setCountdown(null)}>
                    Stay on this page
                  </button>
                )}
                <p className="text-sm text-muted-foreground">Show this screen to our staff to collect your gift.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
