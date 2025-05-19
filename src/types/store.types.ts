import { User } from '.';

export interface RootState {
  auth: AuthState;
  common: CommonState;
}

export interface AuthState {
  user: User | null;
}

export interface CommonState {
  isFullPageLoading: boolean;
}
