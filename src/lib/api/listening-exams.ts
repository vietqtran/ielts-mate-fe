import axios from '../axios';

// TypeScript types có thể được refine sau nếu đã có types chuẩn
export interface ListeningExamRequest {
  title: string;
  description?: string;
  tasks: Array<{
    id: string;
    partNumber: number;
  }>;
}

export interface ListeningExamResponse {
  id: string;
  title: string;
  description?: string;
  isActive: boolean;
  tasks: Array<{
    id: string;
    title: string;
    partNumber: number;
  }>;
}

// Lấy danh sách exam của creator
export const fetchListeningExams = async (params?: {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: string;
  keyword?: string;
}): Promise<{
  data: any[];
  pagination?: {
    totalPages: number;
    pageSize: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    currentPage: number;
  };
  status?: string;
  message?: string;
}> => {
  // Clean params to avoid sending whitespace-only keyword which serializes to '+'
  const cleanedParams = { ...params } as typeof params;
  if (cleanedParams && typeof cleanedParams.keyword === 'string') {
    const trimmed = cleanedParams.keyword.trim();
    if (!trimmed) {
      delete (cleanedParams as any).keyword;
    } else {
      (cleanedParams as any).keyword = trimmed;
    }
  }

  const res = await axios.get('/listening/exams/creator', { params: cleanedParams });
  return {
    data: res.data.data ?? [],
    pagination: res.data.pagination,
    status: res.data.status,
    message: res.data.message,
  };
};

// Tạo mới exam
export const createListeningExam = async (data: ListeningExamRequest) => {
  const res = await axios.post('/listening/exams/', data);
  return res.data.data;
};

// Cập nhật exam
export const updateListeningExam = async (examId: string, data: ListeningExamRequest) => {
  const res = await axios.put(`/listening/exams/${examId}`, data);
  return res.data.data;
};

// Xóa exam
export const deleteListeningExam = async (examId: string) => {
  await axios.delete(`/listening/exams/${examId}`);
};

// Lấy chi tiết exam
export const getListeningExamById = async (examId: string) => {
  const res = await axios.get(`/listening/exams/${examId}`);
  return res.data.data;
};

// Kích hoạt/deactivate exam
export const activateListeningExam = async (examId: string, isActive: boolean) => {
  await axios.patch(`/listening/exams/${examId}/activate`, { isActive });
};

/**
 * Generate a slug from exam name
 * @param examName The exam name to generate slug from
 * @returns Promise with the generated slug
 */
export const generateListeningExamSlug = async (examName: string): Promise<string> => {
  const response = await axios.get<{
    status: string;
    message: string;
    data: { url_slug: string };
  }>(`/listening/exams/gen/slug/${encodeURIComponent(examName)}`);
  return response.data.data.url_slug;
};

/**
 * Check if a slug is available
 * @param slug The slug to check
 * @returns Promise with boolean indicating if slug is available
 */
export const checkListeningExamSlug = async (slug: string): Promise<boolean> => {
  const response = await axios.get<{ data: boolean }>(`/listening/exams/check/${slug}`);
  return response.data.data;
};
