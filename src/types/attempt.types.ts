import { QuestionTypeEnumIndex } from '@/types/reading.types';

// Enums for attempt status
export enum AttemptStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ABANDONED = 'ABANDONED',
}

export enum AttemptStatusEnumIndex {
  IN_PROGRESS = 0,
  COMPLETED = 1,
  ABANDONED = 2,
}

// Response types for fetching attempt data
export interface AttemptData {
  attempt_id?: string; // for reading attempt only
  reading_passage_id?: string; // for reading attempt only
  passage_id?: string; // for exam reading attempt only
  ielts_type: number;
  title: string;
  part_number: number;
  instruction: string;
  content: string;
  question_groups: QuestionGroup[];
}

export interface QuestionGroup {
  question_group_id: string;
  section_order: number;
  section_label: string;
  instruction: string;
  questions: Question[];
  drag_items: DragItem[];
}

export interface Question {
  question_id: string;
  question_order: number;
  question_type: QuestionTypeEnumIndex;
  number_of_correct_answers: number;
  instruction_for_choice?: string;
  instruction_for_matching?: string;
  choices?: Choice[];
}

export interface Choice {
  choice_id: string;
  label: string;
  content: string;
  choice_order: number;
}

export interface DragItem {
  drag_item_id: string;
  content: string;
}

// Payload types for submitting an attempt
export interface Answer {
  question_id: string;
  choices: string[] | null;
  data_filled: string | null;
  data_matched: string | null;
  drag_item_id: string | null;
}

export interface AnswersPayload {
  answers: Answer[];
  duration: number;
}

// Response types for submitting an attempt
export interface ResultSet {
  question_index: number;
  correct_answer: string[];
  user_answer: string[];
  is_correct: boolean;
  explanation: string;
}

export interface DataResponse {
  duration: number;
  result_sets: ResultSet[];
}

// payload for viewing reading attempt history

export interface ReadingAttemptHistoryResponse {
  attempt_id: string; // UUID as string
  duration: number | null; // Long in Java, number in TS, nullable
  total_points: number | null; // Integer in Java, number in TS, nullable
  status: number | null; // Integer in Java, number in TS, nullable
  start_at: string | null; // LocalDateTime as ISO string, nullable
  finished_at: string | null; // LocalDateTime as ISO string, nullable
  reading_passage_id: string; // UUID as string
  title: string | null;
}

export interface GetReadingAttemptHistoryRequest {
  page: number;
  size: number;
  ieltsType?: number[]; // Optional
  status?: number[];
  partNumber?: number[];
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  title?: string;
  listeningTaskId?: string; // UUID as string, optional
}

// payload for viewing listening attempt history

export interface ListeningAttemptHistoryResponse {
  attempt_id: string; // UUID as string
  duration: number | null; // Long in Java → number in TS, nullable
  total_points: number | null; // Integer in Java → number in TS, nullable
  status: number | null; // Integer in Java → number in TS, nullable
  start_at: string | null; // LocalDateTime in Java → ISO string in TS, nullable
  finished_at: string | null; // LocalDateTime in Java → ISO string in TS, nullable
  listening_task_id: string; // UUID as string
  title: string | null;
}

export interface ListeningAttemptHistoryRequest {
  page: number;
  size: number;
  ieltsType?: number[]; // Optional
  status?: number[];
  partNumber?: number[];
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  title?: string;
  listeningTaskId?: string;
}

// Load attempt from history response for reading

export interface AttemptAnswer {
  question_id: string;
  choice_ids: string[];
  filled_text_answer: string;
  matched_text_answer: string;
  drag_item_id: string;
}

export interface Choice {
  choice_id: string;
  label: string;
  choice_order: number;
  content: string;
  is_correct: boolean;
}

export interface AttemptResponseQuestion {
  question_id: string;
  question_order: number;
  question_type: number; // This is an enum index
  point: number;
  explanation: string;
  number_of_correct_answers: number;
  instruction_for_choice: string;
  choices: Choice[];
  blank_index: number;
  correct_answer: string;
  instruction_for_matching: string;
  correct_answer_for_matching: string;
  zone_index: number;
  drag_item_id: string;
}

export interface DragItem {
  drag_item_id: string;
  content: string;
}

export interface AttemptQuestionGroup {
  group_id: string;
  section_label: string;
  section_order: number;
  instruction: string;
  drag_items: DragItem[];
  questions: AttemptResponseQuestion[];
}

export interface PassageTaskData {
  passage_id: string;
  ielts_type: number; // This is an enum index
  part_number: number; // This is an enum index
  status: number; // This is an enum index
  instruction: string;
  title: string;
  content: string;
  question_groups: AttemptQuestionGroup[];
}

export interface LoadAttemptResponse {
  attempt_id: string;
  duration: number;
  task_data: PassageTaskData;
  answers: AttemptAnswer[];
}
