import { firstNameValidation, lastNameValidation, passwordValidation } from '@/constants/validate';

import { z } from 'zod';

export const updateProfileDataSchema = z.object({
  first_name: firstNameValidation,
  last_name: lastNameValidation,
});

export const updatePasswordSchema = z
  .object({
    oldPassword: passwordValidation,
    newPassword: passwordValidation,
    confirmNewPassword: passwordValidation,
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  });
