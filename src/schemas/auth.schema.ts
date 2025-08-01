import {
  confirmPasswordValidation,
  emailValidation,
  firstNameValidation,
  lastNameValidation,
  passwordValidation,
} from '@/constants/validate';

import { z } from 'zod';

export const signUpSchema = z
  .object({
    first_name: firstNameValidation,
    last_name: lastNameValidation,
    email: emailValidation,
    password: passwordValidation,
    confirmPassword: confirmPasswordValidation,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
