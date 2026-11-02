'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const GSI_SRC = 'https://accounts.google.com/gsi/client';
// The home page and a single bike's page stay open (shared bike links must work); browsing the full stock and selling/exchanging need an account.
const GATED = ['/inventory', '/sell', '/exchange'];

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

/**
 * Asks for a Google sign-in on the pages that need an account. Dismissing the prompt sends the visitor home.
 * The pages' HTML is still served to everyone (search engines included); this only covers it for people.
 */
export function AuthGate() {
  const pathname = usePathname();
  const router = useRouter();
  // undefined until /api/auth/me has answered, so a signed-in visitor never sees the prompt flash up.
  const [signedIn, setSignedIn] = useState<boolean | undefined>(undefined);
  const [failed, setFailed] = useState(false);
  const [button, setButton] = useState<HTMLDivElement | null>(null);

  const load = useCallback(
    () => fetch('/api/auth/me').then((r) => r.json()).then((u) => setSignedIn(!!u)).catch(() => setSignedIn(false)),
    [],
  );
  useEffect(() => {
    load();
    window.addEventListener('gg-auth', load);
    return () => window.removeEventListener('gg-auth', load);
  }, [load]);

  const open = signedIn === false && GATED.includes(pathname);

  useEffect(() => {
    if (!open || !CLIENT_ID || !button) return;
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
            if (!res?.ok) return setFailed(true);
            window.dispatchEvent(new Event('gg-auth'));
          },
        });
        gsi.renderButton(button, { theme: 'outline', size: 'large', text: 'continue_with', shape: 'rectangular', width: 280 });
      })
      .catch(() => setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [open, button]);

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) router.push('/'); }}>
      <DialogContent className="max-w-sm" data-testid="auth-gate">
        <DialogHeader>
          <DialogTitle>Sign in to continue</DialogTitle>
          <DialogDescription>
            Create a free account with Google to browse our full stock and to sell or exchange your bike. It takes one tap.
          </DialogDescription>
        </DialogHeader>
        {CLIENT_ID ? (
          <div ref={setButton} className="flex justify-center min-h-[44px]" />
        ) : (
          <p className="text-sm text-destructive">Google sign-in is not configured yet.</p>
        )}
        {failed && <p role="alert" className="text-sm text-destructive">Google sign-in did not work. Please try again.</p>}
      </DialogContent>
    </Dialog>
  );
}
