import { z } from 'zod';

// Utility function for required string validation with trimming
export const createRequiredStringValidation = (fieldName: string, minLength = 1) => {
  return z
    .string()
    .min(1, `${fieldName} is required`)
    .refine((val) => val.trim().length > 0, { message: `${fieldName} cannot be empty` })
    .transform((val) => val.trim())
    .refine((val) => val.length >= minLength, {
      message: `${fieldName} must be at least ${minLength} character${minLength > 1 ? 's' : ''}`,
    });
};

// Utility function for required email validation with trimming
export const createRequiredEmailValidation = () => {
  return z
    .string()
    .min(1, 'Email is required')
    .refine((val) => val.trim().length > 0, { message: 'Email cannot be empty' })
    .transform((val) => val.trim())
    .refine((val) => val.length > 0, { message: 'Email cannot be empty after trimming' })
    .refine((val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
      message: 'Please enter a valid email address',
    });
};

export const passwordValidation = z
  .string()
  .min(1, { message: 'Password is required' })
  .transform((val) => val.trim())
  .refine((val) => val.length >= 8, { message: 'Password must be at least 8 characters' })
  .refine((val) => /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&\u00C0-\u017F]).*$/.test(val), {
    message: 'Password must contain at least one number and one special character',
  });

export const passwordSignInValidation = z
  .string()
  .min(1, { message: 'Password is required' })
  .transform((val) => val.trim())
  .refine((val) => val.length >= 8, { message: 'Password must be at least 8 characters' });

export const confirmPasswordValidation = z
  .string()
  .min(1, { message: 'Confirm password is required' })
  .transform((val) => val.trim());

export const emailValidation = createRequiredEmailValidation();

export const firstNameValidation = createRequiredStringValidation('First name', 2);

export const lastNameValidation = createRequiredStringValidation('Last name', 2);

export const otpValidation = z
  .string()
  .min(1, { message: 'Verification code is required' })
  .refine((val) => val.trim().length > 0, { message: 'Verification code cannot be empty' })
  .transform((val) => val.trim())
  .refine((val) => /^\d+$/.test(val), { message: 'Verification code must contain only numbers' })
  .refine((val) => val.length === 6, { message: 'Verification code must be 6 digits' });
