/**
 * Fetches live inventory, site settings, and lead submissions from the
 * Auto-Stock-Manager backend — the single source of truth for all of it,
 * managed from that backend's own admin panel.
 */
import type { Vehicle } from '@/types/vehicle';

const API_BASE =
  process.env.NEXT_PUBLIC_INVENTORY_API_URL || 'https://auto-stock-manager.onrender.com';

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
  kilometer_run: number | null;
  condition: string;
  color: string | null;
  registration_number: string | null;
  price: number | null;
  status: 'available';
  created_at: string | null;
  cover_photo?: string | null;
  image_urls: string[];
}

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
  return {
    id: v.id,
    title: v.title,
    brand: v.brand,
    model: v.model,
    type: v.type,
    year: v.year,
    km_run: v.kilometer_run ?? 0,
    price: v.price ?? 0,
    description: toDescription(v),
    image_urls: v.image_urls && v.image_urls.length > 0 ? v.image_urls : ['https://placehold.co/800x600'],
    condition: v.condition,
    status: 'available',
    created_at: v.created_at ?? new Date().toISOString(),
    featured: false,
  };
}

/** All available vehicles, newest first (matches the backend's default sort). */
export async function fetchInventory(): Promise<Vehicle[]> {
  const res = await fetch(`${API_BASE}/api/public/vehicles`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Failed to load inventory (${res.status})`);
  const data = await res.json();
  return (data.vehicles as PublicVehicle[]).map(mapVehicle);
}

/** Single vehicle with its full photo gallery. Returns null if not found or not available (e.g. sold). */
export async function fetchVehicleById(id: string): Promise<Vehicle | null> {
  const res = await fetch(`${API_BASE}/api/public/vehicles/${id}`, { next: { revalidate: 60 } });
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
}

/** Site branding/contact info, managed from the Auto-Stock-Manager admin panel. */
export async function fetchSettings(): Promise<SiteSettings> {
  const res = await fetch(`${API_BASE}/api/public/settings`, { next: { revalidate: 60 } });
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
  const res = await fetch(`${API_BASE}/api/public/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(lead),
  });
  if (!res.ok) throw new Error(`Failed to submit lead (${res.status})`);
}
