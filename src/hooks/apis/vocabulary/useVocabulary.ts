import {
  VocabularyCreateRequest,
  VocabularyCreateResponse,
  VocabularyDeleteResponse,
  VocabularyListParams,
  VocabularyListResponse,
  VocabularyResponse,
  VocabularyUpdateRequest,
  createVocabulary,
  deleteVocabulary,
  getMyVocabulary,
  updateVocabulary,
} from '@/lib/api/vocabulary';
import { useState } from 'react';
import { toast } from 'sonner';

export const useVocabulary = () => {
  const [isLoading, setIsLoading] = useState<{
    createVocabulary: boolean;
    getMyVocabulary: boolean;
    deleteVocabulary: boolean;
    updateVocabulary: boolean;
  }>({
    createVocabulary: false,
    getMyVocabulary: false,
    deleteVocabulary: false,
    updateVocabulary: false,
  });

  const [error, setError] = useState<string | null>(null);

  const createVocabularyFn = async (
    data: VocabularyCreateRequest
  ): Promise<VocabularyCreateResponse | null> => {
    setIsLoading((prev) => ({ ...prev, createVocabulary: true }));
    setError(null);

    try {
      const response = await createVocabulary(data);
      toast.success('Vocabulary created successfully');
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create vocabulary';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading((prev) => ({ ...prev, createVocabulary: false }));
    }
  };

  const getMyVocabularyFn = async (
    params: VocabularyListParams = {}
  ): Promise<VocabularyListResponse | null> => {
    setIsLoading((prev) => ({ ...prev, getMyVocabulary: true }));
    setError(null);

    try {
      const response = await getMyVocabulary(params);
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch vocabulary';
      setError(errorMessage);
      // toast.error(errorMessage); // Removed toast for GET
      return null;
    } finally {
      setIsLoading((prev) => ({ ...prev, getMyVocabulary: false }));
    }
  };

  const updateVocabularyFn = async (
    vocabularyId: string,
    data: VocabularyUpdateRequest
  ): Promise<VocabularyResponse | null> => {
    setIsLoading((prev) => ({ ...prev, updateVocabulary: true }));
    setError(null);

    try {
      const response = await updateVocabulary(vocabularyId, data);
      toast.success('Vocabulary updated successfully');
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update vocabulary';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading((prev) => ({ ...prev, updateVocabulary: false }));
    }
  };

  const deleteVocabularyFn = async (
    vocabularyId: string
  ): Promise<VocabularyDeleteResponse | null> => {
    setIsLoading((prev) => ({ ...prev, deleteVocabulary: true }));
    setError(null);

    try {
      const response = await deleteVocabulary(vocabularyId);
      toast.success('Vocabulary deleted successfully');
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete vocabulary';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading((prev) => ({ ...prev, deleteVocabulary: false }));
    }
  };

  return {
    createVocabulary: createVocabularyFn,
    getMyVocabulary: getMyVocabularyFn,
    updateVocabulary: updateVocabularyFn,
    deleteVocabulary: deleteVocabularyFn,
    isLoading,
    error,
  };
};
