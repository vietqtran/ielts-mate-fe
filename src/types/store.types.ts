import { User } from '.';

export interface RootState {
  auth: AuthState;
  common: CommonState;
  authForm: AuthFormState;
}

export interface AuthState {
  user: User | null;
}

export interface AuthFormState {
  signUpForm: {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
  };
  signInForm: {
    email: string;
    password: string;
  };
}

export interface CommonState {
  isFullPageLoading: boolean;
  unverifyEmail: string | null;
  isFirstSendOtp: boolean;
}
