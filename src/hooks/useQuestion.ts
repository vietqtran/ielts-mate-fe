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
} from '@/types/reading.types';

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

  // Create questions for a group
  const createQuestions = async (group_id: string, questions: QuestionCreationRequest[]) => {
    setLoadingState('createQuestions', true);
    setErrorState('createQuestions', null);

    try {
      const { data } = await instance.post(`/reading/groups/${group_id}/questions`, questions);
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
    orderRequest: { question_order: number }
  ) => {
    setLoadingState('updateQuestionOrder', true);
    setErrorState('updateQuestionOrder', null);

    try {
      const { data } = await instance.put(
        `/reading/groups/${group_id}/questions/${question_id}/order`,
        orderRequest
      );
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
    infoRequest: Partial<QuestionCreationRequest>
  ) => {
    setLoadingState('updateQuestionInfo', true);
    setErrorState('updateQuestionInfo', null);

    try {
      const { data } = await instance.put(
        `/reading/groups/${group_id}/questions/${question_id}/info`,
        infoRequest
      );
      return data as BaseResponse<QuestionCreationResponse>;
    } catch (error) {
      setErrorState('updateQuestionInfo', error as Error);
      throw error;
    } finally {
      setLoadingState('updateQuestionInfo', false);
    }
  };

  // Delete question
  const deleteQuestion = async (group_id: string, question_id: string) => {
    setLoadingState('deleteQuestion', true);
    setErrorState('deleteQuestion', null);

    try {
      const { data } = await instance.delete(
        `/reading/groups/${group_id}/questions/${question_id}`
      );
      return data as BaseResponse<void>;
    } catch (error) {
      setErrorState('deleteQuestion', error as Error);
      throw error;
    } finally {
      setLoadingState('deleteQuestion', false);
    }
  };

  // Get choices by question ID
  const getChoicesByQuestionId = async (question_id: string) => {
    setLoadingState('getChoicesByQuestionId', true);
    setErrorState('getChoicesByQuestionId', null);

    try {
      const { data } = await instance.get(`/reading/questions/${question_id}/choices`);
      return data as BaseResponse<QuestionCreationResponse['choices']>;
    } catch (error) {
      setErrorState('getChoicesByQuestionId', error as Error);
      throw error;
    } finally {
      setLoadingState('getChoicesByQuestionId', false);
    }
  };

  // Create choice for question
  const createChoice = async (question_id: string, choice: ChoiceRequest) => {
    setLoadingState('createChoice', true);
    setErrorState('createChoice', null);

    try {
      const { data } = await instance.post(`/reading/questions/${question_id}/choices`, choice);
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
    choice: Partial<ChoiceRequest>
  ) => {
    setLoadingState('updateChoice', true);
    setErrorState('updateChoice', null);

    try {
      const { data } = await instance.put(
        `/reading/questions/${question_id}/choices/${choice_id}`,
        choice
      );
      return data as BaseResponse<QuestionCreationResponse['choices']>;
    } catch (error) {
      setErrorState('updateChoice', error as Error);
      throw error;
    } finally {
      setLoadingState('updateChoice', false);
    }
  };

  // Delete choice
  const deleteChoice = async (question_id: string, choice_id: string) => {
    setLoadingState('deleteChoice', true);
    setErrorState('deleteChoice', null);

    try {
      const { data } = await instance.delete(
        `/reading/questions/${question_id}/choices/${choice_id}`
      );
      return data as BaseResponse<void>;
    } catch (error) {
      setErrorState('deleteChoice', error as Error);
      throw error;
    } finally {
      setLoadingState('deleteChoice', false);
    }
  };

  // Create drag item for group
  const createDragItem = async (group_id: string, dragItem: CreateDragItemRequest) => {
    setLoadingState('createDragItem', true);
    setErrorState('createDragItem', null);

    try {
      const { data } = await instance.post(`/reading/groups/${group_id}/items`, dragItem);
      return data as BaseResponse<DragItemResponse>;
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
    dragItem: UpdateDragItemRequest
  ) => {
    setLoadingState('updateDragItem', true);
    setErrorState('updateDragItem', null);

    try {
      const { data } = await instance.put(`/reading/groups/${group_id}/items/${itemId}`, dragItem);
      return data as BaseResponse<DragItemResponse>;
    } catch (error) {
      setErrorState('updateDragItem', error as Error);
      throw error;
    } finally {
      setLoadingState('updateDragItem', false);
    }
  };

  // Delete drag item
  const deleteDragItem = async (group_id: string, itemId: string) => {
    setLoadingState('deleteDragItem', true);
    setErrorState('deleteDragItem', null);

    try {
      const { data } = await instance.delete(`/reading/groups/${group_id}/items/${itemId}`);
      return data as BaseResponse<void>;
    } catch (error) {
      setErrorState('deleteDragItem', error as Error);
      throw error;
    } finally {
      setLoadingState('deleteDragItem', false);
    }
  };

  // Get drag item by ID
  const getDragItemById = async (group_id: string, itemId: string) => {
    setLoadingState('getDragItemById', true);
    setErrorState('getDragItemById', null);

    try {
      const { data } = await instance.get(`/reading/groups/${group_id}/items/${itemId}`);
      return data as BaseResponse<DragItemResponse>;
    } catch (error) {
      setErrorState('getDragItemById', error as Error);
      throw error;
    } finally {
      setLoadingState('getDragItemById', false);
    }
  };

  // Get all drag items by group ID
  const getAllDragItemsByGroup = async (group_id: string) => {
    setLoadingState('getAllDragItemsByGroup', true);
    setErrorState('getAllDragItemsByGroup', null);

    try {
      const { data } = await instance.get(`/reading/groups/${group_id}/items`);
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
