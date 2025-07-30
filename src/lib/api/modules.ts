import axios from '../axios';

export interface ModuleCreateRequest {
  module_name: string;
  module_description: string;
  vocabulary_ids: string[];
  is_public: boolean;
}

export interface FlashCard {
  flashcard_id: string;
  vocab: {
    vocabulary_id: string;
    word: string;
    context: string;
    meaning: string;
    created_by: string;
    created_at: string;
  };
}

export interface ModuleResponse {
  module_id: string;
  module_name: string;
  description: string;
  is_public: boolean;
  is_deleted: boolean | null;
  flash_card_ids: FlashCard[];
  created_by: string;
  created_at: string;
  updated_by: string | null;
  updated_at: string | null;
}

export interface ModuleCreateResponse {
  status: string;
  message: string;
  data: ModuleResponse;
}

export interface ModuleListResponse {
  status: string;
  message: string;
  data: ModuleResponse[];
  pagination: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/**
 * Create a new module
 * @param data Module data
 * @returns Promise with the created module
 */
export const createModule = async (data: ModuleCreateRequest): Promise<ModuleCreateResponse> => {
  const response = await axios.post<ModuleCreateResponse>('/personal/module', data);
  return response.data;
};

/**
 * Get user's modules/flashcards
 * @returns Promise with the modules list
 */
export const getMyModules = async (): Promise<ModuleListResponse> => {
  const response = await axios.get<ModuleListResponse>('/personal/module/my-flash-cards');
  return response.data;
};
