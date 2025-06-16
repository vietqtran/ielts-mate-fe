import instance from '@/lib/axios';

export const useProfile = () => {
  const updateProfile = async ({
    first_name,
    last_name,
  }: {
    first_name: string;
    last_name: string;
  }) => {
    try {
      const { data } = await instance.put(
        '/identity/auth/update-profile',
        {
          firstName: first_name,
          lastName: last_name,
        },
        {
          withCredentials: true,
        }
      );

      if (data.status === 'success') {
        return data;
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  const updatePassword = async ({
    newPassword,
    confirmNewPassword,
    oldPassword,
  }: {
    newPassword: string;
    confirmNewPassword: string;
    oldPassword: string;
  }) => {
    try {
      const { data } = await instance.put(
        '/identity/auth/change-password',
        {
          newPassword,
          confirmNewPassword,
          oldPassword,
        },
        {
          withCredentials: true,
        }
      );

      if (data.status === 'success') {
        return data;
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  return {
    updateProfile,
    updatePassword,
  };
};
