'use client';

import { useEffect, useRef } from 'react';
import { vehicleIdFromPath, vehiclePageUrl } from '@/lib/vehicle-link';

const API_BASE = process.env.NEXT_PUBLIC_INVENTORY_API_URL || 'https://api.hamroauto.com.np';

interface Account {
  name: string;
  email: string;
  phone?: string;
}

/** Tells the Auto-Stock-Manager backend (Marketing > Leads) who tapped WhatsApp / Call. Sent as text/plain via sendBeacon so it survives leaving the page. */
function reportTap(type: 'call' | 'whatsapp', message: string, vehicleId: string, a: Account) {
  const url = `${API_BASE}/api/public/leads/click`;
  const body = JSON.stringify({ type, message, vehicle_id: vehicleId, name: a.name, phone: a.phone ?? '', address: '', email: a.email });
  try {
    if (!navigator.sendBeacon(url, body)) throw new Error('beacon refused');
  } catch {
    fetch(url, { method: 'POST', body, keepalive: true, headers: { 'Content-Type': 'text/plain' } }).catch(() => {});
  }
}

/**
 * WhatsApp (wa.me) and Call (tel:) buttons always work straight away, with no questions asked. When the visitor happens to be
 * signed in, the tap is also reported with their account details, once per visit, for the team to see under Marketing > Leads.
 * One delegated listener covers every WhatsApp / Call button without touching them.
 */
export function ContactGate() {
  const seen = useRef(new Set<string>());
  const account = useRef<Account | null>(null);

  useEffect(() => {
    const loadAccount = () =>
      fetch('/api/auth/me')
        .then((r) => r.json())
        .then((u) => { account.current = u; })
        .catch(() => { account.current = null; });
    loadAccount();
    window.addEventListener('gg-auth', loadAccount);

    const onClick = (e: MouseEvent) => {
      if (navigator.webdriver || !account.current) return;
      const a = (e.target as Element).closest?.('a[href]') as HTMLAnchorElement | null;
      const href = a?.getAttribute('href') ?? '';
      const type = href.startsWith('tel:') ? 'call' : href.includes('wa.me/') ? 'whatsapp' : null;
      if (!a || !type) return;
      // Which bike was it? A vehicle's own buttons say so (data-vehicle-id / -title); on a vehicle's page any button means that bike.
      const vehicleId = a.dataset.vehicleId || vehicleIdFromPath(location.pathname);
      const title = a.dataset.vehicleTitle || '';
      const text = new URL(href, location.href).searchParams.get('text');
      const message = vehicleId ? `${title ? `${title} — ` : ''}${vehiclePageUrl(vehicleId)}` : `${location.pathname}${text ? ` — ${text}` : ''}`;
      const key = `${type}|${message}`;
      if (seen.current.has(key)) return;
      seen.current.add(key);
      reportTap(type, message, vehicleId, account.current);
    };
    document.addEventListener('click', onClick, true);
    return () => {
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('gg-auth', loadAccount);
    };
  }, []);

  return null;
}
