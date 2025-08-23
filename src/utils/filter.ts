import { QuestionCategory } from '@/types/question-group.enum';
import {
  IeltsTypeEnumIndex,
  PartNumberEnumIndex,
  PassageStatusEnumIndex,
  UserInformation,
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

export const questionCategoryOptions = Object.entries(QuestionCategory)
  .filter(([_, value]) => typeof value === 'string')
  .map(([key, value]) => ({
    value: key,
    label: value,
  }));

export const buildCreatedByList = (users: UserInformation[]) => {
  return users.map((user) => ({
    value: user.user_id,
    label: `${user.first_name} ${user.last_name} - (${user.email})`,
  }));
};

export function isUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}
