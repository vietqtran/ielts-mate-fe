import { User } from './user.types';

export interface Pagination {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ApiResponse<T> {
  status: string;
  message: string | null;
  data: T;
  pagination?: Pagination;
}

export interface ReadingPassage {
  passage_id: string;
  ielts_type: number;
  part_number: number;
  passage_status: number;
  created_by: User;
  created_at: string;
  updated_by: User;
  updated_at: string;
  title?: string;
  content?: string;
  content_with_highlight_keyword?: string;
  instruction?: string;
}

export interface Choice {
  label: string;
  content: string;
  choice_order: number;
  is_correct: boolean;
}

export interface Question {
  question_order: number;
  point: number;
  question_type: number;
  question_category: string[];
  explanation: string;
  number_of_correct_answer: number;
  choices?: Choice[];
  instruction_for_choice?: string;
  blank_index?: number;
  correct_answer?: string;
  instruction_for_matching?: string;
  correct_answer_for_matching?: string;
  zone_index?: number;
  drag_item?: string;
}

export interface QuestionGroup {
  section_label: string;
  section_order: number;
  instruction: string;
  questions: Question[];
  drag_item?: string[];
}

export interface CreatePassageRequest {
  ietls_type: number;
  part_number: number;
  instruction: string;
  title: string;
  content: string;
  content_with_hight_light_keyword: string;
  passage_status: number;
  question_groups: QuestionGroup[];
}

export interface UpdatePassageRequest {
  ietls_type?: number;
  part_number?: number;
  instruction?: string;
  title?: string;
  content?: string;
  passage_status?: number;
  content_with_highlight_keyword?: string;
}
