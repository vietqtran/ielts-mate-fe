'use client';

import { QuestionResultRenderer } from '@/components/features/user/exams/reading/components';
import { getQuestionResultStatus } from '@/components/features/user/exams/reading/components/QuestionResultRenderer';
import { SelectableText } from '@/components/features/user/exams/reading/components/SelectableText';
import {
  Badge,
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AudioProvider } from '@/contexts/AudioContext';
import useListeningAudio from '@/hooks/apis/listening/useListeningAudio';
import { ListeningExamAttemptDetailsResponse } from '@/types/listening/listening-exam.types';
import { ChevronDown, ChevronUp, Headphones } from 'lucide-react';
import { useRef, useState } from 'react';

interface ListeningQuestionAnalysisProps {
  examDetails: ListeningExamAttemptDetailsResponse;
  openQuestions: Set<string>;
  onToggleQuestion: (questionId: string) => void;
}

export const ListeningQuestionAnalysis = ({
  examDetails,
  openQuestions,
  onToggleQuestion,
}: ListeningQuestionAnalysisProps) => {
  const [showTranscripts, setShowTranscripts] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const parts = [
    examDetails.listening_exam.listening_task_id_part1,
    examDetails.listening_exam.listening_task_id_part2,
    examDetails.listening_exam.listening_task_id_part3,
    examDetails.listening_exam.listening_task_id_part4,
  ];

  const audioPart1 = useListeningAudio(parts[0]?.audio_file_id);
  const audioPart2 = useListeningAudio(parts[1]?.audio_file_id);
  const audioPart3 = useListeningAudio(parts[2]?.audio_file_id);
  const audioPart4 = useListeningAudio(parts[3]?.audio_file_id);

  const audioByPart: Record<string, { objectUrl: string | undefined; isLoading: boolean }> = {
    part1: { objectUrl: audioPart1.objectUrl, isLoading: audioPart1.isLoading },
    part2: { objectUrl: audioPart2.objectUrl, isLoading: audioPart2.isLoading },
    part3: { objectUrl: audioPart3.objectUrl, isLoading: audioPart3.isLoading },
    part4: { objectUrl: audioPart4.objectUrl, isLoading: audioPart4.isLoading },
  };

  const dragAndDropsList = [
    ...examDetails.listening_exam.listening_task_id_part1.question_groups.flatMap(
      (g) => g.drag_items || []
    ),
    ...examDetails.listening_exam.listening_task_id_part2.question_groups.flatMap(
      (g) => g.drag_items || []
    ),
    ...examDetails.listening_exam.listening_task_id_part3.question_groups.flatMap(
      (g) => g.drag_items || []
    ),
    ...examDetails.listening_exam.listening_task_id_part4.question_groups.flatMap(
      (g) => g.drag_items || []
    ),
  ];
  return (
    <Card className='space-y-6'>
      {/* Header with controls */}
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-tekhelet-400'>
          <Headphones className='w-5 h-5' />
          Detailed Question Analysis
        </CardTitle>
      </CardHeader>

      {/* Tabs for Parts */}
      <CardContent>
        <Tabs defaultValue='part1' className='w-full'>
          <TabsList className='grid w-full grid-cols-4'>
            {['part1', 'part2', 'part3', 'part4'].map((key, idx) => (
              <TabsTrigger
                key={key}
                value={key}
                className='data-[state=active]:bg-tekhelet-300 data-[state=active]:text-selective-yellow-500'
              >
                Part {idx + 1}
              </TabsTrigger>
            ))}
          </TabsList>

          {['part1', 'part2', 'part3', 'part4'].map((partKey, partIndex) => {
            const part = parts[partIndex];
            return (
              <TabsContent key={partKey} value={partKey} className='mt-4'>
                <div className='space-y-6'>
                  {/* Audio Player */}
                  <div className='mt-2 w-full'>
                    {audioByPart[partKey]?.objectUrl ? (
                      <>
                        <audio
                          ref={audioRef}
                          src={audioByPart[partKey]?.objectUrl}
                          preload='metadata'
                          controls
                          controlsList='nodownload'
                          className='w-full'
                        />
                      </>
                    ) : (
                      <div className='text-center text-selective-yellow-300'>
                        {audioByPart[partKey]?.isLoading
                          ? 'Loading audio...'
                          : 'No audio available'}
                      </div>
                    )}
                  </div>

                  <div>
                    <Collapsible
                      open={showTranscripts}
                      onOpenChange={setShowTranscripts}
                      className='flex flex-col gap-2 border rounded-xl p-4'
                    >
                      <div className='flex items-center justify-between gap-4'>
                        <div className='flex items-center gap-2'>
                          <h4 className='text-sm font-semibold text-tekhelet-500'>
                            Audio Transcript
                          </h4>
                          <Badge
                            variant={'outline'}
                            className={`${
                              part.transcript
                                ? 'bg-green-600 text-white'
                                : 'bg-red-200 text-red-700'
                            } text-sm font-medium`}
                          >
                            {part.transcript ? 'Available' : 'Not Available'}
                          </Badge>
                        </div>
                        <CollapsibleTrigger asChild>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='size-8'
                            disabled={!part.transcript}
                          >
                            {showTranscripts ? <ChevronUp /> : <ChevronDown />}
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                      <CollapsibleContent>
                        <div className='p-4 rounded-lg'>
                          <SelectableText
                            content={part.transcript ?? 'No transcript available'}
                            className='prose prose-sm max-w-none text-tekhelet-500 mb-4'
                            examAttemptId={examDetails.exam_attempt_id}
                            partKey={partKey}
                            passageId={part.task_id}
                            isReviewMode={true}
                          />
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>

                  {/* Question Groups */}
                  {part.question_groups.map((group) => {
                    const groupQuestions = group.questions || [];
                    const correctCount = groupQuestions.reduce((acc, q) => {
                      const ua = examDetails.answers[q.question_id] || [];
                      const status = getQuestionResultStatus(q, ua);
                      return acc + (status === true ? 1 : 0);
                    }, 0);

                    return (
                      <Collapsible key={group.question_group_id} className='border rounded-lg p-4'>
                        <CollapsibleTrigger asChild>
                          <button
                            type='button'
                            className='group flex w-full items-center justify-between gap-4 cursor-pointer'
                            aria-label={`Toggle ${group.section_label || 'Question Group'}`}
                          >
                            <div className='flex items-center gap-3'>
                              <span className='font-semibold text-tekhelet-400'>
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
                              examAttemptId={examDetails.exam_attempt_id}
                              partKey={partKey}
                              passageId={part.task_id}
                              isReviewMode={true}
                            />
                          )}

                          {/* Questions */}
                          <div className='space-y-3 mt-5'>
                            <AudioProvider audioRef={audioRef}>
                              {group.questions?.map((question) => {
                                const userAnswers = examDetails.answers[question.question_id] || [];
                                return (
                                  <QuestionResultRenderer
                                    userAnswers={userAnswers}
                                    dragAndDropItems={dragAndDropsList}
                                    question={question}
                                    key={question.question_id}
                                    isListening={true}
                                    audioRef={audioRef}
                                  />
                                );
                              })}
                            </AudioProvider>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    );
                  })}
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </CardContent>
    </Card>
  );
};
