import { PayloadAction, createSlice } from '@reduxjs/toolkit';

export interface PassageFilters {
  title?: string;
  ieltsType?: number;
  status?: number;
  partNumber?: number;
  questionCategory?: string;
  createdBy?: string;
}

export interface PassageState {
  filters: PassageFilters;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
}

const initialState: PassageState = {
  filters: {},
  sortBy: 'updatedAt',
  sortDirection: 'desc',
};

const passageSlice = createSlice({
  name: 'passage',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<PassageFilters>) => {
      state.filters = { ...action.payload };
    },
    updateFilter: (state, action: PayloadAction<{ key: keyof PassageFilters; value: any }>) => {
      const { key, value } = action.payload;
      if (value === undefined || value === '') {
        delete state.filters[key];
      } else {
        state.filters[key] = value;
      }
    },
    clearFilters: (state) => {
      state.filters = {};
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
    clearPassageState: (state) => {
      state.filters = {};
      state.sortBy = 'updatedAt';
      state.sortDirection = 'desc';
    },
  },
});

export const {
  setFilters,
  updateFilter,
  clearFilters,
  setSort,
  setSortBy,
  setSortDirection,
  clearPassageState,
} = passageSlice.actions;

export default passageSlice.reducer;
