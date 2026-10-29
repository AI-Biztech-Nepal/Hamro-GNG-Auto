"use client"

import { useEffect, useRef } from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';
import { OUTLETS } from '@/lib/constants';

/** Live, draggable street map of both outlets. Tiles: OpenFreeMap (no key). */
export function ShowroomMap() {
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    let map: import('maplibre-gl').Map | undefined;
    let cancelled = false;

    // Load the map only once it is near the viewport; maplibre is heavy.
    const io = new IntersectionObserver(async ([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      const maplibregl = (await import('maplibre-gl')).default;
      if (cancelled) return;
      const m = new maplibregl.Map({
        container: el,
        style: 'https://tiles.openfreemap.org/styles/liberty',
        center: [OUTLETS[0].lng, OUTLETS[0].lat],
        zoom: 17,
        dragRotate: false,
        cooperativeGestures: true,
        attributionControl: { compact: true },
      });
      map = m;
      m.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
      const bounds = new maplibregl.LngLatBounds();
      OUTLETS.forEach(o => {
        const wrap = document.createElement('div');
        wrap.className = 'gng-pin-wrap';
        const label = document.createElement('span');
        label.className = 'gng-pin-label';
        label.textContent = o.name;
        const pin = document.createElement('div');
        pin.className = 'gng-pin';
        wrap.append(label, pin);
        new maplibregl.Marker({ element: wrap, anchor: 'bottom' }).setLngLat([o.lng, o.lat]).addTo(m);
        bounds.extend([o.lng, o.lat]);
      });
      m.fitBounds(bounds, { padding: { top: 90, bottom: 50, left: 70, right: 70 }, maxZoom: 18, duration: 0 });
    }, { rootMargin: '200px' });
    io.observe(el);

    return () => { cancelled = true; io.disconnect(); map?.remove(); };
  }, []);

  return (
    <div
      ref={box}
      role="region"
      aria-label="Map of the G&G Auto head office and branch in Nayabasti, Boudha"
      className="h-[360px] md:h-[480px] w-full rounded-xl overflow-hidden border border-border bg-muted"
    />
  );
}
