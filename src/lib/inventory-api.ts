/**
 * Fetches live inventory, site settings, and lead submissions from the
 * Auto-Stock-Manager backend — the single source of truth for all of it,
 * managed from that backend's own admin panel.
 */
import type { Vehicle } from '@/types/vehicle';

const API_BASE =
  process.env.NEXT_PUBLIC_INVENTORY_API_URL || 'https://api.hamroauto.com.np';

/**
 * Hard ceiling on any single backend request. Without this a slow or
 * unreachable backend hangs page rendering until the host's build/runtime
 * timeout, which is what broke the Hostinger deploy. On abort the callers'
 * existing `.catch()` fallbacks take over.
 */
const REQUEST_TIMEOUT_MS = 8000;

interface PublicVehicle {
  id: string;
  title: string;
  brand: string;
  model: string;
  variant: string | null;
  type: 'bike' | 'scooter';
  year: number;
  engine_cc: number | null;
  fuel_type: string | null;
  ownership_number: number | null;
  kilometer_run: number | null;
  condition: string;
  color: string | null;
  registration_number: string | null;
  price: number | null;
  status: 'available';
  created_at: string | null;
  cover_photo?: string | null;
  image_urls: string[];
  view_count?: number;
}

/** Backend odometer/owner fields carry 0s and out-of-range junk for "not recorded". */
const cleanNumber = (n: number | null | undefined, min: number, max: number): number | null =>
  typeof n === 'number' && n >= min && n <= max ? n : null;

function toDescription(v: PublicVehicle): string {
  return [
    `${v.year} ${v.brand} ${v.model}${v.variant ? ` ${v.variant}` : ''}`,
    v.kilometer_run != null ? `${v.kilometer_run.toLocaleString()} km run` : null,
    v.condition ? `${v.condition} condition` : null,
    v.engine_cc ? `${v.engine_cc}cc ${v.fuel_type ?? ''}`.trim() : null,
    v.registration_number ? `Reg: ${v.registration_number}` : null,
  ]
    .filter(Boolean)
    .join(' · ');
}

function mapVehicle(v: PublicVehicle): Vehicle {
  const photos = (Array.isArray(v.image_urls) ? v.image_urls : []).filter(Boolean);
  const hasPhotos = photos.length > 0;
  return {
    id: v.id,
    title: v.title,
    brand: v.brand,
    model: v.model,
    variant: v.variant || null,
    type: v.type,
    year: v.year,
    km_run: cleanNumber(v.kilometer_run, 1, 500000),
    engine_cc: cleanNumber(v.engine_cc, 1, 2000),
    fuel_type: v.fuel_type || null,
    color: v.color || null,
    registration_number: v.registration_number || null,
    owners: cleanNumber(v.ownership_number, 1, 6),
    price: v.price ?? 0,
    description: toDescription(v),
    image_urls: hasPhotos ? photos : ['https://placehold.co/800x600'],
    has_photos: hasPhotos,
    condition: v.condition,
    status: 'available',
    created_at: v.created_at ?? new Date().toISOString(),
    featured: false,
    view_count: v.view_count ?? 0,
  };
}

/**
 * All available vehicles, newest first (matches the backend's default sort),
 * with photoless ("snoozed") entries moved to the bottom of the list.
 */
export async function fetchInventory(): Promise<Vehicle[]> {
  const res = await fetch(`${API_BASE}/api/public/vehicles`, {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    next: { revalidate: 60, tags: ['storefront-data'] },
  });
  if (!res.ok) throw new Error(`Failed to load inventory (${res.status})`);
  const data = await res.json();
  const vehicles = (data.vehicles as PublicVehicle[]).map(mapVehicle);
  // Keep the backend order, then sink every photoless entry to the end.
  return [
    ...vehicles.filter(v => v.has_photos),
    ...vehicles.filter(v => !v.has_photos),
  ];
}

/** Single vehicle with its full photo gallery. Returns null if not found or not available (e.g. sold). */
export async function fetchVehicleById(id: string): Promise<Vehicle | null> {
  const res = await fetch(`${API_BASE}/api/public/vehicles/${id}`, {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    next: { revalidate: 60, tags: ['storefront-data'] },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to load vehicle (${res.status})`);
  const v = (await res.json()) as PublicVehicle;
  return mapVehicle(v);
}

export interface SiteSettings {
  logo_url?: string;
  business_name?: string;
  contact_phone?: string;
  contact_email?: string;
  address?: string;
  hero_image_url?: string;
  service_image_url?: string;
  /** Admin-picked hero photos (max 5, in display order), flagged with the favourite button in the admin panel. */
  hero_photo_urls?: string[];
}

/** Site branding/contact info, managed from the Auto-Stock-Manager admin panel. */
export async function fetchSettings(): Promise<SiteSettings> {
  const res = await fetch(`${API_BASE}/api/public/settings`, {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    next: { revalidate: 60, tags: ['storefront-data'] },
  });
  if (!res.ok) throw new Error(`Failed to load settings (${res.status})`);
  return res.json();
}

export interface LeadInput {
  type: 'sell' | 'exchange' | 'service';
  name: string;
  phone: string;
  message?: string;
  images?: string[];
  /** Selected service, e.g. "Oil Change" — used for Book Service submissions. */
  requested_service?: string;
  /** Customer's vehicle/model, e.g. "Pulsar 150" — used for Book Service submissions. */
  vehicle_type?: string;
  /** Customer's chosen service date, ISO format (YYYY-MM-DD) — used for Book Service submissions. */
  preferred_date?: string;
}

/** Submits a Sell / Exchange / Book Service form to the Auto-Stock-Manager admin's Leads screen. */
export async function submitLead(lead: LeadInput): Promise<void> {
  // Same-origin relay (src/app/api/leads): the backend's CORS list blocks this site's direct POSTs.
  const res = await fetch('/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(lead),
  });
  if (!res.ok) throw new Error(`Failed to submit lead (${res.status})`);
}

export interface DashainOffer {
  review_url: string;
  /** Prize names in wheel order; the backend picks the winner by index into this list. */
  prizes: string[];
}

/** The Offers tab's gift wheel, managed from the Auto-Stock-Manager admin's Offers screen. */
export async function fetchDashainOffer(): Promise<DashainOffer> {
  const res = await fetch(`${API_BASE}/api/public/offers/dashain`, {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Failed to load the Dashain offer (${res.status})`);
  return res.json();
}
