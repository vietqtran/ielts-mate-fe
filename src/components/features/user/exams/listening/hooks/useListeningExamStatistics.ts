'use client';

import { getQuestionResultStatus } from '@/components/features/user/exams/reading/components/QuestionResultRenderer';
import { ExamStats } from '@/components/features/user/exams/reading/utils/examUtils';
import { ListeningExamAttemptDetailsResponse } from '@/types/listening/listening-exam.types';

export const useListeningExamStatistics = (
  examDetails: ListeningExamAttemptDetailsResponse | null
): ExamStats | null => {
  if (!examDetails) return null;

  const parts = [
    examDetails.listening_exam.listening_task_id_part1,
    examDetails.listening_exam.listening_task_id_part2,
    examDetails.listening_exam.listening_task_id_part3,
    examDetails.listening_exam.listening_task_id_part4,
  ];

  let totalQuestions = 0;
  let totalCorrect = 0;
  let totalNotAnswered = 0;
  let totalPoints = 0;

  const partStats = parts.map((part, index) => {
    let partQuestions = 0;
    let partCorrect = 0;
    let partNotAnswered = 0;
    let partPoints = 0;

    part.question_groups.forEach((group) => {
      if (!group.questions || group.questions.length === 0) return;
      group.questions.forEach((question) => {
        partQuestions += 1;
        const userAnswers = examDetails.answers[question.question_id] || [];
        const status = getQuestionResultStatus(question as any, userAnswers);
        if (status == null) {
          partNotAnswered += 1;
          return;
        }
        if (status === true) {
          partCorrect += 1;
          partPoints += question.point || 1;
        }
      });
    });

    totalQuestions += partQuestions;
    totalCorrect += partCorrect;
    totalNotAnswered += partNotAnswered;
    totalPoints += partPoints;

    return {
      title: `Part ${index + 1}`,
      questions: partQuestions,
      correct: partCorrect,
      points: partPoints,
      percentage: partQuestions > 0 ? Math.round((partCorrect / partQuestions) * 100) : 0,
    };
  });

  const incorrectAnswers = totalQuestions - totalCorrect - totalNotAnswered;
  const scorePercentage =
    totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  return {
    totalQuestions,
    correctAnswers: totalCorrect,
    incorrectAnswers,
    notAnswered: totalNotAnswered,
    totalPoints,
    scorePercentage,
    correctPercentage: scorePercentage,
    partStats,
  };
};
