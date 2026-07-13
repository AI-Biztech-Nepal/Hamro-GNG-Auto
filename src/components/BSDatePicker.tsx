"use client"

import * as React from "react";
import { forwardRef, useEffect, useState } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  adToBsDate,
  bsToAdDate,
  getBSMonthMaxDays,
  getCurrentBSDate,
  formatBSDate,
  BS_MONTHS,
} from "@/lib/nepali-date";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

// Wide enough for appointments a couple of years out, plus recent history
function getBSYearList(): number[] {
  const cur = getCurrentBSDate()?.year || 2083;
  return Array.from({ length: 18 }, (_, i) => cur - 15 + i);
}

// The BS calendar's weekday alignment is derived from the equivalent AD date —
// avoids reimplementing BS weekday math, reuses the already-converted date.
function firstWeekdayOfBSMonth(year: number, month: number): number {
  const adStr = bsToAdDate(year, month, 1);
  if (!adStr) return 0;
  return new Date(`${adStr}T00:00:00`).getDay();
}

interface BSDatePickerProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "value" | "onChange"> {
  value?: string;
  onChange: (adDateString: string) => void;
  /** Disallow picking a day before today (used for future-facing bookings). */
  disablePast?: boolean;
}

const BSDatePicker = forwardRef<HTMLButtonElement, BSDatePickerProps>(function BSDatePicker(
  { value, onChange, required, className = "", disablePast, ...triggerProps },
  ref
) {
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState<number | null>(null);
  const [viewMonth, setViewMonth] = useState<number | null>(null);

  const selectedBS = adToBsDate(value);

  useEffect(() => {
    if (!open) return;
    const base = selectedBS || getCurrentBSDate();
    setViewYear(base?.year ?? 2083);
    setViewMonth(base?.month ?? 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const maxDays = viewYear && viewMonth ? getBSMonthMaxDays(viewYear, viewMonth) : 30;
  const leadingBlanks = viewYear && viewMonth ? firstWeekdayOfBSMonth(viewYear, viewMonth) : 0;
  const years = getBSYearList();
  const todayAD = new Date().toISOString().slice(0, 10);

  const changeMonth = (delta: number) => {
    if (viewMonth === null || viewYear === null) return;
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 1) { m = 12; y -= 1; }
    if (m > 12) { m = 1; y += 1; }
    setViewMonth(m); setViewYear(y);
  };

  const pickDay = (day: number) => {
    if (viewYear === null || viewMonth === null) return;
    const ad = bsToAdDate(viewYear, viewMonth, day);
    if (ad) onChange(ad);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={ref}
          type="button"
          variant="outline"
          required={required}
          className={cn(
            "h-12 w-full rounded-xl text-left font-normal justify-start px-3",
            !selectedBS && "text-muted-foreground",
            className
          )}
          {...triggerProps}
        >
          <div className="flex flex-col items-start overflow-hidden">
            <span className="truncate">
              {selectedBS ? `${formatBSDate(value)} BS` : "Pick a date (BS)"}
            </span>
            {value && (
              <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
                AD: {value}
                <Check size={11} className="text-green-600" />
              </span>
            )}
          </div>
          <CalendarIcon className="ml-auto h-4 w-4 opacity-50 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3 rounded-2xl" align="start">
        {viewYear && viewMonth && (
          <>
            <div className="flex items-center justify-between mb-2 gap-2">
              <button
                type="button"
                onClick={() => changeMonth(-1)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
                aria-label="Previous month"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold">{BS_MONTHS[viewMonth - 1]}</span>
                <select
                  value={viewYear}
                  onChange={(e) => setViewYear(Number(e.target.value))}
                  className="h-7 px-1 text-xs border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={() => changeMonth(1)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
                aria-label="Next month"
              >
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-muted-foreground mb-1">
              {WEEKDAYS.map((w) => <div key={w}>{w}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: leadingBlanks }).map((_, i) => <div key={`blank-${i}`} />)}
              {Array.from({ length: maxDays }, (_, i) => i + 1).map((day) => {
                const isSelected = !!selectedBS && selectedBS.year === viewYear && selectedBS.month === viewMonth && selectedBS.day === day;
                const dayAD = bsToAdDate(viewYear, viewMonth, day);
                const isDisabled = disablePast && !!dayAD && dayAD < todayAD;
                return (
                  <button
                    key={day}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => pickDay(day)}
                    className={cn(
                      "h-7 w-7 text-xs rounded-full flex items-center justify-center transition-colors",
                      isSelected ? "bg-primary text-primary-foreground font-semibold" : "hover:bg-primary/10",
                      isDisabled && "opacity-30 cursor-not-allowed hover:bg-transparent"
                    )}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
});

BSDatePicker.displayName = "BSDatePicker";

export default BSDatePicker;
