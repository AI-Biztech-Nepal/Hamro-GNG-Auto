import 'server-only';
import { unstable_cache } from 'next/cache';
import type { Vehicle } from '@/types/vehicle';
import type { SiteSettings } from '@/lib/inventory-api';

/** Vehicles whose photos always lead the hero, in order. */
const HERO_PINNED_IDS = ['c98c9dcb-4d82-4bee-b43d-18fe2fb9db92'];

export const HERO_MAX_SLIDES = 5;

// Website standard: the 4:3 crop the Sell/Exchange cropper produces, at full 1600x1200.
const MIN_WIDTH = 1600;
const MIN_HEIGHT = 1200;
const TARGET_RATIO = 4 / 3;
const RATIO_TOLERANCE = 0.03;
// Quality floor beyond size: enough encoded detail, and a well-exposed, contrasty frame (not murky or blown out).
const MIN_BYTES = 300 * 1024;
const MIN_MEAN_LUMA = 95;
const MAX_MEAN_LUMA = 175;
const MIN_LUMA_SPREAD = 55;
const PROBE_TIMEOUT_MS = 6000;
/** Non-pinned vehicles we're willing to probe (one photo each) while filling the remaining slides. */
const MAX_FILLER_PROBES = 10;

export interface HeroSlide {
  key: string;
  vehicleId: string;
  title: string;
  price: number;
  src: string;
}

const isHeroGrade = unstable_cache(
  async (url: string): Promise<boolean> => {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(PROBE_TIMEOUT_MS) });
      if (!res.ok) return false;
      const { default: sharp } = await import('sharp');
      const buf = Buffer.from(await res.arrayBuffer());
      const { width, height } = await sharp(buf).metadata();
      if (!width || !height || buf.length < MIN_BYTES) return false;
      const fitsStandard =
        width >= MIN_WIDTH &&
        height >= MIN_HEIGHT &&
        Math.abs(width / height - TARGET_RATIO) / TARGET_RATIO <= RATIO_TOLERANCE;
      if (!fitsStandard) return false;
      const { channels } = await sharp(buf).resize(800).greyscale().stats();
      const { mean, stdev } = channels[0];
      return mean >= MIN_MEAN_LUMA && mean <= MAX_MEAN_LUMA && stdev >= MIN_LUMA_SPREAD;
    } catch {
      return false;
    }
  },
  ['hero-grade-photo'],
  { revalidate: 3600 },
);

/**
 * Only high-quality photos make the hero: landscape 4:3 at 1600x1200, well exposed, with real encoded detail.
 * Pinned vehicles contribute every qualifying photo; other available vehicles
 * contribute their first qualifying photo until the hero is full.
 */
export async function getHeroSlides(vehicles: Vehicle[], settings: SiteSettings = {}): Promise<HeroSlide[]> {
  const picked = adminPickedSlides(vehicles, settings.hero_photo_urls);
  if (picked.length > 0) return picked;
  return autoSlides(vehicles);
}

/** Photos staff starred in the admin panel, in their chosen order. Only photos of still-available vehicles count. */
function adminPickedSlides(vehicles: Vehicle[], urls: string[] | undefined): HeroSlide[] {
  if (!Array.isArray(urls)) return [];
  const slides: HeroSlide[] = [];
  for (const src of urls) {
    const v = vehicles.find(x => x.status === 'available' && x.image_urls.includes(src));
    if (v) slides.push({ key: src, vehicleId: v.id, title: v.title, price: v.price, src });
  }
  return slides.slice(0, HERO_MAX_SLIDES);
}

async function autoSlides(vehicles: Vehicle[]): Promise<HeroSlide[]> {
  const live = vehicles.filter(v => v.status === 'available' && v.has_photos && v.image_urls.length > 0);
  const pinned = HERO_PINNED_IDS.map(id => live.find(v => v.id === id)).filter((v): v is Vehicle => !!v);
  const fillers = live
    .filter(v => !HERO_PINNED_IDS.includes(v.id))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, MAX_FILLER_PROBES);

  const slideFor = (v: Vehicle, src: string): HeroSlide => ({
    key: src, vehicleId: v.id, title: v.title, price: v.price, src,
  });

  const slides: HeroSlide[] = [];
  for (const v of pinned) {
    const ok = await Promise.all(v.image_urls.map(isHeroGrade));
    v.image_urls.forEach((src, i) => { if (ok[i]) slides.push(slideFor(v, src)); });
  }
  if (slides.length >= HERO_MAX_SLIDES) return slides.slice(0, HERO_MAX_SLIDES);

  const probes = await Promise.all(fillers.map(v => isHeroGrade(v.image_urls[0])));
  fillers.forEach((v, i) => { if (probes[i]) slides.push(slideFor(v, v.image_urls[0])); });
  return slides.slice(0, HERO_MAX_SLIDES);
}
