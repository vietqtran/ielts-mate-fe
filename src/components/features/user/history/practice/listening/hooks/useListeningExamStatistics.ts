'use client';

import { ExamStats } from '@/components/features/user/exams/reading/utils/examUtils';
import { LoadListeningAttemptResultResponse } from '@/types/listening/listening-attempt.types';

export const useListeningExamStatistics = (
  attemptDetails: LoadListeningAttemptResultResponse | null
): ExamStats | null => {
  if (!attemptDetails) return null;

  const questionGroups = attemptDetails.task_data.question_groups;
  let totalQuestions = 0;

  // Since we don't have direct access to questions in the result response,
  // we'll calculate stats based on the answers provided
  const userAnswersMap = new Map<string, string[]>();
  attemptDetails.answers.forEach((answer) => {
    const answerValues: string[] = [];

    if (answer.choice_ids && answer.choice_ids.length > 0) {
      answerValues.push(...answer.choice_ids);
    }
    if (answer.filled_text_answer) {
      answerValues.push(answer.filled_text_answer);
    }
    if (answer.matched_text_answer) {
      answerValues.push(answer.matched_text_answer);
    }
    if (answer.drag_item_id) {
      answerValues.push(answer.drag_item_id);
    }

    userAnswersMap.set(answer.question_id, answerValues);
  });

  // Calculate total questions from question groups
  questionGroups.forEach((group) => {
    totalQuestions += group.questions.length;
  });

  // Create part stats based on question groups
  const partStats = questionGroups.map((group, index) => {
    let groupCorrect = 0;
    let groupPoints = 0;

    // Calculate correct answers and points for this group
    group.questions.forEach((question) => {
      const answer = attemptDetails.answers.find((a) => a.question_id === question.question_id);
      if (answer) {
        // Check if the answer is correct
        const isCorrect =
          answer.filled_text_answer === question.correct_answer ||
          (answer.choice_ids && answer.choice_ids.includes(question.correct_answer));

        if (isCorrect) {
          groupCorrect++;
          groupPoints += question.point;
        }
      }
    });

    const groupPercentage =
      group.questions.length > 0 ? Math.round((groupCorrect / group.questions.length) * 100) : 0;

    return {
      title: `Part ${index + 1}`,
      questions: group.questions.length,
      correct: groupCorrect,
      points: groupPoints,
      percentage: groupPercentage,
    };
  });

  // Calculate overall statistics
  const totalCorrect = partStats.reduce((sum, part) => sum + part.correct, 0);
  const scorePercentage =
    totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  return {
    totalQuestions,
    correctAnswers: totalCorrect,
    incorrectAnswers: totalQuestions - totalCorrect,
    totalPoints: attemptDetails.total_points,
    scorePercentage,
    partStats,
  };
};
