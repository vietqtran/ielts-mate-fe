'use client';

import {
  AddGroupQuestionRequest,
  AddGroupQuestionResponse,
  BaseResponse,
  ChoiceRequest,
  CreateDragItemRequest,
  DragItemListResponse,
  DragItemResponse,
  PassageCreationRequest,
  PassageDetailResponse,
  PassageGetResponse,
  QuestionCreationRequest,
  QuestionCreationResponse,
  UpdateDragItemRequest,
} from '@/types/reading.types';

import instance from '@/lib/axios';
import { useState } from 'react';

export function usePassage() {
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<Record<string, Error | null>>({});

  const setLoadingState = (key: string, value: boolean) => {
    setIsLoading(prev => ({ ...prev, [key]: value }));
  };

  const setErrorState = (key: string, value: Error | null) => {
    setError(prev => ({ ...prev, [key]: value }));
  };

  // Get active passages for public
  const getActivePassages = async (params?: {
    page?: number;
    size?: number;
    ieltsType?: number;
    partNumber?: number;
    questionCategory?: string;
  }) => {
    setLoadingState('getActivePassages', true);
    setErrorState('getActivePassages', null);

    try {
      const { data } = await instance.get('/reading/passages', { params });
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
    ieltsType?: number;
    status?: number;
    partNumber?: number;
    questionCategory?: string;
  }) => {
    setLoadingState('getPassagesForTeacher', true);
    setErrorState('getPassagesForTeacher', null);

    try {
      const { data } = await instance.get('/reading/passages/teacher', { params });
      return data as BaseResponse<PassageGetResponse[]>;
    } catch (error) {
      setErrorState('getPassagesForTeacher', error as Error);
      throw error;
    } finally {
      setLoadingState('getPassagesForTeacher', false);
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
        content_with_highlight_keywords: request.content_with_highlight_keywords || request.content || '',
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
  const updatePassage = async (passageId: string, request: PassageCreationRequest) => {
    setLoadingState('updatePassage', true);
    setErrorState('updatePassage', null);

    try {
      const { data } = await instance.put(`/reading/passages/${passageId}`, request);
      return data as BaseResponse<PassageDetailResponse>;
    } catch (error) {
      setErrorState('updatePassage', error as Error);
      throw error;
    } finally {
      setLoadingState('updatePassage', false);
    }
  };

  // Get passage by ID
  const getPassageById = async (passageId: string) => {
    setLoadingState('getPassageById', true);
    setErrorState('getPassageById', null);

    try {
      const { data } = await instance.get(`/reading/passages/${passageId}`);
      return data as BaseResponse<PassageDetailResponse>;
    } catch (error) {
      setErrorState('getPassageById', error as Error);
      throw error;
    } finally {
      setLoadingState('getPassageById', false);
    }
  };

  // Delete passage
  const deletePassage = async (passageId: string) => {
    setLoadingState('deletePassage', true);
    setErrorState('deletePassage', null);

    try {
      const { data } = await instance.delete(`/reading/passages/${passageId}`);
      return data as BaseResponse<void>;
    } catch (error) {
      setErrorState('deletePassage', error as Error);
      throw error;
    } finally {
      setLoadingState('deletePassage', false);
    }
  };

  // Add question group to passage
  const addGroupQuestion = async (passageId: string, request: AddGroupQuestionRequest) => {
    setLoadingState('addGroupQuestion', true);
    setErrorState('addGroupQuestion', null);

    try {
      const { data } = await instance.post(`/reading/passages/${passageId}/groups`, request);
      return data as BaseResponse<AddGroupQuestionResponse>;
    } catch (error) {
      setErrorState('addGroupQuestion', error as Error);
      throw error;
    } finally {
      setLoadingState('addGroupQuestion', false);
    }
  };

  // Get all question groups for passage
  const getAllQuestionGroups = async (passageId: string) => {
    setLoadingState('getAllQuestionGroups', true);
    setErrorState('getAllQuestionGroups', null);

    try {
      const { data } = await instance.get(`/reading/passages/${passageId}/groups`);
      return data as BaseResponse<AddGroupQuestionResponse[]>;
    } catch (error) {
      setErrorState('getAllQuestionGroups', error as Error);
      throw error;
    } finally {
      setLoadingState('getAllQuestionGroups', false);
    }
  };

  // Update question group
  const updateGroupQuestion = async (passageId: string, groupId: string, request: AddGroupQuestionRequest) => {
    setLoadingState('updateGroupQuestion', true);
    setErrorState('updateGroupQuestion', null);

    try {
      const { data } = await instance.put(`/reading/passages/${passageId}/groups/${groupId}`, request);
      return data as BaseResponse<AddGroupQuestionResponse>;
    } catch (error) {
      setErrorState('updateGroupQuestion', error as Error);
      throw error;
    } finally {
      setLoadingState('updateGroupQuestion', false);
    }
  };

  // Delete question group
  const deleteGroupQuestion = async (passageId: string, groupId: string) => {
    setLoadingState('deleteGroupQuestion', true);
    setErrorState('deleteGroupQuestion', null);

    try {
      const { data } = await instance.delete(`/reading/passages/${passageId}/groups/${groupId}`);
      return data as BaseResponse<void>;
    } catch (error) {
      setErrorState('deleteGroupQuestion', error as Error);
      throw error;
    } finally {
      setLoadingState('deleteGroupQuestion', false);
    }
  };

  // Get question group by ID
  const getGroupQuestionById = async (passageId: string, groupId: string) => {
    setLoadingState('getGroupQuestionById', true);
    setErrorState('getGroupQuestionById', null);

    try {
      const { data } = await instance.get(`/reading/passages/${passageId}/groups/${groupId}`);
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