export interface UpdateReminderConfigParams {
  email: string;
  reminder_date: string[];
  reminder_time: {
    hour: number;
    minute: number;
    second: number;
    nano: number;
  };
  recurrence: number;
  time_zone: string;
  enable: boolean;
  message: string;
}
