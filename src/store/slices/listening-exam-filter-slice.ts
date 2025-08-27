import { CommonReduxFilterStates } from '@/types/filter.types';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';

export interface ListeningExamFilters
  extends CommonReduxFilterStates<{
    searchText?: string;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc' | '';
  }> {}

const initialState: ListeningExamFilters = {
  filters: {
    searchText: '',
    sortBy: '',
    sortDirection: 'asc',
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

const listeningExamSlice = createSlice({
  name: 'listeningExam',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<ListeningExamFilters['filters']>) => {
      state.filters = action.payload;
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
    clearAllStates: (state) => {
      state.filters = initialState.filters;
      state.isLoading = initialState.isLoading;
      state.pagination = initialState.pagination;
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
  },
});

export const { setFilters, setLoading, setPagination, clearAllStates, clearFilters } =
  listeningExamSlice.actions;

export default listeningExamSlice.reducer;
