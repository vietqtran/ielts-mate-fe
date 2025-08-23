import instance from '@/lib/axios';
import qs from 'qs';

// This fetcher function is used with SWR for data fetching
// It uses the custom Axios instance to make GET requests
// and returns the data from the response.
// DO NOT use this fetcher for POST/PUT/DELETE requests
// !DO NOT DELETE THIS FILE!
export const fetcher = <T>(url: string): Promise<T> => instance.get<T>(url).then((res) => res.data);

// This function builds a SWR key for the given endpoint and parameters.
export function buildSWRKey(endpoint: string, params?: Record<string, any>) {
  if (!params || Object.keys(params).length === 0) return endpoint;
  return `${endpoint}?${qs.stringify(params, {
    skipNulls: true,
    arrayFormat: 'comma',
    sort: (a, b) => a.localeCompare(b),
  })}`;
}
