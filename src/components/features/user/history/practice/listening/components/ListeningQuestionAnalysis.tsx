'use client';

import {
  AttemptQuestionResultRenderer,
  isAttemptQuestionCorrect,
} from '@/components/features/user/common/attempt/AttemptQuestionResultRenderer';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadListeningAttemptResultResponse } from '@/types/listening/listening-attempt.types';

interface ListeningQuestionAnalysisProps {
  attemptDetails: LoadListeningAttemptResultResponse;
}

export const ListeningQuestionAnalysis = ({ attemptDetails }: ListeningQuestionAnalysisProps) => {
  const userAnswersMap = new Map<string, string[]>();
  const dragAndDropItems =
    attemptDetails.task_data.question_groups.flatMap((group) => group.drag_items) || [];
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className='font-semibold text-xl text-tekhelet-500'>Question Analysis</CardTitle>
        <p className='text-sm text-tekhelet-500'>
          Detailed breakdown of your answers for each question group
        </p>
      </CardHeader>
      <CardContent className='space-y-4'>
        {attemptDetails.task_data.question_groups.map((group, groupIndex) => {
          const groupQuestions = group.questions;
          const correctCount = groupQuestions.reduce((acc, q) => {
            const ua = attemptDetails.answers.filter((ans) => ans.question_id === q.question_id);
            return acc + (isAttemptQuestionCorrect(q, ua) ? 1 : 0);
          }, 0);
          return (
            <Card key={group.group_id}>
              <CardHeader className='pb-3'>
                <CardTitle className='text-lg text-tekhelet-500 font-semibold'>
                  Part {groupIndex + 1}: {group.section_label}
                </CardTitle>
                {group.instruction && (
                  <div
                    className='text-sm text-tekhelet-500'
                    dangerouslySetInnerHTML={{ __html: group.instruction }}
                  />
                )}
                <Badge
                  variant={'outline'}
                  className='text-sm font-semibold text-white bg-selective-yellow-200 mt-5'
                >
                  Correct: {correctCount} / {groupQuestions.length}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className='space-y-5'>
                  {group.questions.map((question, questionIndex) => {
                    const userAnswers = attemptDetails.answers.filter(
                      (answer) => answer.question_id === question.question_id
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
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Audio Transcript Section */}
        {attemptDetails.task_data.transcript && (
          <Card>
            <CardHeader>
              <CardTitle className='text-lg text-tekhelet-500 font-semibold'>
                Audio Transcript
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='p-4 rounded-lg'>
                <p className='text-sm text-tekhelet-500 whitespace-pre-line'>
                  {attemptDetails.task_data.transcript}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};
