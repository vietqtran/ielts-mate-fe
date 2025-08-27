'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IeltsType, PassageStatus, QuestionTypeEnumIndex } from '@/types/reading/reading.types';
import { BookOpen, CheckCircle, Clock, FileQuestion, Users } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { LocalQuestionGroup } from './QuestionGroupsManager';

interface PassageData {
  title: string;
  instruction: string;
  content: string;
  ielts_type: IeltsType;
  part_number: number;
  passage_status: PassageStatus;
}

interface QuestionGroup {
  section_order: number;
  section_label: string;
  instruction: string;
  question_type: number;
  questions: any[];
  drag_items?: string[];
}

interface PassagePreviewProps {
  passageData: PassageData;
  questionGroups: LocalQuestionGroup[];
  onFinish: (status?: PassageStatus) => void;
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

const getQuestionTypeLabel = (type: number): string => {
  switch (type) {
    case QuestionTypeEnumIndex.MULTIPLE_CHOICE:
      return 'Multiple Choice';
    case QuestionTypeEnumIndex.FILL_IN_THE_BLANKS:
      return 'Fill in the Blanks';
    case QuestionTypeEnumIndex.MATCHING:
      return 'Matching';
    case QuestionTypeEnumIndex.DRAG_AND_DROP:
      return 'Drag & Drop';
    default:
      return 'Unknown';
  }
};

export function PassagePreview({
  passageData,
  questionGroups,
  onFinish,
}: Readonly<PassagePreviewProps>) {
  console.log('PassagePreview received questionGroups:', questionGroups);
  const totalQuestions = questionGroups.reduce((total, group) => total + group.questions.length, 0);
  const totalPoints = questionGroups.reduce(
    (total, group) =>
      total +
      group.questions.reduce(
        (groupTotal: number, question: any) => groupTotal + (question.point || 1),
        0
      ),
    0
  );
  const estimatedTime = Math.max(15, Math.ceil(totalQuestions * 1.5)); // Rough estimate: 1.5 min per question, min 15 min

  // Function to validate points for status change
  const validatePointsForStatus = (status: PassageStatus): boolean => {
    if (status !== PassageStatus.TEST && status !== PassageStatus.PUBLISHED) {
      return true; // No validation needed for DRAFT status
    }

    const requiredPoints = passageData.part_number === 1 ? 14 : 13;
    return totalPoints === requiredPoints;
  };

  const handleFinishWithValidation = (status: PassageStatus) => {
    if (!validatePointsForStatus(status)) {
      const requiredPoints = passageData.part_number === 1 ? 14 : 13;
      toast.error(
        `Part ${passageData.part_number} requires exactly ${requiredPoints} points to publish or test. Current points: ${totalPoints}`
      );
      return;
    }
    onFinish(status);
  };

  return (
    <div className='space-y-6'>
      {/* Header & Stats */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='text-2xl'>{passageData.title}</CardTitle>
              <div className='flex gap-2 mt-2'>
                <Badge variant='outline'>{getIeltsTypeLabel(passageData.ielts_type)}</Badge>
                <Badge variant='outline'>Part {passageData.part_number}</Badge>
                <Badge variant='outline'>{getStatusLabel(passageData.passage_status)}</Badge>
              </div>
            </div>
            <div className='flex gap-2'>
              <Button
                onClick={() => handleFinishWithValidation(PassageStatus.TEST)}
                variant='outline'
                className='gap-2'
                disabled={passageData.passage_status === PassageStatus.TEST}
              >
                <FileQuestion className='h-4 w-4' />
                Test Mode
              </Button>
              <Button
                onClick={() => handleFinishWithValidation(PassageStatus.PUBLISHED)}
                className='gap-2'
                disabled={passageData.passage_status === PassageStatus.TEST}
              >
                <CheckCircle className='h-4 w-4' />
                Publish Passage
              </Button>
            </div>
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
                      <h4 className='font-semibold'>{group.section_label}</h4>
                      <Badge variant='secondary' className='mt-1'>
                        {getQuestionTypeLabel(Number(group.question_type))}
                      </Badge>
                    </div>
                    <span className='text-sm text-muted-foreground'>
                      {group.questions.length} question{group.questions.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div
                    className='text-sm text-gray-600 mt-2 prose prose-sm max-w-none'
                    dangerouslySetInnerHTML={{ __html: group.instruction }}
                  />
                </CardHeader>
                <CardContent className='space-y-4'>
                  {Number(group.question_type) === QuestionTypeEnumIndex.MULTIPLE_CHOICE && (
                    <div className='space-y-4'>
                      {group.questions.map((question, qIndex) => (
                        <div key={qIndex} className='space-y-2'>
                          <div
                            className='font-medium'
                            dangerouslySetInnerHTML={{
                              __html: `${question.question_order}. ${question.instruction_for_choice}`,
                            }}
                          />
                          <div className='pl-4 space-y-1'>
                            {question.choices?.map((choice: any, cIndex: number) => (
                              <div
                                key={cIndex}
                                className={`text-sm ${choice.is_correct ? 'text-green-600 font-medium' : ''}`}
                              >
                                {choice.label}. {choice.content}
                                {choice.is_correct && ' ✓'}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {Number(group.question_type) === QuestionTypeEnumIndex.FILL_IN_THE_BLANKS && (
                    <div className='space-y-4'>
                      {group.questions.map((question, qIndex) => (
                        <div key={qIndex} className='space-y-2'>
                          <div>Blank {qIndex + 1}:</div>
                          <div className='pl-4 text-sm text-green-600'>
                            <strong>Answer:</strong> {question.correct_answer}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {Number(group.question_type) === QuestionTypeEnumIndex.MATCHING && (
                    <div className='space-y-4'>
                      {group.questions.map((question, qIndex) => (
                        <div key={qIndex} className='space-y-2'>
                          <div
                            className='font-medium'
                            dangerouslySetInnerHTML={{
                              __html: `${question.question_order}. ${question.instruction_for_matching}`,
                            }}
                          />
                          <div className='pl-4 text-sm'>
                            <div className='bg-green-50 p-2 rounded font-mono text-green-700'>
                              {question.correct_answer_for_matching}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {Number(group.question_type) === QuestionTypeEnumIndex.DRAG_AND_DROP && (
                    <div className='space-y-4'>
                      {group.drag_items && group.drag_items.length > 0 ? (
                        <div>
                          <p className='font-medium text-sm mb-2'>Drag Items:</p>
                          <div className='flex flex-wrap gap-2'>
                            {group.drag_items.map((item, itemIndex) => (
                              <span
                                key={itemIndex}
                                className='px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm'
                              >
                                {typeof item === 'string'
                                  ? item
                                  : item.content || item.item_content || ''}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className='text-sm text-muted-foreground italic'>
                          No drag items available
                        </div>
                      )}

                      <div className='space-y-3'>
                        {group.questions && group.questions.length > 0 ? (
                          group.questions.map((question, qIndex) => {
                            // Find the drag item content for this question
                            let dragItemContent = '';
                            if (question.drag_item_id && group.drag_items) {
                              const dragItem = group.drag_items.find((item) => {
                                if (typeof item === 'string') {
                                  return false; // Skip string items
                                }
                                return (
                                  item.drag_item_id === question.drag_item_id ||
                                  item.item_id === question.drag_item_id ||
                                  item.id === question.drag_item_id
                                );
                              });
                              dragItemContent = dragItem
                                ? dragItem.content || dragItem.item_content || ''
                                : '';
                            }

                            return (
                              <div key={qIndex} className='space-y-2'>
                                <div
                                  className='font-medium'
                                  dangerouslySetInnerHTML={{
                                    __html: `${question.question_order}. ${question.instruction_for_choice || question.explanation || ''}`,
                                  }}
                                />
                                <div className='pl-4 text-sm text-green-600'>
                                  <strong>Zone {question.zone_index}:</strong>{' '}
                                  {dragItemContent || question.drag_item_id || 'No item assigned'}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className='text-sm text-muted-foreground italic'>
                            No questions available
                          </div>
                        )}
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
                {Object.values(QuestionTypeEnumIndex)
                  .filter((v) => typeof v === 'number')
                  .map((type) => {
                    const count = questionGroups.filter(
                      (g) => Number(g.question_type) === type
                    ).length;
                    const questionCount = questionGroups
                      .filter((g) => Number(g.question_type) === type)
                      .reduce((sum, g) => sum + g.questions.length, 0);

                    if (count === 0) return null;

                    return (
                      <div key={type} className='flex justify-between text-sm'>
                        <span>{getQuestionTypeLabel(Number(type))}</span>
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
              <div className='flex gap-2'>
                <Button
                  onClick={() => handleFinishWithValidation(PassageStatus.TEST)}
                  variant='outline'
                  size='lg'
                  className='gap-2'
                  disabled={passageData.passage_status === PassageStatus.TEST}
                >
                  <FileQuestion className='h-5 w-5' />
                  Test Mode
                </Button>
                <Button
                  onClick={() => handleFinishWithValidation(PassageStatus.PUBLISHED)}
                  size='lg'
                  className='gap-2'
                  disabled={passageData.passage_status === PassageStatus.TEST}
                >
                  <CheckCircle className='h-5 w-5' />
                  Publish Passage
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
