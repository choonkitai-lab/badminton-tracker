// ============================================================
// Shared utility / helper functions
// ============================================================

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';
import type { StringJobStatus, BreakLocation } from '@/types';

// Safely merge Tailwind CSS class names.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format "2024-01-15" → "Jan 15, 2024"
export function formatDate(dateString: string): string {
  return format(new Date(dateString), 'MMM d, yyyy');
}

// Format "2024-01-15" → "3 days ago"
export function formatRelativeTime(dateString: string): string {
  return formatDistanceToNow(new Date(dateString), { addSuffix: true });
}

// Format minutes → "2h 30m" or "45m"
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

// Tailwind colour classes for each string job status badge
export function getStatusColor(status: StringJobStatus): string {
  const colors: Record<StringJobStatus, string> = {
    active:   'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    broken:   'bg-red-100    text-red-800    dark:bg-red-900/30    dark:text-red-400',
    cut:      'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    restrung: 'bg-blue-100   text-blue-800   dark:bg-blue-900/30   dark:text-blue-400',
  };
  return colors[status];
}

// Human-readable label for break location
export function getBreakLocationLabel(location: BreakLocation | null): string {
  if (!location) return '—';
  const labels: Record<BreakLocation, string> = {
    vertical:   'Vertical string',
    horizontal: 'Horizontal string',
    sweet_spot: 'Sweet spot',
    edge:       'Edge / Frame',
  };
  return labels[location];
}

// Compute average, returning 0 for empty arrays
export function average(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

// Format a number to 1 decimal place — e.g. 12.333 → "12.3"
export function round1(n: number): string {
  return n.toFixed(1);
}

// Today's date as "YYYY-MM-DD" (for default date inputs)
export function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}
