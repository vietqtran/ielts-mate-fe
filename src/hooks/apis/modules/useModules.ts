import {
  ModuleCreateRequest,
  ModuleCreateResponse,
  ModuleListResponse,
  createModule,
  getMyModules,
} from '@/lib/api/modules';
import { useState } from 'react';
import { toast } from 'sonner';

export const useModules = () => {
  const [isLoading, setIsLoading] = useState<{
    createModule: boolean;
    getMyModules: boolean;
  }>({
    createModule: false,
    getMyModules: false,
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
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading((prev) => ({ ...prev, getMyModules: false }));
    }
  };

  return {
    createModule: createModuleFn,
    getMyModules: getMyModulesFn,
    isLoading,
    error,
  };
};
