'use client';

import {
  AddGroupQuestionRequest,
  AddGroupQuestionResponse,
  BaseResponse,
  PassageCreationRequest,
  PassageDetailResponse,
  PassageGetResponse,
} from '@/types/reading/reading.types';
import { useRef, useState } from 'react';

import { buildSWRKey, fetcher } from '@/lib/api/fetcher';
import instance from '@/lib/axios';
import { CommonPaginationResponseProperties } from '@/types/filter.types';
import { ReadingExamResponse } from '@/types/reading/reading-exam.types';
import useSWR from 'swr';

export function usePassage() {
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<Record<string, Error | null>>({});
  const abortControllerRef = useRef<AbortController | null>(null);

  const setLoadingState = (key: string, value: boolean) => {
    setIsLoading((prev) => ({ ...prev, [key]: value }));
  };

  const setErrorState = (key: string, value: Error | null) => {
    setError((prev) => ({ ...prev, [key]: value }));
  };

  // Get active passages for public
  const getActivePassages = async (params?: {
    page?: number;
    size?: number;
    ieltsType?: string[];
    partNumber?: string[];
    questionCategory?: string;
    title?: string;
    sortBy?: string;
    sortDirection?: string;
  }) => {
    setLoadingState('getActivePassages', true);
    setErrorState('getActivePassages', null);

    try {
      const { data } = await instance.get('/reading/passages', {
        params: {
          page: params?.page,
          size: params?.size,
          ieltsType: params?.ieltsType?.length ? params?.ieltsType?.join(',') : undefined,
          partNumber: params?.partNumber?.length ? params?.partNumber?.join(',') : undefined,
          title: params?.title,
        },
      });
      return data as BaseResponse<PassageGetResponse[]>;
    } catch (error) {
      setErrorState('getActivePassages', error as Error);
      throw error;
    } finally {
      setLoadingState('getActivePassages', false);
    }
  };

  // Get passages for teacher
  const getPassagesForTeacher = async (params?: {
    page?: number;
    size?: number;
    ielts_type?: number;
    status?: number;
    part_number?: number;
    questionCategory?: string;
    sortBy?: string;
    sortDirection?: string;
    title?: string;
    createdBy?: string;
  }) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const currentController = new AbortController();
    abortControllerRef.current = currentController;

    setLoadingState('getPassagesForTeacher', true);
    setErrorState('getPassagesForTeacher', null);

    try {
      const processedParams: any = {
        page: params?.page,
        size: params?.size,
        ieltsType: params?.ielts_type,
        partNumber: params?.part_number,
        status: params?.status,
        questionCategory: params?.questionCategory,
        sortBy: params?.sortBy,
        sortDirection: params?.sortDirection,
        title: params?.title,
        createdBy: params?.createdBy,
      };

      if (processedParams.ielts_type !== undefined) {
        processedParams.ieltsType = processedParams.ielts_type;
        delete processedParams.ielts_type;
      }

      if (processedParams.part_number !== undefined) {
        processedParams.partNumber = processedParams.part_number;
        delete processedParams.part_number;
      }

      const { data } = await instance.get('/reading/passages/teacher', {
        params: processedParams,
        signal: currentController.signal,
      });

      // Only return data if this is still the current request
      if (abortControllerRef.current === currentController) {
        return data as BaseResponse<PassageGetResponse[]>;
      }
    } catch (error) {
      // Only handle error if this is still the current request
      if (abortControllerRef.current === currentController) {
        if ((error as any).name !== 'AbortError') {
          setErrorState('getPassagesForTeacher', error as Error);
          throw error;
        }
      }
    } finally {
      // Only set loading to false if this is still the current request
      if (abortControllerRef.current === currentController) {
        setLoadingState('getPassagesForTeacher', false);
      }
    }
  };

  // Create new passage
  const createPassage = async (request: PassageCreationRequest) => {
    setLoadingState('createPassage', true);
    setErrorState('createPassage', null);

    try {
      // Ensure content_with_highlight_keywords has a default value
      const requestData = {
        ...request,
        content_with_highlight_keywords:
          request.content_with_highlight_keywords || request.content || '',
      };
      const { data } = await instance.post('/reading/passages', requestData);
      return data;
    } catch (error) {
      setErrorState('createPassage', error as Error);
      throw error;
    } finally {
      setLoadingState('createPassage', false);
    }
  };

  // Update passage
  const updatePassage = async (passage_id: string, request: PassageCreationRequest) => {
    setLoadingState('updatePassage', true);
    setErrorState('updatePassage', null);

    try {
      const { data } = await instance.put(`/reading/passages/${passage_id}`, request);
      return data as BaseResponse<PassageDetailResponse>;
    } catch (error) {
      setErrorState('updatePassage', error as Error);
      throw error;
    } finally {
      setLoadingState('updatePassage', false);
    }
  };

  // Get passage by ID
  const getPassageById = async (passage_id: string) => {
    setLoadingState('getPassageById', true);
    setErrorState('getPassageById', null);

    try {
      const { data } = await instance.get(`/reading/passages/${passage_id}`);
      return data as BaseResponse<PassageDetailResponse>;
    } catch (error) {
      setErrorState('getPassageById', error as Error);
      throw error;
    } finally {
      setLoadingState('getPassageById', false);
    }
  };

  // Delete passage
  const deletePassage = async (passage_id: string) => {
    setLoadingState('deletePassage', true);
    setErrorState('deletePassage', null);

    try {
      const { data } = await instance.delete(`/reading/passages/${passage_id}`);
      return data as BaseResponse<void>;
    } catch (error) {
      setErrorState('deletePassage', error as Error);
      throw error;
    } finally {
      setLoadingState('deletePassage', false);
    }
  };

  // Add question group to passage
  const addGroupQuestion = async (passage_id: string, request: AddGroupQuestionRequest) => {
    setLoadingState('addGroupQuestion', true);
    setErrorState('addGroupQuestion', null);

    try {
      const { data } = await instance.post(`/reading/passages/${passage_id}/groups`, request);
      return data as BaseResponse<AddGroupQuestionResponse>;
    } catch (error) {
      setErrorState('addGroupQuestion', error as Error);
      throw error;
    } finally {
      setLoadingState('addGroupQuestion', false);
    }
  };

  // Get all question groups for passage
  const getAllQuestionGroups = async (passage_id: string) => {
    setLoadingState('getAllQuestionGroups', true);
    setErrorState('getAllQuestionGroups', null);

    try {
      const { data } = await instance.get(`/reading/passages/${passage_id}/groups`);
      return data as BaseResponse<AddGroupQuestionResponse[]>;
    } catch (error) {
      setErrorState('getAllQuestionGroups', error as Error);
      throw error;
    } finally {
      setLoadingState('getAllQuestionGroups', false);
    }
  };

  // Update question group
  const updateGroupQuestion = async (
    passage_id: string,
    group_id: string,
    request: AddGroupQuestionRequest
  ) => {
    setLoadingState('updateGroupQuestion', true);
    setErrorState('updateGroupQuestion', null);

    try {
      const { data } = await instance.put(
        `/reading/passages/${passage_id}/groups/${group_id}`,
        request
      );
      return data as BaseResponse<AddGroupQuestionResponse>;
    } catch (error) {
      setErrorState('updateGroupQuestion', error as Error);
      throw error;
    } finally {
      setLoadingState('updateGroupQuestion', false);
    }
  };

  // Delete question group
  const deleteGroupQuestion = async (passage_id: string, group_id: string) => {
    setLoadingState('deleteGroupQuestion', true);
    setErrorState('deleteGroupQuestion', null);

    try {
      const { data } = await instance.delete(`/reading/passages/${passage_id}/groups/${group_id}`);
      return data as BaseResponse<void>;
    } catch (error) {
      setErrorState('deleteGroupQuestion', error as Error);
      throw error;
    } finally {
      setLoadingState('deleteGroupQuestion', false);
    }
  };

  // Get question group by ID
  const getGroupQuestionById = async (passage_id: string, group_id: string) => {
    setLoadingState('getGroupQuestionById', true);
    setErrorState('getGroupQuestionById', null);

    try {
      const { data } = await instance.get(`/reading/passages/${passage_id}/groups/${group_id}`);
      return data as BaseResponse<AddGroupQuestionResponse>;
    } catch (error) {
      setErrorState('getGroupQuestionById', error as Error);
      throw error;
    } finally {
      setLoadingState('getGroupQuestionById', false);
    }
  };

  return {
    getActivePassages,
    getPassagesForTeacher,
    createPassage,
    updatePassage,
    getPassageById,
    deletePassage,
    addGroupQuestion,
    getAllQuestionGroups,
    updateGroupQuestion,
    deleteGroupQuestion,
    getGroupQuestionById,
    isLoading,
    error,
  };
}

export const useGetReadingPassageCached = (params?: {
  page?: number;
  size?: number;
  ieltsType?: string[];
  partNumber?: string[];
  questionCategory?: string;
  title?: string;
  sortBy?: string;
  sortDirection?: string;
}) => {
  const endpoint = 'reading/passages';
  const key = buildSWRKey(endpoint, params);

  const { data, error, isLoading, mutate } = useSWR<{
    data: PassageGetResponse[];
    pagination: CommonPaginationResponseProperties;
  }>(key, fetcher);

  return { data, error, isLoading, mutate };
};

export const useGetReadingExamCached = (params?: {
  page?: number;
  size?: number;
  ieltsType?: string[];
  partNumber?: string[];
  questionCategory?: string;
  title?: string;
  sortBy?: string;
  sortDirection?: string;
}) => {
  const endpoint = 'reading/reading-exams/active-exams';
  const key = buildSWRKey(endpoint, params);

  const { data, error, isLoading, mutate } = useSWR<{
    data: ReadingExamResponse['data'][];
    pagination: CommonPaginationResponseProperties;
  }>(key, fetcher);

  return { data, error, isLoading, mutate };
};
