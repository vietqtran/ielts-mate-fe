import { CommonPaginationParams } from '@/types/filter.types';

/**
 * Interface for Get Reading Attempt History request parameters.
 */
export interface GetReadingAttemptHistoryRequestParams extends CommonPaginationParams {
  ieltsType?: string | string[];
  status?: string | string[];
  partNumber?: string | string[];
  questionCategory?: string;
  title?: string;
  passageId?: string;
}
