import {
  ReadingAttemptFilters,
  ReadingAttemptState,
} from '@/store/slices/reading-attempt-filter-slice';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';

const initialState: ReadingAttemptState = {
  filters: {},
  currentPage: 1,
  sortBy: 'createdAt',
  sortDirection: 'desc',
  isLoading: false,
  pagination: {
    totalPages: 1,
    pageSize: 12,
    totalItems: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  },
};

const readingExamAttemptSlice = createSlice({
  name: 'readingExamAttempt',
  initialState,
  reducers: {
    setReadingExamAttemptFilters: (state, action: PayloadAction<ReadingAttemptFilters>) => {
      state.filters = action.payload;
    },
    clearReadingExamAttemptFilters: (state) => {
      state.filters = {};
    },
    setReadingExamAttemptCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setReadingExamAttemptSortBy: (state, action: PayloadAction<string>) => {
      state.sortBy = action.payload;
    },
    setReadingExamAttemptSortDirection: (state, action: PayloadAction<'asc' | 'desc'>) => {
      state.sortDirection = action.payload;
    },
    setReadingExamAttemptLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setReadingExamAttemptPagination: (
      state,
      action: PayloadAction<{
        totalPages: number;
        pageSize: number;
        totalItems: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
      }>
    ) => {
      state.pagination = action.payload;
    },
  },
});

export const {
  setReadingExamAttemptFilters,
  clearReadingExamAttemptFilters,
  setReadingExamAttemptCurrentPage,
  setReadingExamAttemptSortBy,
  setReadingExamAttemptSortDirection,
  setReadingExamAttemptLoading,
  setReadingExamAttemptPagination,
} = readingExamAttemptSlice.actions;

export default readingExamAttemptSlice.reducer;
