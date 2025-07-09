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
}

export interface ReadingExamUpdateRequest {
  reading_exam_name?: string;
  reading_exam_description?: string;
  url_slug?: string;
  reading_passage_id_part1?: string;
  reading_passage_id_part2?: string;
  reading_passage_id_part3?: string;
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
  };
}
