'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_INVENTORY_API_URL || 'https://api.hamroauto.com.np';

/**
 * Reports each page view to the Auto-Stock-Manager backend, which shows them on its admin
 * "Visits" page. Sends only a random per-browser id, the path and the referrer -- no cookies,
 * no IP stored. Sent as text/plain so the browser treats it as a simple request (no preflight).
 */
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
    const body = JSON.stringify({ visitor_id: id, path: pathname, referrer: document.referrer });
    const url = `${API_BASE}/api/public/visit`;
    try {
      if (!navigator.sendBeacon(url, body)) throw new Error('beacon refused');
    } catch {
      fetch(url, { method: 'POST', body, keepalive: true, headers: { 'Content-Type': 'text/plain' } }).catch(() => {});
    }
  }, [pathname]);

  return null;
}
