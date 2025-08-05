import { PayloadAction, createSlice } from '@reduxjs/toolkit';

export interface UserPassageFilters {
  ieltsType?: string[];
  partNumber?: string[];
  title?: string;
  sortDirection?: 'asc' | 'desc' | '';
  sortBy?: string;
  questionCategory?: string;
  createdBy?: string;
}

export interface UserPassageState {
  filters: UserPassageFilters;
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

const initialState: UserPassageState = {
  filters: {
    ieltsType: [],
    partNumber: [],
    title: '',
    sortDirection: '',
    sortBy: '',
    questionCategory: '',
    createdBy: '',
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

const userPassageSlice = createSlice({
  name: 'userPassage',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<UserPassageFilters>) => {
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

export const { setFilters, clearFilters, clearState, setLoading, setPagination } =
  userPassageSlice.actions;

export default userPassageSlice.reducer;
