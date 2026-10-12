import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

export function formatPrice(amount: number, currency = 'INR'): string {
  if (currency !== 'INR') return `${currency} ${amount.toLocaleString()}`;
  return inr.format(amount);
}

export function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const diffMs = date.getTime() - Date.now();
  const diffMin = Math.round(diffMs / 60000);
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  if (Math.abs(diffMin) < 60) return rtf.format(diffMin, 'minute');
  const diffHr = Math.round(diffMin / 60);
  if (Math.abs(diffHr) < 24) return rtf.format(diffHr, 'hour');
  const diffDay = Math.round(diffHr / 24);
  if (Math.abs(diffDay) < 30) return rtf.format(diffDay, 'day');
  const diffMonth = Math.round(diffDay / 30);
  return rtf.format(diffMonth, 'month');
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}

export function slugify(text: string): string {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export const TRANSACTION_MODE_LABELS: Record<string, string> = {
  BUY: 'Buy',
  RENT: 'Rent',
  BORROW: 'Borrow',
  HIRE: 'Hire',
  EXCHANGE: 'Exchange',
  DONATE: 'Donate',
};

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  PAYMENT_PENDING: 'Awaiting payment',
  PAID: 'Paid',
  CONFIRMED: 'Confirmed',
  READY: 'Ready',
  ACTIVE: 'In progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  DISPUTED: 'Disputed',
  REFUNDED: 'Refunded',
};
