'use client';

import { QuestionGroupForm } from '@/components/features/admin/reading/create/QuestionGroupForm';
import { DragDropManager } from '@/components/features/admin/reading/create/questions/DragDropManager';
import { FillInBlanksManager } from '@/components/features/admin/reading/create/questions/FillInBlanksManager';
import { MatchingManager } from '@/components/features/admin/reading/create/questions/MatchingManager';
import { MultipleChoiceManager } from '@/components/features/admin/reading/create/questions/MultipleChoiceManager';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useListeningQuestion, useListeningTask } from '@/hooks';

import { SafeHtmlRenderer } from '@/lib/utils/safeHtml';
import { QuestionTypeEnumIndex } from '@/types/reading/reading.types';
import { Edit3, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export interface DragItem {
  id?: string;
  drag_item_id?: string;
  item_id?: string;
  content: string;
  item_content?: string;
}

export interface LocalListeningQuestionGroup {
  id?: string;
  section_order: number;
  section_label: string;
  instruction: string;
  question_type: number;
  questions: any[];
  drag_items?: DragItem[];
}

interface ListeningQuestionGroupsManagerProps {
  task_id: string;
  questionGroups: LocalListeningQuestionGroup[];
  onAddGroup: (group: LocalListeningQuestionGroup) => void;
  onUpdateGroup: (index: number, group: LocalListeningQuestionGroup) => void;
  onDeleteGroup: (index: number) => void;
  refetchTaskData: () => void;
}

const IELTS_QUESTION_TYPES: Array<{
  type: number;
  label: string;
  description: string;
  icon: string;
  explanation: string;
  tips: string;
}> = [
  {
    type: QuestionTypeEnumIndex.MULTIPLE_CHOICE,
    label: 'Multiple Choice',
    description: 'Choose the correct answer from multiple options',
    icon: '●',
    explanation:
      'Students select one or more correct answers from given options. Can be single or multiple correct answers.',
    tips: 'Use for testing specific information, opinions, or main ideas. Provide 3-4 plausible options.',
  },
  {
    type: QuestionTypeEnumIndex.FILL_IN_THE_BLANKS,
    label: 'Fill in the Blanks',
    description: 'Complete sentences with missing words from the audio',
    icon: '___',
    explanation:
      'Students fill in numbered blanks with words they hear. Usually 1-3 words per blank.',
    tips: 'Test factual information, dates, names, or key terms. Blanks should follow audio order.',
  },
  {
    type: QuestionTypeEnumIndex.MATCHING,
    label: 'Matching',
    description: 'Match items to categories, headings, or audio sections',
    icon: '⟷',
    explanation:
      'Students match statements, headings, or features to appropriate sections of the audio.',
    tips: 'Divide audio into clear sections. Use for testing understanding of main ideas.',
  },
  {
    type: QuestionTypeEnumIndex.DRAG_AND_DROP,
    label: 'Drag & Drop',
    description: 'Drag items to correct positions in diagrams or text',
    icon: '🔄',
    explanation: 'Interactive questions where students drag items to correct zones or positions.',
    tips: 'Good for visual learners. Use with diagrams, flowcharts, or completion tasks.',
  },
];

export function ListeningQuestionGroupsManager({
  task_id,
  questionGroups,
  onAddGroup,
  onUpdateGroup,
  onDeleteGroup,
  refetchTaskData,
}: Readonly<ListeningQuestionGroupsManagerProps>) {
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [activeGroupIndex, setActiveGroupIndex] = useState<number | null>(null);
  const { addGroupQuestion, getAllQuestionGroups, isLoading } = useListeningTask();
  const { createQuestions, ...useListeningQuestionHooks } = useListeningQuestion();

  useEffect(() => {
    setIsCreatingGroup(false);
    setActiveGroupIndex(null);
  }, [task_id]);

  const handleCreateGroup = async (groupData: any) => {
    if (isLoading.addGroupQuestion) return;
    try {
      const response = await addGroupQuestion(task_id, groupData);
      if (response.data) {
        const group_id = response.data.group_id;
        if (!group_id) return;
        const frontendGroup: LocalListeningQuestionGroup = {
          id: group_id,
          section_order: response.data.section_order || groupData.section_order,
          section_label: response.data.section_label || groupData.section_label,
          instruction: response.data.instruction || groupData.instruction,
          question_type: groupData.question_type,
          questions: response.data.questions ?? [],
          drag_items:
            'drag_items' in response.data && response.data.drag_items !== undefined
              ? response.data.drag_items
              : (groupData.drag_items ?? []),
        };
        onAddGroup(frontendGroup);
        setIsCreatingGroup(false);
      }
    } catch (error) {}
  };

  const handleEditGroup = (index: number) => {
    setActiveGroupIndex(index);
  };

  const handleDeleteGroup = (index: number) => {
    onDeleteGroup(index);
    if (activeGroupIndex === index) {
      setActiveGroupIndex(null);
    }
  };

  const renderQuestionManager = (group: LocalListeningQuestionGroup, groupIndex: number) => {
    const commonProps = {
      group,
      groupIndex,
      onUpdateGroup: (updatedGroup: any) => {
        const hasJustCreatedQuestions = updatedGroup._justCreatedQuestions === true;
        const createdQuestionIds = updatedGroup._createdQuestionIds || [];
        const localGroup: LocalListeningQuestionGroup = {
          id: updatedGroup.id,
          section_order: updatedGroup.section_order,
          section_label: updatedGroup.section_label,
          instruction: updatedGroup.instruction,
          question_type: updatedGroup.question_type,
          questions: (updatedGroup.questions || []).map((q: any) => ({
            ...q,
            question_id: q.question_id || q.id,
            choices: (q.choices || []).map((c: any) => ({
              ...c,
              choice_id: c.choice_id || c.id,
            })),
          })),
          drag_items: updatedGroup.drag_items || [],
        };
        if (hasJustCreatedQuestions) {
          // @ts-ignore
          localGroup._justCreatedQuestions = true;
          // @ts-ignore
          localGroup._createdQuestionIds = createdQuestionIds;
        }
        onUpdateGroup(groupIndex, localGroup);
      },
      refetchPassageData: refetchTaskData,
    };
    switch (group.question_type) {
      case QuestionTypeEnumIndex.MULTIPLE_CHOICE:
        return (
          <MultipleChoiceManager
            {...commonProps}
            onUpdateGroup={commonProps.onUpdateGroup}
            isListening={true}
          />
        );
      case QuestionTypeEnumIndex.FILL_IN_THE_BLANKS:
        return (
          <FillInBlanksManager
            {...commonProps}
            onUpdateGroup={commonProps.onUpdateGroup}
            isListening={true}
          />
        );
      case QuestionTypeEnumIndex.MATCHING:
        return (
          <MatchingManager
            {...commonProps}
            onUpdateGroup={commonProps.onUpdateGroup}
            isListening={true}
          />
        );
      case QuestionTypeEnumIndex.DRAG_AND_DROP:
        return (
          <DragDropManager
            {...commonProps}
            onUpdateGroup={commonProps.onUpdateGroup}
            isListening={true}
          />
        );
      default:
        return (
          <div className='text-center text-muted-foreground py-8'>
            Question type not supported yet
          </div>
        );
    }
  };

  const getQuestionTypeInfo = (type: number) => {
    return IELTS_QUESTION_TYPES.find((qt) => qt.type === type);
  };

  return (
    <div className='space-y-6'>
      {/* Question Types Guide */}
      <Card>
        <CardHeader>
          <CardTitle>IELTS Listening Question Types</CardTitle>
          <p className='text-sm text-muted-foreground'>
            Choose from common IELTS listening question formats. Each type tests different skills.
          </p>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {IELTS_QUESTION_TYPES.map((question_type) => (
              <div key={question_type.type} className='p-4 border rounded-lg hover:bg-gray-50'>
                <div className='flex items-start gap-3'>
                  <span className='text-2xl'>{question_type.icon}</span>
                  <div className='flex-1'>
                    <h4 className='font-semibold'>{question_type.label}</h4>
                    <p className='text-sm text-muted-foreground mt-1'>
                      {question_type.description}
                    </p>
                    <p className='text-xs text-blue-600 mt-2'>{question_type.explanation}</p>
                    <p className='text-xs text-green-600 mt-1 italic'>💡 {question_type.tips}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      {/* Create New Group */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle>Question Groups ({questionGroups.length})</CardTitle>
            <Button onClick={() => setIsCreatingGroup(true)} className='gap-2'>
              <Plus className='h-4 w-4' />
              Add Question Group
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isCreatingGroup && (
            <QuestionGroupForm
              onSubmit={handleCreateGroup}
              onCancel={() => setIsCreatingGroup(false)}
              isLoading={isLoading.addGroupQuestion}
            />
          )}
          {questionGroups.length === 0 && !isCreatingGroup && (
            <div className='text-center text-muted-foreground py-8'>
              No question groups yet. Add your first group!
            </div>
          )}
          {questionGroups.map((group, index) => (
            <Card key={index} className='mt-4'>
              <CardHeader className='flex flex-row items-center justify-between'>
                <div>
                  <CardTitle>{group.section_label}</CardTitle>
                  <Badge variant='secondary' className='ml-2'>
                    {getQuestionTypeInfo(Number(group.question_type))?.label}
                  </Badge>
                </div>
                <div className='flex gap-2'>
                  <Button variant='outline' size='icon' onClick={() => handleEditGroup(index)}>
                    <Edit3 className='h-4 w-4' />
                  </Button>
                  <Button variant='outline' size='icon' onClick={() => handleDeleteGroup(index)}>
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {activeGroupIndex === index ? (
                  renderQuestionManager(group, index)
                ) : (
                  <div>
                    <div className='text-muted-foreground mb-2'>
                      {group.questions.length} question(s) in this group
                    </div>
                    {group.questions && group.questions.length > 0 && (
                      <div className='space-y-4'>
                        {group.questions.map((q: any) => {
                          switch (Number(q.question_type)) {
                            case QuestionTypeEnumIndex.MULTIPLE_CHOICE: // Multiple Choice
                              return (
                                <div key={q.question_id} className='p-4 border rounded'>
                                  <div
                                    dangerouslySetInnerHTML={{ __html: q.instruction_for_choice }}
                                  />
                                  <ul className='list-disc ml-6'>
                                    {Array.isArray(q.choices) &&
                                      q.choices.map((c: any) => (
                                        <li key={c.choice_id}>
                                          <span className='font-semibold'>{c.label}:</span>{' '}
                                          {c.content}
                                          {c.is_correct && (
                                            <span className='ml-2 text-green-600 font-bold'>
                                              (Correct)
                                            </span>
                                          )}
                                        </li>
                                      ))}
                                  </ul>
                                  <div className='mt-2 text-sm text-gray-500'>
                                    <span className='font-medium'>Explanation:</span>
                                    <SafeHtmlRenderer
                                      htmlContent={q.explanation || ''}
                                      className='mt-1'
                                    />
                                  </div>
                                </div>
                              );
                            case QuestionTypeEnumIndex.FILL_IN_THE_BLANKS: // Fill in the Blanks
                              return (
                                <div key={q.question_id} className='p-4 border rounded'>
                                  <div>
                                    <span className='font-semibold'>Blank {q.blank_index}:</span>{' '}
                                    {q.correct_answer}
                                  </div>
                                  <div className='mt-2 text-sm text-gray-500'>
                                    <span className='font-medium'>Explanation:</span>
                                    <SafeHtmlRenderer
                                      htmlContent={q.explanation || ''}
                                      className='mt-1'
                                    />
                                  </div>
                                </div>
                              );
                            case QuestionTypeEnumIndex.MATCHING: // Matching
                              return (
                                <div key={q.question_id} className='p-4 border rounded'>
                                  <div
                                    dangerouslySetInnerHTML={{ __html: q.instruction_for_matching }}
                                  />
                                  <div>
                                    <span className='font-semibold'>Answer:</span>{' '}
                                    {q.correct_answer_for_matching}
                                  </div>
                                  <div className='mt-2 text-sm text-gray-500'>
                                    <span className='font-medium'>Explanation:</span>
                                    <SafeHtmlRenderer
                                      htmlContent={q.explanation || ''}
                                      className='mt-1'
                                    />
                                  </div>
                                </div>
                              );
                            case QuestionTypeEnumIndex.DRAG_AND_DROP: // Drag & Drop
                              return (
                                <div key={q.question_id} className='p-4 border rounded'>
                                  <div>
                                    <span className='font-semibold'>Zone {q.zone_index}:</span>{' '}
                                    {q.drag_item_id}
                                  </div>
                                  <div className='mt-2 text-sm text-gray-500'>
                                    <span className='font-medium'>Explanation:</span>
                                    <SafeHtmlRenderer
                                      htmlContent={q.explanation || ''}
                                      className='mt-1'
                                    />
                                  </div>
                                </div>
                              );
                            default:
                              return (
                                <div key={q.question_id} className='p-4 border rounded'>
                                  Unknown question type
                                </div>
                              );
                          }
                        })}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
