import { combineReducers, configureStore } from '@reduxjs/toolkit';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistReducer,
  persistStore,
} from 'redux-persist';
import {
  authFormReducer,
  authReducer,
  commonReducer,
  listeningAttemptReducer,
  listeningExamAttemptReducer,
  listeningExamReducer,
  listeningTasksReducer,
  markupSliceReducer,
  passageReducer,
  readingAttemptReducer,
  readingExamAttemptReducer,
  readingExamReducer,
  userPassageReducer,
} from './slices';

import { RootState } from '@/types/store.types';
import storage from 'redux-persist/lib/storage';

const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  whitelist: [
    'auth',
    'authForm',
    'common',
    'passage',
    'userPassage',
    'listeningTasks',
    'readingAttempt',
    'readingExamAttempt',
    'listeningAttempt',
    'markupTasks',
    'listeningExamAttempt',
    'listeningExam',
    'readingExam',
    'readingExamAttempt',
  ],
};

const rootReducer = combineReducers({
  auth: authReducer,
  common: commonReducer,
  authForm: authFormReducer,
  passage: passageReducer,
  userPassage: userPassageReducer,
  readingAttempt: readingAttemptReducer,
  readingExam: readingExamReducer,
  readingExamAttempt: readingExamAttemptReducer,
  listeningTasks: listeningTasksReducer,
  listeningAttempt: listeningAttemptReducer,
  listeningExam: listeningExamReducer,
  listeningExamAttempt: listeningExamAttemptReducer,
  markupTasks: markupSliceReducer,
});

const persistedReducer = persistReducer<RootState>(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type AppDispatch = typeof store.dispatch;
