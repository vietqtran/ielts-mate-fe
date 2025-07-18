export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  FILL_IN_THE_BLANKS = 'FILL_IN_THE_BLANKS',
  MATCHING = 'MATCHING',
  DRAG_AND_DROP = 'DRAG_AND_DROP',
}

export enum QuestionTypeEnumIndex {
  MULTIPLE_CHOICE = 0,
  FILL_IN_THE_BLANKS = 1,
  MATCHING = 2,
  DRAG_AND_DROP = 3,
}

export enum IeltsType {
  ACADEMIC = 'ACADEMIC',
  GENERAL_TRAINING = 'GENERAL_TRAINING',
}

export enum IeltsTypeEnumIndex {
  ACADEMIC = 0,
  GENERAL_TRAINING = 1,
}

export enum PartNumber {
  PART_1 = 'PART_1',
  PART_2 = 'PART_2',
  PART_3 = 'PART_3',
  PART_4 = 'PART_4',
}

export enum PartNumberEnumIndex {
  PART_1 = 0,
  PART_2 = 1,
  PART_3 = 2,
  PART_4 = 3,
}

export enum PassageStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  DEACTIVATED = 'DEACTIVATED',
  FINISHED = 'FINISHED',
  TEST = 'TEST',
}

export enum PassageStatusEnumIndex {
  DRAFT = 0,
  PUBLISHED = 1,
  DEACTIVATED = 2,
  FINISHED = 3,
  TEST = 4,
}

export interface UserInformation {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface PassageDetailResponse {
  passage_id: string;
  ielts_type: number;
  part_number: number;
  instruction: string;
  title: string;
  content: string;
  content_with_highlight_keywords: string;
  passage_status: number;
  created_by: UserInformation;
  updated_by: UserInformation;
  created_at: string;
  updated_at: string;
}

export interface PassageGetResponse {
  passage_id: string;
  ielts_type: number;
  part_number: number;
  instruction: string;
  title: string;
  content: string;
  content_with_highlight_keywords: string;
  passage_status: number;
  created_by: UserInformation;
  updated_by: UserInformation;
  created_at: string;
  updated_at: string;
}

export interface PassageCreationRequest {
  ielts_type: number;
  part_number: number;
  instruction: string;
  title: string;
  content: string;
  content_with_highlight_keywords: string;
  passage_status: number;
}

export interface ChoiceRequest {
  label: string;
  content: string;
  choice_order: number;
  is_correct: boolean;
}

export interface QuestionCreationRequest {
  question_order: number;
  point: number;
  question_type: number;
  question_group_id: string;
  question_categories: string[];
  explanation: string;
  number_of_correct_answers: number;

  // For Multiple Choice
  instruction_for_choice?: string;
  choices?: ChoiceRequest[];

  // For Fill in Blank
  blank_index?: number;
  correct_answer?: string;

  // For Matching
  instruction_for_matching?: string;
  correct_answer_for_matching?: string;

  // For Drag and Drop
  zone_index?: number;
  drag_item_id?: string;
}

export interface AddGroupQuestionRequest {
  section_order: number;
  section_label: string;
  instruction: string;
  questions: QuestionCreationRequest[];
  drag_items?: string[];
}

export interface AddGroupQuestionResponse {
  group_id: string;
  id?: string;
}

export interface QuestionCreationResponse {
  question_id: string;
  question_order: number;
  point: number;
  question_type: number;
  explanation: string;
  number_of_correct_answers: number;
  instruction_for_choice?: string;
  choices?: ChoiceResponse[];
  blank_index?: number;
  correct_answer?: string;
  instruction_for_matching?: string;
  correct_answer_for_matching?: string;
  zone_index?: number;
  drag_item_id?: string;
}

export interface ChoiceResponse {
  choice_id: string;
  label: string;
  content: string;
  choice_order: number;
  is_correct: boolean;
}

export interface AddGroupQuestionResponse {
  group_id: string;
  section_order: number;
  section_label: string;
  instruction: string;
  questions: QuestionCreationResponse[];
}

export interface DragItemResponse {
  item_id: string;
  content: string;
}

export interface DragItemListResponse {
  group_id: string;
  items: DragItemSummaryResponse[];
}

export interface DragItemSummaryResponse {
  item_id: string;
  item_content: string;
}

export interface CreateDragItemRequest {
  content: string;
}

export interface UpdateDragItemRequest {
  content: string;
}

// Form types for frontend
export interface PassageFormData {
  ielts_type: IeltsType;
  part_number: number;
  instruction: string;
  title: string;
  content: string;
  content_with_highlight_keywords: string;
  passage_status: PassageStatus;
  groups: GroupFormData[];
}

export interface GroupFormData {
  section_order: number;
  section_label: string;
  instruction: string;
  question_type: QuestionType;
  questions: QuestionFormData[];
  drag_items?: string[];
}

export interface QuestionFormData {
  question_order: number;
  point: number;
  explanation: string;
  number_of_correct_answers: number;

  // For Multiple Choice
  instruction_for_choice?: string;
  choices?: ChoiceFormData[];

  // For Fill in Blank
  blank_index?: number;
  correct_answer?: string;

  // For Matching
  instruction_for_matching?: string;
  correct_answer_for_matching?: string;

  // For Drag and Drop
  zone_index?: number;
  drag_item_id?: string;
}

export interface ChoiceFormData {
  label: string;
  content: string;
  choice_order: number;
  is_correct: boolean;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface BaseResponse<T> {
  data: T;
  message?: string;
  pagination?: Pagination;
  status?: string;
}
