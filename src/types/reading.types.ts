export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  FILL_IN_THE_BLANKS = 'FILL_IN_THE_BLANKS',
  MATCHING = 'MATCHING',
  DRAG_AND_DROP = 'DRAG_AND_DROP',
}

export enum IeltsType {
  ACADEMIC = 'ACADEMIC',
  GENERAL_TRAINING = 'GENERAL_TRAINING',
}

export enum PassageStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  DEACTIVATED = 'DEACTIVATED',
  FINISHED = 'FINISHED',
  TEST = 'TEST',
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
  contentWithHighlightKeywords: string;
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
  contentWithHighlightKeywords: string;
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
  groupId: string;
  id?: string;
}

export interface QuestionCreationResponse {
  questionId: string;
  questionOrder: number;
  point: number;
  questionType: number;
  explanation: string;
  numberOfCorrectAnswers: number;
  instructionForChoice?: string;
  choices?: ChoiceResponse[];
  blankIndex?: number;
  correctAnswer?: string;
  instructionForMatching?: string;
  correctAnswerForMatching?: string;
  zoneIndex?: number;
  dragItemId?: string;
}

export interface ChoiceResponse {
  choiceId: string;
  label: string;
  content: string;
  choiceOrder: number;
  isCorrect: boolean;
}

export interface AddGroupQuestionResponse {
  groupId: string;
  sectionOrder: number;
  sectionLabel: string;
  instruction: string;
  questions: QuestionCreationResponse[];
}

export interface DragItemResponse {
  itemId: string;
  content: string;
  itemOrder: number;
}

export interface DragItemListResponse {
  items: DragItemResponse[];
}

export interface CreateDragItemRequest {
  content: string;
  itemOrder: number;
}

export interface UpdateDragItemRequest {
  content: string;
  itemOrder: number;
}

// Form types for frontend
export interface PassageFormData {
  ielts_type: IeltsType;
  part_number: number;
  instruction: string;
  title: string;
  content: string;
  contentWithHighlightKeywords: string;
  passage_status: PassageStatus;
  groups: GroupFormData[];
}

export interface GroupFormData {
  sectionOrder: number;
  sectionLabel: string;
  instruction: string;
  questionType: QuestionType;
  questions: QuestionFormData[];
  dragItems?: string[];
}

export interface QuestionFormData {
  questionOrder: number;
  point: number;
  explanation: string;
  numberOfCorrectAnswers: number;

  // For Multiple Choice
  instructionForChoice?: string;
  choices?: ChoiceFormData[];

  // For Fill in Blank
  blankIndex?: number;
  correctAnswer?: string;

  // For Matching
  instructionForMatching?: string;
  correctAnswerForMatching?: string;

  // For Drag and Drop
  zoneIndex?: number;
  dragItemId?: string;
}

export interface ChoiceFormData {
  label: string;
  content: string;
  choiceOrder: number;
  isCorrect: boolean;
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
