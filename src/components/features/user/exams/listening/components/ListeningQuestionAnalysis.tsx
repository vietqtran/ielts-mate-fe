'use client';

import { QuestionResultRenderer } from '@/components/features/user/exams/reading/components';
import { getQuestionResultStatus } from '@/components/features/user/exams/reading/components/QuestionResultRenderer';
import { Badge } from '@/components/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AudioProvider } from '@/contexts/AudioContext';
import useListeningAudio from '@/hooks/apis/listening/useListeningAudio';
import { ListeningExamAttemptDetailsResponse } from '@/types/listening/listening-exam.types';
import { Headphones } from 'lucide-react';
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

  const toggleAllQuestions = (isOpen: boolean) => {
    const allQuestionIds: string[] = [];
    parts.forEach((part) => {
      part.question_groups.forEach((group) => {
        if (group.questions) {
          group.questions.forEach((question) => {
            allQuestionIds.push(question.question_id);
          });
        }
      });
    });

    if (isOpen) {
      allQuestionIds.forEach(onToggleQuestion);
    } else {
      allQuestionIds.forEach((id) => {
        if (openQuestions.has(id)) {
          onToggleQuestion(id);
        }
      });
    }
  };

  return (
    <Card className='space-y-6'>
      {/* Header with controls */}
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-tekhelet-400'>
          <Headphones className='w-5 h-5' />
          Detailed Question Analysis
        </CardTitle>
        {/* <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTranscripts(!showTranscripts)}
              className="bg-white/50 border-tekhelet-300 hover:bg-white/70 text-tekhelet-600"
            >
              {showTranscripts ? (
                <EyeOff className="w-4 h-4 mr-2" />
              ) : (
                <Eye className="w-4 h-4 mr-2" />
              )}
              {showTranscripts ? "Hide" : "Show"} Transcripts
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleAllQuestions(openQuestions.size === 0)}
              className="bg-white/50 border-tekhelet-300 hover:bg-white/70 text-tekhelet-600"
            >
              {openQuestions.size > 0 ? "Collapse All" : "Expand All"}
            </Button>
          </div> */}
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
            const partNumber = partIndex + 1;
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

                  {/* Transcript */}
                  {showTranscripts && part.transcription && (
                    <Card className='bg-tekhelet-100/30 border border-tekhelet-300'>
                      <CardHeader>
                        <CardTitle className='text-sm text-tekhelet-600'>
                          Audio Transcript
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className='prose prose-sm max-w-none text-tekhelet-700'>
                          <p className='whitespace-pre-line'>{part.transcription}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Question Groups */}
                  {part.question_groups.map((group) => {
                    const groupQuestions = group.questions || [];
                    const correctCount = groupQuestions.reduce((acc, q) => {
                      const ua = examDetails.answers[q.question_id] || [];
                      const status = getQuestionResultStatus(q, ua);
                      return acc + (status === true ? 1 : 0);
                    }, 0);

                    return (
                      <div
                        key={group.question_group_id}
                        className='space-y-4 border rounded-lg p-4'
                      >
                        {group.section_label && (
                          <div className='p-3'>
                            <h4 className='font-medium text-tekhelet-600'>{group.section_label}</h4>
                            {group.instruction && (
                              <div
                                className='text-sm text-tekhelet-500 mt-1'
                                dangerouslySetInnerHTML={{
                                  __html: group.instruction,
                                }}
                              />
                            )}
                            <Badge
                              variant={'outline'}
                              className='text-sm font-semibold text-white bg-selective-yellow-200 mt-5'
                            >
                              Correct: {correctCount} / {groupQuestions.length}
                            </Badge>
                          </div>
                        )}

                        {/* Questions */}
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
                              />
                            );
                          })}
                        </AudioProvider>
                      </div>
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
