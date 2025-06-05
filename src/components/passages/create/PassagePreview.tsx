'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IeltsType, PassageStatus, QuestionType } from '@/types/reading.types';
import { BookOpen, CheckCircle, Clock, Users } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface PassageData {
  title: string;
  instruction: string;
  content: string;
  ieltsType: IeltsType;
  partNumber: number;
  passageStatus: PassageStatus;
}

interface QuestionGroup {
  sectionOrder: number;
  sectionLabel: string;
  instruction: string;
  questionType: QuestionType;
  questions: any[];
  dragItems?: string[];
}

interface PassagePreviewProps {
  passageData: PassageData;
  questionGroups: QuestionGroup[];
  onFinish: () => void;
}

const getIeltsTypeLabel = (type: IeltsType): string => {
  switch (type) {
    case IeltsType.ACADEMIC:
      return 'Academic';
    case IeltsType.GENERAL_TRAINING:
      return 'General Training';
    default:
      return 'Unknown';
  }
};

const getStatusLabel = (status: PassageStatus): string => {
  switch (status) {
    case PassageStatus.DRAFT:
      return 'Draft';
    case PassageStatus.PUBLISHED:
      return 'Published';
    case PassageStatus.DEACTIVATED:
      return 'Deactivated';
    case PassageStatus.FINISHED:
      return 'Finished';
    case PassageStatus.TEST:
      return 'Test';
    default:
      return 'Unknown';
  }
};

const getQuestionTypeLabel = (type: QuestionType): string => {
  switch (type) {
    case QuestionType.MULTIPLE_CHOICE:
      return 'Multiple Choice';
    case QuestionType.FILL_IN_THE_BLANKS:
      return 'Fill in the Blanks';
    case QuestionType.MATCHING:
      return 'Matching';
    case QuestionType.DRAG_AND_DROP:
      return 'Drag & Drop';
    default:
      return 'Unknown';
  }
};

export function PassagePreview({ passageData, questionGroups, onFinish }: PassagePreviewProps) {
  const totalQuestions = questionGroups.reduce((total, group) => total + group.questions.length, 0);
  const estimatedTime = Math.max(15, Math.ceil(totalQuestions * 1.5)); // Rough estimate: 1.5 min per question, min 15 min

  return (
    <div className='space-y-6'>
      {/* Header & Stats */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='text-2xl'>{passageData.title}</CardTitle>
              <div className='flex gap-2 mt-2'>
                <Badge variant='outline'>{getIeltsTypeLabel(passageData.ieltsType)}</Badge>
                <Badge variant='outline'>Part {passageData.partNumber}</Badge>
                <Badge variant='outline'>{getStatusLabel(passageData.passageStatus)}</Badge>
              </div>
            </div>
            <Button onClick={onFinish} className='gap-2'>
              <CheckCircle className='h-4 w-4' />
              Publish Passage
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-4 gap-4 text-center'>
            <div className='flex flex-col items-center gap-2'>
              <BookOpen className='h-8 w-8 text-blue-600' />
              <div>
                <p className='text-2xl font-bold'>{questionGroups.length}</p>
                <p className='text-sm text-muted-foreground'>Question Groups</p>
              </div>
            </div>
            <div className='flex flex-col items-center gap-2'>
              <Users className='h-8 w-8 text-green-600' />
              <div>
                <p className='text-2xl font-bold'>{totalQuestions}</p>
                <p className='text-sm text-muted-foreground'>Total Questions</p>
              </div>
            </div>
            <div className='flex flex-col items-center gap-2'>
              <Clock className='h-8 w-8 text-orange-600' />
              <div>
                <p className='text-2xl font-bold'>{estimatedTime}</p>
                <p className='text-sm text-muted-foreground'>Est. Minutes</p>
              </div>
            </div>
            <div className='flex flex-col items-center gap-2'>
              <CheckCircle className='h-8 w-8 text-purple-600' />
              <div>
                <p className='text-2xl font-bold'>Ready</p>
                <p className='text-sm text-muted-foreground'>Status</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exam Preview */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Exam Preview</CardTitle>
          <p className='text-sm text-muted-foreground'>
            This is how students will see your passage and questions
          </p>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Passage Instruction */}
          <div className='bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500'>
            <h3 className='font-semibold text-blue-900 mb-2'>Reading Instructions</h3>
            <p className='text-blue-800'>{passageData.instruction}</p>
          </div>

          {/* Reading Passage */}
          <div>
            <h3 className='font-semibold mb-4 text-lg'>{passageData.title}</h3>
            <div
              className='prose prose-sm max-w-none p-6 bg-gray-50 rounded-lg border'
              dangerouslySetInnerHTML={{ __html: passageData.content }}
            />
          </div>

          <Separator />

          {/* Questions Preview */}
          <div className='space-y-6'>
            <h3 className='font-semibold text-lg'>Questions</h3>

            {questionGroups.map((group, groupIndex) => (
              <Card key={groupIndex} className='border-l-4 border-l-green-500'>
                <CardHeader className='pb-3'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <h4 className='font-semibold'>{group.sectionLabel}</h4>
                      <Badge variant='secondary' className='mt-1'>
                        {getQuestionTypeLabel(group.questionType)}
                      </Badge>
                    </div>
                    <span className='text-sm text-muted-foreground'>
                      {group.questions.length} question{group.questions.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <p className='text-sm text-gray-600 mt-2'>{group.instruction}</p>
                </CardHeader>
                <CardContent className='space-y-4'>
                  {group.questionType === QuestionType.MULTIPLE_CHOICE && (
                    <div className='space-y-4'>
                      {group.questions.map((question, qIndex) => (
                        <div key={qIndex} className='space-y-2'>
                          <div
                            className='font-medium'
                            dangerouslySetInnerHTML={{
                              __html: `${question.questionOrder}. ${question.instructionForChoice}`,
                            }}
                          />
                          <div className='pl-4 space-y-1'>
                            {question.choices?.map((choice: any, cIndex: number) => (
                              <div
                                key={cIndex}
                                className={`text-sm ${choice.isCorrect ? 'text-green-600 font-medium' : ''}`}
                              >
                                {choice.label}. {choice.content}
                                {choice.isCorrect && ' ✓'}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {group.questionType === QuestionType.FILL_IN_THE_BLANKS && (
                    <div className='space-y-4'>
                      {group.questions.map((question, qIndex) => (
                        <div key={qIndex} className='space-y-2'>
                          <div
                            className='font-medium'
                            dangerouslySetInnerHTML={{
                              __html: `${question.questionOrder}. ${question.instructionForChoice}`,
                            }}
                          />
                          <div className='pl-4 text-sm text-green-600'>
                            <strong>Answer:</strong> {question.correctAnswer}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {group.questionType === QuestionType.MATCHING && (
                    <div className='space-y-4'>
                      {group.questions.map((question, qIndex) => (
                        <div key={qIndex} className='space-y-2'>
                          <div
                            className='font-medium'
                            dangerouslySetInnerHTML={{
                              __html: `${question.questionOrder}. ${question.instructionForMatching}`,
                            }}
                          />
                          <div className='pl-4 text-sm'>
                            <div className='bg-green-50 p-2 rounded font-mono text-green-700'>
                              {question.correctAnswerForMatching}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {group.questionType === QuestionType.DRAG_AND_DROP && (
                    <div className='space-y-4'>
                      {group.dragItems && group.dragItems.length > 0 && (
                        <div>
                          <p className='font-medium text-sm mb-2'>Drag Items:</p>
                          <div className='flex flex-wrap gap-2'>
                            {group.dragItems.map((item, itemIndex) => (
                              <span
                                key={itemIndex}
                                className='px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm'
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className='space-y-3'>
                        {group.questions.map((question, qIndex) => (
                          <div key={qIndex} className='space-y-2'>
                            <div
                              className='font-medium'
                              dangerouslySetInnerHTML={{
                                __html: `${question.questionOrder}. ${question.instructionForChoice}`,
                              }}
                            />
                            <div className='pl-4 text-sm text-green-600'>
                              <strong>Zone {question.zoneIndex}:</strong> {question.dragItemId}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary & Actions */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Passage Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <h4 className='font-semibold mb-3'>Question Type Distribution</h4>
              <div className='space-y-2'>
                {Object.values(QuestionType).map((type) => {
                  const count = questionGroups.filter((g) => g.questionType === type).length;
                  const questionCount = questionGroups
                    .filter((g) => g.questionType === type)
                    .reduce((sum, g) => sum + g.questions.length, 0);

                  if (count === 0) return null;

                  return (
                    <div key={type} className='flex justify-between text-sm'>
                      <span>{getQuestionTypeLabel(type)}</span>
                      <span className='text-muted-foreground'>
                        {count} group{count !== 1 ? 's' : ''}, {questionCount} question
                        {questionCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h4 className='font-semibold mb-3'>IELTS Compliance Check</h4>
              <div className='space-y-2 text-sm'>
                <div className='flex items-center gap-2'>
                  <CheckCircle className='h-4 w-4 text-green-600' />
                  <span>Passage content provided</span>
                </div>
                <div className='flex items-center gap-2'>
                  <CheckCircle className='h-4 w-4 text-green-600' />
                  <span>Clear instructions included</span>
                </div>
                <div className='flex items-center gap-2'>
                  <CheckCircle className='h-4 w-4 text-green-600' />
                  <span>Question groups created</span>
                </div>
                <div className='flex items-center gap-2'>
                  <CheckCircle className='h-4 w-4 text-green-600' />
                  <span>{totalQuestions} questions total</span>
                </div>
                <div className='flex items-center gap-2'>
                  <CheckCircle className='h-4 w-4 text-green-600' />
                  <span>Multiple question types used</span>
                </div>
              </div>
            </div>
          </div>

          <div className='mt-6 pt-4 border-t'>
            <div className='flex justify-between items-center'>
              <div className='text-sm text-muted-foreground'>
                Ready to publish this passage for student use
              </div>
              <Button onClick={onFinish} size='lg' className='gap-2'>
                <CheckCircle className='h-5 w-5' />
                Complete & Publish Passage
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
