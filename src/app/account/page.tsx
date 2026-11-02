"use client"

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { Loader2, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

type User = { name: string; email: string; picture?: string };

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export default function AccountPage() {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [gsiReady, setGsiReady] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((u: User | null) => setUser(u))
      .catch(() => setUser(null));
    // The GSI script may already be loaded when navigating back to this page.
    if ((window as any).google?.accounts) setGsiReady(true);
  }, []);

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

            <Button variant="outline" className="w-full h-11 font-semibold" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" /> Sign out
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-muted-foreground leading-relaxed">
              Sign in with Google to browse our full stock and to sell or exchange your bike. No phone number needed.
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
