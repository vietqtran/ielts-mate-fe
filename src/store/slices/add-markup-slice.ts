import { PayloadAction, createSlice } from '@reduxjs/toolkit';

export interface AddMarkupFilters {
  searchText: string;
  sortBy: string;
  sortDirection: 'asc' | 'desc' | '';
}

export interface AddMarkupStates {
  filters: AddMarkupFilters;
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

const initialState: AddMarkupStates = {
  filters: {
    searchText: '',
    sortBy: '',
    sortDirection: '',
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

const addMarkupSlice = createSlice({
  name: 'addMarkupFilters',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<AddMarkupFilters>) => {
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
  addMarkupSlice.actions;

export default addMarkupSlice.reducer;
