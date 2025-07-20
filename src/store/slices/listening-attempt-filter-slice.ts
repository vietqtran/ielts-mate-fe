import { PayloadAction, createSlice } from '@reduxjs/toolkit';

export interface ListeningAttemptFilters {
  title?: string;
  ieltsType?: number[];
  partNumber?: number[];
  status?: number[];
}

export interface ListeningAttemptState {
  filters: ListeningAttemptFilters;
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

const initialState: ListeningAttemptState = {
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

const listeningAttemptSlice = createSlice({
  name: 'listeningAttempt',
  initialState,
  reducers: {
    setListeningAttemptFilters: (state, action: PayloadAction<ListeningAttemptFilters>) => {
      state.filters = action.payload;
    },
    clearListeningAttemptFilters: (state) => {
      state.filters = {};
    },
    setListeningAttemptCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setListeningAttemptSortBy: (state, action: PayloadAction<string>) => {
      state.sortBy = action.payload;
    },
    setListeningAttemptSortDirection: (state, action: PayloadAction<'asc' | 'desc'>) => {
      state.sortDirection = action.payload;
    },
    setListeningAttemptLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setListeningAttemptPagination: (
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
  setListeningAttemptFilters,
  clearListeningAttemptFilters,
  setListeningAttemptCurrentPage,
  setListeningAttemptSortBy,
  setListeningAttemptSortDirection,
  setListeningAttemptLoading,
  setListeningAttemptPagination,
} = listeningAttemptSlice.actions;

export default listeningAttemptSlice.reducer;
