import { Pagination, UserInformation } from './reading.types';

export enum IeltsListeningType {
  ACADEMIC = 1,
  GENERAL_TRAINING = 2,
}

export enum ListeningTaskStatus {
  DRAFT = 0,
  PUBLISHED = 1,
  DEACTIVATED = 2,
}

export interface ListeningTaskResponse {
  task_id: string;
  ielts_type: number;
  part_number: number;
  status: number;
  title: string;
  created_by: UserInformation;
  updated_by: UserInformation;
  created_at: string;
  updated_at: string;
}

export interface ListeningTaskDetailResponse {
  task_id: string;
  ielts_type: number;
  part_number: number;
  instruction: string;
  title: string;
  audio_file_id: string;
  transcription: string;
  status?: number;
}

export interface ListeningTaskCreationRequest {
  ielts_type: number;
  part_number: number;
  instruction: string;
  title: string;
  transcription?: string;
  status: number;
  is_automatic_transcription: boolean;
  audio_file: File;
}

export interface ListeningTaskUpdateRequest {
  ielts_type: number;
  part_number: number;
  instruction: string;
  status: number;
  title: string;
  transcription: string;
  audio_file?: File;
}

export interface ListeningTaskFilterParams {
  page?: number;
  size?: number;
  ielts_type?: string[];
  part_number?: string[];
  status?: string[];
  question_category?: string;
  sort_by?: string;
  sort_direction?: string;
  title?: string;
  created_by?: string;
}

export interface BaseListeningResponse<T> {
  status: string;
  message: string;
  data: T;
  pagination?: Pagination;
}

export interface AddGroupQuestionRequest {
  section_order: number;
  section_label: string;
  instruction: string;
  questions: any[]; // Sử dụng any hoặc định nghĩa lại nếu cần
  drag_items?: string[];
}

export interface AddGroupQuestionResponse {
  group_id: string;
  section_order: number;
  section_label: string;
  instruction: string;
  questions: any[]; // Sử dụng any hoặc định nghĩa lại nếu cần
}
