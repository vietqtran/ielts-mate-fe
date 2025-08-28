import { z } from 'zod';

export const reminderConfigSchema = z
  .object({
    email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
    reminder_date: z.array(z.string()).refine((dates) => {
      // Validate ISO date format for each date
      return dates.every((date) => {
        const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
        return isoDateRegex.test(date) && !isNaN(Date.parse(date));
      });
    }, 'Invalid date format'),
    reminder_time: z
      .string()
      // .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:mm format'),
      .nonempty('Reminder time is required'),
    recurrence: z
      .number()
      .int()
      .min(0, 'Invalid recurrence value')
      .max(5, 'Invalid recurrence value'),
    time_zone: z.string().min(1, 'Time zone is required'),
    enable: z.boolean(),
    message: z
      .string()
      .min(1, 'Reminder message is required')
      .max(500, 'Message must be less than 500 characters'),
  })
  .refine(
    (data) => {
      // Additional validation for reminder_date based on recurrence
      if (data.recurrence === 0 && data.reminder_date.length !== 1) {
        return false;
      }
      if (data.recurrence === 5 && data.reminder_date.length === 0) {
        return false;
      }
      return true;
    },
    {
      message: 'Please select appropriate dates for the selected recurrence pattern',
      path: ['reminder_date'],
    }
  )
  .transform((data) => ({
    ...data,
    reminder_date: data.reminder_date.map((date) => date.trim()),
  }));

export type ReminderConfigFormData = z.infer<typeof reminderConfigSchema>;
