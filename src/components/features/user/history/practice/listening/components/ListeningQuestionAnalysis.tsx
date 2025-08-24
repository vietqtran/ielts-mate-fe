'use client';

import { AttemptQuestionResultRenderer } from '@/components/features/user/common/attempt/AttemptQuestionResultRenderer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadListeningAttemptResultResponse } from '@/types/listening/listening-attempt.types';
import { Volume2 } from 'lucide-react';

interface ListeningQuestionAnalysisProps {
  attemptDetails: LoadListeningAttemptResultResponse;
}

export const ListeningQuestionAnalysis = ({ attemptDetails }: ListeningQuestionAnalysisProps) => {
  // Create a map of user answers for quick lookup
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
    <Card className='rounded-3xl border'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-[#003b73] font-semibold'>
          <Volume2 className='w-5 h-5' />
          Question Analysis
        </CardTitle>
        <p className='text-[#0074b7]'>Detailed breakdown of your answers for each question group</p>
      </CardHeader>
      <CardContent className='space-y-4'>
        {attemptDetails.task_data.question_groups.map((group, groupIndex) => (
          <Card
            key={group.group_id}
            className='backdrop-blur-sm bg-gradient-to-br from-[#bfd7ed]/30 to-[#60a3d9]/10 border border-[#60a3d9]/20 rounded-2xl'
          >
            <CardHeader className='pb-3'>
              <CardTitle className='text-lg text-[#003b73] font-semibold'>
                Part {groupIndex + 1}: {group.section_label}
              </CardTitle>
              {group.instruction && (
                <div
                  className='text-sm text-[#0074b7]'
                  dangerouslySetInnerHTML={{ __html: group.instruction }}
                />
              )}
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
        ))}

        {/* Audio Transcript Section */}
        {attemptDetails.task_data.transcript && (
          <Card className='bg-[#bfd7ed]/50 backdrop-blur-sm rounded-2xl border border-[#60a3d9]/30'>
            <CardHeader>
              <CardTitle className='text-lg text-[#003b73] font-semibold'>
                Audio Transcript
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='p-4 bg-white/60 rounded-lg'>
                <p className='text-sm text-[#0074b7] whitespace-pre-line'>
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
