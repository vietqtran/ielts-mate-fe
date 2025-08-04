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
  time_spent?: number; // Time spent in seconds
  progress?: number; // Progress as percentage (0 to 100)
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

// Sharing related interfaces
export interface ShareModuleRequest {
  user_ids: string[];
}

export interface ModuleUserResponse {
  module_id: string;
  module_name: string;
  description: string;
  is_public: boolean;
  status: number; // 0: pending, 1: accepted, 2: denied
  is_deleted?: boolean;
  flash_card_ids: FlashCard[];
  created_by: string;
  created_at: string;
  updated_by?: string;
  updated_at?: string;
  time_spent?: number; // Time spent in seconds
  progress?: number; // Progress as percentage (0 to 100)
}

export interface ModuleUserListResponse {
  status: string;
  message: string;
  data: ModuleUserResponse[];
  pagination: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface ModuleProgressRequest {
  flashcard_id: string;
  is_correct: boolean;
  time_spent: number;
}

export interface ModuleProgressResponse {
  module_id: string;
  user_id: string;
  progress_percentage: number;
  cards_completed: number;
  total_cards: number;
  time_spent: number;
  last_studied: string;
  streak_count: number;
  created_at: string;
  updated_at: string;
}

export interface BaseResponse<T> {
  status: string;
  message: string;
  data?: T;
  pagination?: {
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

/**
 * Get a module by id
 * @param id Module id
 * @returns Promise with the module
 */
export const getModuleById = async (id: string): Promise<ModuleCreateResponse> => {
  const response = await axios.get<ModuleCreateResponse>(`/personal/module/${id}`);
  return response.data;
};

/**
 * Update a module by id
 * @param id Module id
 * @param data Module update data
 * @returns Promise with the updated module
 */
export const updateModule = async (
  id: string,
  data: ModuleCreateRequest
): Promise<ModuleCreateResponse> => {
  const response = await axios.put<ModuleCreateResponse>(`/personal/module/${id}`, data);
  return response.data;
};

// Sharing API functions

/**
 * Share a module with other users
 * @param moduleId Module ID to share
 * @param data Share request data containing user IDs
 * @returns Promise with success response
 */
export const shareModule = async (
  moduleId: string,
  data: ShareModuleRequest
): Promise<BaseResponse<void>> => {
  const response = await axios.post<BaseResponse<void>>(
    `/personal/module-share/${moduleId}/share`,
    data
  );
  return response.data;
};

/**
 * Get all shared modules user accepted
 * @param page Page number
 * @param size Page size
 * @param sortBy Sort field
 * @param sortDirection Sort direction
 * @param keyword Search keyword
 * @returns Promise with shared modules list
 */
export const getMySharedModules = async (
  page: number = 1,
  size: number = 10,
  sortBy: string = 'createdAt',
  sortDirection: string = 'desc',
  keyword?: string
): Promise<ModuleUserListResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
    sortBy,
    sortDirection,
  });

  if (keyword) {
    params.append('keyword', keyword);
  }

  const response = await axios.get<ModuleUserListResponse>(
    `/personal/module-share/my-shared?${params}`
  );
  return response.data;
};

/**
 * Get all pending shared module requests
 * @param page Page number
 * @param size Page size
 * @param sortBy Sort field
 * @param sortDirection Sort direction
 * @param keyword Search keyword
 * @returns Promise with shared module requests list
 */
export const getSharedModuleRequests = async (
  page: number = 1,
  size: number = 10,
  sortBy: string = 'createdAt',
  sortDirection: string = 'desc',
  keyword?: string
): Promise<ModuleUserListResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
    sortBy,
    sortDirection,
  });

  if (keyword) {
    params.append('keyword', keyword);
  }

  const response = await axios.get<ModuleUserListResponse>(
    `/personal/module-share/my-shared/requests?${params}`
  );
  return response.data;
};

/**
 * Accept or deny a shared module request
 * @param moduleId Module ID
 * @param status Status (1: accept, 2: deny)
 * @returns Promise with success response
 */
export const updateSharedModuleRequest = async (
  moduleId: string,
  status: number
): Promise<BaseResponse<void>> => {
  const response = await axios.put<BaseResponse<void>>(
    `/personal/module-share/${moduleId}?status=${status}`
  );
  return response.data;
};

/**
 * Get all modules shared by me
 * @param page Page number
 * @param size Page size
 * @param sortBy Sort field
 * @param sortDirection Sort direction
 * @param keyword Search keyword
 * @returns Promise with my shared modules list
 */
export const getMyRequestedModules = async (
  page: number = 1,
  size: number = 10,
  sortBy: string = 'createdAt',
  sortDirection: string = 'desc',
  keyword?: string
): Promise<ModuleUserListResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
    sortBy,
    sortDirection,
  });

  if (keyword) {
    params.append('keyword', keyword);
  }

  const response = await axios.get<ModuleUserListResponse>(
    `/personal/module-share/my-shared/requested?${params}`
  );
  return response.data;
};

/**
 * Get module progress of user
 * @param moduleId Module ID
 * @returns Promise with module progress
 */
export const getModuleProgress = async (
  moduleId: string
): Promise<BaseResponse<ModuleProgressResponse>> => {
  const response = await axios.get<BaseResponse<ModuleProgressResponse>>(
    `/personal/module-share/progress/${moduleId}`
  );
  return response.data;
};

/**
 * Update module progress of user
 * @param moduleId Module ID
 * @param data Progress update data
 * @returns Promise with updated progress
 */
export const updateModuleProgress = async (
  moduleId: string,
  data: ModuleProgressRequest
): Promise<BaseResponse<string>> => {
  const response = await axios.put<BaseResponse<string>>(
    `/personal/module-share/progress/${moduleId}/flashcard`,
    data
  );
  return response.data;
};
