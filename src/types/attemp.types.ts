import { QuestionTypeEnumIndex } from '@/types/reading.types';

export interface AttemptData {
  attempt_id: string;
  reading_passage_id: string;
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
