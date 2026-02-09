/**
 * Restaurant hours utilities
 */

export interface DayHours {
  open?: string;   // "06:30" format
  close?: string;  // "16:30" format
  closed?: boolean;
}

export interface WeekHours {
  monday?: DayHours;
  tuesday?: DayHours;
  wednesday?: DayHours;
  thursday?: DayHours;
  friday?: DayHours;
  saturday?: DayHours;
  sunday?: DayHours;
}

const DAYS_OF_WEEK = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;

/**
 * Format time from "16:30" to "4:30pm"
 */
export function formatTime(time: string): string {
  const [hourStr, minute] = time.split(':');
  const hour = parseInt(hourStr, 10);
  const period = hour >= 12 ? 'pm' : 'am';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${minute}${period}`;
}

/**
 * Get current day name
 */
function getCurrentDay(timezone?: string): typeof DAYS_OF_WEEK[number] {
  const now = timezone 
    ? new Date(new Date().toLocaleString('en-US', { timeZone: timezone }))
    : new Date();
  return DAYS_OF_WEEK[now.getDay()];
}

/**
 * Get current time in HH:MM format
 */
function getCurrentTime(timezone?: string): string {
  const now = timezone
    ? new Date(new Date().toLocaleString('en-US', { timeZone: timezone }))
    : new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Check if time is between open and close
 */
function isTimeBetween(current: string, open: string, close: string): boolean {
  // Handle overnight hours (close < open means closes after midnight)
  if (close < open) {
    return current >= open || current < close;
  }
  return current >= open && current < close;
}

/**
 * Check if restaurant is currently open
 */
export function isCurrentlyOpen(hours: WeekHours | null | undefined, timezone?: string): boolean {
  if (!hours) return true; // Assume open if no hours data
  
  const currentDay = getCurrentDay(timezone);
  const currentTime = getCurrentTime(timezone);
  const todayHours = hours[currentDay];
  
  if (!todayHours || todayHours.closed) return false;
  if (!todayHours.open || !todayHours.close) return true; // Assume open if incomplete data
  
  return isTimeBetween(currentTime, todayHours.open, todayHours.close);
}

/**
 * Get today's hours as a formatted string
 */
export function getTodayHours(hours: WeekHours | null | undefined, timezone?: string): string {
  if (!hours) return 'Hours not available';
  
  const currentDay = getCurrentDay(timezone);
  const todayHours = hours[currentDay];
  
  if (!todayHours || todayHours.closed) return 'Closed today';
  if (!todayHours.open || !todayHours.close) return 'Hours not set';
  
  return `${formatTime(todayHours.open)} – ${formatTime(todayHours.close)}`;
}

/**
 * Format all weekly hours for display
 */
export function formatWeeklyHours(hours: WeekHours | null | undefined): Array<{ day: string; hours: string }> {
  if (!hours) return [];
  
  const dayLabels: Record<string, string> = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
  };
  
  return DAYS_OF_WEEK.slice(1).concat(DAYS_OF_WEEK[0]).map(day => {
    const dayHours = hours[day];
    let hoursStr = 'Closed';
    
    if (dayHours && !dayHours.closed && dayHours.open && dayHours.close) {
      hoursStr = `${formatTime(dayHours.open)} – ${formatTime(dayHours.close)}`;
    }
    
    return { day: dayLabels[day], hours: hoursStr };
  });
}
