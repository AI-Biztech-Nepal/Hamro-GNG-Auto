import { adToBs, bsToAd } from "@sbmdkl/nepali-date-converter";

export const BS_MONTHS = [
  "Baishakh", "Jestha", "Ashadh", "Shrawan", "Bhadra", "Ashwin",
  "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra",
];

export interface BSDate {
  year: number;
  month: number;
  day: number;
}

// Convert AD date string (YYYY-MM-DD) → BS {year, month, day} or null
export function adToBsDate(adStr?: string | null): BSDate | null {
  if (!adStr) return null;
  try {
    const result = adToBs(adStr.slice(0, 10));
    const [y, m, d] = result.split("-").map(Number);
    return { year: y, month: m, day: d };
  } catch {
    return null;
  }
}

// Convert BS {year, month, day} → AD date string (YYYY-MM-DD) or null
export function bsToAdDate(year: number, month: number, day: number): string | null {
  if (!year || !month || !day) return null;
  try {
    const bsStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return bsToAd(bsStr);
  } catch {
    return null;
  }
}

// Format: "2083 Jestha 21"
export function formatBSDate(adStr?: string | null): string {
  const bs = adToBsDate(adStr);
  if (!bs) return "—";
  return `${bs.year} ${BS_MONTHS[bs.month - 1]} ${bs.day}`;
}

// Format: "2083/02/21"
export function formatBSDateNumeric(adStr?: string | null): string {
  const bs = adToBsDate(adStr);
  if (!bs) return "—";
  return `${bs.year}/${String(bs.month).padStart(2, "0")}/${String(bs.day).padStart(2, "0")}`;
}

// Get today's BS date
export function getCurrentBSDate(): BSDate | null {
  return adToBsDate(new Date().toISOString().slice(0, 10));
}

// Get max days in a BS year/month (scans down from 32)
export function getBSMonthMaxDays(year: number, month: number): number {
  for (let d = 32; d >= 28; d--) {
    if (bsToAdDate(year, month, d)) return d;
  }
  return 30;
}

// Today's AD date as string
export function getTodayAD(): string {
  return new Date().toISOString().slice(0, 10);
}
