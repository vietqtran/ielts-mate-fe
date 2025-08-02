export interface CreateTaskMarkupPayload {
  markUpType: number;
  taskType: number;
  practiceType: number;
  taskId: string;
}

export interface GetTaskMarkupParams {
  page: string;
  size: string;
  markUpType: string;
  taskType: string;
  practiceType: string;
}

export interface GetTaskMarkupResponse {
  markup_id: number;
  markup_type: number;
  task_type: number;
  practice_type: number;
  task_title: string;
}
