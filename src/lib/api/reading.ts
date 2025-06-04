import {
  ApiResponse,
  AttemptSubmission,
  Choice,
  DragItem,
  Question,
  ReadingPassage,
} from '@/types/reading-passage.types';

import instance from '@/lib/axios';

export interface GetPassagesParams {
  page: number;
  size: number;
  ieltsType?: number;
  partNumber?: number;
  status?: number;
  questionCategory?: string;
}

export interface CreatePassageRequest {
  ielts_type: number;
  part_number: number;
  instruction: string;
  title: string;
  content: string;
  passage_status: number;
  content_with_highlight_keywords: string;
}

export interface UpdatePassageRequest {
  ielts_type?: number;
  part_number?: number;
  instruction?: string;
  title?: string;
  content?: string;
  passage_status?: number;
  content_with_highlight_keywords?: string;
}

export interface CreateQuestionRequest {
  passage_id: string;
  question_order: number;
  point: number;
  question_type: number;
  question_category: string[];
  explanation: string;
  number_of_correct_answer: number;
  instruction?: string;
  instruction_for_choice?: string;
  blank_index?: number;
  correct_answer?: string;
  instruction_for_matching?: string;
  correct_answer_for_matching?: string;
  zone_index?: number;
  drag_item?: string;
}

export interface UpdateQuestionRequest {
  question_order?: number;
  point?: number;
  question_type?: number;
  question_category?: string[];
  explanation?: string;
  number_of_correct_answer?: number;
  instruction?: string;
  instruction_for_choice?: string;
  blank_index?: number;
  correct_answer?: string;
  instruction_for_matching?: string;
  correct_answer_for_matching?: string;
  zone_index?: number;
  drag_item?: string;
}

export interface CreateChoiceRequest {
  question_id: string;
  label: string;
  content: string;
  choice_order: number;
  is_correct: boolean;
}

export interface UpdateChoiceRequest {
  label?: string;
  content?: string;
  choice_order?: number;
  is_correct?: boolean;
}

export interface CreateDragItemRequest {
  question_id: string;
  content: string;
  drag_item_order: number;
}

export interface UpdateDragItemRequest {
  content?: string;
  drag_item_order?: number;
}

export interface CreateAttemptRequest {
  user_id: string;
  question_id: string;
  selected_choice_id?: string;
  drag_answer?: string;
  fill_blank_answer?: string;
}

export interface CreateSubmissionRequest {
  user_id: string;
  passage_id: string;
  time_spent_seconds: number;
  attempts: CreateAttemptRequest[];
}

// ======================== PASSAGE ENDPOINTS ========================
export const readingPassageAPI = {
  // 1. Get list of reading passages
  getPassages: async (params: GetPassagesParams): Promise<ApiResponse<ReadingPassage[]>> => {
    const searchParams = new URLSearchParams();

    searchParams.append('page', params.page.toString());
    searchParams.append('size', params.size.toString());

    if (params.ieltsType !== undefined) {
      searchParams.append('ieltsType', params.ieltsType.toString());
    }
    if (params.partNumber !== undefined) {
      searchParams.append('partNumber', params.partNumber.toString());
    }
    if (params.status !== undefined) {
      searchParams.append('status', params.status.toString());
    }
    if (params.questionCategory) {
      searchParams.append('questionCategory', params.questionCategory);
    }

    const { data } = await instance.get(`/reading/passages/teacher?${searchParams.toString()}`, {
      withCredentials: true,
    });
    return data;
  },

  // 2. Create a new reading passage
  createPassage: async (
    passageData: CreatePassageRequest
  ): Promise<ApiResponse<ReadingPassage>> => {
    const { data } = await instance.post('/reading/passages', passageData, {
      withCredentials: true,
    });
    return data;
  },

  // 3. Update an existing reading passage
  updatePassage: async (
    passageId: string,
    passageData: UpdatePassageRequest
  ): Promise<ApiResponse<ReadingPassage>> => {
    const { data } = await instance.put(`/reading/passages/${passageId}`, passageData, {
      withCredentials: true,
    });
    return data;
  },
  // 4. Delete a reading passage
  deletePassage: async (passageId: string): Promise<ApiResponse<null>> => {
    const { data } = await instance.delete(`/reading/passages/${passageId}`, {
      withCredentials: true,
    });
    return data;
  },

  // 5. Get a single reading passage
  getPassage: async (passageId: string): Promise<ApiResponse<ReadingPassage>> => {
    const { data } = await instance.get(`/reading/passages/${passageId}`, {
      withCredentials: true,
    });
    return data;
  },

  // 6. Get passage for student practice
  getPassageForPractice: async (passageId: string): Promise<ApiResponse<ReadingPassage>> => {
    const { data } = await instance.get(`/reading/passages/${passageId}/practice`, {
      withCredentials: true,
    });
    return data;
  },
};

// ======================== QUESTION ENDPOINTS ========================
export const questionAPI = {
  // 7. Get all questions for a passage
  getQuestionsByPassage: async (passageId: string): Promise<ApiResponse<Question[]>> => {
    const { data } = await instance.get(`/reading/passages/${passageId}/questions`, {
      withCredentials: true,
    });
    return data;
  },

  // 8. Create a new question
  createQuestion: async (questionData: CreateQuestionRequest): Promise<ApiResponse<Question>> => {
    const { data } = await instance.post('/reading/questions', questionData, {
      withCredentials: true,
    });
    return data;
  },

  // 9. Update a question
  updateQuestion: async (
    questionId: string,
    questionData: UpdateQuestionRequest
  ): Promise<ApiResponse<Question>> => {
    const { data } = await instance.put(`/reading/questions/${questionId}`, questionData, {
      withCredentials: true,
    });
    return data;
  },
  // 10. Delete a question
  deleteQuestion: async (questionId: string): Promise<ApiResponse<null>> => {
    const { data } = await instance.delete(`/reading/questions/${questionId}`, {
      withCredentials: true,
    });
    return data;
  },

  // 11. Get a single question
  getQuestion: async (questionId: string): Promise<ApiResponse<Question>> => {
    const { data } = await instance.get(`/reading/questions/${questionId}`, {
      withCredentials: true,
    });
    return data;
  },

  // 12. Bulk create questions
  bulkCreateQuestions: async (
    passageId: string,
    questions: CreateQuestionRequest[]
  ): Promise<ApiResponse<Question[]>> => {
    const { data } = await instance.post(
      `/reading/passages/${passageId}/questions/bulk`,
      {
        questions,
      },
      {
        withCredentials: true,
      }
    );
    return data;
  },

  // 13. Reorder questions
  reorderQuestions: async (
    passageId: string,
    questionOrders: { question_id: string; question_order: number }[]
  ): Promise<ApiResponse<null>> => {
    const { data } = await instance.put(
      `/reading/passages/${passageId}/questions/reorder`,
      {
        question_orders: questionOrders,
      },
      {
        withCredentials: true,
      }
    );
    return data;
  },
};

// ======================== CHOICE ENDPOINTS ========================
export const choiceAPI = {
  // 14. Get all choices for a question
  getChoicesByQuestion: async (questionId: string): Promise<ApiResponse<Choice[]>> => {
    const { data } = await instance.get(`/reading/questions/${questionId}/choices`, {
      withCredentials: true,
    });
    return data;
  },

  // 15. Create a new choice
  createChoice: async (choiceData: CreateChoiceRequest): Promise<ApiResponse<Choice>> => {
    const { data } = await instance.post('/reading/choices', choiceData, {
      withCredentials: true,
    });
    return data;
  },

  // 16. Update a choice
  updateChoice: async (
    choiceId: string,
    choiceData: UpdateChoiceRequest
  ): Promise<ApiResponse<Choice>> => {
    const { data } = await instance.put(`/reading/choices/${choiceId}`, choiceData, {
      withCredentials: true,
    });
    return data;
  },

  // 17. Delete a choice
  deleteChoice: async (choiceId: string): Promise<ApiResponse<null>> => {
    const { data } = await instance.delete(`/reading/choices/${choiceId}`, {
      withCredentials: true,
    });
    return data;
  },

  // 18. Bulk create choices
  bulkCreateChoices: async (
    questionId: string,
    choices: CreateChoiceRequest[]
  ): Promise<ApiResponse<Choice[]>> => {
    const { data } = await instance.post(
      `/reading/questions/${questionId}/choices/bulk`,
      {
        choices,
      },
      {
        withCredentials: true,
      }
    );
    return data;
  },
};

// ======================== DRAG ITEM ENDPOINTS ========================
export const dragItemAPI = {
  // 19. Get all drag items for a question
  getDragItemsByQuestion: async (questionId: string): Promise<ApiResponse<DragItem[]>> => {
    const { data } = await instance.get(`/reading/questions/${questionId}/drag-items`, {
      withCredentials: true,
    });
    return data;
  },

  // 20. Create a new drag item
  createDragItem: async (dragItemData: CreateDragItemRequest): Promise<ApiResponse<DragItem>> => {
    const { data } = await instance.post('/reading/drag-items', dragItemData, {
      withCredentials: true,
    });
    return data;
  },

  // 21. Update a drag item
  updateDragItem: async (
    dragItemId: string,
    dragItemData: UpdateDragItemRequest
  ): Promise<ApiResponse<DragItem>> => {
    const { data } = await instance.put(`/reading/drag-items/${dragItemId}`, dragItemData, {
      withCredentials: true,
    });
    return data;
  },
  // 22. Delete a drag item
  deleteDragItem: async (dragItemId: string): Promise<ApiResponse<null>> => {
    const { data } = await instance.delete(`/reading/drag-items/${dragItemId}`, {
      withCredentials: true,
    });
    return data;
  },

  // 23. Bulk create drag items
  bulkCreateDragItems: async (
    questionId: string,
    dragItems: CreateDragItemRequest[]
  ): Promise<ApiResponse<DragItem[]>> => {
    const { data } = await instance.post(
      `/reading/questions/${questionId}/drag-items/bulk`,
      {
        drag_items: dragItems,
      },
      {
        withCredentials: true,
      }
    );
    return data;
  },
};

// ======================== ATTEMPT & SUBMISSION ENDPOINTS ========================
export const attemptAPI = {
  // 24. Submit attempt (create submission with attempts)
  submitAttempt: async (
    submissionData: CreateSubmissionRequest
  ): Promise<ApiResponse<AttemptSubmission>> => {
    const { data } = await instance.post('/reading/attempts/submit', submissionData, {
      withCredentials: true,
    });
    return data;
  },

  // 25. Get attempt results for a user and passage
  getAttemptResults: async (
    userId: string,
    passageId: string
  ): Promise<ApiResponse<AttemptSubmission[]>> => {
    const { data } = await instance.get(
      `/reading/attempts/results?user_id=${userId}&passage_id=${passageId}`,
      {
        withCredentials: true,
      }
    );
    return data;
  },

  // Additional useful endpoints for attempt management
  getUserAttempts: async (userId: string): Promise<ApiResponse<AttemptSubmission[]>> => {
    const { data } = await instance.get(`/reading/attempts/user/${userId}`, {
      withCredentials: true,
    });
    return data;
  },

  getPassageAttempts: async (passageId: string): Promise<ApiResponse<AttemptSubmission[]>> => {
    const { data } = await instance.get(`/reading/attempts/passage/${passageId}`, {
      withCredentials: true,
    });
    return data;
  },
};
