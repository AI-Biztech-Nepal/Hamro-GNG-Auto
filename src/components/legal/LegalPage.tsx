import Link from 'next/link';
import { ArrowRight, ChevronDown, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CONTACT_INFO } from '@/lib/constants';

export type LegalBlock = string | { list: string[] };
export type LegalSection = { id: string; title: string; body: LegalBlock[] };

type LegalPageProps = {
  title: string;
  intro: string;
  updated: string;
  sections: LegalSection[];
  sibling: { href: string; label: string };
};

const focusRing = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-sm';

function TocLinks({ sections }: { sections: LegalSection[] }) {
  return (
    <ul className="space-y-2.5">
      {sections.map((s) => (
        <li key={s.id}>
          <a
            href={`#${s.id}`}
            className={`text-sm text-muted-foreground hover:text-foreground transition-colors ${focusRing}`}
          >
            {s.title}
          </a>
        </li>
      ))}
    </ul>
  );
}

/** Shared shell for /privacy and /terms: plain reading layout, section index, and a way to reach the showroom. */
export function LegalPage({ title, intro, updated, sections, sibling }: LegalPageProps) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 sm:py-14">
      <header className="max-w-2xl">
        <span aria-hidden className="block w-8 h-1 bg-brand mb-4" />
        <h1 className="font-headline font-bold text-3xl md:text-4xl tracking-tight text-balance">{title}</h1>
        <p className="mt-3 text-muted-foreground leading-relaxed">{intro}</p>
        <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span>Last updated {updated}</span>
          <Link href={sibling.href} className={`inline-flex items-center gap-1.5 font-semibold text-foreground hover:text-brand transition-colors ${focusRing}`}>
            {sibling.label} <ArrowRight className="w-3.5 h-3.5" aria-hidden />
          </Link>
        </p>
      </header>

      <details className="group mt-8 border border-border rounded-lg lg:hidden">
        <summary className={`flex items-center justify-between cursor-pointer list-none px-4 py-3 text-sm font-semibold ${focusRing}`}>
          On this page
          <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" aria-hidden />
        </summary>
        <nav aria-label="On this page" className="px-4 pb-4 pt-1">
          <TocLinks sections={sections} />
        </nav>
      </details>

      <div className="mt-10 lg:mt-12 lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-16">
        <nav aria-label="On this page" className="hidden lg:block">
          <div className="sticky top-28">
            <p className="text-sm font-semibold mb-4">On this page</p>
            <TocLinks sections={sections} />
          </div>
        </nav>

        <div className="max-w-prose border-t border-border lg:border-t-0">
          {sections.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-28 py-7 border-b border-border first:pt-7 lg:first:pt-0">
              <h2 className="font-headline font-semibold text-xl tracking-tight text-balance">{s.title}</h2>
              <div className="mt-3 space-y-3.5 text-[15px] leading-7 text-muted-foreground">
                {s.body.map((block, i) =>
                  typeof block === 'string' ? (
                    <p key={i}>{block}</p>
                  ) : (
                    <ul key={i} className="space-y-2">
                      {block.list.map((item) => (
                        <li
                          key={item}
                          className="relative pl-5 before:content-[''] before:absolute before:left-0 before:top-[0.75em] before:w-1.5 before:h-1.5 before:bg-brand"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  ),
                )}
              </div>
            </section>
          ))}
        </div>
      </div>

      <section className="mt-16 bg-secondary text-white rounded-xl px-6 sm:px-10 py-12">
        <div className="max-w-xl">
          <span aria-hidden className="block w-8 h-1 bg-brand mb-4" />
          <h2 className="font-headline font-bold text-2xl md:text-3xl tracking-tight">Questions about this page?</h2>
          <p className="mt-3 text-white/70 leading-relaxed">
            Ask us at the showroom in {CONTACT_INFO.address}, {CONTACT_INFO.addressLocality}, or reach us directly.
            We reply in plain language.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            <Button size="lg" className="h-12 px-7 bg-white text-secondary hover:bg-white/90 font-semibold" asChild>
              <a href={`tel:${CONTACT_INFO.phone}`}>
                <Phone className="w-4 h-4" aria-hidden /> Call {CONTACT_INFO.phone}
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 px-7 border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white font-semibold"
              asChild
            >
              <a href={`mailto:${CONTACT_INFO.email}`}>
                <Mail className="w-4 h-4" aria-hidden /> Email us
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
