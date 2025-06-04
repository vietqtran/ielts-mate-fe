import { ApiResponse, ReadingPassage } from '@/types/reading-passage.types';

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

export const readingPassageAPI = {
  // Get list of reading passages
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

  // Create a new reading passage
  createPassage: async (
    passageData: CreatePassageRequest
  ): Promise<ApiResponse<ReadingPassage>> => {
    const { data } = await instance.post('/reading/passages', passageData, {
      withCredentials: true,
    });
    return data;
  },

  // Update an existing reading passage
  updatePassage: async (
    passageId: string,
    passageData: UpdatePassageRequest
  ): Promise<ApiResponse<ReadingPassage>> => {
    const { data } = await instance.put(`/reading/passages/${passageId}`, passageData, {
      withCredentials: true,
    });
    return data;
  },

  // Delete a reading passage
  deletePassage: async (passageId: string): Promise<ApiResponse<any>> => {
    const { data } = await instance.delete(`/reading/passages/${passageId}`, {
      withCredentials: true,
    });
    return data;
  },

  // Get a single reading passage
  getPassage: async (passageId: string): Promise<ApiResponse<ReadingPassage>> => {
    const { data } = await instance.get(`/reading/passages/${passageId}`, {
      withCredentials: true,
    });
    return data;
  },
};
