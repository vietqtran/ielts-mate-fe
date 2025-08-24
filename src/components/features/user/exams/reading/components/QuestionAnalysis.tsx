'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReadingExamAttemptDetailsResponse } from '@/types/reading/reading-exam-attempt.types';
import { BookOpen } from 'lucide-react';
import { QuestionResultRenderer } from './QuestionResultRenderer';

interface QuestionAnalysisProps {
  examDetails: ReadingExamAttemptDetailsResponse;
  openQuestions: Set<string>;
  onToggleQuestion: (questionId: string) => void;
}

export const QuestionAnalysis = ({
  examDetails,
  openQuestions,
  onToggleQuestion,
}: QuestionAnalysisProps) => {
  const parts = [
    examDetails.reading_exam.reading_passage_id_part1,
    examDetails.reading_exam.reading_passage_id_part2,
    examDetails.reading_exam.reading_passage_id_part3,
  ];

  const dragAndDropItems = [
    ...examDetails.reading_exam.reading_passage_id_part1.question_groups.flatMap(
      (g) => g.drag_items || []
    ),
    ...examDetails.reading_exam.reading_passage_id_part2.question_groups.flatMap(
      (g) => g.drag_items || []
    ),
    ...examDetails.reading_exam.reading_passage_id_part3.question_groups.flatMap(
      (g) => g.drag_items || []
    ),
  ];
  return (
    <Card className='bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl'>
      <CardHeader>
        <CardTitle className='text-tekhelet-400'>Detailed Question Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue='part1' className='w-full'>
          <TabsList className='grid w-full grid-cols-3 bg-tekhelet-900/50'>
            <TabsTrigger value='part1'>Part 1</TabsTrigger>
            <TabsTrigger value='part2'>Part 2</TabsTrigger>
            <TabsTrigger value='part3'>Part 3</TabsTrigger>
          </TabsList>

          {['part1', 'part2', 'part3'].map((partKey, partIndex) => {
            const part = parts[partIndex];

            return (
              <TabsContent key={partKey} value={partKey} className='mt-4'>
                <div className='space-y-6'>
                  {/* Passage Content */}
                  <div className='bg-white/50 rounded-lg p-4'>
                    <h3 className='text-lg font-semibold text-tekhelet-400 mb-2 flex items-center gap-2'>
                      <BookOpen className='w-5 h-5' />
                      {part.title}
                    </h3>
                    <div
                      className='prose prose-sm max-w-none text-tekhelet-500 mb-4'
                      dangerouslySetInnerHTML={{
                        __html: part.instruction || 'No instruction provided',
                      }}
                    />
                    {part.content && (
                      <div className='mt-4 p-4 bg-white/70 rounded-lg border border-tekhelet-200'>
                        <h4 className='font-medium text-tekhelet-400 mb-2'>Reading Passage:</h4>
                        <div
                          className='prose prose-sm max-w-none text-tekhelet-600 leading-relaxed'
                          dangerouslySetInnerHTML={{
                            __html: part.content,
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Questions */}
                  <div className='space-y-4'>
                    {part.question_groups.map((group) => (
                      <div key={group.question_group_id} className='bg-white/50 rounded-lg p-4'>
                        <h4 className='font-semibold text-tekhelet-400 mb-3'>
                          {group.section_label}
                        </h4>
                        <div
                          className='text-tekhelet-500 prose prose-sm max-w-none mb-4'
                          dangerouslySetInnerHTML={{
                            __html: group.instruction || 'No instruction provided',
                          }}
                        />

                        <div className='space-y-3'>
                          {group.questions && group.questions.length > 0 ? (
                            group.questions.map((question) => {
                              // Get user answers from the main exam details answers map
                              const userAnswers = examDetails.answers[question.question_id] || [];

                              return (
                                <QuestionResultRenderer
                                  key={question.question_id}
                                  question={question}
                                  userAnswers={userAnswers}
                                  dragAndDropItems={dragAndDropItems}
                                />
                              );
                            })
                          ) : (
                            <div className='text-center py-4 text-tekhelet-500'>
                              <p>No questions available for this section.</p>
                              <p className='text-sm mt-1'>
                                This may be a question group with questions stored elsewhere or
                                questions that need to be populated.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </CardContent>
    </Card>
  );
};
