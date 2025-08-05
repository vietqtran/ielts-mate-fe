import { PayloadAction, createSlice } from '@reduxjs/toolkit';

export interface ListeningTasksFilters {
  title?: string;
  ieltsType?: string[];
  partNumber?: string[];
  sortDirection?: 'asc' | 'desc' | '';
  sortBy?: string;
  createdBy?: string;
  questionCategory?: string;
  status?: string[];
}

export interface ListeningTasksStates {
  filters: ListeningTasksFilters;
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

const initialState: ListeningTasksStates = {
  filters: {
    title: '',
    ieltsType: [],
    partNumber: [],
    sortDirection: '',
    sortBy: '',
    status: [],
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

const listeningTasksSlice = createSlice({
  name: 'listeningTasks',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<ListeningTasksFilters>) => {
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
  listeningTasksSlice.actions;

export default listeningTasksSlice.reducer;
