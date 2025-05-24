import axios, { AxiosInstance } from 'axios';

const instance: AxiosInstance = axios.create({
  timeout: 300000,
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
});

export default instance;
