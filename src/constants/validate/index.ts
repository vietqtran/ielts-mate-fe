import { z } from 'zod';

export const passwordValidation = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters' })
  .regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&\u00C0-\u017F]).*$/, {
    message: 'Password must contain at least one number and one special character',
  });

export const passwordSignInValidation = z.string();

export const confirmPasswordValidation = z.string();

export const emailValidation = z
  .string()
  .email({ message: 'Please enter a valid email address' })
  .regex(/^(?!.*\+)/, {
    message: 'Not allow sub-address in email',
  });

export const firstNameValidation = z
  .string()
  .min(2, { message: 'First name must be at least 2 characters' });
export const lastNameValidation = z
  .string()
  .min(2, { message: 'Last name must be at least 2 characters' });

export const otpValidation = z
  .string()
  .regex(/^\d+$/, { message: 'Verification code must contain only numbers' })
  .min(6, { message: 'Verification code must be 6 digits' })
  .max(6, { message: 'Verification code must be 6 digits' });
