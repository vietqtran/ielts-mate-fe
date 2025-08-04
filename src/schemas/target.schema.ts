import { z } from 'zod';

export const targetConfigSchema = z.object({
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
});

export type TargetConfigFormData = z.infer<typeof targetConfigSchema>;
