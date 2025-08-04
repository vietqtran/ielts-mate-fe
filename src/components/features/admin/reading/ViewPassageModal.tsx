'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Edit, Eye, EyeOff, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { usePassage } from '@/hooks';
import { PassageGetResponse, QuestionTypeEnumIndex } from '@/types/reading/reading.types';

interface ViewPassageModalProps {
  passage: PassageGetResponse;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const getielts_typeLabel = (type: number): string => {
  switch (type) {
    case 0:
      return 'Academic';
    case 1:
      return 'General Training';
    default:
      return 'Unknown';
  }
};

const getStatusLabel = (status: number): string => {
  switch (status) {
    case 0:
      return 'Draft';
    case 1:
      return 'Published';
    case 2:
      return 'Deactivated';
    case 3:
      return 'Finished';
    case 4:
      return 'Test';
    default:
      return 'Unknown';
  }
};

const getStatusColor = (status: number): string => {
  switch (status) {
    case 0:
      return 'bg-gray-100 text-gray-800';
    case 1:
      return 'bg-green-100 text-green-800';
    case 2:
      return 'bg-red-100 text-red-800';
    case 3:
      return 'bg-blue-100 text-blue-800';
    case 4:
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export function ViewPassageModal({
  passage,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: ViewPassageModalProps) {
  const { getAllQuestionGroups } = usePassage();
  const [questionGroups, setQuestionGroups] = useState<any[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [showHighlights, setShowHighlights] = useState(false);

  useEffect(() => {
    if (isOpen && passage.passage_id) {
      loadQuestionGroups();
    }
  }, [isOpen, passage.passage_id]);

  const loadQuestionGroups = async () => {
    setIsLoadingGroups(true);
    try {
      const response = await getAllQuestionGroups(passage.passage_id);
      if (response.data) {
        setQuestionGroups(response.data);
      }
    } catch (error) {
    } finally {
      setIsLoadingGroups(false);
    }
  };

  const renderQuestionsByType = (questions: any[]) => {
    return questions.map((question, index) => {
      switch (question.question_type) {
        case QuestionTypeEnumIndex.MULTIPLE_CHOICE: // Multiple Choice
          return (
            <div key={index} className='space-y-2'>
              <h5 className='font-medium'>Question {question.question_order}</h5>
              <div
                dangerouslySetInnerHTML={{
                  __html: question.instruction_for_choice,
                }}
              />
              {question.choices && (
                <div className='space-y-1 ml-4'>
                  {question.choices.map((choice: any, choiceIndex: number) => (
                    <div
                      key={choiceIndex}
                      className={`text-sm ${choice.is_correct ? 'text-green-600 font-medium' : ''}`}
                    >
                      {choice.label}. {choice.content}
                      {choice.is_correct && ' ✓'}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        case QuestionTypeEnumIndex.FILL_IN_THE_BLANKS: // Fill in Blank
          return (
            <div key={index} className='space-y-2'>
              <h5 className='font-medium'>Blank {question.blank_index}</h5>
              <p className='text-sm text-green-600 font-medium'>
                Answer: {question.correct_answer}
              </p>
            </div>
          );
        case QuestionTypeEnumIndex.MATCHING: // Matching
          return (
            <div key={index} className='space-y-2'>
              <h5 className='font-medium'>Question {question.question_order}</h5>
              <div
                dangerouslySetInnerHTML={{
                  __html: question.instruction_for_matching,
                }}
              />
              <div className='text-sm'>
                <p className='font-medium'>Correct Answers:</p>
                <p className='font-mono bg-gray-50 p-2 rounded'>
                  {question.correct_answer_for_matching}
                </p>
              </div>
            </div>
          );
        case QuestionTypeEnumIndex.DRAG_AND_DROP: // Drag and Drop
          return (
            <div key={index} className='space-y-2'>
              <h5 className='font-medium'>Zone {question.zone_index}</h5>
              <p className='text-sm text-green-600 font-medium'>
                Correct Item: {question.dragItemContent}
              </p>
            </div>
          );
        default:
          return null;
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-6xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <div className='flex items-center justify-between'>
            <DialogTitle>{passage.title}</DialogTitle>
            <div className='flex gap-2'>
              <Button onClick={onEdit} variant='outline' size='sm'>
                <Edit className='h-4 w-4 mr-2' />
                Edit
              </Button>
              <Button onClick={onDelete} variant='destructive' size='sm'>
                <Trash2 className='h-4 w-4 mr-2' />
                Delete
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Passage Information */}
          <Card>
            <CardHeader>
              <CardTitle>Passage Information</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                <div>
                  <p className='text-sm font-medium text-muted-foreground'>IELTS Type</p>
                  <Badge variant='outline'>{getielts_typeLabel(passage.ielts_type)}</Badge>
                </div>
                <div>
                  <p className='text-sm font-medium text-muted-foreground'>Part Number</p>
                  <p>Part {passage.part_number}</p>
                </div>
                <div>
                  <p className='text-sm font-medium text-muted-foreground'>Status</p>
                  <Badge variant={'outline'} className={getStatusColor(passage.passage_status)}>
                    {getStatusLabel(passage.passage_status)}
                  </Badge>
                </div>
                <div>
                  <p className='text-sm font-medium text-muted-foreground'>Created By</p>
                  <p>
                    {passage.created_by?.first_name} {passage.created_by?.last_name}
                  </p>
                </div>
              </div>

              {passage.instruction && (
                <div>
                  <p className='text-sm font-medium text-muted-foreground mb-2'>Instruction</p>
                  <div className='p-3 bg-gray-50 rounded-md'>{passage.instruction}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reading Content */}
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <CardTitle>Reading Passage</CardTitle>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setShowHighlights(!showHighlights)}
                >
                  {showHighlights ? (
                    <>
                      <EyeOff className='h-4 w-4 mr-2' />
                      Hide Highlights
                    </>
                  ) : (
                    <>
                      <Eye className='h-4 w-4 mr-2' />
                      Show Highlights
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div
                className='prose max-w-none'
                dangerouslySetInnerHTML={{
                  __html: showHighlights
                    ? passage.content_with_highlight_keywords
                    : passage.content,
                }}
              />
            </CardContent>
          </Card>

          {/* Question Groups */}
          <Card>
            <CardHeader>
              <CardTitle>Question Groups</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingGroups ? (
                <div className='flex items-center justify-center py-8'>
                  <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
                </div>
              ) : questionGroups.length === 0 ? (
                <p className='text-center text-muted-foreground py-8'>
                  No question groups found for this passage.
                </p>
              ) : (
                <div className='space-y-6'>
                  {questionGroups.map((group, groupIndex) => (
                    <div key={groupIndex} className='border rounded-lg p-4'>
                      <div className='mb-4'>
                        <h4 className='font-semibold text-lg'>{group.section_label}</h4>
                        {group.instruction && (
                          <div className='mt-2 p-3 bg-blue-50 rounded-md'>
                            <div
                              className='text-sm prose prose-sm max-w-none'
                              dangerouslySetInnerHTML={{
                                __html: group.instruction,
                              }}
                            />
                          </div>
                        )}
                      </div>

                      <Separator className='my-4' />

                      {group.questions && group.questions.length > 0 ? (
                        <div className='space-y-4'>
                          {/* Group questions by type and show instruction once */}
                          {group.questions.filter(
                            (q: any) => q.instruction_for_choice || q.instruction_for_matching
                          ).length > 0 && (
                            <div className='space-y-3'>
                              {group.questions
                                .filter(
                                  (q: any) => q.instruction_for_choice || q.instruction_for_matching
                                )
                                .slice(0, 1) // Show instruction from first question only
                                .map((question: any, index: number) => (
                                  <div key={index} className='p-3 bg-gray-50 rounded-md'>
                                    <div
                                      dangerouslySetInnerHTML={{
                                        __html:
                                          question.instruction_for_choice ||
                                          question.instruction_for_matching,
                                      }}
                                    />
                                  </div>
                                ))}
                            </div>
                          )}

                          <div className='grid gap-4'>{renderQuestionsByType(group.questions)}</div>

                          {/* Show drag items if this is a drag & drop group */}
                          {group.questions.some((q: any) => q.question_type === 3) && (
                            <div className='mt-4 p-3 bg-blue-50 rounded-md'>
                              <p className='text-sm font-medium mb-2'>Available Drag Items:</p>
                              <div className='flex flex-wrap gap-2'>
                                {/* This would need to be populated from drag items API */}
                                <span className='text-sm text-muted-foreground'>
                                  Drag items would be loaded separately
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className='text-muted-foreground text-center py-4'>
                          No questions in this group.
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
