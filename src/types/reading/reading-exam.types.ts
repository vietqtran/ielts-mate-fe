export enum Status {
  INACTIVE = 0,
  ACTIVE = 1,
}

export interface ReadingPassage {
  reading_passage_id: string;
  reading_passage_name: string;
  reading_passage_content: string;
}

export interface ReadingExamCreateRequest {
  reading_exam_name: string;
  reading_exam_description: string;
  url_slug: string;
  reading_passage_id_part1: string;
  reading_passage_id_part2: string;
  reading_passage_id_part3: string;
  status?: number;
}

export interface ReadingExamUpdateRequest {
  reading_exam_name?: string;
  reading_exam_description?: string;
  url_slug?: string;
  reading_passage_id_part1?: string;
  reading_passage_id_part2?: string;
  reading_passage_id_part3?: string;
  status?: number;
}

export interface ReadingExamResponse {
  status: string;
  message: string;
  data: {
    reading_exam_id: string;
    reading_exam_name: string;
    reading_exam_description: string;
    url_slug: string;
    reading_passage_id_part1: ReadingPassage;
    reading_passage_id_part2: ReadingPassage;
    reading_passage_id_part3: ReadingPassage;
    is_marked_up: boolean;
    status: number;
  };
}

// Request payload and response for fetching all reading exams history
// User information
export interface UserInformationResponse {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
}

// Reading Exam info
export interface UserGetHistoryExamAttemptReadingExamResponse {
  reading_exam_id: string;
  reading_exam_name: string;
  reading_exam_description: string;
  url_slug: string;
}
export interface GetHistoryExamAttemptResponse {
  exam_attempt_id: string;
  reading_exam: UserGetHistoryExamAttemptReadingExamResponse;
  duration: number;
  total_question: number;
  created_by: UserInformationResponse;
  updated_by: UserInformationResponse;
  created_at: string;
  updated_at: string;
}
