import { z } from 'zod';

/**
 * Common validation patterns for reuse across forms
 */
export const commonValidations = {
  requiredString: (fieldName: string) => z.string().min(1, `${fieldName} is required`),

  email: z.string().email('Please enter a valid email address'),

  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number'),

  url: z.string().url('Please enter a valid URL'),

  positiveNumber: z.number().positive('Must be a positive number'),

  dateInFuture: z.date().refine((date) => date > new Date(), 'Date must be in the future'),
};

/**
 * Example schemas for the three child forms
 */
export const userInfoSchema = z.object({
  name: commonValidations.requiredString('Name'),
  email: commonValidations.email,
});

export const addressSchema = z.object({
  street: commonValidations.requiredString('Street address'),
  city: commonValidations.requiredString('City'),
  state: commonValidations.requiredString('State'),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Please enter a valid ZIP code'),
});

export const preferencesSchema = z.object({
  newsletter: z.boolean(),
  notifications: z.enum(['all', 'important', 'none']),
  theme: z.enum(['light', 'dark', 'system']),
});

export type UserInfoFormData = z.infer<typeof userInfoSchema>;
export type AddressFormData = z.infer<typeof addressSchema>;
export type PreferencesFormData = z.infer<typeof preferencesSchema>;
