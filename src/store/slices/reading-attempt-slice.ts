import { PayloadAction, createSlice } from '@reduxjs/toolkit';

export interface ReadingAttemptFilters {
  title?: string;
  ieltsTypeList?: number[];
  partNumberList?: number[];
  statusList?: number[];
}

export interface ReadingAttemptState {
  filters: ReadingAttemptFilters;
  currentPage: number;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  isLoading: boolean;
  pagination: {
    totalPages: number;
    pageSize: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

const initialState: ReadingAttemptState = {
  filters: {},
  currentPage: 1,
  sortBy: 'start_at',
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

const readingAttemptSlice = createSlice({
  name: 'readingAttempt',
  initialState,
  reducers: {
    setReadingAttemptFilters: (state, action: PayloadAction<ReadingAttemptFilters>) => {
      state.filters = action.payload;
    },
    clearReadingAttemptFilters: (state) => {
      state.filters = {};
    },
    setReadingAttemptCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setReadingAttemptSortBy: (state, action: PayloadAction<string>) => {
      state.sortBy = action.payload;
    },
    setReadingAttemptSortDirection: (state, action: PayloadAction<'asc' | 'desc'>) => {
      state.sortDirection = action.payload;
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
      }>
    ) => {
      state.pagination = action.payload;
    },
  },
});

export const {
  setReadingAttemptFilters,
  clearReadingAttemptFilters,
  setReadingAttemptCurrentPage,
  setReadingAttemptSortBy,
  setReadingAttemptSortDirection,
  setReadingAttemptLoading,
  setReadingAttemptPagination,
} = readingAttemptSlice.actions;

export default readingAttemptSlice.reducer;
