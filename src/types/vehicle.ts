
export type VehicleStatus = 'available' | 'sold';
export type VehicleType = 'bike' | 'scooter';

export interface Vehicle {
  id: string;
  title: string;
  brand: string;
  model: string;
  type: VehicleType;
  year: number;
  km_run: number;
  price: number;
  description: string;
  image_urls: string[];
  condition: string;
  status: VehicleStatus;
  created_at: string;
  featured?: boolean;
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
