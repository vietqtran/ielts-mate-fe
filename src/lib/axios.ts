import axios, { AxiosInstance } from 'axios';

import { generateRandomUUID } from '@/utils/generate';

const instance: AxiosInstance = axios.create({
  timeout: 300000,
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

instance.interceptors.request.use((config) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Request] ${config.method?.toUpperCase()} ${config.url}`);
  }
  config.headers['idempotency-key'] = generateRandomUUID();
  return config;
});

export default instance;
