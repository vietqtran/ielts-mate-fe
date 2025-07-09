// !! DO NOT DELETE THIS FILE, THIS IS A MODULE AUGMENTATION FILE !!
// It extends the AxiosRequestConfig interface to include a custom property `notify`
// that can be used to control whether notifications should be shown for a request.
// This allows you to pass `notify: false` in the request config to suppress notifications.

import 'axios';
declare module 'axios' {
  export interface AxiosRequestConfig {
    /**
     * Custom property to control notification behavior.
     * If set to false, no notifications will be shown for this request.
     */
    notify?: boolean;
    /**
     * Custom property to control error notification behavior.
     * If set to true, an error notification will be shown on error responses.
     */
    notifyError?: boolean;
    /**
     * Custom property to control success notification behavior.
     * If set to true, a success notification will be shown on successful responses.
     */
    notifySuccess?: boolean;
  }
}
