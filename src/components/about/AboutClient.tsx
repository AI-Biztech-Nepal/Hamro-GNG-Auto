"use client"

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { MapPin } from 'lucide-react';
import { CONTACT_INFO, OUTLETS } from '@/lib/constants';
import { ShowroomMap } from '@/components/about/ShowroomMap';

const FOUNDERS = [
  { name: 'Tulsi Khadka', role: 'Co-founder', photo: '/team/tp.jpg', pos: '50% 30%', quote: 'A used bike is a big purchase for most families. We earn their trust by being honest about every bike, including its flaws.' },
  { name: 'Chandan Prasad Gupta', role: 'Founder', photo: '/team/cp.jpg', pos: '50% 22%', quote: 'Good and Genuine is the standard we set for ourselves: fair prices, clear paperwork, and nothing hidden from the buyer.' },
  { name: 'Laxman Gautam', role: 'Co-founder', photo: '/team/lp.jpg', pos: '50% 25%', quote: 'A name only means something if you live up to it. Every day we work to make sure our customers ride away without a doubt.' },
];

const PROMISES = [
  { big: '40', title: 'points checked', body: 'Engine, brakes, frame, electrics, tyres. If a bike fails a check, it is fixed or it does not go on the floor.' },
  { big: 'Real', title: 'paperwork', body: 'Blue book, ownership and transfer handled cleanly. What the papers say is what the bike is.' },
  { big: '1', title: 'price, no haggling', body: 'The tag is the price for everyone. Nobody pays more for being polite or less for being loud.' },
  { big: 'Same', title: 'door after the sale', body: 'Servicing, insurance renewal and exchange happen in the showroom you bought from.' },
];

/** Rises into place once, the first time it scrolls into view. */
function Reveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} data-in={on} className={`about-reveal ${className}`} style={{ '--d': `${delay}ms` } as CSSProperties}>
      {children}
    </div>
  );
}

function Hero() {
  const photo = useRef<HTMLDivElement>(null);
  // Photo drifts slightly slower than the page while the hero is on screen.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (photo.current) photo.current.style.transform = `translate3d(0, ${Math.min(window.scrollY, 600) * 0.12}px, 0)`;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, []);

  return (
    <header className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 md:pt-14 pb-10">
      <div className="relative md:pb-16">
        <span aria-hidden className="hidden md:block absolute -top-4 right-[-1rem] w-[34%] h-[55%] bg-brand" />
        <div ref={photo} className="relative md:ml-auto md:w-[72%] will-change-transform">
          <div className="about-photo aspect-video overflow-hidden bg-secondary">
            <img src="/hero/showroom-premium.jpg" srcSet="/hero/showroom-premium-1000.jpg 1000w, /hero/showroom-premium.jpg 1672w" sizes="(min-width: 768px) 72vw, 100vw" width={1672} height={940} alt="The G&G showroom floor with bikes and scooters on display" className="h-full w-full object-cover" />
          </div>
        </div>
        <div className="about-panel relative mt-[-3rem] mx-3 md:mx-0 md:mt-0 md:absolute md:left-0 md:bottom-0 md:w-[54%] bg-white p-6 md:p-10 shadow-[0_18px_40px_-20px_rgba(0,0,0,0.4)]">
          <span aria-hidden className="block w-8 h-1 bg-brand mb-4" />
          <h1 className="font-headline font-bold uppercase text-4xl sm:text-5xl md:text-6xl tracking-tight leading-[0.95] text-balance">
            Good and <span className="text-brand">genuine.</span>
          </h1>
          <p className="mt-4 text-muted-foreground">That is what G&amp;G stands for.</p>
        </div>
      </div>
      <div className="mt-10 grid sm:grid-cols-2 gap-x-10">
        {[
          { g: 'Good', body: 'Bikes that start, stop and run the way the tag says.' },
          { g: 'Genuine', body: 'Papers, prices and people you can take at their word.' },
        ].map(({ g, body }) => (
          <div key={g} className="border-t border-foreground pt-4 pb-4">
            <h2 className="font-headline font-bold text-xl uppercase tracking-tight">{g}</h2>
            <p className="mt-1 text-muted-foreground">{body}</p>
          </div>
        ))}
      </div>
    </header>
  );
}

function Story() {
  return (
    <section className="bg-surface border-y border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24 grid md:grid-cols-[0.9fr_1.1fr] gap-10 md:gap-20">
        <Reveal>
          <h2 className="font-headline font-bold text-3xl md:text-5xl tracking-tight text-balance leading-[1.08]">
            Your next bike should not depend on the{' '}
            <span className="relative inline-block isolate">
              <svg aria-hidden className="crayon absolute -inset-x-2 top-[38%] h-[62%] w-[calc(100%+1rem)] -z-10 text-[#ff4d4d]" viewBox="0 0 200 40" preserveAspectRatio="none">
                <defs>
                  <filter id="crayon-rough" x="-5%" y="-20%" width="110%" height="140%">
                    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" result="n" />
                    <feDisplacementMap in="SourceGraphic" in2="n" scale="5" />
                  </filter>
                </defs>
                <path d="M4 24 C40 14, 90 30, 130 18 S186 22, 196 16" pathLength="1" fill="none" stroke="currentColor" strokeOpacity="0.85" strokeWidth="26" strokeLinecap="round" filter="url(#crayon-rough)" />
              </svg>
              distance
            </span>{' '}
            to our door.
          </h2>
        </Reveal>
        <div className="space-y-6 text-lg leading-relaxed text-foreground/80 max-w-[60ch]">
          <Reveal><p>Buying a second-hand bike used to mean a trip. Find the time, cross the city, walk the floor, and hope the one you came for was still there.</p></Reveal>
          <Reveal><p>We decided the showroom should not be a wall between you and the bike. So we built this platform: every bike we have, with real photos, the real specs and the real price, open to you from your phone, wherever you are.</p></Reveal>
          <Reveal><p>Look as long as you like. Compare at home. Ask us on a call or WhatsApp when something catches your eye. Sell or exchange your own bike and book a service the same way, without queuing at a counter.</p></Reveal>
          <Reveal><p>The showroom in Nayabasti is still here, and you are always welcome. But now you arrive already knowing which bike you want.</p></Reveal>
          <Reveal><p className="font-headline font-semibold text-2xl text-foreground text-balance">Same good and genuine, with the distance taken out.</p></Reveal>
        </div>
      </div>
    </section>
  );
}

function Promises() {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24">
      <Reveal>
        <h2 className="font-headline font-bold text-3xl md:text-4xl tracking-tight max-w-xl text-balance">What genuine looks like on a Tuesday afternoon</h2>
      </Reveal>
      <div className="mt-12 grid sm:grid-cols-2 gap-x-10 gap-y-10">
        {PROMISES.map((p, i) => (
          <Reveal key={p.title} delay={(i % 2) * 80}>
            <div className="border-t border-foreground pt-5">
              <p className="flex items-baseline gap-3">
                <span className="font-display font-extrabold text-5xl text-brand">{p.big}</span>
                <span className="font-headline font-semibold text-xl">{p.title}</span>
              </p>
              <p className="mt-3 text-muted-foreground leading-relaxed max-w-[46ch]">{p.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Founders() {
  return (
    <section className="bg-surface border-y border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        <Reveal>
          <h2 className="font-headline font-bold text-3xl md:text-5xl tracking-tight text-balance max-w-2xl leading-[1.08]">Message from our founders</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-[56ch] leading-relaxed">If you want to know who stands behind your bike, this is who.</p>
        </Reveal>
        <div className="mt-12 grid gap-10 sm:grid-cols-3 items-start">
          {FOUNDERS.map((p, i) => (
            <Reveal key={p.name} delay={i * 100}>
              <figure className="group">
                <div className="aspect-[4/5] overflow-hidden bg-secondary">
                  <img
                    src={p.photo}
                    alt={p.name}
                    loading="lazy"
                    className="h-full w-full object-cover grayscale transition-[filter,transform] duration-700 group-hover:grayscale-0 group-hover:scale-[1.03]"
                    style={{ objectPosition: p.pos }}
                  />
                </div>
                <figcaption className="mt-4 border-t border-foreground pt-3">
                  <p className="font-headline font-semibold text-xl">{p.name}</p>
                  <p className="text-sm text-muted-foreground">{p.role}, G&amp;G Auto</p>
                  <blockquote className="mt-3 font-headline italic text-lg leading-snug text-foreground/80">
                    <span aria-hidden className="text-brand text-3xl leading-none align-[-0.3em] mr-1">&ldquo;</span>{p.quote}<span aria-hidden className="text-brand text-3xl leading-none align-[-0.3em] ml-1">&rdquo;</span>
                  </blockquote>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Visit() {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24">
      <div className="grid md:grid-cols-[0.8fr_1.4fr] gap-10 md:gap-14 items-start">
        <Reveal>
          <h2 className="font-headline font-bold text-3xl md:text-4xl tracking-tight text-balance">Our two branches.</h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">{CONTACT_INFO.address}, {CONTACT_INFO.addressLocality}. About 50 metres apart.</p>
          <ul className="mt-6 border-t border-foreground">
            {OUTLETS.map(o => (
              <li key={o.name} className="flex items-center justify-between gap-4 py-4 border-b border-border">
                <div>
                  <p className="font-headline font-semibold">{o.name}</p>
                  <p className="text-sm text-muted-foreground">{o.where}</p>
                </div>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${o.lat},${o.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 shrink-0 text-sm font-semibold text-brand hover:underline underline-offset-4"
                >
                  <MapPin className="w-4 h-4" /> Directions
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={100}>
          <ShowroomMap />
        </Reveal>
      </div>
    </section>
  );
}

export function AboutClient() {
  return (
    <>
      <Hero />
      <Story />
      <Promises />
      <Founders />
      <Visit />
    </>
  );
}
