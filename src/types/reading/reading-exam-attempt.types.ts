import { AttemptData, Choice, DragItem } from '@/types/attempt.types';
import { CommonPaginationParams } from '@/types/filter.types';

/**
 * Type definitions of response for Create Reading Exam Attempt
 */
export interface ReadingExamData {
  exam_attempt_id: string;
  reading_exam: ReadingExam;
  url_slug: string;
  created_by: CreatedBy;
  created_at: string;
}

type CreatedBy = {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
};

export interface ReadingExam {
  reading_exam_id: string;
  reading_exam_name: string;
  reading_exam_description: string;
  url_slug: string;
  reading_passage_id_part1: AttemptData;
  reading_passage_id_part2: AttemptData;
  reading_passage_id_part3: AttemptData;
}

/**
 * Type definitions of submit payload for Reading Exam Attempt
 */
// Represents the whole exam attempt submission payload
export interface SubmitExamAttemptAnswersRequest {
  /**
   * List of 3 passage IDs (UUIDs) included in exam.
   */
  passage_id: string[];

  /**
   * List of all question group IDs (UUIDs) present in exam.
   */
  question_group_ids: string[];

  /**
   * List of all item IDs (UUIDs) used for drag and drop questions in exam.
   */
  item_ids: string[];

  /**
   * Array of entries for every question in the exam.
   * If a question was not answered, its `selected_answers` will be `null`.
   */
  answers: SubmitExamAnswerRequest[];

  /**
   * Time spent on the exam (in seconds).
   */
  duration: number;
}

// Represents a single answer for one question in the exam attempt
export interface SubmitExamAnswerRequest {
  /**
   * UUID of the question being answered.
   */
  question_id: string;

  /**
   * List of selected answers for the question, or null if not answered:
   *  - For multiple choice: array of selected choice ids (as strings).
   *  - For fill in the blank: array of user filled answers, e.g. ["user answer"].
   *  - For matching: array of pairs as string, e.g. ["4-A"].
   *  - For drag and drop: array of item ids selected by the user, e.g. ["item id"].
   */
  selected_answers: string[] | null;

  /**
   * For multiple choice questions: Pass a list of **all choice ids** (not just selected ones) for this question.
   * For other question types: pass an empty array.
   */
  choice_ids: string[];
}

/**
 * Type definitions of response for Submit Reading Exam Attempt
 */
export interface SubmitExamResultResponse {
  duration: number;
  result_sets: ResultSet[];
}
export interface ResultSet {
  question_index: number;
  correct_answer: string[];
  user_answer: string[];
  is_correct: boolean;
  explanation: string;
}

/**
 * Type definitions of response for Get List Reading Exam Attempt History
 */
export type ReadingExamAttempt = {
  exam_attempt_id: string;
  reading_exam: {
    reading_exam_id: string;
    reading_exam_name: string;
    reading_exam_description: string;
    url_slug: string;
  };
  duration: number;
  total_question: number;
  created_by: CreatedBy;
  updated_by: CreatedBy;
  created_at: string;
  updated_at: string;
};
export type ReadingExamAttemptList = ReadingExamAttempt[];
// End of Reading Exam Attempt History Response

/**
 * Type definitions of response for Get Reading Exam Attempt Details
 */
// Start of Reading Exam Attempt Details Response
export interface ReadingExamAttemptDetailsResponse {
  exam_attempt_id: string;
  estimated_ielts_band: number;
  reading_exam: ReadingExamAttemptDetailsMainResponse;
  duration: number;
  total_point: number;
  created_by: CreatedBy;
  updated_by: CreatedBy;
  created_at: string;
  updated_at: string;
  answers: Record<string, string[]>; // key: question_id, value: array of answer(s)
}

interface ReadingExamAttemptDetailsChoice extends Choice {
  is_correct: boolean;
}

export type ReadingExamAttemptDetailsQuestion = {
  question_id: string;
  question_order: number;
  question_type: number;
  number_of_correct_answers: number;
  instruction_for_choice?: string;
  instruction_for_matching?: string;
  correct_answer_for_matching?: string;
  choices?: ReadingExamAttemptDetailsChoice[];
  correct_answer?: string;
  explanation?: string;
  point?: number;
  blank_index?: number;
  zone_index?: number;
  start_time?: number; // for listening question
  end_time?: number; // for listening question
};

export interface QuestionGroup {
  question_group_id: string;
  section_order: number;
  section_label: string;
  instruction: string;
  questions?: ReadingExamAttemptDetailsQuestion[];
  drag_items?: DragItem[];
}

// Passage type
type ReadingExamAttemptDetails = {
  passage_id: string;
  instruction: string;
  title: string;
  content_with_highlight_keyword: string;
  content: string;
  part_number: number;
  question_groups: QuestionGroup[];
};

// Main Exam structure
type ReadingExamAttemptDetailsMainResponse = {
  reading_exam_id: string;
  reading_exam_name: string;
  reading_exam_description: string;
  url_slug: string;
  reading_passage_id_part1: ReadingExamAttemptDetails;
  reading_passage_id_part2: ReadingExamAttemptDetails;
  reading_passage_id_part3: ReadingExamAttemptDetails;
};

// End of Reading Exam Attempt Details Response

/**
 * Interface for Get Reading Exam Attempt History request parameters.
 */
export interface ReadingExamAttemptFiltersRequestParams extends CommonPaginationParams {
  readingExamName?: string; // Filter by reading exam name
}
