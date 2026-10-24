"use client"

import { useState } from 'react';
import { Search } from 'lucide-react';

export type Hands = 'any' | '1' | '2' | '3';
export interface FinderQuery { budget: number | null; brand: string; hands: Hands }

export const EMPTY_QUERY: FinderQuery = { budget: null, brand: 'any', hands: 'any' };

/** "How many hands" = how many owners the bike has had. 3 means three or more. */
export function matchesQuery(v: { price: number; brand: string; owners: number | null }, q: FinderQuery): boolean {
  if (q.budget != null && !(v.price > 0 && v.price <= q.budget)) return false;
  if (q.brand !== 'any' && v.brand !== q.brand) return false;
  if (q.hands === '1') return v.owners === 1;
  if (q.hands === '2') return v.owners === 2;
  if (q.hands === '3') return v.owners != null && v.owners >= 3;
  return true;
}

interface BikeFinderProps {
  brands: string[];
  onSearch: (q: FinderQuery) => void;
  onClear: () => void;
  active: boolean;
}

const field = 'h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand';
const label = 'mb-1 block text-xs font-semibold text-muted-foreground';

/** Budget, brand and number of hands in one row; the customer presses Find and sees matching bikes. */
export function BikeFinder({ brands, onSearch, onClear, active }: BikeFinderProps) {
  const [budget, setBudget] = useState('');
  const [brand, setBrand] = useState('any');
  const [hands, setHands] = useState<Hands>('any');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = Number(budget.replace(/[^0-9]/g, ''));
    onSearch({ budget: n > 0 ? n : null, brand, hands });
  };
  const clear = () => { setBudget(''); setBrand('any'); setHands('any'); onClear(); };

  return (
    <form onSubmit={submit} className="rounded-2xl border border-border bg-muted/40 p-4 sm:p-5" aria-label="Find a bike">
      <h2 className="mb-3 font-headline text-lg font-bold text-foreground">Find your bike</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_auto] lg:items-end">
        <div>
          <label htmlFor="finder-budget" className={label}>Your budget (NPR)</label>
          <input
            id="finder-budget"
            inputMode="numeric"
            value={budget}
            onChange={e => setBudget(e.target.value.replace(/[^0-9,]/g, ''))}
            placeholder="e.g. 120000"
            className={field}
          />
        </div>
        <div>
          <label htmlFor="finder-brand" className={label}>Bike brand</label>
          <select id="finder-brand" value={brand} onChange={e => setBrand(e.target.value)} className={field}>
            <option value="any">Any brand</option>
            {brands.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="finder-hands" className={label}>How many hands</label>
          <select id="finder-hands" value={hands} onChange={e => setHands(e.target.value as Hands)} className={field}>
            <option value="any">Any</option>
            <option value="1">1st hand (one owner)</option>
            <option value="2">2nd hand (two owners)</option>
            <option value="3">3rd hand or more</option>
          </select>
        </div>
        <div className="flex gap-2 sm:col-span-2 lg:col-span-1">
          <button type="submit" className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-brand px-5 text-sm font-semibold text-brand-foreground transition-opacity hover:opacity-90">
            <Search className="h-4 w-4" /> Find bikes
          </button>
          {active && (
            <button type="button" onClick={clear} className="h-11 rounded-lg border border-border px-4 text-sm font-medium text-foreground hover:bg-muted">
              Clear
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
