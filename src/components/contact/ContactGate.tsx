'use client';

import { useEffect, useRef, useState } from 'react';
import { MessageCircle, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { vehicleIdFromPath, vehiclePageUrl } from '@/lib/vehicle-link';

const API_BASE = process.env.NEXT_PUBLIC_INVENTORY_API_URL || 'https://api.hamroauto.com.np';
const STORAGE_KEY = 'gng_visitor';

interface Visitor {
  name: string;
  phone: string;
  address: string;
  email: string;
}

interface Pending {
  type: 'call' | 'whatsapp';
  href: string;
  message: string;
  vehicleId: string;
}

/** 7 to 15 digits, optional leading +, spaces and dashes allowed (the same rule the admin backend applies). */
export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return /^\+?[\d\s-]{7,20}$/.test(phone.trim()) && digits.length >= 7 && digits.length <= 15;
}

const isValidEmail = (email: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);

function readVisitor(): Visitor | null {
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

function saveVisitor(v: Visitor) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(v));
  } catch {
    /* the contact still goes ahead; they will just be asked again next time */
  }
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
 * Before anyone taps WhatsApp (wa.me) or Call (tel:) anywhere on the site, we ask who they are: name and a phone number are
 * required, address and e-mail are optional. The answer is remembered in this browser, so a visitor is asked once. Every tap is
 * then reported with their details, and the team accepts or rejects it under Marketing > Leads. One delegated listener covers
 * every WhatsApp / Call button without touching them.
 */
export function ContactGate() {
  const [pending, setPending] = useState<Pending | null>(null);
  const [form, setForm] = useState<Visitor>({ name: '', phone: '', address: '', email: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof Visitor, string>>>({});
  const seen = useRef(new Set<string>());

  useEffect(() => {
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

      const visitor = readVisitor();
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
      setPending({ type, href: a.href, message, vehicleId });
    };
    // Capture phase, so a button that stops the click from bubbling can't skip the question.
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  const set = (k: keyof Visitor) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors(er => ({ ...er, [k]: undefined }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pending) return;
    const v: Visitor = { name: form.name.trim(), phone: form.phone.trim(), address: form.address.trim(), email: form.email.trim() };
    const er: Partial<Record<keyof Visitor, string>> = {};
    if (v.name.length < 2) er.name = 'Please enter your name.';
    if (!isValidPhone(v.phone)) er.phone = 'Please enter a valid phone number (7 to 15 digits).';
    if (v.email && !isValidEmail(v.email)) er.email = 'That e-mail address does not look right.';
    setErrors(er);
    if (Object.keys(er).length) return;

    saveVisitor(v);
    seen.current.add(`${pending.type}|${pending.message}`);
    reportTap(pending.type, pending.message, pending.vehicleId, v);
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
      <DialogContent className="max-w-md" data-testid="contact-gate">
        <DialogHeader>
          <DialogTitle>Before we connect you</DialogTitle>
          <DialogDescription>Please tell us who is getting in touch, so our team can reply to you.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4" noValidate>
          <div className="grid gap-1.5">
            <Label htmlFor="gate-name">Your name <span className="text-destructive">*</span></Label>
            <Input id="gate-name" value={form.name} onChange={set('name')} autoComplete="name" maxLength={100} autoFocus aria-invalid={!!errors.name} />
            {errors.name && <p role="alert" className="text-sm text-destructive">{errors.name}</p>}
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="gate-phone">Phone number <span className="text-destructive">*</span></Label>
            <Input id="gate-phone" type="tel" inputMode="tel" value={form.phone} onChange={set('phone')} autoComplete="tel" maxLength={20} placeholder="98XXXXXXXX" aria-invalid={!!errors.phone} />
            {errors.phone && <p role="alert" className="text-sm text-destructive">{errors.phone}</p>}
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="gate-address">Address <span className="text-xs font-normal text-muted-foreground">(optional)</span></Label>
            <Input id="gate-address" value={form.address} onChange={set('address')} autoComplete="street-address" maxLength={200} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="gate-email">E-mail <span className="text-xs font-normal text-muted-foreground">(optional)</span></Label>
            <Input id="gate-email" type="email" inputMode="email" value={form.email} onChange={set('email')} autoComplete="email" maxLength={150} aria-invalid={!!errors.email} />
            {errors.email && <p role="alert" className="text-sm text-destructive">{errors.email}</p>}
          </div>
          <Button type="submit" size="lg" className="w-full" data-testid="contact-gate-continue">
            {isCall ? <Phone /> : <MessageCircle />}
            {isCall ? 'Continue to call' : 'Continue to WhatsApp'}
          </Button>
          <p className="text-center text-xs text-muted-foreground">We use these details only to reply to your enquiry.</p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
