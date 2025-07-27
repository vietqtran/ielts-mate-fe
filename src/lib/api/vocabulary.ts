import axios from '../axios';

export interface VocabularyCreateRequest {
  word: string;
  context: string;
  meaning: string;
}

export interface VocabularyResponse {
  vocabulary_id: string;
  word: string;
  context: string;
  meaning: string;
  created_by: string;
  created_at: string;
  // Additional properties for UI compatibility
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  category?: string;
  mastered?: boolean;
  reviewDate?: string;
}

export interface VocabularyCreateResponse {
  status: string;
  message: string;
  data: VocabularyResponse;
}

export interface VocabularyListResponse {
  status: string;
  message: string;
  data: VocabularyResponse[];
  pagination: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface VocabularyListParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  keyword?: string;
}

/**
 * Create a new vocabulary
 * @param data Vocabulary data
 * @returns Promise with the created vocabulary
 */
export const createVocabulary = async (
  data: VocabularyCreateRequest
): Promise<VocabularyCreateResponse> => {
  const response = await axios.post<VocabularyCreateResponse>('/personal/vocabulary/', data);
  return response.data;
};

/**
 * Get user's vocabulary list with pagination and filtering
 * @param params Query parameters for pagination and filtering
 * @returns Promise with the vocabulary list and pagination info
 */
export const getMyVocabulary = async (
  params: VocabularyListParams = {}
): Promise<VocabularyListResponse> => {
  const queryParams = new URLSearchParams();

  if (params.page !== undefined) queryParams.append('page', params.page.toString());
  if (params.size !== undefined) queryParams.append('size', params.size.toString());
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.sortDirection) queryParams.append('sortDirection', params.sortDirection);
  if (params.keyword) queryParams.append('keyword', params.keyword);

  const url = `/personal/vocabulary/my-vocabulary${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await axios.get<VocabularyListResponse>(url);
  return response.data;
};
