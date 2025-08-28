'use client';

import {
  AttemptQuestionResultRenderer,
  isAttemptQuestionCorrect,
} from '@/components/features/user/common/attempt/AttemptQuestionResultRenderer';
import { SelectableText } from '@/components/features/user/exams/reading/components/SelectableText';
import { Button, Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import useListeningAudio from '@/hooks/apis/listening/useListeningAudio';
import { LoadListeningAttemptResultResponse } from '@/types/listening/listening-attempt.types';
import { RootState } from '@/types/store.types';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';

interface ListeningQuestionAnalysisProps {
  attemptDetails: LoadListeningAttemptResultResponse;
}

export const ListeningQuestionAnalysis = ({ attemptDetails }: ListeningQuestionAnalysisProps) => {
  const userAnswersMap = new Map<string, string[]>();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const dragAndDropItems =
    attemptDetails.task_data.question_groups.flatMap((group) => group.drag_items) || [];

  // Get highlights from store for this attempt
  const highlights = useSelector(
    (state: RootState) => state.readingHighlight.highlights[attemptDetails.attempt_id] || []
  );
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
  const { objectUrl, isLoading } = useListeningAudio(attemptDetails.task_data.audio_file_id);

  return (
    <Card>
      <CardHeader>
        <CardTitle className='font-semibold text-xl text-tekhelet-500'>Question Analysis</CardTitle>
        <p className='text-sm text-tekhelet-500'>
          Detailed breakdown of your answers for each question group
        </p>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='w-full'>
          {isLoading ? (
            <p className='text-sm text-muted-foreground'>Loading audio...</p>
          ) : (
            <audio
              ref={audioRef}
              src={objectUrl}
              preload='metadata'
              controls
              controlsList='nodownload'
              className='w-full'
            />
          )}
        </div>
        <div>
          <Collapsible
            open={isOpen}
            onOpenChange={setIsOpen}
            className='flex flex-col gap-2 border rounded-xl p-4'
          >
            <div className='flex items-center justify-between gap-4'>
              <div className='flex items-center gap-2'>
                <h4 className='text-sm font-semibold text-tekhelet-500'>Audio Transcript</h4>
                <Badge
                  variant={'outline'}
                  className={`${
                    attemptDetails.task_data?.transcript
                      ? 'bg-green-600 text-white'
                      : 'bg-red-200 text-red-700'
                  } text-sm font-medium`}
                >
                  {attemptDetails.task_data?.transcript ? 'Available' : 'Not Available'}
                </Badge>
              </div>
              <CollapsibleTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  className='size-8'
                  disabled={!attemptDetails.task_data?.transcript}
                >
                  {isOpen ? <ChevronUp /> : <ChevronDown />}
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent>
              <div className='p-4 rounded-lg'>
                <SelectableText
                  content={attemptDetails.task_data?.transcript ?? 'No transcript available'}
                  className='prose prose-sm max-w-none text-tekhelet-500 mb-4'
                  examAttemptId={attemptDetails.attempt_id}
                  partKey='listening'
                  passageId={attemptDetails.task_data.task_id}
                  isReviewMode={true}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
        {attemptDetails.task_data.question_groups.map((group, groupIndex) => {
          const groupQuestions = group.questions;
          const correctCount = groupQuestions.reduce((acc, q) => {
            const ua = attemptDetails.answers.filter((ans) => ans.question_id === q.question_id);
            return acc + (isAttemptQuestionCorrect(q, ua) ? 1 : 0);
          }, 0);
          return (
            <Collapsible key={group.group_id} className='border rounded-2xl p-4'>
              <CollapsibleTrigger asChild>
                <button
                  type='button'
                  className='group flex w-full items-center justify-between gap-4 cursor-pointer'
                  aria-label={`Toggle ${group.section_label || 'Question Group'}`}
                >
                  <div className='flex items-center gap-3'>
                    <span className='text-lg text-tekhelet-500 font-semibold'>
                      {group.section_label || 'Question Group'}
                    </span>
                    <Badge
                      variant={'outline'}
                      className='text-sm font-semibold text-white bg-selective-yellow-200'
                    >
                      Correct: {correctCount} / {groupQuestions.length}
                    </Badge>
                  </div>
                  <ChevronDown className='h-5 w-5 text-tekhelet-400 transition-transform duration-200 group-data-[state=open]:rotate-180' />
                </button>
              </CollapsibleTrigger>

              <CollapsibleContent>
                {group.instruction && (
                  <SelectableText
                    content={group.instruction || 'No instruction provided'}
                    className='prose prose-sm max-w-none text-tekhelet-500 mt-4'
                    examAttemptId={attemptDetails.attempt_id}
                    partKey='listening'
                    passageId={attemptDetails.task_data.task_id}
                    isReviewMode={true}
                  />
                )}
                <div className='space-y-5 mt-5'>
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
                        audioRef={audioRef}
                        listening
                      />
                    );
                  })}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </CardContent>
    </Card>
  );
};
