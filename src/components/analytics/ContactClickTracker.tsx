'use client';

import { useEffect } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_INVENTORY_API_URL || 'https://api.hamroauto.com.np';

/**
 * Reports taps on any WhatsApp (wa.me) or phone (tel:) link to the Auto-Stock-Manager backend,
 * which lists them under Marketing > Leads. One delegated listener, so new buttons are covered
 * without touching them. Sent as text/plain via sendBeacon so it survives leaving the page.
 */
export function ContactClickTracker() {
  useEffect(() => {
    const seen = new Set<string>();
    const onClick = (e: MouseEvent) => {
      if (navigator.webdriver) return;
      const a = (e.target as Element).closest?.('a[href]') as HTMLAnchorElement | null;
      const href = a?.getAttribute('href') ?? '';
      const type = href.startsWith('tel:') ? 'call' : href.includes('wa.me/') ? 'whatsapp' : null;
      if (!type) return;
      // A WhatsApp link carries the bike in its prefilled text; otherwise say which page it was tapped on.
      const text = new URL(href, location.href).searchParams.get('text');
      const message = `${location.pathname}${text ? ` — ${text}` : ''}`;
      const key = `${type}|${message}`;
      if (seen.has(key)) return; // double taps / repeat taps in one visit are one lead
      seen.add(key);
      const url = `${API_BASE}/api/public/leads/click`;
      const body = JSON.stringify({ type, message });
      try {
        if (!navigator.sendBeacon(url, body)) throw new Error('beacon refused');
      } catch {
        fetch(url, { method: 'POST', body, keepalive: true, headers: { 'Content-Type': 'text/plain' } }).catch(() => {});
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return null;
}
