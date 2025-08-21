'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { LoadAttemptResponse } from '@/types/attempt.types';
import { BookOpen, CheckCircle, ChevronDown, ChevronRight, XCircle } from 'lucide-react';

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

  return (
    <Card className='bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-tekhelet-200 ring-1 ring-tekhelet-100'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-tekhelet-500 font-semibold'>
          <BookOpen className='w-5 h-5' />
          Question Analysis
        </CardTitle>
        <p className='text-tekhelet-400'>Breakdown of your answers per question group</p>
      </CardHeader>
      <CardContent className='space-y-4'>
        {groups.map((group, groupIndex) => (
          <Card
            key={group.group_id}
            className='bg-gradient-to-br from-white to-tekhelet-50 border border-tekhelet-100 rounded-2xl'
          >
            <CardHeader className='pb-3'>
              <CardTitle className='text-lg text-tekhelet-500 font-semibold'>
                Part {groupIndex + 1}: {group.section_label}
              </CardTitle>
              {group.instruction && (
                <div
                  className='text-sm text-tekhelet-400 prose prose-sm max-w-none'
                  dangerouslySetInnerHTML={{ __html: group.instruction }}
                />
              )}
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                {group.questions.map((question, questionIndex) => {
                  // locate answer
                  const answer = attemptDetails.answers.find(
                    (a) => a.question_id === question.question_id
                  );
                  const isOpen = openQuestions.has(question.question_id);
                  const userChoiceIds = answer?.choice_ids || [];
                  const isCorrect =
                    userChoiceIds.includes((question as any).correct_answer) || false; // fallback until correct_answer spec provided

                  return (
                    <Collapsible
                      key={question.question_id}
                      open={isOpen}
                      onOpenChange={() => onToggleQuestion(question.question_id)}
                      className='border rounded-lg bg-white/80 hover:bg-white/90 transition-colors'
                    >
                      <CollapsibleTrigger className='w-full'>
                        <div className='flex items-center justify-between w-full p-3 rounded-lg'>
                          <div className='flex items-center gap-3'>
                            {isCorrect ? (
                              <CheckCircle className='w-5 h-5 text-green-600' />
                            ) : (
                              <XCircle className='w-5 h-5 text-red-600' />
                            )}
                            <span className='text-sm font-medium text-tekhelet-500'>
                              Question {questionIndex + 1}
                            </span>
                            <Badge
                              variant={isCorrect ? 'default' : 'destructive'}
                              className='text-xs'
                            >
                              {isCorrect ? 'Correct' : 'Incorrect'}
                            </Badge>
                          </div>
                          {isOpen ? (
                            <ChevronDown className='w-4 h-4 text-tekhelet-400' />
                          ) : (
                            <ChevronRight className='w-4 h-4 text-tekhelet-400' />
                          )}
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent className='mt-2'>
                        <div className='p-4 bg-white/60 rounded-lg space-y-4'>
                          <div>
                            <h4 className='text-sm font-semibold text-tekhelet-500 mb-2'>
                              Your Answer:
                            </h4>
                            {answer ? (
                              <div className='space-y-1'>
                                {answer.choice_ids && answer.choice_ids.length > 0 ? (
                                  <p className='text-sm text-tekhelet-400'>
                                    <strong>Choices:</strong> {answer.choice_ids.join(', ')}
                                  </p>
                                ) : (
                                  <p className='text-sm text-red-600 italic'>No answer provided</p>
                                )}
                              </div>
                            ) : (
                              <p className='text-sm text-red-600 italic'>No answer provided</p>
                            )}
                          </div>
                          {/* Placeholder for correct answer & explanation when API adds them */}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })}
              </div>
              {group.drag_items && group.drag_items.length > 0 && (
                <div className='mt-4 pt-4 border-t border-tekhelet-100'>
                  <h4 className='text-sm font-semibold text-tekhelet-500 mb-2'>Drag Items:</h4>
                  <div className='flex flex-wrap gap-2'>
                    {group.drag_items.map((item) => (
                      <Badge
                        key={item.drag_item_id}
                        variant='outline'
                        className='text-xs bg-white/80'
                      >
                        {item.content}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
};
