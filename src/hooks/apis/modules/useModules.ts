import {
  ModuleCreateRequest,
  ModuleCreateResponse,
  ModuleListResponse,
  createModule,
  getModuleById,
  getMyModules,
  updateModule,
} from '@/lib/api/modules';
import { useState } from 'react';
import { toast } from 'sonner';

export const useModules = () => {
  const [isLoading, setIsLoading] = useState<{
    createModule: boolean;
    getMyModules: boolean;
    getModuleById?: boolean;
    updateModule?: boolean;
  }>({
    createModule: false,
    getMyModules: false,
    getModuleById: false,
    updateModule: false,
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

  return {
    createModule: createModuleFn,
    getMyModules: getMyModulesFn,
    getModuleById: getModuleByIdFn,
    updateModule: updateModuleFn,
    isLoading,
    error,
  };
};
