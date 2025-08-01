import { PayloadAction, createSlice } from '@reduxjs/toolkit';

export interface ReadingAttemptFilters {
  searchText?: string;
  ieltsType?: number[];
  partNumber?: number[];
  status?: number[];
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
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
    sortBy: 'updatedAt',
    sortDirection: 'desc',
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
    setReadingAttemptFilters: (state, action: PayloadAction<ReadingAttemptFilters>) => {
      state.filters = action.payload;
    },
    clearReadingAttemptFilters: (state) => {
      state.filters = initialState.filters;
    },

    clearReadingAttemptState: (state) => {
      state.filters = initialState.filters;
      state.pagination = initialState.pagination;
    },

    setReadingAttemptLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setReadingAttemptPagination: (
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

export const {
  setReadingAttemptFilters,
  clearReadingAttemptFilters,
  setReadingAttemptLoading,
  setReadingAttemptPagination,
} = readingAttemptSlice.actions;

export default readingAttemptSlice.reducer;
