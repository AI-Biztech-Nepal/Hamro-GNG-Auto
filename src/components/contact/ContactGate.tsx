'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { MessageCircle, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { isValidPhone } from '@/lib/phone';
import { vehicleIdFromPath, vehiclePageUrl } from '@/lib/vehicle-link';

const API_BASE = process.env.NEXT_PUBLIC_INVENTORY_API_URL || 'https://api.hamroauto.com.np';
const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const GSI_SRC = 'https://accounts.google.com/gsi/client';
const STORAGE_KEY = 'gng_visitor';

export interface Visitor {
  name: string;
  phone: string;
  address: string;
  email: string;
}

interface Account {
  name: string;
  email: string;
  phone?: string;
}

interface Pending {
  type: 'call' | 'whatsapp';
  href: string;
  message: string;
  vehicleId: string;
}

const isValidEmail = (email: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);

export function readVisitor(): Visitor | null {
  try {
    const v = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (v && typeof v.name === 'string' && v.name.trim().length >= 2 && typeof v.phone === 'string' && isValidPhone(v.phone)) {
      return { name: v.name, phone: v.phone, address: v.address || '', email: v.email || '' };
    }
  } catch {
    /* private mode, blocked storage or a corrupt value: ask again */
  }
  return null;
}

export function saveVisitor(v: Visitor) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(v));
  } catch {
    /* the contact still goes ahead; they will just be asked again next time */
  }
}

/** Loads Google's sign-in script the first time it is needed (the account page loads the same script itself). */
function loadGsi(): Promise<void> {
  if ((window as any).google?.accounts) return Promise.resolve();
  return new Promise((resolve, reject) => {
    let script = document.querySelector<HTMLScriptElement>(`script[src="${GSI_SRC}"]`);
    if (!script) {
      script = document.createElement('script');
      script.src = GSI_SRC;
      script.async = true;
      document.head.appendChild(script);
    }
    script.addEventListener('load', () => resolve(), { once: true });
    script.addEventListener('error', () => reject(new Error('gsi failed to load')), { once: true });
  });
}

/** Tells the Auto-Stock-Manager backend (Marketing > Leads) who tapped WhatsApp / Call. Sent as text/plain via sendBeacon so it survives leaving the page. */
function reportTap(type: Pending['type'], message: string, vehicleId: string, v: Visitor) {
  const url = `${API_BASE}/api/public/leads/click`;
  const body = JSON.stringify({ type, message, vehicle_id: vehicleId, name: v.name, phone: v.phone, address: v.address, email: v.email });
  try {
    if (!navigator.sendBeacon(url, body)) throw new Error('beacon refused');
  } catch {
    fetch(url, { method: 'POST', body, keepalive: true, headers: { 'Content-Type': 'text/plain' } }).catch(() => {});
  }
}

/**
 * Before anyone taps WhatsApp (wa.me) or Call (tel:) anywhere on the site, we ask who they are. That prompt is also the sign-up
 * point: "Sign up with Google" creates the account and only the phone is left to add; or they can carry on without an account with
 * name and phone (address and e-mail optional). The answer is remembered in this browser, and an account that has its number
 * counts as identified on any browser, so nobody is asked twice. Every tap is then reported with their details, and the team
 * accepts or rejects it under Marketing > Leads. One delegated listener covers every WhatsApp / Call button without touching them.
 */
export function ContactGate() {
  const [pending, setPending] = useState<Pending | null>(null);
  const [form, setForm] = useState<Visitor>({ name: '', phone: '', address: '', email: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof Visitor, string>>>({});
  const [signInFailed, setSignInFailed] = useState(false);
  const [googleButton, setGoogleButton] = useState<HTMLDivElement | null>(null);
  const seen = useRef(new Set<string>());
  // The signed-in Google account, if any: a ref for the click listener, state for what the prompt shows.
  // The account page and this prompt tell each other about changes through the gg-auth event.
  const account = useRef<Account | null>(null);
  const [acct, setAcct] = useState<Account | null>(null);
  const applyAccount = useCallback((u: Account | null) => {
    account.current = u;
    setAcct(u);
  }, []);

  useEffect(() => {
    const loadAccount = () =>
      fetch('/api/auth/me')
        .then((r) => r.json())
        .then(applyAccount)
        .catch(() => applyAccount(null));
    loadAccount();
    window.addEventListener('gg-auth', loadAccount);

    // An account that has added its number is already identified, even on a browser that never saw the prompt.
    const visitorFromAccount = (): Visitor | null => {
      const a = account.current;
      if (!a?.phone || a.name.trim().length < 2 || !isValidPhone(a.phone)) return null;
      const v: Visitor = { name: a.name, phone: a.phone, address: '', email: a.email };
      saveVisitor(v);
      return v;
    };

    const onClick = (e: MouseEvent) => {
      if (navigator.webdriver) return;
      const a = (e.target as Element).closest?.('a[href]') as HTMLAnchorElement | null;
      const href = a?.getAttribute('href') ?? '';
      const type = href.startsWith('tel:') ? 'call' : href.includes('wa.me/') ? 'whatsapp' : null;
      if (!a || !type) return;
      // Which bike was it? A vehicle's own buttons say so (data-vehicle-id / -title); on a vehicle's page any button means that bike.
      // The lead then names the bike and links its page; otherwise it just says which page the button was on.
      const vehicleId = a.dataset.vehicleId || vehicleIdFromPath(location.pathname);
      const title = a.dataset.vehicleTitle || '';
      const text = new URL(href, location.href).searchParams.get('text');
      const message = vehicleId ? `${title ? `${title} — ` : ''}${vehiclePageUrl(vehicleId)}` : `${location.pathname}${text ? ` — ${text}` : ''}`;

      const visitor = readVisitor() ?? visitorFromAccount();
      if (visitor) {
        // Already identified: let the tap go through, and report it once per visit (double taps are one lead).
        const key = `${type}|${message}`;
        if (!seen.current.has(key)) {
          seen.current.add(key);
          reportTap(type, message, vehicleId, visitor);
        }
        return;
      }
      // Not yet: hold the tap, ask who they are, and carry on from there.
      e.preventDefault();
      setErrors({});
      setSignInFailed(false);
      setPending({ type, href: a.href, message, vehicleId });
    };
    // Capture phase, so a button that stops the click from bubbling can't skip the question.
    document.addEventListener('click', onClick, true);
    return () => {
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('gg-auth', loadAccount);
    };
  }, [applyAccount]);

  // Offer "Sign up with Google" inside the prompt while nobody is signed in.
  useEffect(() => {
    if (!pending || acct || !CLIENT_ID || !googleButton) return;
    let cancelled = false;
    loadGsi()
      .then(() => {
        if (cancelled) return;
        const gsi = (window as any).google.accounts.id;
        gsi.initialize({
          client_id: CLIENT_ID,
          callback: async ({ credential }: { credential: string }) => {
            const res = await fetch('/api/auth/google', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ credential }),
            }).catch(() => null);
            if (!res?.ok) return setSignInFailed(true);
            applyAccount(await res.json());
            window.dispatchEvent(new Event('gg-auth'));
          },
        });
        gsi.renderButton(googleButton, { theme: 'outline', size: 'large', text: 'signup_with', shape: 'rectangular', width: 280 });
      })
      .catch(() => {
        /* Google unreachable: the form below still works */
      });
    return () => {
      cancelled = true;
    };
  }, [pending, acct, googleButton, applyAccount]);

  const set = (k: keyof Visitor) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors(er => ({ ...er, [k]: undefined }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pending) return;
    const phone = form.phone.trim();
    const address = form.address.trim();
    const v: Visitor = acct
      ? { name: acct.name, phone, address, email: acct.email }
      : { name: form.name.trim(), phone, address, email: form.email.trim() };
    const er: Partial<Record<keyof Visitor, string>> = {};
    if (v.name.length < 2) er.name = 'Please enter your name.';
    if (!isValidPhone(v.phone)) er.phone = 'Please enter a valid phone number (7 to 15 digits).';
    if (!acct && v.email && !isValidEmail(v.email)) er.email = 'That e-mail address does not look right.';
    setErrors(er);
    if (Object.keys(er).length) return;

    saveVisitor(v);
    seen.current.add(`${pending.type}|${pending.message}`);
    reportTap(pending.type, pending.message, pending.vehicleId, v);
    // A signed-in account that had no number gets it now: that completes the sign-up (it also reaches Leads as a signup).
    if (acct && !acct.phone) {
      fetch('/api/account/phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
        keepalive: true,
      })
        .then(() => window.dispatchEvent(new Event('gg-auth')))
        .catch(() => {});
    }
    // This runs inside the button press, so the browser lets the WhatsApp tab open. (Not 'noopener' in the open() call: that
    // always returns null, which would look like a blocked popup. The opener is cut off by hand instead.)
    if (pending.type === 'call') window.location.href = pending.href;
    else {
      const tab = window.open(pending.href, '_blank');
      if (tab) {
        try { tab.opener = null; } catch { /* cross-origin already */ }
      } else {
        window.location.href = pending.href; // popup really blocked: go there in this tab instead
      }
    }
    setPending(null);
  };

  const isCall = pending?.type === 'call';
  return (
    <Dialog open={!!pending} onOpenChange={(open) => { if (!open) setPending(null); }}>
      <DialogContent className="max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto" data-testid="contact-gate">
        <DialogHeader>
          <DialogTitle>{acct ? 'One more step' : 'Before we connect you'}</DialogTitle>
          <DialogDescription>
            {acct
              ? 'Add your phone number to finish your account, then we will connect you.'
              : CLIENT_ID
                ? 'Sign up with Google, or just tell us who is getting in touch, so our team can reply to you.'
                : 'Please tell us who is getting in touch, so our team can reply to you.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4" noValidate>
          {acct ? (
            <p className="rounded-md bg-muted px-3 py-2.5 text-sm leading-snug" data-testid="contact-gate-account">
              Signed in as <span className="font-semibold">{acct.name}</span>
              <span className="block text-muted-foreground">{acct.email}</span>
            </p>
          ) : (
            <>
              {CLIENT_ID && (
                <div className="grid gap-3">
                  <div ref={setGoogleButton} className="flex justify-center min-h-[44px]" />
                  {signInFailed && (
                    <p role="alert" className="text-sm text-destructive">Google sign-in did not work. You can still continue below.</p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground" aria-hidden>
                    <span className="h-px flex-1 bg-border" />
                    or continue without an account
                    <span className="h-px flex-1 bg-border" />
                  </div>
                </div>
              )}
              <div className="grid gap-1.5">
                <Label htmlFor="gate-name">Your name <span className="text-destructive">*</span></Label>
                <Input id="gate-name" value={form.name} onChange={set('name')} autoComplete="name" maxLength={100} autoFocus aria-invalid={!!errors.name} />
                {errors.name && <p role="alert" className="text-sm text-destructive">{errors.name}</p>}
              </div>
            </>
          )}
          <div className="grid gap-1.5">
            <Label htmlFor="gate-phone">Phone number <span className="text-destructive">*</span></Label>
            <Input id="gate-phone" type="tel" inputMode="tel" value={form.phone} onChange={set('phone')} autoComplete="tel" maxLength={20} placeholder="98XXXXXXXX" autoFocus={!!acct} aria-invalid={!!errors.phone} />
            {errors.phone && <p role="alert" className="text-sm text-destructive">{errors.phone}</p>}
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="gate-address">Address <span className="text-xs font-normal text-muted-foreground">(optional)</span></Label>
            <Input id="gate-address" value={form.address} onChange={set('address')} autoComplete="street-address" maxLength={200} />
          </div>
          {!acct && (
            <div className="grid gap-1.5">
              <Label htmlFor="gate-email">E-mail <span className="text-xs font-normal text-muted-foreground">(optional)</span></Label>
              <Input id="gate-email" type="email" inputMode="email" value={form.email} onChange={set('email')} autoComplete="email" maxLength={150} aria-invalid={!!errors.email} />
              {errors.email && <p role="alert" className="text-sm text-destructive">{errors.email}</p>}
            </div>
          )}
          <Button type="submit" size="lg" className="w-full" data-testid="contact-gate-continue">
            {isCall ? <Phone /> : <MessageCircle />}
            {isCall ? 'Continue to call' : 'Continue to WhatsApp'}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            {acct ? (
              <>
                Your number finishes your account. We may call or WhatsApp you about bikes, offers and servicing.{' '}
                <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">Privacy Policy</a>
              </>
            ) : (
              'We use these details only to reply to your enquiry.'
            )}
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
