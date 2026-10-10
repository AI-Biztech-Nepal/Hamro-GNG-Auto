"use client"

import { useEffect, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Backpack, CookingPot, Fuel, Gift, Hand, HardHat, Loader2, Shirt, Smartphone, Star, type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Step = 'review' | 'details' | 'wheel' | 'result';

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
];
function iconFor(prize: string): LucideIcon {
  const name = prize.toLowerCase();
  return PRIZE_ICONS.find(([key]) => name.includes(key))?.[1] ?? Gift;
}

const SLICE_COLORS = [
  { fill: 'hsl(0 72% 44%)', ink: '#ffffff' },
  { fill: '#fff4dc', ink: '#171717' },
  { fill: '#171717', ink: '#ffffff' },
  { fill: '#f2b824', ink: '#171717' },
];

const R = 150;
const SPIN_MS = 5500;

async function callOffer(action: 'check' | 'spin', payload: Record<string, string>): Promise<OfferReply> {
  const res = await fetch('/api/offers/dashain', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...payload }),
  });
  return res.json();
}

function Wheel({ prizes, rotation }: { prizes: string[]; rotation: number }) {
  const seg = 360 / prizes.length;
  // Point on the rim at `deg` clockwise from the top.
  const rim = (deg: number) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return `${(R * Math.cos(rad)).toFixed(2)} ${(R * Math.sin(rad)).toFixed(2)}`;
  };

  return (
    <div className="relative mx-auto w-full max-w-[340px]">
      <div
        aria-hidden
        className="absolute left-1/2 -top-1 z-10 -translate-x-1/2 w-0 h-0 border-x-[13px] border-x-transparent border-t-[26px] border-t-foreground drop-shadow"
      />
      <svg viewBox="-160 -160 320 320" className="w-full h-auto" role="img" aria-label={`Gift wheel: ${prizes.join(', ')}`}>
        <g style={{ transform: `rotate(${rotation}deg)`, transition: `transform ${SPIN_MS}ms cubic-bezier(0.12, 0.8, 0.2, 1)` }}>
          {prizes.map((prize, i) => {
            const { fill, ink } = SLICE_COLORS[i % SLICE_COLORS.length];
            const Icon = iconFor(prize);
            return (
              <g key={`${prize}-${i}`}>
                <path d={`M0 0 L${rim(i * seg)} A${R} ${R} 0 0 1 ${rim((i + 1) * seg)} Z`} fill={fill} stroke="#ffffff" strokeWidth={2} />
                <g transform={`rotate(${(i + 0.5) * seg})`}>
                  <Icon x={-12} y={-R + 12} width={24} height={24} color={ink} strokeWidth={2} />
                  <text
                    transform="rotate(-90)"
                    x={R - 44}
                    y={4}
                    textAnchor="end"
                    fontSize={11.5}
                    fontWeight={700}
                    fill={ink}
                    {...(prize.length > 12 ? { textLength: 76, lengthAdjust: 'spacingAndGlyphs' as const } : {})}
                  >
                    {prize}
                  </text>
                </g>
              </g>
            );
          })}
        </g>
        <circle r={R + 4} fill="none" stroke="#171717" strokeWidth={8} />
        <circle r={22} fill="#ffffff" stroke="#171717" strokeWidth={4} />
        <circle r={6} fill="hsl(0 72% 44%)" />
      </svg>
    </div>
  );
}

export function DashainSpin({ prizes, reviewUrl, joinUrl }: { prizes: string[]; reviewUrl: string; joinUrl: string }) {
  const [step, setStep] = useState<Step>('review');
  const [reviewOpened, setReviewOpened] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bikeNo, setBikeNo] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<{ prize: string; already: boolean } | null>(null);
  const stepRef = useRef(step);
  stepRef.current = step;

  // When the customer comes back from the Google review tab/app, move on by itself.
  useEffect(() => {
    if (!reviewOpened) return;
    const onVisible = () => {
      if (document.visibilityState === 'visible' && stepRef.current === 'review') setStep('details');
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [reviewOpened]);

  // The backend treats this as the one-spin-per-bike key (and reads it as `code` on the wire).
  const bikeNumber = bikeNo.trim().toUpperCase();

  async function submitDetails(e: React.FormEvent) {
    e.preventDefault();
    const plate = bikeNumber.replace(/[^A-Z0-9ऀ-ॿ]/g, '');
    if (name.trim().length < 2) return setError('Please enter your name.');
    if (!/^9\d{9}$/.test(phone.trim())) return setError('Please enter a valid 10-digit mobile number.');
    if (plate.length < 4 || !/[0-9०-९]/.test(plate)) {
      return setError('Please enter the number plate of your bike, e.g. Ba 70 Pa 1234.');
    }
    setError('');
    setBusy(true);
    try {
      // Has this bike already had its spin? If so show that gift instead of the wheel.
      const r = await callOffer('check', { code: bikeNumber });
      if (!r.ok) setError(r.msg || 'Please check the bike number and try again.');
      else if (r.used) {
        setResult({ prize: r.prize || '', already: true });
        setStep('result');
      } else setStep('wheel');
    } catch {
      setError('Connection problem. Please try again.');
    }
    setBusy(false);
  }

  async function spin() {
    setError('');
    setBusy(true);
    try {
      const r = await callOffer('spin', { code: bikeNumber, name: name.trim(), phone: phone.trim() });
      if (!r.ok || r.prize == null) {
        setError(r.msg || 'Something went wrong. Please ask our staff.');
        setBusy(false);
        return;
      }
      // The pointer sits at the top; turn the wheel so the middle of the winning slice lands under it.
      const seg = 360 / prizes.length;
      const landing = 360 - ((r.prize_index ?? 0) + 0.5) * seg + (Math.random() - 0.5) * seg * 0.6;
      setRotation((prev) => prev - (prev % 360) + 360 * 6 + landing);
      setTimeout(() => {
        setResult({ prize: r.prize as string, already: Boolean(r.already) });
        setStep('result');
        setBusy(false);
      }, SPIN_MS + 600);
    } catch {
      setError('Connection problem. Please try again.');
      setBusy(false);
    }
  }

  const ResultIcon = result ? iconFor(result.prize) : Gift;

  return (
    <div className="bg-white p-6 sm:p-10 rounded-xl border border-border" data-testid="dashain-spin">
      {/* A laptop or showroom screen only shows a code to scan -- the review, the form and the
          wheel all happen on the customer's own phone, so nothing spins on this screen. */}
      <div className="hidden mouse:block space-y-6 text-center" data-testid="scan-to-spin">
        <h2 className="text-3xl font-bold font-headline">Scan to spin the wheel</h2>
        <p className="text-muted-foreground leading-relaxed">
          Point your phone camera at this code. You&apos;ll leave a quick Google review, add your details and spin the wheel right on your phone.
        </p>
        <div className="mx-auto w-fit rounded-xl border border-border bg-white p-5" data-testid="join-qr">
          <QRCodeSVG
            value={joinUrl}
            size={240}
            level="M"
            marginSize={0}
            bgColor="#ffffff"
            fgColor="#171717"
            title="Scan to join the G&G Auto Enterprises Dashain Spin & Win"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          or open <span className="font-mono font-semibold text-foreground">{joinUrl.replace(/^https?:\/\//, '')}</span> on your phone
        </p>
      </div>

      <div className="mouse:hidden">
        {step === 'review' && (
          <div className="space-y-6 text-center">
            <h2 className="text-3xl font-bold font-headline">Congratulations on your new ride!</h2>
            <div className="flex justify-center gap-1.5" aria-hidden>
              {[0, 1, 2, 3, 4].map((i) => <Star key={i} className="w-8 h-8 fill-[#f2b824] text-[#f2b824]" />)}
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Tell us how we did with a quick Google review. When you come back to this page, you can add your details and spin the wheel.
            </p>
            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold rounded-lg bg-brand text-brand-foreground hover:bg-brand/90"
              onClick={() => {
                window.open(reviewUrl, '_blank', 'noopener');
                setReviewOpened(true);
              }}
            >
              <Star className="w-5 h-5" /> Write a Google review
            </Button>
            {reviewOpened && (
              <Button size="lg" variant="outline" className="w-full h-12 font-semibold rounded-lg" onClick={() => setStep('details')}>
                I&apos;m done — add my details
              </Button>
            )}
            <button type="button" className="text-sm text-muted-foreground underline underline-offset-4" onClick={() => setStep('details')}>
              Already reviewed us? Continue
            </button>
          </div>
        )}

        {step === 'details' && (
          <form onSubmit={submitDetails} className="space-y-6" noValidate>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold font-headline">Thank you! One last step</h2>
              <p className="text-muted-foreground">Tell us who you are and which bike you bought, then spin the gift wheel.</p>
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
              <Label htmlFor="offer-bike" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Bike Lot No.</Label>
              <Input id="offer-bike" autoCapitalize="characters" autoComplete="off" maxLength={24} value={bikeNo} onChange={(e) => setBikeNo(e.target.value)} placeholder="Ba 70 Pa 1234" className="h-11 rounded-md font-mono uppercase" />
              <p className="text-xs text-muted-foreground">The number plate of the bike or scooter you bought.</p>
            </div>
            {error && <p role="alert" className="text-sm font-medium text-destructive">{error}</p>}
            <Button type="submit" size="lg" disabled={busy} className="w-full h-14 text-lg font-bold rounded-lg">
              {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Open the wheel'}
            </Button>
          </form>
        )}

        {step === 'wheel' && (
          <div className="space-y-6 text-center">
            <h2 className="text-3xl font-bold font-headline">Spin the wheel!</h2>
            <Wheel prizes={prizes} rotation={rotation} />
            {error && <p role="alert" className="text-sm font-medium text-destructive">{error}</p>}
            <Button size="lg" disabled={busy} onClick={spin} className="w-full h-14 text-lg font-bold rounded-lg bg-brand text-brand-foreground hover:bg-brand/90">
              {busy ? 'Spinning…' : 'SPIN'}
            </Button>
          </div>
        )}

        {step === 'result' && result && (
          <div className="space-y-6 text-center" data-testid="dashain-result">
            <div className="mx-auto w-20 h-20 rounded-full bg-[#fff4dc] flex items-center justify-center">
              <ResultIcon className="w-10 h-10 text-brand" strokeWidth={1.75} />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{result.already ? 'Your gift' : 'You won'}</p>
              <h2 className="font-headline font-bold text-4xl md:text-5xl text-brand">{result.prize}</h2>
            </div>
            <p className="text-muted-foreground">Show this screen to our staff to collect your gift.</p>
            <p className="mx-auto w-fit rounded-md border-2 border-dashed border-border px-6 py-2 font-mono text-lg font-semibold tracking-wider">{bikeNumber}</p>
            <p className="text-muted-foreground">Happy Dashain and safe riding!</p>
          </div>
        )}
      </div>
    </div>
  );
}
