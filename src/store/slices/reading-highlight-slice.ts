import { PayloadAction, createSlice } from '@reduxjs/toolkit';

export interface ReadingHighlight {
  text: string;
  startOffset: number;
  endOffset: number;
  partKey: string; // 'part1', 'part2', 'part3'
  passageId: string;
}

export interface ReadingHighlightState {
  highlights: Record<string, ReadingHighlight[]>; // key: examAttemptId
}

const initialState: ReadingHighlightState = {
  highlights: {},
};

const readingHighlightSlice = createSlice({
  name: 'readingHighlight',
  initialState,
  reducers: {
    addHighlight: (
      state,
      action: PayloadAction<{ examAttemptId: string; highlight: ReadingHighlight }>
    ) => {
      const { examAttemptId, highlight } = action.payload;
      if (!state.highlights[examAttemptId]) {
        state.highlights[examAttemptId] = [];
      }
      state.highlights[examAttemptId].push(highlight);
    },
    removeHighlight: (
      state,
      action: PayloadAction<{ examAttemptId: string; highlightIndex: number }>
    ) => {
      const { examAttemptId, highlightIndex } = action.payload;
      if (state.highlights[examAttemptId]) {
        state.highlights[examAttemptId].splice(highlightIndex, 1);
      }
    },
    clearHighlights: (state, action: PayloadAction<string>) => {
      const examAttemptId = action.payload;
      delete state.highlights[examAttemptId];
    },
    clearAllHighlights: (state) => {
      state.highlights = {};
    },
  },
});

export const { addHighlight, removeHighlight, clearHighlights, clearAllHighlights } =
  readingHighlightSlice.actions;

export default readingHighlightSlice.reducer;
