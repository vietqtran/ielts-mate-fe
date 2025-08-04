import {
  BaseResponse,
  ModuleCreateRequest,
  ModuleCreateResponse,
  ModuleListResponse,
  ModuleProgressRequest,
  ModuleProgressResponse,
  ModuleUserListResponse,
  ShareModuleRequest,
  createModule,
  getModuleById,
  getModuleProgress,
  getMyModules,
  getMyRequestedModules,
  getMySharedModules,
  getSharedModuleRequests,
  shareModule,
  updateModule,
  updateModuleProgress,
  updateSharedModuleRequest,
} from '@/lib/api/modules';
import { useState } from 'react';
import { toast } from 'sonner';

export const useModules = () => {
  const [isLoading, setIsLoading] = useState<{
    createModule: boolean;
    getMyModules: boolean;
    getModuleById?: boolean;
    updateModule?: boolean;
    shareModule?: boolean;
    getMySharedModules?: boolean;
    getSharedModuleRequests?: boolean;
    updateSharedModuleRequest?: boolean;
    getMyRequestedModules?: boolean;
    getModuleProgress?: boolean;
    updateModuleProgress?: boolean;
  }>({
    createModule: false,
    getMyModules: false,
    getModuleById: false,
    updateModule: false,
    shareModule: false,
    getMySharedModules: false,
    getSharedModuleRequests: false,
    updateSharedModuleRequest: false,
    getMyRequestedModules: false,
    getModuleProgress: false,
    updateModuleProgress: false,
  });

  const [error, setError] = useState<string | null>(null);

  const createModuleFn = async (
    data: ModuleCreateRequest
  ): Promise<ModuleCreateResponse | null> => {
    setIsLoading((prev) => ({ ...prev, createModule: true }));
    setError(null);

    try {
      const response = await createModule(data);
      toast.success('Module created successfully');
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create module';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading((prev) => ({ ...prev, createModule: false }));
    }
  };

  const getMyModulesFn = async (): Promise<ModuleListResponse | null> => {
    setIsLoading((prev) => ({ ...prev, getMyModules: true }));
    setError(null);

    try {
      const response = await getMyModules();
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch modules';
      setError(errorMessage);
      // toast.error(errorMessage); // Removed toast for GET
      return null;
    } finally {
      setIsLoading((prev) => ({ ...prev, getMyModules: false }));
    }
  };

  const getModuleByIdFn = async (id: string): Promise<ModuleCreateResponse | null> => {
    setIsLoading((prev) => ({ ...prev, getModuleById: true }));
    setError(null);
    try {
      const response = await getModuleById(id);
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch module';
      setError(errorMessage);
      // toast.error(errorMessage); // Removed toast for GET
      return null;
    } finally {
      setIsLoading((prev) => ({ ...prev, getModuleById: false }));
    }
  };

  const updateModuleFn = async (
    id: string,
    data: ModuleCreateRequest
  ): Promise<ModuleCreateResponse | null> => {
    setIsLoading((prev) => ({ ...prev, updateModule: true }));
    setError(null);
    try {
      const response = await updateModule(id, data);
      toast.success('Module updated successfully');
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update module';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading((prev) => ({ ...prev, updateModule: false }));
    }
  };

  // Sharing functions
  const shareModuleFn = async (
    moduleId: string,
    data: ShareModuleRequest
  ): Promise<BaseResponse<void> | null> => {
    setIsLoading((prev) => ({ ...prev, shareModule: true }));
    setError(null);

    try {
      const response = await shareModule(moduleId, data);
      toast.success('Module shared successfully');
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to share module';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading((prev) => ({ ...prev, shareModule: false }));
    }
  };

  const getMySharedModulesFn = async (
    page: number = 1,
    size: number = 10,
    sortBy: string = 'createdAt',
    sortDirection: string = 'desc',
    keyword?: string
  ): Promise<ModuleUserListResponse | null> => {
    setIsLoading((prev) => ({ ...prev, getMySharedModules: true }));
    setError(null);

    try {
      const response = await getMySharedModules(page, size, sortBy, sortDirection, keyword);
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch shared modules';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading((prev) => ({ ...prev, getMySharedModules: false }));
    }
  };

  const getSharedModuleRequestsFn = async (
    page: number = 1,
    size: number = 10,
    sortBy: string = 'createdAt',
    sortDirection: string = 'desc',
    keyword?: string
  ): Promise<ModuleUserListResponse | null> => {
    setIsLoading((prev) => ({ ...prev, getSharedModuleRequests: true }));
    setError(null);

    try {
      const response = await getSharedModuleRequests(page, size, sortBy, sortDirection, keyword);
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch sharing requests';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading((prev) => ({ ...prev, getSharedModuleRequests: false }));
    }
  };

  const updateSharedModuleRequestFn = async (
    moduleId: string,
    status: number
  ): Promise<BaseResponse<void> | null> => {
    setIsLoading((prev) => ({ ...prev, updateSharedModuleRequest: true }));
    setError(null);

    try {
      const response = await updateSharedModuleRequest(moduleId, status);
      const message = status === 1 ? 'Module request accepted' : 'Module request denied';
      toast.success(message);
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update sharing request';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading((prev) => ({ ...prev, updateSharedModuleRequest: false }));
    }
  };

  const getMyRequestedModulesFn = async (
    page: number = 1,
    size: number = 10,
    sortBy: string = 'createdAt',
    sortDirection: string = 'desc',
    keyword?: string
  ): Promise<ModuleUserListResponse | null> => {
    setIsLoading((prev) => ({ ...prev, getMyRequestedModules: true }));
    setError(null);

    try {
      const response = await getMyRequestedModules(page, size, sortBy, sortDirection, keyword);
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch requested modules';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading((prev) => ({ ...prev, getMyRequestedModules: false }));
    }
  };

  const getModuleProgressFn = async (
    moduleId: string
  ): Promise<BaseResponse<ModuleProgressResponse> | null> => {
    setIsLoading((prev) => ({ ...prev, getModuleProgress: true }));
    setError(null);

    try {
      const response = await getModuleProgress(moduleId);
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch module progress';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading((prev) => ({ ...prev, getModuleProgress: false }));
    }
  };

  const updateModuleProgressFn = async (
    moduleId: string,
    data: ModuleProgressRequest
  ): Promise<BaseResponse<string> | null> => {
    setIsLoading((prev) => ({ ...prev, updateModuleProgress: true }));
    setError(null);

    try {
      const response = await updateModuleProgress(moduleId, data);
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update module progress';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading((prev) => ({ ...prev, updateModuleProgress: false }));
    }
  };

  return {
    createModule: createModuleFn,
    getMyModules: getMyModulesFn,
    getModuleById: getModuleByIdFn,
    updateModule: updateModuleFn,
    shareModule: shareModuleFn,
    getMySharedModules: getMySharedModulesFn,
    getSharedModuleRequests: getSharedModuleRequestsFn,
    updateSharedModuleRequest: updateSharedModuleRequestFn,
    getMyRequestedModules: getMyRequestedModulesFn,
    getModuleProgress: getModuleProgressFn,
    updateModuleProgress: updateModuleProgressFn,
    isLoading,
    error,
  };
};
