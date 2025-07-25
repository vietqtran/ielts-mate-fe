# Reading Exam Details Components

This directory contains the modular components for displaying reading exam details and results.

## Structure

```
reading/
├── ReadingExamDetailsPage.tsx          # Main page component
├── components/                         # Reusable UI components
│   ├── index.ts                       # Component exports
│   ├── ExamResultHeader.tsx           # Header with navigation
│   ├── ExamInfoCard.tsx              # Exam information display
│   ├── OverallScoreCard.tsx          # Overall score display
│   ├── IELTSBandScoreCard.tsx        # IELTS band score display
│   ├── StatisticsCard.tsx            # Statistics display
│   ├── PerformanceByPartsCard.tsx    # Performance breakdown by parts
│   ├── QuestionAnalysis.tsx          # Detailed question analysis with tabs
│   ├── QuestionItem.tsx              # Individual question details (collapsible)
│   ├── ExamErrorState.tsx            # Error state component
│   └── ExamLoadingState.tsx          # Loading state component
├── hooks/                            # Custom hooks
│   └── useExamStatistics.ts         # Statistics calculation hook
└── utils/                           # Utility functions
    └── examUtils.ts                 # Shared utilities and types
```

## Component Reusability

### Highly Reusable Components

These components can be easily reused across different exam types (Reading, Listening, etc.):

- **ExamResultHeader**: Generic header with navigation buttons
- **OverallScoreCard**: Score percentage display with performance level
- **IELTSBandScoreCard**: IELTS band score calculation and display
- **StatisticsCard**: Statistics display (correct/incorrect answers, points)
- **PerformanceByPartsCard**: Performance breakdown by exam parts
- **ExamErrorState**: Generic error state display
- **ExamLoadingState**: Generic loading state display

### Reading-Specific Components

These components are specific to reading exam structure but could be adapted:

- **ExamInfoCard**: Displays reading exam information (could be adapted for other exam types)
- **QuestionAnalysis**: Reading-specific question analysis with passages
- **QuestionItem**: Question details display (adaptable for different question types)

### Custom Hook

- **useExamStatistics**: Calculates exam statistics from reading exam data (could be adapted for other exam types)

### Utility Functions

- **examUtils.ts**: Contains reusable utility functions:
  - `formatDuration()`: Format time duration
  - `formatDate()`: Format date strings
  - `getIELTSBandScore()`: Calculate IELTS band score from percentage
  - `getPerformanceLevel()`: Get performance level and styling

## Usage

```tsx
import {
  ExamResultHeader,
  OverallScoreCard,
  IELTSBandScoreCard,
  // ... other components
} from './components';

import { useExamStatistics } from './hooks/useExamStatistics';
import { formatDate, formatDuration, getIELTSBandScore } from './utils/examUtils';
```

## Adapting for Other Exam Types

To use these components for other exam types (e.g., Listening):

1. **Copy reusable components** (ExamResultHeader, OverallScoreCard, etc.)
2. **Adapt the statistics hook** to calculate stats for the specific exam type
3. **Modify ExamInfoCard** to display relevant exam information
4. **Create new analysis components** if the question structure is different
5. **Update utility functions** if needed for the specific exam type

## Benefits

- **Modularity**: Each component has a single responsibility
- **Reusability**: Components can be reused across different exam types
- **Maintainability**: Easy to update individual components without affecting others
- **Testability**: Each component can be tested in isolation
- **Consistency**: Shared styling and behavior across similar components
