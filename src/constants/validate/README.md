# Validation Utilities

This directory contains Zod validation schemas and utility functions for the IELTS Mate application.

## Overview

All string inputs are automatically validated to ensure they:
1. Are not empty (required)
2. Are not just whitespace
3. Are automatically trimmed before validation
4. Meet minimum length requirements

## Utility Functions

### `createRequiredStringValidation(fieldName: string, minLength = 1)`

Creates a validation schema for required string fields with automatic trimming.

```typescript
import { createRequiredStringValidation } from '@/constants/validate';

const titleValidation = createRequiredStringValidation('Title', 3);
// Validates: required, not empty, trimmed, minimum 3 characters
```

### `createRequiredEmailValidation()`

Creates a validation schema for required email fields with automatic trimming and email format validation.

```typescript
import { createRequiredEmailValidation } from '@/constants/validate';

const emailValidation = createRequiredEmailValidation();
// Validates: required, not empty, trimmed, valid email format
```

## Validation Flow

1. **Initial Check**: Ensures the field is not undefined/null
2. **Empty Check**: Ensures the field is not just whitespace
3. **Transform**: Automatically trims the input
4. **Post-Trim Check**: Ensures the field is not empty after trimming
5. **Additional Validation**: Applies field-specific rules (length, format, etc.)

## Usage Examples

### Basic String Field
```typescript
const schema = z.object({
  name: createRequiredStringValidation('Name', 2)
});
```

### Email Field
```typescript
const schema = z.object({
  email: createRequiredEmailValidation()
});
```

### Custom Validation
```typescript
const customValidation = z
  .string()
  .min(1, 'Field is required')
  .refine((val) => val.trim().length > 0, { message: 'Field cannot be empty' })
  .transform((val) => val.trim())
  .refine((val) => val.length > 0, { message: 'Field cannot be empty after trimming' })
  .refine((val) => val.length <= 100, { message: 'Field must be 100 characters or less' });
```

## Benefits

- **Consistent Validation**: All string fields follow the same validation pattern
- **Automatic Trimming**: No need to manually trim inputs in forms
- **User-Friendly Messages**: Clear error messages for validation failures
- **Type Safety**: Full TypeScript support with Zod
- **Maintainable**: Centralized validation logic that's easy to update

## Migration Notes

When updating existing schemas:
1. Replace manual `.transform()` calls with utility functions
2. Remove redundant trimming logic
3. Use utility functions for consistent validation patterns
4. Ensure all string fields use the new validation approach
