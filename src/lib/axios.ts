import { BaseResponse } from '@/types/reading.types';
import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  notify?: boolean; // Custom property to control notification behavior
  notifyError?: boolean; // Custom property to control error notification behavior
  notifySuccess?: boolean; // Custom property to control success notification behavior
}

/**
 * Custom Axios instance with response interceptors for notifications.
 *
 * This instance will show a toast notification on successful responses
 * and error responses unless the `notify` property in the request config is set to false.
 * Usage:
 * ```typescript
 * import axios from "@/lib/axios";
 *  axios.get("/api/some-endpoint"); // Will show toast on success/error
 *  axios.post("/api/another-endpoint", { foo: "bar" }, { notify: false }); // No toast will be shown
 * ```
 */
const instance: AxiosInstance = axios.create({
  timeout: 300000,
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
});

instance.interceptors.response.use(
  (res: AxiosResponse<BaseResponse<any>>) => {
    const notify = (res.config as CustomAxiosRequestConfig)?.notify ?? true;
    const notifySuccess = (res.config as CustomAxiosRequestConfig)?.notifySuccess ?? true;

    if (notify && res.data.status == 'success' && notifySuccess) {
      toast.success(res.data.message || 'Request successful');
    }
    return res;
  },
  (err) => {
    const notify = (err.config as CustomAxiosRequestConfig)?.notify ?? true;
    const notifyError = (err.config as CustomAxiosRequestConfig)?.notifyError ?? true;
    if (!notify || !notifyError) return Promise.reject(err);

    if (axios.isAxiosError(err)) {
      const errorMessage = err.response?.data?.message || 'An error occurred';
      if (notifyError) {
        toast.error(errorMessage);
      }
    } else {
      toast.error('An unexpected error occurred');
    }
    return Promise.reject(err);
  }
);

export default instance;
