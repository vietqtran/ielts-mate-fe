import { CommonPaginationParams } from '@/types/filter.types';

/**
 * Interface for Get Reading Attempt History request parameters.
 */
export interface GetReadingAttemptHistoryRequestParams extends CommonPaginationParams {
  ieltsType?: string | string[];
  status?: string | string[];
  partNumber?: string | string[];
  questionCategory?: string;
  title?: string;
  passageId?: string;
}

/**
 * Interface for Get Reading Attempt Result response.
 */
export interface GetReadingAttemptResultResponse {
  attempt_id: string;
  duration: number; // seconds (based on the sample)
  task_data: TaskData;
  answers: Answer[];
}

interface TaskData {
  passage_id: string;
  ielts_type: number;
  part_number: number;
  instruction?: string;
  title?: string;
  content?: string;
  question_groups: QuestionGroup[];
}

interface QuestionGroup {
  group_id: string;
  section_order: number;
  section_label?: string;
  instruction?: string;
  drag_items?: any[]; // keep loose until spec is known
  questions: Question[];
}

interface Question {
  question_id: string;
  question_order: number;
  question_type: number;
  point?: number;
  number_of_correct_answers?: number;
  choices?: Choice[];
}

interface Choice {
  choice_id: string;
  label?: string;
  choice_order?: number;
  content?: string;
  is_correct?: boolean;
}

interface Answer {
  question_id: string;
  choice_ids: string[];
}
