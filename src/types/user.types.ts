export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: number;
  roles: string[];
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}
