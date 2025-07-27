import {
  ReadingExamCreateRequest,
  ReadingExamResponse,
  ReadingExamUpdateRequest,
} from '@/types/reading/reading-exam.types';
import axios from '../axios';

/**
 * Create a new reading exam
 * @param data Reading exam data
 * @returns Promise with the created reading exam
 */
export const createReadingExam = async (
  data: ReadingExamCreateRequest
): Promise<ReadingExamResponse> => {
  const response = await axios.post<ReadingExamResponse>('/reading/reading-exams', data);
  return response.data;
};

/**
 * Update an existing reading exam
 * @param id Reading exam ID
 * @param data Reading exam data to update
 * @returns Promise with the updated reading exam
 */
export const updateReadingExam = async (
  id: string,
  data: ReadingExamUpdateRequest
): Promise<ReadingExamResponse> => {
  const response = await axios.put<ReadingExamResponse>(`/reading/reading-exams/${id}`, data);
  return response.data;
};

/**
 * Delete a reading exam
 * @param id Reading exam ID
 * @returns Promise with the deletion response
 */
export const deleteReadingExam = async (id: string): Promise<ReadingExamResponse> => {
  const response = await axios.delete<ReadingExamResponse>(`/reading/reading-exams/${id}`);
  return response.data;
};

/**
 * Get details of a specific reading exam
 * @param id Reading exam ID
 * @returns Promise with the reading exam details
 */
export const getReadingExam = async (id: string): Promise<ReadingExamResponse> => {
  const response = await axios.get<ReadingExamResponse>(`/reading/reading-exams/${id}`);
  return response.data;
};

/**
 * Get a list of all reading exams
 * @returns Promise with the list of reading exams
 */
export const getReadingExams = async (): Promise<{
  status: string;
  message: string;
  data: ReadingExamResponse['data'][];
}> => {
  const response = await axios.get<{
    status: string;
    message: string;
    data: ReadingExamResponse['data'][];
  }>('/reading/reading-exams');
  return response.data;
};
