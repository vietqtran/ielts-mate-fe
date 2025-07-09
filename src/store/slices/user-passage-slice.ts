import { PayloadAction, createSlice } from '@reduxjs/toolkit';

export interface UserPassageFilters {
  title?: string;
  ieltsType?: number[];
  partNumber?: number[];
}

export interface UserPassageState {
  filters: UserPassageFilters;
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

const initialState: UserPassageState = {
  filters: {},
  currentPage: 1,
  sortBy: 'created_at',
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

const userPassageSlice = createSlice({
  name: 'userPassage',
  initialState,
  reducers: {
    setUserFilters: (state, action: PayloadAction<UserPassageFilters>) => {
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
    updateUserFilter: (
      state,
      action: PayloadAction<{ key: keyof UserPassageFilters; value: any }>
    ) => {
      const { key, value } = action.payload;
      if (value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
        delete state.filters[key];
      } else {
        state.filters[key] = value;
      }
    },
    clearUserFilters: (state) => {
      state.filters = {};
      state.currentPage = 1;
    },
    setUserCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setUserSort: (
      state,
      action: PayloadAction<{ sortBy: string; sortDirection: 'asc' | 'desc' }>
    ) => {
      state.sortBy = action.payload.sortBy;
      state.sortDirection = action.payload.sortDirection;
    },
    setUserSortBy: (state, action: PayloadAction<string>) => {
      state.sortBy = action.payload;
    },
    setUserSortDirection: (state, action: PayloadAction<'asc' | 'desc'>) => {
      state.sortDirection = action.payload;
    },
    setUserLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setUserPagination: (
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
    clearUserPassageState: (state) => {
      state.filters = {};
      state.currentPage = 1;
      state.sortBy = 'created_at';
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
  setUserFilters,
  updateUserFilter,
  clearUserFilters,
  setUserCurrentPage,
  setUserSort,
  setUserSortBy,
  setUserSortDirection,
  setUserLoading,
  setUserPagination,
  clearUserPassageState,
} = userPassageSlice.actions;

export default userPassageSlice.reducer;
