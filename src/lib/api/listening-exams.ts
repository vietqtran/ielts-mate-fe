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
}) => {
  const res = await axios.get('/listening/exams/creator', { params });
  return res.data.data;
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
