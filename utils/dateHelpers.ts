import type { MonthRecord } from '@/types';

// ─── Agenda helpers ──────────────────────────────────────────────────────────

export function toDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function toTimeString(d: Date): string {
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${min}`;
}

export function formatDisplayDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

export function formatDisplayTime(hhmm: string): string {
  return hhmm;
}

// ─── Aproveitamento helpers ──────────────────────────────────────────────────

export const MONTH_NAMES = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
];

export function getDaysInMonth(period: string): number {
  const parts = period.split('-').map(Number);
  if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) return 30;
  return new Date(parts[0], parts[1], 0).getDate();
}

export function buildAnnualMonths(year: number): MonthRecord[] {
  return Array.from({ length: 12 }, (_, i) => ({
    monthIndex: i,
    completedDays: 0,
    totalDays: new Date(year, i + 1, 0).getDate(),
  }));
}

export function currentPeriod(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export function formatPeriodLabel(period: string): string {
  const [y, m] = period.split('-');
  const monthIndex = Number(m) - 1;
  const monthName = monthIndex >= 0 && monthIndex < 12 ? MONTH_NAMES[monthIndex] : period;
  return `${monthName}/${y}`;
}
