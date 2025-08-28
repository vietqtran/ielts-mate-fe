import { AddMarkupStates } from '@/store/slices/add-markup-slice';
import { ListeningAttemptState } from '@/store/slices/listening-attempt-filter-slice';
import { ListeningExamAttemptFilters } from '@/store/slices/listening-exam-attempt-filter-slice';
import { ListeningExamFilters } from '@/store/slices/listening-exam-filter-slice';
import { ListeningTasksStates } from '@/store/slices/listening-filter-slice';
import { MarkupStates } from '@/store/slices/markup-slice';
import { PassageState } from '@/store/slices/passage-slice';
import { ReadingAttemptState } from '@/store/slices/reading-attempt-filter-slice';
import { ReadingExamAttemptFilters } from '@/store/slices/reading-exam-attempt-filter-slice';
import { ReadingExamFilters } from '@/store/slices/reading-exam-filter-slice';
import { UserPassageState } from '@/store/slices/reading-filter-slices';
import { ReadingHighlightState } from '@/store/slices/reading-highlight-slice';
import { User } from '.';

export interface RootState {
  auth: AuthState;
  common: CommonState;
  authForm: AuthFormState;
  passage: PassageState;
  userPassage: UserPassageState;
  readingAttempt: ReadingAttemptState;
  readingExamAttempt: ReadingExamAttemptFilters;
  readingHighlight: ReadingHighlightState;
  listeningTasks: ListeningTasksStates;
  listeningAttempt: ListeningAttemptState;
  listeningExamAttempt: ListeningExamAttemptFilters;
  listeningExam: ListeningExamFilters;
  readingExam: ReadingExamFilters;
  markupTasks: MarkupStates;
  addMarkup: AddMarkupStates;
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
