import {
  Answer,
  AnswersPayload,
  AttemptAnswer,
  Choice,
  DataResponse,
  DragItem,
  Question,
  QuestionGroup,
  ReadingAttemptHistoryResponse,
} from '@/types/attempt.types';
/**
 * Type for submitting a listening attempt.
 */
export interface SubmitListeningAttemptRequest extends Answer {}

/**
 * Type for the response after submitting a listening attempt.
 */
export interface SubmitListeningAttemptResponse extends DataResponse {}

/**
 * Type for saving progress of a listening attempt during practice.
 */
export interface SaveListeningAttemptProgressRequest extends AnswersPayload {}

/**
 * Type for the response after starting a listening attempt.
 */
export interface StartListeningAttemptResponse {
  attempt_id: string;
  listening_task_id: string;
  ielts_type: number;
  part_number: number;
  instruction: string;
  title: string;
  audio_file_id: string;
  question_groups: StartListeningAttemptQuestionGroup[];
}

export interface StartListeningAttemptQuestionGroup extends QuestionGroup {
  questions: StartListeningAttemptQuestion[];
}

export interface StartListeningAttemptQuestion extends Question {
  zone_index?: number;
  blank_index?: number;
}

/**
 * Type for the response of get listening attempt history.
 */
export interface ListeningAttemptHistoryResponse
  extends Omit<ReadingAttemptHistoryResponse, 'reading_passage_id'> {
  listening_task_id: string;
}

/**
 * Type for the response of get listening attempt details.
 */
export interface LoadListeningAttemptResultResponse {
  attempt_id: string;
  duration: number;
  total_points: number;
  task_data: ListeningTaskData;
  answers: ListeningAttemptAnswer[];
}

export interface ListeningTaskData {
  listening_task_id: string;
  ielts_type: number;
  part_number: number;
  status?: number;
  instruction: string;
  title: string;
  audio_file_id: string;
  transcript?: string;
  question_groups: ListeningTaskQuestionGroup[];
}

export interface ListeningTaskQuestionGroup {
  group_id: string;
  section_order: number;
  section_label: string;
  instruction: string;
  drag_items: DragItem[];
  questions: ListeningTaskQuestion[];
}

export interface ListeningTaskQuestion {
  question_id: string;
  question_order: number;
  question_type: number;
  point: number;
  number_of_correct_answers: number;
  choices: Choice[];
}

export interface ListeningAttemptAnswer extends AttemptAnswer {}

/**
 * Type for the response of load listening attempt.
 */
export interface LoadListeningAttemptResponse extends LoadListeningAttemptResultResponse {}
