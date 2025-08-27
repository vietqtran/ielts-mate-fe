'use client';

import {
  AttemptQuestionResultRenderer,
  isAttemptQuestionCorrect,
} from '@/components/features/user/common/attempt/AttemptQuestionResultRenderer';
import { SelectableText } from '@/components/features/user/exams/reading/components/SelectableText';
import { Badge } from '@/components/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadAttemptResponse } from '@/types/attempt.types';
import { BookOpen } from 'lucide-react';

interface ReadingQuestionAnalysisProps {
  attemptDetails: LoadAttemptResponse;
  openQuestions: Set<string>;
  onToggleQuestion: (questionId: string) => void;
}

export const ReadingQuestionAnalysis = ({
  attemptDetails,
  openQuestions,
  onToggleQuestion,
}: ReadingQuestionAnalysisProps) => {
  const groups = attemptDetails.task_data.question_groups;
  const dragAndDropItems =
    attemptDetails.task_data.question_groups.flatMap((group) => group.drag_items) || [];

  return (
    <Card className='rounded-2xl border'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-tekhelet-500 font-semibold'>
          <BookOpen className='w-5 h-5' />
          Question Analysis
        </CardTitle>
        <p className='text-tekhelet-400'>Breakdown of your answers per question group</p>
      </CardHeader>
      <CardContent className='space-y-4'>
        {groups.map((group, groupIndex) => {
          const groupQuestions = group.questions;
          const correctCount = groupQuestions.reduce((acc, q) => {
            const ua = attemptDetails.answers.filter((ans) => ans.question_id === q.question_id);
            return acc + (isAttemptQuestionCorrect(q, ua) ? 1 : 0);
          }, 0);
          return (
            <Card key={group.group_id} className='border rounded-2xl'>
              <CardHeader className='pb-3'>
                <CardTitle className='text-lg text-tekhelet-500 font-semibold'>
                  {group.section_label}
                </CardTitle>
                {group.instruction && (
                  <SelectableText
                    content={group.instruction || 'No instruction provided'}
                    className='prose prose-sm max-w-none text-tekhelet-500 mb-4'
                  />
                )}
                <Badge
                  variant={'outline'}
                  className='text-sm font-semibold text-white bg-selective-yellow-200 mt-5'
                >
                  Correct: {correctCount} / {groupQuestions.length}
                </Badge>
              </CardHeader>
              <CardContent className='space-y-5'>
                {group.questions.map((question) => {
                  const userAnswers = attemptDetails.answers.filter(
                    (ans) => ans.question_id === question.question_id
                  );
                  return (
                    <AttemptQuestionResultRenderer
                      key={question.question_id}
                      question={question}
                      userAnswers={userAnswers}
                      dragAndDropItems={dragAndDropItems}
                    />
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </CardContent>
    </Card>
  );
};
