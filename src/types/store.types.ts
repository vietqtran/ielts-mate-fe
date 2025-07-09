import { PassageState } from '@/store/slices/passage-slice';
import { UserPassageState } from '@/store/slices/user-passage-slice';
import { User } from '.';

export interface RootState {
  auth: AuthState;
  common: CommonState;
  authForm: AuthFormState;
  passage: PassageState;
  userPassage: UserPassageState;
}

export interface AuthState {
  user: User | null;
}

export interface AuthFormState {
  signUpForm: {
    email: string;
    password: string;
    confirmPassword: string;
    first_name: string;
    last_name: string;
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
