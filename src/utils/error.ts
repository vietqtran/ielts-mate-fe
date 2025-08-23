import { AxiosError } from 'axios';

export const extractAxiosErrorData = (error: unknown, defaultMessage?: string) => {
  if (error instanceof AxiosError) {
    const axiosError = error as AxiosError<{ message: string; error_code: string }>;
    if (axiosError.isAxiosError && axiosError.response) {
      const status = axiosError.response.status ?? 0;
      const isClientError = status >= 400 && status < 500;
      return {
        message: isClientError
          ? axiosError.response.data.message ||
            defaultMessage ||
            'Request failed. Please try again.'
          : defaultMessage || 'Something went wrong. Please try again.',
        error_code: axiosError.response.data.error_code || 'UNKNOWN_ERROR',
        name: axiosError.name,
      };
    }
  }

  return {
    message: defaultMessage ?? 'Something went wrong. Please try again.',
    error_code: 'UNKNOWN_ERROR',
    name: 'UnknownError',
  };
};
