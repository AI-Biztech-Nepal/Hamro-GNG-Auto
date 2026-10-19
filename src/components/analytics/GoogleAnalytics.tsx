import Script from 'next/script';

/** Loads GA4 (measurement ID for hamroauto.com.np; NEXT_PUBLIC_GA_ID overrides it). */
export function GoogleAnalytics() {
  const id = process.env.NEXT_PUBLIC_GA_ID || 'G-T0V2M6DFEF';
  if (!id || !/^G-[A-Z0-9]+$/.test(id)) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${id}');`}
      </Script>
    </>
  );
}
