import { firstNameValidation, lastNameValidation, passwordValidation } from '@/constants/validate';

import { z } from 'zod';

export const updateProfileDataSchema = z
  .object({
    first_name: firstNameValidation,
    last_name: lastNameValidation,
  })
  .transform((data) => ({
    ...data,
    first_name: data.first_name.trim(),
    last_name: data.last_name.trim(),
  }));

export const updatePasswordSchema = z
  .object({
    oldPassword: passwordValidation,
    newPassword: passwordValidation,
    confirmNewPassword: passwordValidation,
  })
  .transform((data) => ({
    ...data,
    oldPassword: data.oldPassword.trim(),
    newPassword: data.newPassword.trim(),
    confirmNewPassword: data.confirmNewPassword.trim(),
  }))
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  });
