'use client';

import { isAttemptQuestionCorrect } from '@/components/features/user/common/attempt/AttemptQuestionResultRenderer';
import { ExamStats } from '@/components/features/user/exams/reading/utils/examUtils';
import { LoadListeningAttemptResultResponse } from '@/types/listening/listening-attempt.types';

export const useListeningExamStatistics = (
  attemptDetails: LoadListeningAttemptResultResponse | null
): ExamStats | null => {
  if (!attemptDetails) return null;

  const questionGroups = attemptDetails.task_data.question_groups;
  const allQuestions = questionGroups.flatMap((g) => g.questions);
  const totalQuestions = allQuestions.length;

  // Build part stats mirroring ListeningQuestionAnalysis filtering logic
  const partStats = questionGroups.map((group, index) => {
    let groupCorrect = 0;
    let groupNotAnswered = 0;

    group.questions.forEach((q) => {
      const userAnswers = attemptDetails.answers.filter((a) => a.question_id === q.question_id);
      const hasAnswer =
        userAnswers.length > 0 &&
        ((userAnswers[0].choice_ids && userAnswers[0].choice_ids.length > 0) ||
          !!userAnswers[0].filled_text_answer ||
          !!userAnswers[0].matched_text_answer ||
          !!userAnswers[0].drag_item_id);
      if (!hasAnswer) {
        groupNotAnswered += 1;
        return;
      }
      if (isAttemptQuestionCorrect(q, userAnswers)) {
        groupCorrect += 1;
      }
    });

    const groupPercentage =
      group.questions.length > 0 ? Math.round((groupCorrect / group.questions.length) * 100) : 0;

    return {
      title: `Part ${index + 1}`,
      questions: group.questions.length,
      correct: groupCorrect,
      points: groupCorrect,
      percentage: groupPercentage,
    };
  });

  const totalCorrect = partStats.reduce((sum, part) => sum + part.correct, 0);
  const totalNotAnswered = allQuestions.reduce((acc, q) => {
    const userAnswers = attemptDetails.answers.filter((a) => a.question_id === q.question_id);
    const hasAnswer =
      userAnswers.length > 0 &&
      ((userAnswers[0].choice_ids && userAnswers[0].choice_ids.length > 0) ||
        !!userAnswers[0].filled_text_answer ||
        !!userAnswers[0].matched_text_answer ||
        !!userAnswers[0].drag_item_id);
    return acc + (hasAnswer ? 0 : 1);
  }, 0);

  const incorrectAnswers = totalQuestions - totalCorrect - totalNotAnswered;
  const scorePercentage =
    totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  return {
    totalQuestions,
    correctAnswers: totalCorrect,
    incorrectAnswers,
    notAnswered: totalNotAnswered,
    totalPoints: totalCorrect,
    scorePercentage,
    correctPercentage: scorePercentage,
    partStats,
  };
};
