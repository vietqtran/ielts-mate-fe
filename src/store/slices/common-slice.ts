import { CommonState } from '@/types';
import { createSlice } from '@reduxjs/toolkit';

const initialState: CommonState = {
  isFullPageLoading: false,
  unverifyEmail: null,
  isFirstSendOtp: false,
};

const commonSlice = createSlice({
  name: 'common',
  initialState,
  reducers: {
    setFullPageLoading(state, action) {
      state.isFullPageLoading = action.payload;
    },
    setUnverifyEmail(state, action) {
      state.unverifyEmail = action.payload;
    },
    setIsFirstSendOtp(state, action) {
      state.isFirstSendOtp = action.payload;
    },
  },
});

export const { setFullPageLoading, setUnverifyEmail, setIsFirstSendOtp } = commonSlice.actions;
export default commonSlice.reducer;
