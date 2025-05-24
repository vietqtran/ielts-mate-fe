import { AxiosError } from 'axios';

export const extractAxiosErrorData = (error: unknown, defaultMessage?: string) => {
  if (error instanceof AxiosError) {
    const axiosError = error as AxiosError<{ message: string; error_code: string }>;
    if (axiosError.isAxiosError && axiosError.response) {
      return {
        message: axiosError.response.data.message || 'An error occurred',
        error_code: axiosError.response.data.error_code || 'UNKNOWN_ERROR',
        name: axiosError.name,
      };
    }
  }

  return {
    message: defaultMessage ?? 'An unexpected error occurred',
    error_code: 'UNKNOWN_ERROR',
    name: 'UnknownError',
  };
};
