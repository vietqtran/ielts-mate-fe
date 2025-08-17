import { MarkupType, PracticeType, TaskType } from '@/types/markup/markup.enum';

export interface CreateTaskMarkupPayload {
  markUpType: MarkupType;
  taskType: TaskType;
  practiceType: PracticeType;

  // TaskID will be corresponding to the task type and practice type
  // e.g., for taskType = reading, practiceType = exam, it will be the reading exam ID
  // and for taskType = listening, practiceType = task, it will be the listening task ID
  taskId: string;
}

export interface GetTaskMarkupParams {
  page: string;
  size: string;
  markupType?: string;
  taskType?: string;
  practiceType?: string;
}

export interface GetTaskMarkupResponse {
  markup_id: number;
  markup_type: MarkupType;
  task_type: TaskType;
  practice_type: PracticeType;
  task_title: string;
  task_id: string;
}
