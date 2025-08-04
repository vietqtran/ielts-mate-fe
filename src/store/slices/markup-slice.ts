import { MarkupType, PracticeType, TaskType } from '@/types/markup/markup.enum';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';

export interface MarkupFilters {
  markUpType?: MarkupType; // Corresponds to MarkupType enum
  taskType?: TaskType; // Corresponds to TaskType enum
  practiceType?: PracticeType; // Corresponds to PracticeType enum
}

export interface MarkupStates {
  filters: MarkupFilters;
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

const initialState: MarkupStates = {
  filters: {
    markUpType: undefined,
    taskType: undefined,
    practiceType: undefined,
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

const markupSlice = createSlice({
  name: 'markupFilters',
  initialState,
  reducers: {
    setMarkupFilters: (state, action: PayloadAction<MarkupFilters>) => {
      state.filters = action.payload;
    },
    clearMarkupFilters: (state) => {
      state.filters = initialState.filters;
    },

    clearMarkupState: (state) => {
      state.filters = initialState.filters;
      state.pagination = initialState.pagination;
    },

    setMarkupLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setMarkupPagination: (
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
  setMarkupFilters,
  clearMarkupFilters,
  clearMarkupState,
  setMarkupLoading,
  setMarkupPagination,
} = markupSlice.actions;

export default markupSlice.reducer;
