import { AuthFormState } from '@/types';
import { createSlice } from '@reduxjs/toolkit';

const initialState: AuthFormState = {
  signUpForm: {
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  },
  signInForm: {
    email: '',
    password: '',
  },
};

const commonSlice = createSlice({
  name: 'common',
  initialState,
  reducers: {
    setSignUpForm(state, action) {
      state.signUpForm = { ...state.signUpForm, ...action.payload };
    },
    setSignInForm(state, action) {
      state.signInForm = { ...state.signInForm, ...action.payload };
    },
  },
});

export const { setSignUpForm, setSignInForm } = commonSlice.actions;
export default commonSlice.reducer;
