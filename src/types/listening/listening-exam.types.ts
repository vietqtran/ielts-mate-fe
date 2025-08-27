import { DragItem } from '@/types/attempt.types';
import {
  QuestionGroup,
  SubmitExamAttemptAnswersRequest,
  SubmitExamResultResponse,
} from '@/types/reading/reading-exam-attempt.types';

export interface UserInfo {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
}

/**
 * Type definitions of response for start new listening exam attempt.
 */
export interface StartListeningExamResponse {
  exam_attempt_id: string;
  listening_exam: ListeningExamDetail;
  url_slug: string;
  total_question: number;
  created_by: UserInfo;
  created_at: string;
}

export interface ListeningExamDetail {
  listening_exam_id: string;
  listening_exam_name: string;
  listening_exam_description: string;
  url_slug: string;
  listening_task_id_part1: ListeningTaskShort;
  listening_task_id_part2: ListeningTaskShort;
  listening_task_id_part3: ListeningTaskShort;
  listening_task_id_part4: ListeningTaskShort;
}

export interface ListeningTaskShort {
  task_id: string;
  ielts_type: number;
  part_number: number;
  instruction: string;
  title: string;
  audio_file_id: string;
  transcription: string;
  question_groups: QuestionGroup[];
}

/**
 * Type definitions of request for submit listening exam attempt answers.
 */
export interface SubmitListeningExamAttemptAnswersRequest
  extends Omit<SubmitExamAttemptAnswersRequest, 'passage_id'> {
  task_id: string[];
}

/**
 * Type definitions for response after submit listening exam attempt answers.
 */
export interface SubmitListeningExamAttemptAnswersResponse extends SubmitExamResultResponse {}

/**
 * Type definitions for response of get listening exam attempt details.
 */
export interface ListeningExamAttemptDetailsResponse {
  exam_attempt_id: string;
  estimated_ielts_band: number;
  listening_exam: ListeningExamDetail;
  duration: number;
  total_point: number;
  created_by: UserInfo;
  updated_by: UserInfo;
  created_at: string;
  updated_at: string;
  answers: Record<string, string[]>;
}

/**
 * Type definitions for response of get listening exam attempts history.
 */
export interface ListeningExamAttemptsHistoryResponse {
  exam_attempt_id: string;
  listening_exam: ListeningExamBasic;
  duration: number;
  total_question: number;
  created_by: UserInfo;
  updated_by: UserInfo;
  created_at: string;
  updated_at: string;
}

export interface ListeningExamBasic {
  listening_exam_id: string;
  listening_exam_name: string;
  listening_exam_description: string;
  url_slug: string;
}

/**
 * Type definition for the response of get list active listening exams.
 */
export interface ListActiveListeningExamsResponse {
  listening_exam_id: string;
  exam_name: string;
  exam_description: string;
  url_slug: string;
  part1: ListeningTaskShort;
  part2: ListeningTaskShort;
  part3: ListeningTaskShort;
  part4: ListeningTaskShort;
  created_by: string;
  created_at: string; // ISO 8601 string
  updated_by: string;
  updated_at: string; // ISO 8601 string
  is_current: boolean;
  display_version: number;
  is_original: boolean;
  is_deleted: boolean;
  is_marked_up: boolean;
}

/**
 * Type definition for the response of get listening exam details.
 */
export interface ListeningExamAttemptResponse {
  exam_attempt_id: string;
  listening_exam: ListeningExam;
  duration: number;
  total_point: number;
  created_by: UserInfo;
  updated_by: UserInfo;
  created_at: string;
  updated_at: string;
  answers: Record<string, string[]>;
}

export interface ListeningExam {
  listening_exam_id: string;
  listening_exam_name: string;
  listening_exam_description: string;
  url_slug: string;
  listening_task_id_part1: ListeningTask;
  listening_task_id_part2: ListeningTask;
  listening_task_id_part3: ListeningTask;
  listening_task_id_part4: ListeningTask;
}

export interface ListeningTask {
  task_id: string;
  ielts_type: number;
  part_number: number;
  instruction: string;
  title: string;
  audio_file_id: string;
  question_groups: ListeningQuestionGroup[];
}

export interface ListeningQuestionGroup {
  question_group_id: string;
  section_order: number;
  section_label: string;
  instruction: string;
  questions: ListeningQuestion[];
  drag_items: DragItem[];
}

export interface ListeningQuestion {
  question_id: string;
  question_order: number;
  question_type: number;
  number_of_correct_answers: number;
  instruction_for_choice?: string;
  choices?: ListeningChoice[];
  explanation?: string;
  point?: number;
  blank_index?: number;
  zone_index?: number;
  correct_answer?: string;
}

export interface ListeningChoice {
  choice_id: string;
  label: string;
  content: string;
  choice_order: number;
  is_correct?: boolean;
}

export interface GetListeningExamParams {
  page: number;
  size: number;
  sort_by?: string;
  sort_direction?: string;
  keywords?: string;
}
