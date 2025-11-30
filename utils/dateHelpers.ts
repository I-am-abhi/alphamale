import { format, isToday, isSameDay, addDays, differenceInDays, startOfDay, differenceInHours, differenceInMinutes } from 'date-fns';

export function formatDateWithDay(date: Date): string {
  return format(date, 'EEEE, MMMM d, yyyy'); // e.g., "Monday, October 26, 2025"
}

export function formatDateShort(date: Date): string {
  return format(date, 'MMM d, yyyy'); // e.g., "Oct 26, 2025"
}

export function getDayNameFull(date: Date): string {
  return format(date, 'EEEE'); // e.g., "Monday"
}

export function formatTime(date: Date): string {
  return format(date, 'HH:mm');
}

export function formatDate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function isTodayDate(date: Date): boolean {
  return isToday(date);
}

export function isSameDayDate(date1: Date, date2: Date): boolean {
  return isSameDay(date1, date2);
}

export function getDayOfWeek(date: Date): number {
  // Returns 0 (Sunday) to 6 (Saturday)
  return date.getDay();
}

export function getDayName(date: Date): string {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[getDayOfWeek(date)];
}

export function getDaysSinceStart(startDate: Date): number {
  const today = startOfDay(new Date());
  const start = startOfDay(startDate);
  return differenceInDays(today, start) + 1; // +1 to include start day
}

export function parseTime(timeString: string): { hours: number; minutes: number } {
  const [hours, minutes] = timeString.split(':').map(Number);
  return { hours, minutes };
}

export function getNextOccurrence(timeString: string): Date {
  const { hours, minutes } = parseTime(timeString);
  const now = new Date();
  const next = new Date();
  next.setHours(hours, minutes, 0, 0);
  
  // If time has passed today, schedule for tomorrow
  if (next < now) {
    next.setDate(next.getDate() + 1);
  }
  
  return next;
}

export function formatTimeWithSeconds(date: Date): string {
  return format(date, 'HH:mm:ss');
}

export function getTimeSince(date: Date): string {
  const now = new Date();
  const hours = differenceInHours(now, date);
  const minutes = differenceInMinutes(now, date) % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ago`;
  } else if (minutes > 0) {
    return `${minutes}m ago`;
  } else {
    return 'Just now';
  }
}

export function formatDateTime(date: Date): string {
  return format(date, 'MMM d, yyyy • HH:mm');
}

