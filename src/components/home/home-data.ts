import type { Vehicle } from '@/types/vehicle';

/** Quick filters above the rails. Each one narrows every rail on the page at once. */
export const FILTERS = [
  { id: 'all', label: 'All Bikes & Scooters' },
  { id: 'under-1l', label: 'Under NPR 1 Lakh' },
  { id: 'under-1-5l', label: 'Under NPR 1.5 Lakh' },
  { id: 'under-2l', label: 'Under NPR 2.0 Lakh' },
  { id: 'scooters', label: 'Scooters Only' },
  { id: 'commuter', label: '125cc - 160cc Commuter' },
  { id: 'recent', label: 'Recently Listed' },
] as const;

export type FilterId = (typeof FILTERS)[number]['id'];

/** The "budget deals" rail shows bikes at or under this price. */
export const BUDGET_CAP = 100000;
export const MID_CAP = 150000;
export const UPPER_CAP = 200000;

const DAY = 24 * 60 * 60 * 1000;
export const daysOld = (v: Vehicle) => (Date.now() - new Date(v.created_at).getTime()) / DAY;

export function matchesFilter(v: Vehicle, filter: FilterId): boolean {
  switch (filter) {
    case 'under-1l': return v.price > 0 && v.price <= BUDGET_CAP;
    case 'under-1-5l': return v.price > 0 && v.price <= MID_CAP;
    case 'under-2l': return v.price > 0 && v.price <= UPPER_CAP;
    case 'scooters': return v.type === 'scooter';
    case 'commuter': return v.engine_cc != null && v.engine_cc >= 125 && v.engine_cc <= 160;
    case 'recent': return daysOld(v) <= 14;
    default: return true;
  }
}

export type Badge = 'Most Viewed' | 'Lowest Price' | 'Fresh Arrival';

const newestFirst = (a: Vehicle, b: Vehicle) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime();

/**
 * The three rails, built from the real stock. Only vehicles with a photo appear (photoless ones
 * are kept off the homepage until staff add one).
 *  - Most popular: ranked by how often each bike's page was opened in the last 30 days, taken from
 *    the same visit data as the admin Visits page. Bikes nobody has opened yet are left out.
 *  - Budget deals: everything at or under BUDGET_CAP, cheapest first.
 *  - Fresh arrivals: the most recently added.
 */
/** How long a bike stays under Fresh arrivals. */
export const FRESH_DAYS = 30;

export function buildRails(all: Vehicle[]) {
  const list = all.filter(v => v.has_photos && v.status !== 'sold');

  const popular = list
    .filter(v => (v.view_count ?? 0) > 0)
    .sort((a, b) => (b.view_count ?? 0) - (a.view_count ?? 0) || newestFirst(a, b))
    .slice(0, 12);

  const budget = list
    .filter(v => v.price > 0 && v.price <= BUDGET_CAP)
    .sort((a, b) => a.price - b.price)
    .slice(0, 12);

  // A bike counts as a fresh arrival for its first month, then moves on to Available stock.
  const budgetMid = list
    .filter(v => v.price > BUDGET_CAP && v.price <= MID_CAP)
    .sort((a, b) => a.price - b.price)
    .slice(0, 12);

  const budgetUpper = list
    .filter(v => v.price > MID_CAP && v.price <= UPPER_CAP)
    .sort((a, b) => a.price - b.price)
    .slice(0, 12);

  const fresh = list.filter(v => daysOld(v) <= FRESH_DAYS).sort(newestFirst).slice(0, 12);

  const badges = new Map<string, Badge>();
  popular.slice(0, 3).forEach(v => badges.set(v.id, 'Most Viewed'));
  fresh.filter(v => daysOld(v) <= 7).forEach(v => { if (!badges.has(v.id)) badges.set(v.id, 'Fresh Arrival'); });
  budget.slice(0, 3).forEach(v => { if (!badges.has(v.id)) badges.set(v.id, 'Lowest Price'); });

  return { popular, budget, budgetMid, budgetUpper, fresh, badges, total: list.length };
}

/** "1,65,000" style, matching how prices are written elsewhere on the site. */
export const formatNpr = (n: number) => `NPR ${n.toLocaleString('en-IN')}`;
