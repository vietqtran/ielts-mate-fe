'use client';

import { ExamStats } from '@/components/features/user/exams/reading/utils/examUtils';
import { LoadAttemptResponse } from '@/types/attempt.types';

// Calculates stats for a reading practice attempt (no band score).
export const useReadingPracticeStatistics = (
  attemptDetails: LoadAttemptResponse | null
): ExamStats | null => {
  if (!attemptDetails) return null;

  const questionGroups = attemptDetails.task_data.question_groups;
  let totalQuestions = 0;

  questionGroups.forEach((group) => {
    totalQuestions += group.questions.length;
  });

  // Create part stats based on question groups
  const partStats = questionGroups.map((group, index) => {
    let groupCorrect = 0;

    group.questions.forEach((question) => {
      const answer = attemptDetails.answers.find((a) => a.question_id === question.question_id);
      if (answer) {
        // Determine correctness by checking if any of the user's selected choices match a correct answer placeholder.
        // Actual correct answers field may come later; currently we can't know correctness reliably without API field, so assume first selected counts if present.
        // This is a placeholder logic until backend supplies correct answer meta in practice attempt result.
        if (answer.choice_ids && answer.choice_ids.length > 0) {
          groupCorrect += 1; // optimistic count
        }
      }
    });

    const groupPercentage =
      group.questions.length > 0 ? Math.round((groupCorrect / group.questions.length) * 100) : 0;

    return {
      title: `Part ${index + 1}`,
      questions: group.questions.length,
      correct: groupCorrect,
      points: groupCorrect, // each correct = 1 point simple rule
      percentage: groupPercentage,
    };
  });

  const totalCorrect = partStats.reduce((sum, part) => sum + part.correct, 0);
  const scorePercentage =
    totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  return {
    totalQuestions,
    correctAnswers: totalCorrect,
    incorrectAnswers: totalQuestions - totalCorrect,
    totalPoints: totalCorrect,
    scorePercentage,
    partStats,
  };
};
