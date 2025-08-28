import {
  createRequiredEmailValidation,
  createRequiredStringValidation,
} from '@/constants/validate';
import { z } from 'zod';

export const reminderConfigSchema = z
  .object({
    email: createRequiredEmailValidation(),
    reminder_date: z
      .array(z.string())
      .refine((dates) => {
        // Validate ISO date format for each date
        return dates.every((date) => {
          const trimmedDate = date.trim();
          if (trimmedDate.length === 0) return false;
          const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
          return isoDateRegex.test(trimmedDate) && !isNaN(Date.parse(trimmedDate));
        });
      }, 'Invalid date format or empty dates')
      .transform((dates) => dates.map((date) => date.trim())),
    reminder_time: createRequiredStringValidation('Reminder time'),
    recurrence: z
      .number()
      .int()
      .min(0, 'Invalid recurrence value')
      .max(5, 'Invalid recurrence value'),
    time_zone: createRequiredStringValidation('Time zone'),
    enable: z.boolean(),
    message: z
      .string()
      .min(1, 'Reminder message is required')
      .refine((val) => val.trim().length > 0, { message: 'Reminder message cannot be empty' })
      .transform((val) => val.trim())
      .refine((val) => val.length > 0, {
        message: 'Reminder message cannot be empty after trimming',
      })
      .refine((val) => val.length <= 500, { message: 'Message must be less than 500 characters' }),
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
  );

export type ReminderConfigFormData = z.infer<typeof reminderConfigSchema>;
