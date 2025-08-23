import { PayloadAction, createSlice } from '@reduxjs/toolkit';

export interface ReadingAttemptFilters {
  searchText?: string;
  ieltsType?: number[];
  partNumber?: number[];
  status?: number[];
  sortBy?: string;
  sortDirection?: 'asc' | 'desc' | '';
  questionCategory?: string;
  passageId?: string;
}

export interface ReadingAttemptState {
  filters: ReadingAttemptFilters;
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

const initialState: ReadingAttemptState = {
  filters: {
    searchText: '',
    ieltsType: [],
    partNumber: [],
    status: [],
    sortBy: '',
    sortDirection: '',
    questionCategory: '',
    passageId: '',
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

const readingAttemptSlice = createSlice({
  name: 'readingAttempt',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<ReadingAttemptFilters>) => {
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

export const { setFilters, clearFilters, setLoading, setPagination } = readingAttemptSlice.actions;

export default readingAttemptSlice.reducer;
