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
  notAnswered: number;
  totalPoints: number;
  scorePercentage: number;
  // Alias for clarity when needed by UI
  correctPercentage: number;
  partStats: PartStat[];
}

// Performance level type
export interface PerformanceLevel {
  level: string;
  color: string;
}
