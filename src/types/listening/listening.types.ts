import { Pagination, UserInformation } from '../reading/reading.types';

export enum IeltsListeningType {
  ACADEMIC = 0,
  GENERAL_TRAINING = 1,
}

export enum ListeningTaskStatus {
  DRAFT = 0,
  PUBLISHED = 1,
  DEACTIVATED = 2,
  TEST = 4,
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
  is_marked_up: boolean;
}

export interface ListeningTaskDetailResponse {
  task_id: string;
  ielts_type: number;
  part_number: number;
  instruction: string;
  title: string;
  audio_file_id: string;
  transcript: string;
  status?: number;
}

export interface ListeningTaskCreationRequest {
  ielts_type: number;
  part_number: number;
  instruction: string;
  title: string;
  transcript?: string;
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
  transcript: string;
  audio_file?: File;
}

export interface ListeningTaskFilterParams {
  page: number;
  size: number;
  ielts_type?: string[];
  part_number?: string[];
  status?: string[];
  question_category?: string;
  sort_by?: string;
  sort_direction?: string;
  title?: string;
  created_by?: string;
}

// New camelCase filter params for UI components
export interface ListeningTaskFilterParamsCamelCase {
  page: number;
  size: number;
  ieltsType?: string[];
  partNumber?: string[];
  status?: string[];
  questionCategory?: string;
  sortBy?: string;
  sortDirection?: string;
  title?: string;
  createdBy?: string;
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
