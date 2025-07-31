'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ListeningExamAttemptDetailsResponse } from '@/types/listening/listening-exam.types';
import { ChevronDown, ChevronUp, Eye, EyeOff, Headphones } from 'lucide-react';
import { useState } from 'react';
import { ListeningQuestionItem } from '.';
import AudioPlayer from './AudioPlayer';

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
  const [openParts, setOpenParts] = useState<Set<number>>(new Set([1, 2, 3, 4]));

  const parts = [
    examDetails.listening_exam.listening_task_id_part1,
    examDetails.listening_exam.listening_task_id_part2,
    examDetails.listening_exam.listening_task_id_part3,
    examDetails.listening_exam.listening_task_id_part4,
  ];

  const togglePart = (partNumber: number) => {
    const newOpenParts = new Set(openParts);
    if (newOpenParts.has(partNumber)) {
      newOpenParts.delete(partNumber);
    } else {
      newOpenParts.add(partNumber);
    }
    setOpenParts(newOpenParts);
  };

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
    <div className='space-y-6'>
      {/* Header with controls */}
      <Card className='bg-white/70 backdrop-blur-lg border rounded-2xl shadow-lg'>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle className='flex items-center gap-2 text-tekhelet-400'>
              <Headphones className='w-5 h-5' />
              Detailed Question Analysis
            </CardTitle>
            <div className='flex gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setShowTranscripts(!showTranscripts)}
                className='bg-white/50 border-tekhelet-300 hover:bg-white/70 text-tekhelet-600'
              >
                {showTranscripts ? (
                  <EyeOff className='w-4 h-4 mr-2' />
                ) : (
                  <Eye className='w-4 h-4 mr-2' />
                )}
                {showTranscripts ? 'Hide' : 'Show'} Transcripts
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => toggleAllQuestions(openQuestions.size === 0)}
                className='bg-white/50 border-tekhelet-300 hover:bg-white/70 text-tekhelet-600'
              >
                {openQuestions.size > 0 ? 'Collapse All' : 'Expand All'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Parts */}
      {parts.map((part, partIndex) => {
        const partNumber = partIndex + 1;
        const isPartOpen = openParts.has(partNumber);

        return (
          <Card
            key={part.task_id}
            className='bg-white/70 backdrop-blur-lg border rounded-2xl shadow-lg'
          >
            <Collapsible open={isPartOpen} onOpenChange={() => togglePart(partNumber)}>
              <CollapsibleTrigger asChild>
                <CardHeader className='cursor-pointer hover:bg-white/50 transition-colors rounded-t-2xl'>
                  <div className='flex items-center justify-between'>
                    <CardTitle className='flex items-center gap-2 text-tekhelet-400'>
                      <Headphones className='w-5 h-5' />
                      Part {partNumber}: {part.title}
                    </CardTitle>
                    {isPartOpen ? (
                      <ChevronUp className='w-5 h-5' />
                    ) : (
                      <ChevronDown className='w-5 h-5' />
                    )}
                  </div>
                  <p className='text-sm text-tekhelet-500 text-left'>{part.instruction}</p>
                </CardHeader>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <CardContent className='space-y-6'>
                  {/* Audio Player */}
                  <div className='mt-4'>
                    <AudioPlayer
                      audioFileId={part.audio_file_id}
                      title={part.title}
                      partNumber={partNumber}
                    />
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
                  {part.question_groups.map((group) => (
                    <div key={group.question_group_id} className='space-y-4 border rounded-lg p-4'>
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
                        </div>
                      )}

                      {/* Questions */}
                      {group.questions &&
                        group.questions.map((question) => (
                          <ListeningQuestionItem
                            key={question.question_id}
                            question={question}
                            userAnswers={examDetails.answers[question.question_id] || []}
                            isOpen={openQuestions.has(question.question_id)}
                            onToggle={() => onToggleQuestion(question.question_id)}
                            choices={question.choices}
                            dragItems={group.drag_items || []}
                          />
                        ))}
                    </div>
                  ))}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        );
      })}
    </div>
  );
};
