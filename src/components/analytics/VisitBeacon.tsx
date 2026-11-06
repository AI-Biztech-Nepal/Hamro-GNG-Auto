'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_INVENTORY_API_URL || 'https://api.hamroauto.com.np';

/**
 * Reports each page view to the Auto-Stock-Manager backend, which shows them on its admin
 * "Visits" page. Sends a random per-browser id, the path and the referrer -- no cookies,
 * no IP stored -- plus the email of a visitor who is signed in with Google, so the admin can see
 * which registered customers visit. Sent as text/plain so the browser treats it as a simple request (no preflight).
 */
// The signed-in visitor's email, looked up once per page load (null for guests).
let emailLookup: Promise<string | null> | null = null;
const signedInEmail = () =>
  (emailLookup ??= fetch('/api/auth/me', { cache: 'no-store' })
    .then(r => (r.ok ? r.json() : null))
    .then(u => (u && typeof u.email === 'string' ? u.email : null))
    .catch(() => null));

export function VisitBeacon() {
  const pathname = usePathname();

  useEffect(() => {
    if (navigator.webdriver) return; // automated browsers / crawlers running scripts
    let id: string | null = null;
    try {
      id = localStorage.getItem('hamro_vid');
      if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem('hamro_vid', id);
      }
    } catch {
      id = crypto.randomUUID(); // storage blocked: still count the view, just not as a repeat visitor
    }
    const url = `${API_BASE}/api/public/visit`;
    signedInEmail().then(email => {
      const body = JSON.stringify({ visitor_id: id, path: pathname, referrer: document.referrer, ...(email && { email }) });
      try {
        if (!navigator.sendBeacon(url, body)) throw new Error('beacon refused');
      } catch {
        fetch(url, { method: 'POST', body, keepalive: true, headers: { 'Content-Type': 'text/plain' } }).catch(() => {});
      }
    });
  }, [pathname]);

  return null;
}
