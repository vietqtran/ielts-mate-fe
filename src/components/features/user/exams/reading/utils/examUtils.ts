// Utility functions for reading exam details

// Enhanced time formatting for better readability
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return `${remainingSeconds}s`;
  }
};

// Format date
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// IELTS band score approximation
export const getIELTSBandScore = (percentage: number): number => {
  if (percentage >= 95) return 9.0;
  if (percentage >= 89) return 8.5;
  if (percentage >= 83) return 8.0;
  if (percentage >= 75) return 7.5;
  if (percentage >= 67) return 7.0;
  if (percentage >= 58) return 6.5;
  if (percentage >= 50) return 6.0;
  if (percentage >= 42) return 5.5;
  if (percentage >= 33) return 5.0;
  if (percentage >= 25) return 4.5;
  if (percentage >= 17) return 4.0;
  if (percentage >= 8) return 3.5;
  return 3.0;
};

// Get performance level and color
export const getPerformanceLevel = (score: number) => {
  if (score >= 85)
    return {
      level: 'Excellent',
      color: 'bg-tekhelet-500 text-tekhelet-900',
    };
  if (score >= 70) return { level: 'Good', color: 'bg-green-600 text-white' };
  if (score >= 55) return { level: 'Fair', color: 'bg-tangerine-400 text-white' };
  return { level: 'Needs Improvement', color: 'bg-persimmon-300 text-white' };
};

// Types for statistics
export interface PartStat {
  title: string;
  questions: number;
  correct: number;
  points: number;
  percentage: number;
}

export interface ExamStats {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  totalPoints: number;
  scorePercentage: number;
  partStats: PartStat[];
}

// Performance level type
export interface PerformanceLevel {
  level: string;
  color: string;
}
