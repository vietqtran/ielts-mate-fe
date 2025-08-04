import {
  IeltsTypeEnumIndex,
  PartNumberEnumIndex,
  PassageStatusEnumIndex,
} from '@/types/reading/reading.types';

/**
 * Enum for common status values used in various components, eg: Filter components,...
 */
export const statusOptions = Object.entries(PassageStatusEnumIndex)
  .filter(([_, value]) => typeof value === 'number')
  .map(([key, value]) => ({
    value: String(value),
    label: key
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase()),
  }));

/**
 * Enum for common part numbers used in various components, eg: Filter components,...
 */
export const partNumberOptions = Object.entries(PartNumberEnumIndex)
  .filter(([_, value]) => typeof value === 'number')
  .map(([key, value]) => ({
    value: String(value),
    label: key
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase()),
  }));

/**
 * Enum for common ielts types used in various components, eg: Filter components,...
 */
export const ieltsTypeOptions = Object.entries(IeltsTypeEnumIndex)
  .filter(([_, value]) => typeof value === 'number')
  .map(([key, value]) => ({
    value: String(value),
    label: key
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase()),
  }));
