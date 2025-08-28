import { createRequiredStringValidation } from '@/constants/validate';
import { z } from 'zod';

export const targetConfigSchema = z.object({
  listening_target: z
    .number()
    .min(0, 'Listening target must be at least 0')
    .max(9, 'Listening target cannot exceed 9'),
  listening_target_date: createRequiredStringValidation('Listening target date'),
  reading_target: z
    .number()
    .min(0, 'Reading target must be at least 0')
    .max(9, 'Reading target cannot exceed 9'),
  reading_target_date: createRequiredStringValidation('Reading target date'),
});

export type TargetConfigFormData = z.infer<typeof targetConfigSchema>;
