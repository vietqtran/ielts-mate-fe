import { ListeningAttemptState } from '@/store/slices/listening-attempt-filter-slice';
import { ListeningTasksStates } from '@/store/slices/listening-filter-slice';
import { PassageState } from '@/store/slices/passage-slice';
import { ReadingAttemptState } from '@/store/slices/reading-attempt-filter-slice';
import { UserPassageState } from '@/store/slices/reading-filter-slices';
import { User } from '.';

export interface RootState {
  auth: AuthState;
  common: CommonState;
  authForm: AuthFormState;
  passage: PassageState;
  userPassage: UserPassageState;
  listeningTasks: ListeningTasksStates;
  readingAttempt: ReadingAttemptState;
  listeningAttempt: ListeningAttemptState;
  readingExamAttempt: ReadingAttemptState;
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
