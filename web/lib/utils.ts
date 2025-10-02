import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Time utilities pinned to Asia/Kolkata for streak logic
const IST_TIMEZONE = 'Asia/Kolkata';

/** Returns Date for now in IST. */
export function nowIST(): Date {
  return new Date(
    new Date().toLocaleString('en-US', { timeZone: IST_TIMEZONE })
  );
}

/** Build a YYYY-MM-DD key from a Date object, assuming that date is already in IST clock time. */
export function toDateKeyIST(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Today date key in IST. */
export function todayDateKeyIST(): string {
  return toDateKeyIST(nowIST());
}

/** Add days to a Date (mutates a copy). */
export function addDays(date: Date, amount: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + amount);
  return copy;
}

/** Returns start and end Date of month in IST (as local Date objects representing that clock time). */
export function monthRangeIST(
  year: number,
  month0: number
): { start: Date; end: Date } {
  const start = new Date(
    new Date(Date.UTC(year, month0, 1)).toLocaleString('en-US', {
      timeZone: IST_TIMEZONE,
    })
  );
  const end = new Date(
    new Date(Date.UTC(year, month0 + 1, 0)).toLocaleString('en-US', {
      timeZone: IST_TIMEZONE,
    })
  );
  return { start, end };
}

export type DayStatus = 'done' | 'missed' | 'future';
