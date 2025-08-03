export interface UpdateReminderConfigParams {
  email: string;
  /**
   * List of reminder dates.
   * - If recurrence = NONE: Only 1 date is allowed.
   * - If recurrence = CUSTOM: Multiple dates can be set.
   * - If recurrence = DAILY, WEEKLY, MONTHLY, YEARLY: Default is today.
   */
  reminder_date: string[]; // ISO date strings (e.g., "2025-08-04")
  /**
   * Reminder time in 24h format ("HH:mm").
   */
  reminder_time: string;
  recurrence: number; // 0: NONE, 1: DAILY, 2: WEEKLY, 3: MONTHLY, 4: YEARLY, 5: CUSTOM
  /**
   * Time zone for the reminder (IANA format, e.g., "America/New_York").
   */
  time_zone: string;
  enable: boolean;
  message: string;
}

export interface ReminderConfigData {
  account_id: number | null;
  config_id: number;
  email: string;
  enabled: boolean;
  message: string;
  recurrence: number;
  reminder_date: string[];
  reminder_time: string;
  zone: string;
}
