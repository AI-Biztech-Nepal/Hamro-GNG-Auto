
export type VehicleStatus = 'available' | 'reserved' | 'sold';
export type VehicleType = 'bike' | 'scooter';

export interface Vehicle {
  id: string;
  title: string;
  brand: string;
  model: string;
  variant: string | null;
  type: VehicleType;
  year: number;
  /** Odometer reading. `null` when the showroom hasn't recorded it (currently the norm). */
  km_run: number | null;
  engine_cc: number | null;
  fuel_type: string | null;
  color: string | null;
  registration_number: string | null;
  /** Number of previous owners, only when it's a sane recorded value (1–6). */
  owners: number | null;
  price: number;
  description: string;
  image_urls: string[];
  /**
   * Whether the backend supplied at least one real photo for this vehicle.
   * Photoless entries are "snoozed": kept off the homepage and pushed to the
   * bottom of the inventory list until a staff member attaches a photo.
   */
  has_photos: boolean;
  condition: string;
  status: VehicleStatus;
  created_at: string;
  featured?: boolean;
  /** Times this vehicle's page was opened in the last 30 days (the admin's Visits data). */
  view_count?: number;
}

export interface Inquiry {
  id: string;
  type: 'sell' | 'exchange' | 'test-ride' | 'general';
  name: string;
  phone: string;
  email?: string;
  vehicleId?: string;
  message: string;
  created_at: string;
  status: 'new' | 'viewed' | 'replied';
}
