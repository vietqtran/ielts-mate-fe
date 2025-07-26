'use client';

import { ReadingExamAttemptDetailsResponse } from '@/types/reading/reading-exam-attempt.types';
import { ExamStats } from '../utils/examUtils';

export const useExamStatistics = (
  examDetails: ReadingExamAttemptDetailsResponse | null
): ExamStats | null => {
  if (!examDetails) return null;

  const parts = [
    examDetails.reading_exam.reading_passage_id_part1,
    examDetails.reading_exam.reading_passage_id_part2,
    examDetails.reading_exam.reading_passage_id_part3,
  ];

  let totalQuestions = 0;
  let correctAnswers = 0;
  let totalPoints = 0;

  const partStats = parts.map((part, index) => {
    let partQuestions = 0;
    let partCorrect = 0;
    let partPoints = 0;

    part.question_groups.forEach((group) => {
      if (group.questions && group.questions.length > 0) {
        group.questions.forEach((question) => {
          partQuestions++;
          const userAnswers = examDetails.answers[question.question_id] || [];
          const correctAnswer = question.correct_answer || '';

          // Check if answer is correct based on question type
          let isCorrect = false;
          if (question.question_type === 0 && question.choices) {
            // Multiple choice - check by choice ID
            const correctChoiceId = question.choices.find((choice) => choice.is_correct)?.choice_id;
            isCorrect = userAnswers.includes(correctChoiceId || '');
          } else {
            // Text-based answers
            isCorrect =
              userAnswers.length > 0 &&
              userAnswers.join('').toLowerCase() === correctAnswer.toLowerCase();
          }

          if (isCorrect) {
            partCorrect++;
            partPoints += question.point || 1;
          }
        });
      }
    });

    totalQuestions += partQuestions;
    correctAnswers += partCorrect;
    totalPoints += partPoints;

    return {
      title: `Part ${index + 1}`,
      questions: partQuestions,
      correct: partCorrect,
      points: partPoints,
      percentage: partQuestions > 0 ? Math.round((partCorrect / partQuestions) * 100) : 0,
    };
  });

  const scorePercentage =
    totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

  return {
    totalQuestions,
    correctAnswers,
    incorrectAnswers: totalQuestions - correctAnswers,
    totalPoints,
    scorePercentage,
    partStats,
  };
};
