import { BaseResponse } from '@/types/reading/reading.types';
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
 *  // GET request with params and no toast
 *  axios.get("/api/some-endpoint", { params: { foo: "bar" }, notify: false });
 * ```
 */
const instance: AxiosInstance = axios.create({
  timeout: 300000,
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
});

instance.interceptors.response.use(
  (res: AxiosResponse<BaseResponse<any>>) => {
    return res;
  },
  (err) => {
    // By default, do NOT surface error details to the UI.
    // Only show a generic error toast if the caller explicitly opts in via { notifyError: true }.
    const notify = (err.config as CustomAxiosRequestConfig)?.notify ?? false;
    const notifyError = (err.config as CustomAxiosRequestConfig)?.notifyError ?? false;
    if (notify && notifyError) {
      const genericMessage = 'Something went wrong. Please try again.';
      if (axios.isAxiosError(err)) {
        toast.error(genericMessage);
      } else {
        toast.error(genericMessage);
      }
    }
    return Promise.reject(err);
  }
);

export default instance;
