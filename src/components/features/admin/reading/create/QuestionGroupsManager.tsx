'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit3, Eye, Plus, Settings, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePassage } from '@/hooks';
import { QuestionTypeEnumIndex } from '@/types/reading/reading.types';
import { useEffect, useState } from 'react';
import { QuestionGroupForm } from './QuestionGroupForm';
import { DragDropManager } from './questions/DragDropManager';
import { FillInBlanksManager } from './questions/FillInBlanksManager';
import { MatchingManager } from './questions/MatchingManager';
import { MultipleChoiceManager } from './questions/MultipleChoiceManager';

// Define the DragItem interface to match what DragDropManager expects
export interface DragItem {
  id?: string;
  drag_item_id?: string;
  item_id?: string;
  content: string;
  item_content?: string;
}

export interface LocalQuestionGroup {
  id?: string;
  section_order: number;
  section_label: string;
  instruction: string;
  question_type: number; // QuestionTypeEnumIndex
  questions: any[];
  drag_items?: DragItem[]; // Changed from string[] to DragItem[]
}

interface QuestionGroupsManagerProps {
  passage_id: string;
  questionGroups: LocalQuestionGroup[];
  onAddGroup: (group: LocalQuestionGroup) => void;
  onUpdateGroup: (index: number, group: LocalQuestionGroup) => void;
  onDeleteGroup: (index: number) => void;
  refetchPassageData: () => void;
}

const IELTS_QUESTION_TYPES = [
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
    description: 'Complete sentences with missing words from the passage',
    icon: '___',
    explanation:
      'Students fill in numbered blanks with words directly from the passage. Usually 1-3 words per blank.',
    tips: 'Test factual information, dates, names, or key terms. Blanks should follow passage order.',
  },
  {
    type: QuestionTypeEnumIndex.MATCHING,
    label: 'Matching',
    description: 'Match items to categories, headings, or passage sections',
    icon: '⟷',
    explanation:
      'Students match statements, headings, or features to appropriate sections of the passage.',
    tips: 'Divide passage into clear sections (A, B, C, etc.). Use for testing understanding of main ideas.',
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

export function QuestionGroupsManager({
  passage_id,
  questionGroups,
  onAddGroup,
  onUpdateGroup,
  onDeleteGroup,
  refetchPassageData,
}: Readonly<QuestionGroupsManagerProps>) {
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [activeGroupIndex, setActiveGroupIndex] = useState<number | null>(null);
  const { addGroupQuestion, isLoading } = usePassage();

  // Reset component state when passage_id changes (indicating a new passage is being created)
  useEffect(() => {
    setIsCreatingGroup(false);
    setActiveGroupIndex(null);
  }, [passage_id]);

  const handleCreateGroup = async (groupData: any) => {
    if (isLoading.addGroupQuestion) return;
    try {
      const response = await addGroupQuestion(passage_id, groupData);
      if (response.data) {
        // Backend response uses camelCase for property access after JSON parsing
        // Handle multiple possible field names for ID
        const group_id =
          response.data.group_id || (response.data as any).id || (response.data as any).group_id;

        if (!group_id) {
          return;
        }

        const frontendGroup: LocalQuestionGroup = {
          id: group_id, // Use the found ID
          section_order: response.data.section_order || groupData.section_order,
          section_label: response.data.section_label || groupData.section_label,
          instruction: response.data.instruction || groupData.instruction,
          question_type: groupData.question_type,
          questions: response.data.questions ?? [],
          drag_items: [], // Initialize as empty DragItem array
        };

        onAddGroup(frontendGroup);
        setIsCreatingGroup(false);
      } else {
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

  const renderQuestionManager = (group: LocalQuestionGroup, groupIndex: number) => {
    const commonProps = {
      group: group, // Pass group directly since types now match
      groupIndex,
      onUpdateGroup: (updatedGroup: any) => {
        // Check if this contains newly created questions that shouldn't be updated again
        const hasJustCreatedQuestions = updatedGroup._justCreatedQuestions === true;
        const createdQuestionIds = updatedGroup._createdQuestionIds || [];

        // Ensure proper data structure for preview
        const localGroup: LocalQuestionGroup = {
          id: updatedGroup.id,
          section_order: updatedGroup.section_order,
          section_label: updatedGroup.section_label,
          instruction: updatedGroup.instruction,
          question_type: updatedGroup.question_type,
          // Ensure questions array is correctly formatted
          questions: (updatedGroup.questions || []).map((q: any) => ({
            ...q,
            question_id: q.question_id || q.id,
            choices: (q.choices || []).map((c: any) => ({
              ...c,
              choice_id: c.choice_id || c.id,
            })),
          })),
          // Keep drag_items as DragItem[] (no conversion needed)
          drag_items: updatedGroup.drag_items || [],
        };

        // Preserve the special flags to prevent redundant updates
        if (hasJustCreatedQuestions) {
          // @ts-ignore - These properties aren't in the type definition but we need them
          localGroup._justCreatedQuestions = true;
          // @ts-ignore
          localGroup._createdQuestionIds = createdQuestionIds;
        }

        onUpdateGroup(groupIndex, localGroup);
      },
      refetchPassageData: refetchPassageData,
    };

    switch (group.question_type) {
      case QuestionTypeEnumIndex.MULTIPLE_CHOICE:
        return <MultipleChoiceManager {...commonProps} onUpdateGroup={commonProps.onUpdateGroup} />;
      case QuestionTypeEnumIndex.FILL_IN_THE_BLANKS:
        return <FillInBlanksManager {...commonProps} onUpdateGroup={commonProps.onUpdateGroup} />;
      case QuestionTypeEnumIndex.MATCHING:
        return <MatchingManager {...commonProps} onUpdateGroup={commonProps.onUpdateGroup} />;
      case QuestionTypeEnumIndex.DRAG_AND_DROP:
        return <DragDropManager {...commonProps} onUpdateGroup={commonProps.onUpdateGroup} />;
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
          <CardTitle>IELTS Reading Question Types</CardTitle>
          <p className='text-sm text-muted-foreground'>
            Choose from common IELTS reading question formats. Each type tests different skills.
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
            <div className='mb-6 p-4 border rounded-lg bg-gray-50'>
              <QuestionGroupForm
                onSubmit={handleCreateGroup}
                onCancel={() => setIsCreatingGroup(false)}
                isLoading={isLoading.addGroupQuestion}
              />
            </div>
          )}

          {/* Groups List */}
          <div className='space-y-4'>
            {questionGroups.length === 0 ? (
              <div className='text-center py-12 text-muted-foreground'>
                <Plus className='h-8 w-8 mx-auto mb-4 opacity-50' />
                <p>No question groups created yet.</p>
                <p className='text-sm'>Add your first question group to get started.</p>
              </div>
            ) : (
              questionGroups.map((group, index) => {
                const typeInfo = getQuestionTypeInfo(group.question_type);
                const isActive = activeGroupIndex === index;

                return (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 transition-all ${
                      isActive
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-4'>
                        <div className='text-2xl'>{typeInfo?.icon}</div>
                        <div>
                          <h3 className='font-semibold'>{group.section_label}</h3>
                          <div className='flex items-center gap-2 mt-1'>
                            <Badge variant='outline'>{typeInfo?.label}</Badge>
                            <span className='text-sm text-muted-foreground'>
                              {group.questions.length} questions
                            </span>
                          </div>
                          {group.instruction && (
                            <div
                              className='text-xs text-muted-foreground mt-1 max-w-md truncate prose prose-xs'
                              dangerouslySetInnerHTML={{ __html: group.instruction }}
                            />
                          )}
                        </div>
                      </div>

                      <div className='flex gap-2'>
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          onClick={() => setActiveGroupIndex(isActive ? null : index)}
                        >
                          {isActive ? <Eye className='h-4 w-4' /> : <Edit3 className='h-4 w-4' />}
                          {isActive ? 'Hide' : 'Manage'}
                        </Button>
                        <Button variant='ghost' size='sm' onClick={() => handleEditGroup(index)}>
                          <Settings className='h-4 w-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleDeleteGroup(index)}
                          className='text-red-600 hover:text-red-700'
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>

                    {isActive && (
                      <div className='mt-6 pt-4 border-t'>
                        {renderQuestionManager(group, index)}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tips for IELTS Question Groups */}
      <Card>
        <CardHeader>
          <CardTitle>💡 Best Practices for IELTS Reading Questions</CardTitle>
        </CardHeader>
        <CardContent className='space-y-3'>
          <div className='text-sm space-y-2'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <h4 className='font-semibold text-green-700 mb-2'>Question Order & Flow</h4>
                <ul className='space-y-1 text-xs'>
                  <li>• Questions typically follow passage order</li>
                  <li>• Start with factual, move to inferential</li>
                  <li>• Group similar question types together</li>
                  <li>• Use clear numbering (1-5, 6-10, etc.)</li>
                </ul>
              </div>
              <div>
                <h4 className='font-semibold text-blue-700 mb-2'>IELTS Standards</h4>
                <ul className='space-y-1 text-xs'>
                  <li>• 40 questions total in real IELTS</li>
                  <li>• Mix 2-3 different question types per passage</li>
                  <li>• Provide clear instructions for each section</li>
                  <li>• Test range of reading skills (scanning, skimming, detail)</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
