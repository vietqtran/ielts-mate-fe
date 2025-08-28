import { z } from 'zod';

export const targetConfigSchema = z
  .object({
    listening_target: z
      .number()
      .min(0, 'Listening target must be at least 0')
      .max(9, 'Listening target cannot exceed 9'),
    listening_target_date: z.string().min(1, 'Listening target date is required'),
    reading_target: z
      .number()
      .min(0, 'Reading target must be at least 0')
      .max(9, 'Reading target cannot exceed 9'),
    reading_target_date: z.string().min(1, 'Reading target date is required'),
  })
  .refine(
    (val) => {
      const d = new Date();
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const todayYMD = `${yyyy}-${mm}-${dd}`;
      return !val.listening_target_date || val.listening_target_date >= todayYMD;
    },
    {
      message: 'Listening target date cannot be in the past',
      path: ['listening_target_date'],
    }
  )
  .refine(
    (val) => {
      const d = new Date();
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const todayYMD = `${yyyy}-${mm}-${dd}`;
      return !val.reading_target_date || val.reading_target_date >= todayYMD;
    },
    {
      message: 'Reading target date cannot be in the past',
      path: ['reading_target_date'],
    }
  );

export type TargetConfigFormData = z.infer<typeof targetConfigSchema>;
