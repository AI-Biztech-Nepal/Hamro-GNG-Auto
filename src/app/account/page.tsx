"use client"

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { Check, Loader2, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { readVisitor, saveVisitor } from '@/components/contact/ContactGate';
import { useToast } from '@/hooks/use-toast';
import { isValidPhone } from '@/lib/phone';

type User = { name: string; email: string; picture?: string; phone?: string };

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const INTERESTS = [
  { value: 'buy', label: 'Buy a bike' },
  { value: 'sell', label: 'Sell my bike' },
  { value: 'exchange', label: 'Exchange' },
  { value: 'service', label: 'Servicing' },
];

export default function AccountPage() {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [gsiReady, setGsiReady] = useState(false);
  const [phone, setPhone] = useState('');
  const [interest, setInterest] = useState('');
  const [savedPhone, setSavedPhone] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState('');
  const [saving, setSaving] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((u: User | null) => {
        setUser(u);
        setSavedPhone(u?.phone ?? null);
      })
      .catch(() => setUser(null));
    // The GSI script may already be loaded when navigating back to this page.
    if ((window as any).google?.accounts) setGsiReady(true);
    // Someone who already gave a number at the call/WhatsApp prompt doesn't have to type it twice.
    setPhone(readVisitor()?.phone ?? '');
  }, []);

  async function savePhone(e: React.FormEvent) {
    e.preventDefault();
    if (!user || saving) return;
    const value = phone.trim();
    if (!isValidPhone(value)) return setPhoneError('Please enter a valid phone number (7 to 15 digits).');
    setPhoneError('');
    setSaving(true);
    const res = await fetch('/api/account/phone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: value, interest: interest || undefined }),
    }).catch(() => null);
    setSaving(false);
    if (res?.ok) {
      setSavedPhone(value);
      setUser({ ...user, phone: value });
      // Also tell the call/WhatsApp prompt who this is, so it doesn't ask them again.
      saveVisitor({ name: user.name, phone: value, address: readVisitor()?.address ?? '', email: user.email });
      window.dispatchEvent(new Event('gg-auth'));
    } else if (res?.status === 401) {
      setUser(null);
      toast({ title: 'Please sign in again', description: 'Your sign-in has expired.', variant: 'destructive' });
    } else if (res?.status === 429) {
      toast({ title: 'Too many attempts', description: 'Please wait a few minutes and try again.', variant: 'destructive' });
    } else {
      toast({ title: 'Could not save your number', description: 'Please try again in a moment.', variant: 'destructive' });
    }
  }

  useEffect(() => {
    if (user !== null || !gsiReady || !CLIENT_ID || !buttonRef.current) return;
    const gsi = (window as any).google.accounts.id;
    gsi.initialize({
      client_id: CLIENT_ID,
      callback: async ({ credential }: { credential: string }) => {
        const res = await fetch('/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credential }),
        });
        if (res.ok) {
          setUser(await res.json());
          window.dispatchEvent(new Event('gg-auth'));
        }
        else toast({ title: 'Sign-in failed', description: 'Please try again.', variant: 'destructive' });
      },
    });
    gsi.renderButton(buttonRef.current, { theme: 'outline', size: 'large', text: 'signin_with', shape: 'rectangular', width: 280 });
  }, [user, gsiReady, toast]);

  async function signOut() {
    await fetch('/api/auth/logout', { method: 'POST' });
    (window as any).google?.accounts?.id.disableAutoSelect();
    setUser(null);
    window.dispatchEvent(new Event('gg-auth'));
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16 md:py-24">
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onLoad={() => setGsiReady(true)} />
      <div className="space-y-5 mb-10">
        <span aria-hidden className="block w-8 h-1 bg-brand" />
        <h1 className="font-headline font-bold text-4xl leading-tight tracking-tight">Your account</h1>
      </div>

      <div className="bg-white p-8 rounded-xl border border-border">
        {user === undefined ? (
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground mx-auto" aria-label="Loading" />
        ) : user ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14">
                <AvatarImage src={user.picture} alt="" referrerPolicy="no-referrer" />
                <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-semibold truncate">{user.name}</p>
                <p className="text-sm text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>

            {savedPhone ? (
              <div className="border-t border-border pt-6 space-y-2">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <Check className="w-4 h-4 text-brand" aria-hidden /> Account complete
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We&apos;ll use <span className="font-semibold text-foreground">{savedPhone}</span> to reach you about bikes, offers and servicing.{' '}
                  <button
                    type="button"
                    className="font-semibold text-foreground underline underline-offset-2 hover:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-sm"
                    onClick={() => {
                      setPhone(savedPhone);
                      setSavedPhone(null);
                    }}
                  >
                    Change number
                  </button>
                </p>
              </div>
            ) : (
              <form onSubmit={savePhone} className="border-t border-border pt-6 space-y-5" noValidate>
                <div>
                  <h2 className="font-headline font-semibold text-lg">One more step: add your phone number</h2>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                    Your account is not complete until we have a number to reach you on about bikes you like, offers and servicing.
                  </p>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="account-phone">Phone number <span className="text-destructive">*</span></Label>
                  <Input
                    id="account-phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    maxLength={20}
                    placeholder="98XXXXXXXX"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (phoneError) setPhoneError('');
                    }}
                    aria-invalid={!!phoneError}
                  />
                  {phoneError && <p role="alert" className="text-sm text-destructive">{phoneError}</p>}
                </div>
                <fieldset className="grid gap-2">
                  <legend className="text-sm font-medium mb-1">
                    What are you looking for? <span className="text-xs font-normal text-muted-foreground">(optional)</span>
                  </legend>
                  <RadioGroup value={interest} onValueChange={setInterest} className="grid-cols-2">
                    {INTERESTS.map((o) => (
                      <Label
                        key={o.value}
                        htmlFor={`interest-${o.value}`}
                        className="flex items-center gap-2.5 rounded-md border border-border px-3 py-2.5 text-sm font-normal cursor-pointer transition-colors hover:bg-muted has-[[data-state=checked]]:border-foreground"
                      >
                        <RadioGroupItem id={`interest-${o.value}`} value={o.value} />
                        {o.label}
                      </Label>
                    ))}
                  </RadioGroup>
                </fieldset>
                <Button type="submit" className="w-full h-11 font-semibold" disabled={saving}>
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden />}
                  Finish my account
                </Button>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  By saving, you agree that G&amp;G Auto may call or WhatsApp you about bikes, offers and servicing. You can ask us to
                  stop at any time. See our <Link href="/privacy" className="underline underline-offset-2">Privacy Policy</Link>.
                </p>
              </form>
            )}

            <Button variant="outline" className="w-full h-11 font-semibold" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" /> Sign out
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-muted-foreground leading-relaxed">
              Create your account with Google. You&apos;ll add your phone number next, so our team can reach you about bikes,
              offers and servicing.
            </p>
            {CLIENT_ID ? (
              <div ref={buttonRef} className="flex justify-center min-h-[44px]" />
            ) : (
              <p className="text-sm text-destructive">Google sign-in is not configured yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
