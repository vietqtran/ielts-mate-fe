import { CommonState } from '@/types';
import { createSlice } from '@reduxjs/toolkit';

const initialState: CommonState = {
  isFullPageLoading: false,
};

const commonSlice = createSlice({
  name: 'common',
  initialState,
  reducers: {
    setFullPageLoading(state, action) {
      state.isFullPageLoading = action.payload;
    },
  },
});

export const { setFullPageLoading } = commonSlice.actions;
export default commonSlice.reducer;
