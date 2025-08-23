import { format, toZonedTime } from 'date-fns-tz';

export const formatDuration = (duration: number | null): string => {
  if (!duration) return 'N/A';
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const seconds = duration % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
};

export const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export function getLocalTime(reminderDate: string, reminderTime: string, timeZone: string) {
  if (!reminderDate || !reminderTime) return '--:--';

  // Ensure time string has seconds (HH:mm:ss)
  const fullTime = reminderTime.length === 5 ? reminderTime + ':00' : reminderTime;
  // Construct a UTC ISO string
  const utcDateTimeStr = `${reminderDate}T${fullTime}Z`; // e.g., "2025-08-04T07:00:00Z"

  // Make sure it's a valid Date!
  const utcDate = new Date(utcDateTimeStr);
  if (isNaN(utcDate.getTime())) return '--:--';

  // Convert to target timezone
  const zonedDate = toZonedTime(utcDate, timeZone);
  return format(zonedDate, 'HH:mm', { timeZone });
}
