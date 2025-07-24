import authFormReducer from './auth-form-slice';
import authReducer from './auth-slice';
import commonReducer from './common-slice';
import listeningAttemptReducer from './listening-attempt-filter-slice';
import listeningTasksReducer from './listening-filter-slice';
import passageReducer from './passage-slice';
import readingAttemptReducer from './reading-attempt-filter-slice';
import readingExamAttemptReducer from './reading-exam-attempt-filter-slice';
import userPassageReducer from './reading-filter-slices';
export {
  authReducer,
  commonReducer,
  authFormReducer,
  passageReducer,
  userPassageReducer,
  readingAttemptReducer,
  listeningAttemptReducer,
  listeningTasksReducer,
  readingExamAttemptReducer,
};
