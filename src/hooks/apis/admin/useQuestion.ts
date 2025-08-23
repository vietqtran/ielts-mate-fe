'use client';

import {
  BaseResponse,
  ChoiceRequest,
  CreateDragItemRequest,
  DragItemListResponse,
  DragItemResponse,
  QuestionCreationRequest,
  QuestionCreationResponse,
  UpdateDragItemRequest,
} from '@/types/reading/reading.types';

import instance from '@/lib/axios';
import { useState } from 'react';

export function useQuestion() {
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<Record<string, Error | null>>({});

  const setLoadingState = (key: string, value: boolean) => {
    setIsLoading((prev) => ({ ...prev, [key]: value }));
  };

  const setErrorState = (key: string, value: Error | null) => {
    setError((prev) => ({ ...prev, [key]: value }));
  };

  // Helper: xác định group_id là của listening hay reading (ví dụ: truyền thêm isListening hoặc prefix group_id)
  function isListeningGroup(group_id: string) {
    // Nếu group_id có prefix đặc biệt hoặc truyền thêm flag, có thể sửa lại logic này
    // Ở đây giả sử group_id là UUID, ta cần truyền thêm isListening vào các hàm
    return false; // Mặc định là reading, sẽ sửa lại ở các hàm bên dưới
  }

  // Create questions for a group
  const createQuestions = async (
    group_id: string,
    questions: QuestionCreationRequest[],
    isListening = false
  ) => {
    setLoadingState('createQuestions', true);
    setErrorState('createQuestions', null);

    try {
      const endpoint = isListening
        ? `/listening/groups/${group_id}/questions`
        : `/reading/groups/${group_id}/questions`;
      const { data } = await instance.post(endpoint, questions);
      return data as BaseResponse<QuestionCreationResponse[]>;
    } catch (error) {
      setErrorState('createQuestions', error as Error);
      throw error;
    } finally {
      setLoadingState('createQuestions', false);
    }
  };

  // Update question order
  const updateQuestionOrder = async (
    group_id: string,
    question_id: string,
    orderRequest: { order: number },
    isListening = false
  ) => {
    setLoadingState('updateQuestionOrder', true);
    setErrorState('updateQuestionOrder', null);

    try {
      const endpoint = isListening
        ? `/listening/groups/${group_id}/questions/${question_id}/order`
        : `/reading/groups/${group_id}/questions/${question_id}/order`;
      const { data } = await instance.put(endpoint, orderRequest);
      return data as BaseResponse<QuestionCreationResponse>;
    } catch (error) {
      setErrorState('updateQuestionOrder', error as Error);
      throw error;
    } finally {
      setLoadingState('updateQuestionOrder', false);
    }
  };

  // Update question information
  const updateQuestionInfo = async (
    group_id: string,
    question_id: string,
    infoRequest: Partial<QuestionCreationRequest>,
    isListening = false
  ) => {
    setLoadingState('updateQuestionInfo', true);
    setErrorState('updateQuestionInfo', null);

    try {
      const endpoint = isListening
        ? `/listening/groups/${group_id}/questions/${question_id}/info`
        : `/reading/groups/${group_id}/questions/${question_id}/info`;
      const { data } = await instance.put(endpoint, infoRequest);
      return data as BaseResponse<QuestionCreationResponse>;
    } catch (error) {
      setErrorState('updateQuestionInfo', error as Error);
      throw error;
    } finally {
      setLoadingState('updateQuestionInfo', false);
    }
  };

  // Delete question
  const deleteQuestion = async (group_id: string, question_id: string, isListening = false) => {
    setLoadingState('deleteQuestion', true);
    setErrorState('deleteQuestion', null);

    try {
      const endpoint = isListening
        ? `/listening/groups/${group_id}/questions/${question_id}`
        : `/reading/groups/${group_id}/questions/${question_id}`;
      const { data } = await instance.delete(endpoint);
      return data as BaseResponse<void>;
    } catch (error) {
      setErrorState('deleteQuestion', error as Error);
      throw error;
    } finally {
      setLoadingState('deleteQuestion', false);
    }
  };

  // Get choices by question ID
  const getChoicesByQuestionId = async (question_id: string, isListening = false) => {
    setLoadingState('getChoicesByQuestionId', true);
    setErrorState('getChoicesByQuestionId', null);

    try {
      const endpoint = isListening
        ? `/listening/questions/${question_id}/choices`
        : `/reading/questions/${question_id}/choices`;
      const { data } = await instance.get(endpoint);
      return data as BaseResponse<QuestionCreationResponse['choices']>;
    } catch (error) {
      setErrorState('getChoicesByQuestionId', error as Error);
      throw error;
    } finally {
      setLoadingState('getChoicesByQuestionId', false);
    }
  };

  // Create choice for question
  const createChoice = async (question_id: string, choice: ChoiceRequest, isListening = false) => {
    setLoadingState('createChoice', true);
    setErrorState('createChoice', null);

    try {
      const endpoint = isListening
        ? `/listening/questions/${question_id}/choices`
        : `/reading/questions/${question_id}/choices`;
      const { data } = await instance.post(endpoint, choice);
      return data as BaseResponse<QuestionCreationResponse['choices']>;
    } catch (error) {
      setErrorState('createChoice', error as Error);
      throw error;
    } finally {
      setLoadingState('createChoice', false);
    }
  };

  // Update choice
  const updateChoice = async (
    question_id: string,
    choice_id: string,
    choice: Partial<ChoiceRequest>,
    isListening = false
  ) => {
    setLoadingState('updateChoice', true);
    setErrorState('updateChoice', null);

    try {
      const endpoint = isListening
        ? `/listening/questions/${question_id}/choices/${choice_id}`
        : `/reading/questions/${question_id}/choices/${choice_id}`;
      const { data } = await instance.put(endpoint, choice);
      return data as BaseResponse<QuestionCreationResponse['choices']>;
    } catch (error) {
      setErrorState('updateChoice', error as Error);
      throw error;
    } finally {
      setLoadingState('updateChoice', false);
    }
  };

  // Delete choice
  const deleteChoice = async (question_id: string, choice_id: string, isListening = false) => {
    setLoadingState('deleteChoice', true);
    setErrorState('deleteChoice', null);

    try {
      const endpoint = isListening
        ? `/listening/questions/${question_id}/choices/${choice_id}`
        : `/reading/questions/${question_id}/choices/${choice_id}`;
      const { data } = await instance.delete(endpoint);
      return data as BaseResponse<void>;
    } catch (error) {
      setErrorState('deleteChoice', error as Error);
      throw error;
    } finally {
      setLoadingState('deleteChoice', false);
    }
  };

  // Create drag items for group
  const createDragItem = async (
    group_id: string,
    dragItems: CreateDragItemRequest,
    isListening = false
  ) => {
    setLoadingState('createDragItem', true);
    setErrorState('createDragItem', null);

    try {
      const endpoint = isListening
        ? `/listening/groups/${group_id}/items`
        : `/reading/groups/${group_id}/items`;
      const { data } = await instance.post(endpoint, dragItems);
      return data as BaseResponse<DragItemResponse[]>; // Now returns an array of items
    } catch (error) {
      setErrorState('createDragItem', error as Error);
      throw error;
    } finally {
      setLoadingState('createDragItem', false);
    }
  };

  // Update drag item
  const updateDragItem = async (
    group_id: string,
    itemId: string,
    dragItem: UpdateDragItemRequest,
    isListening = false
  ) => {
    setLoadingState('updateDragItem', true);
    setErrorState('updateDragItem', null);

    try {
      const endpoint = isListening
        ? `/listening/groups/${group_id}/items/${itemId}`
        : `/reading/groups/${group_id}/items/${itemId}`;
      const { data } = await instance.put(endpoint, dragItem);
      return data as BaseResponse<DragItemResponse>;
    } catch (error) {
      setErrorState('updateDragItem', error as Error);
      throw error;
    } finally {
      setLoadingState('updateDragItem', false);
    }
  };

  // Delete drag item
  const deleteDragItem = async (group_id: string, itemId: string, isListening = false) => {
    setLoadingState('deleteDragItem', true);
    setErrorState('deleteDragItem', null);

    try {
      const endpoint = isListening
        ? `/listening/groups/${group_id}/items/${itemId}`
        : `/reading/groups/${group_id}/items/${itemId}`;
      const { data } = await instance.delete(endpoint);
      return data as BaseResponse<void>;
    } catch (error) {
      setErrorState('deleteDragItem', error as Error);
      throw error;
    } finally {
      setLoadingState('deleteDragItem', false);
    }
  };

  // Get drag item by ID
  const getDragItemById = async (group_id: string, itemId: string, isListening = false) => {
    setLoadingState('getDragItemById', true);
    setErrorState('getDragItemById', null);

    try {
      const endpoint = isListening
        ? `/listening/groups/${group_id}/items/${itemId}`
        : `/reading/groups/${group_id}/items/${itemId}`;
      const { data } = await instance.get(endpoint);
      // Map the response to match our expected structure if needed
      return data as BaseResponse<DragItemResponse>;
    } catch (error) {
      setErrorState('getDragItemById', error as Error);
      throw error;
    } finally {
      setLoadingState('getDragItemById', false);
    }
  };

  // Get all drag items by group ID
  const getAllDragItemsByGroup = async (group_id: string, isListening = false) => {
    setLoadingState('getAllDragItemsByGroup', true);
    setErrorState('getAllDragItemsByGroup', null);

    try {
      const endpoint = isListening
        ? `/listening/groups/${group_id}/items`
        : `/reading/groups/${group_id}/items`;
      const { data } = await instance.get(endpoint);
      return data as BaseResponse<DragItemListResponse>;
    } catch (error) {
      setErrorState('getAllDragItemsByGroup', error as Error);
      throw error;
    } finally {
      setLoadingState('getAllDragItemsByGroup', false);
    }
  };

  return {
    createQuestions,
    updateQuestionOrder,
    updateQuestionInfo,
    deleteQuestion,
    getChoicesByQuestionId,
    createChoice,
    updateChoice,
    deleteChoice,
    createDragItem,
    updateDragItem,
    deleteDragItem,
    getDragItemById,
    getAllDragItemsByGroup,
    isLoading,
    error,
  };
}
