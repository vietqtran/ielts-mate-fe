import instance from '@/lib/axios';
import { ApiResponse } from '@/types/reading-passage.types';

export interface LogoutResponse {
  message: string;
}

export const authAPI = {
  // Logout user
  logout: async (): Promise<ApiResponse<LogoutResponse>> => {
    const { data } = await instance.post(
      '/identity/auth/logout',
      {},
      {
        withCredentials: true,
      }
    );
    return data;
  },
};
