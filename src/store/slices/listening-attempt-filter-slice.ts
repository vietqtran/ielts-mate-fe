import { PayloadAction, createSlice } from '@reduxjs/toolkit';

export interface ListeningAttemptFilters {
  title?: string;
  ieltsType?: number[];
  partNumber?: number[];
  status?: number[];
  sortDirection?: 'asc' | 'desc' | '';
  listeningTaskId?: string;
  sortBy?: string;
  questionCategory?: string;
}

export interface ListeningAttemptState {
  filters: ListeningAttemptFilters;
  isLoading: boolean;
  pagination: {
    totalPages: number;
    pageSize: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    currentPage: number;
  };
}

const initialState: ListeningAttemptState = {
  filters: {
    title: '',
    ieltsType: [],
    partNumber: [],
    status: [],
    sortDirection: '',
    listeningTaskId: '',
    sortBy: '',
    questionCategory: '',
  },
  isLoading: false,
  pagination: {
    totalPages: 1,
    pageSize: 10,
    totalItems: 0,
    hasNextPage: false,
    hasPreviousPage: false,
    currentPage: 1,
  },
};

const listeningAttemptSlice = createSlice({
  name: 'listeningAttempt',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<ListeningAttemptFilters>) => {
      state.filters = action.payload;
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },

    clearState: (state) => {
      state.filters = initialState.filters;
      state.pagination = initialState.pagination;
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setPagination: (
      state,
      action: PayloadAction<{
        totalPages: number;
        pageSize: number;
        totalItems: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
        currentPage: number;
      }>
    ) => {
      state.pagination = action.payload;
    },
  },
});

export const { setFilters, clearFilters, setLoading, setPagination, clearState } =
  listeningAttemptSlice.actions;

export default listeningAttemptSlice.reducer;
