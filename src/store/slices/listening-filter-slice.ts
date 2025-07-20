import { PayloadAction, createSlice } from '@reduxjs/toolkit';

export interface ListeningTasksFilters {
  title?: string;
  ieltsType?: number[];
  partNumber?: number[];
}

export interface ListeningTasksStates {
  filters: ListeningTasksFilters;
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

const initialState: ListeningTasksStates = {
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

const listeningTasksSlice = createSlice({
  name: 'listeningTasks',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<ListeningTasksFilters>) => {
      // Migrate old single values to arrays
      const migratedFilters = { ...action.payload };
      if (migratedFilters.ieltsType !== undefined && !Array.isArray(migratedFilters.ieltsType)) {
        migratedFilters.ieltsType = [migratedFilters.ieltsType as any];
      }
      if (migratedFilters.partNumber !== undefined && !Array.isArray(migratedFilters.partNumber)) {
        migratedFilters.partNumber = [migratedFilters.partNumber as any];
      }
      state.filters = migratedFilters;
    },
    updateFilter: (
      state,
      action: PayloadAction<{ key: keyof ListeningTasksFilters; value: any }>
    ) => {
      const { key, value } = action.payload;
      if (value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
        delete state.filters[key];
      } else {
        state.filters[key] = value;
      }
    },
    clearFilters: (state) => {
      state.filters = {};
      state.currentPage = 1;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setSort: (state, action: PayloadAction<{ sortBy: string; sortDirection: 'asc' | 'desc' }>) => {
      state.sortBy = action.payload.sortBy;
      state.sortDirection = action.payload.sortDirection;
    },
    setSortBy: (state, action: PayloadAction<string>) => {
      state.sortBy = action.payload;
    },
    setSortDirection: (state, action: PayloadAction<'asc' | 'desc'>) => {
      state.sortDirection = action.payload;
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
      }>
    ) => {
      state.pagination = action.payload;
    },
    clearState: (state) => {
      state.filters = {};
      state.currentPage = 1;
      state.sortBy = 'createdAt';
      state.sortDirection = 'desc';
      state.isLoading = false;
      state.pagination = {
        totalPages: 1,
        pageSize: 12,
        totalItems: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      };
    },
  },
});

export const {
  setFilters,
  updateFilter,
  clearFilters,
  setCurrentPage,
  setSort,
  setSortBy,
  setSortDirection,
  setLoading,
  setPagination,
  clearState,
} = listeningTasksSlice.actions;

export default listeningTasksSlice.reducer;
