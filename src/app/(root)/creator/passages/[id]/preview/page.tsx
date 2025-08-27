'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, BookOpen, FileText, User } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePassage } from '@/hooks/apis/reading/usePassage';

// Use backend response types
interface PassagePreviewData {
  passage_id: string;
  title: string;
  instruction: string;
  content: string;
  ielts_type: number;
  part_number: number;
  passage_status: number;
  question_groups: QuestionGroup[];
}

interface QuestionGroup {
  group_id: string;
  section_label: string;
  section_order: number;
  instruction: string;
  question_type: number;
  drag_items: DragItem[];
  questions: Question[];
}

interface Question {
  question_id: string;
  question_order: number;
  question_type: number;
  point: number;
  explanation: string;
  number_of_correct_answers: number;
  instruction_for_choice?: string;
  choices?: Choice[];
  blank_index?: number;
  correct_answer?: string;
  instruction_for_matching?: string;
  correct_answer_for_matching?: string;
  zone_index?: number;
  drag_item_id?: string;
}

interface Choice {
  choice_id: string;
  content: string;
  choice_order: number;
}

interface DragItem {
  drag_item_id: string;
  content: string;
}

export default function PassagePreviewPage() {
  const router = useRouter();
  const params = useParams();
  const { getPassageById, isLoading } = usePassage();
  const passage_id = params.id as string;

  const [passageData, setPassageData] = useState<PassagePreviewData | null>(null);

  useEffect(() => {
    const loadPassageData = async () => {
      try {
        const response = await getPassageById(passage_id);
        if (response.data) {
          // Cast the response to include question_groups field
          const backendData = response.data as any;
          const mappedData: PassagePreviewData = {
            passage_id: backendData.passage_id,
            title: backendData.title,
            instruction: backendData.instruction,
            content: backendData.content,
            ielts_type: backendData.ielts_type,
            part_number: backendData.part_number,
            passage_status: backendData.passage_status,
            question_groups: backendData.question_groups || [],
          };
          setPassageData(mappedData);
        }
      } catch (error) {
        console.error('Error loading passage data:', error);
        // Still set passage data to null to show "Passage not found"
        setPassageData(null);
      }
    };

    if (passage_id) {
      loadPassageData();
    }
  }, [passage_id]);

  const getIeltsTypeLabel = (type: number) => {
    return type === 0 ? 'Academic' : 'General Training';
  };

  const getPartLabel = (part: number) => {
    return `Part ${part + 1}`;
  };

  const renderQuestion = (question: Question, groupIndex: number, questionIndex: number) => {
    // Use the actual question order from the API response
    const questionNumber = question.question_order;

    switch (question.question_type) {
      case 0: // Multiple Choice
        return (
          <div key={question.question_id} className='mb-6 p-4 border rounded-lg'>
            <div className='flex items-center gap-2 mb-3'>
              <Badge variant='outline'>{questionNumber}</Badge>
              <Badge variant='secondary'>Multiple Choice</Badge>
            </div>
            {question.instruction_for_choice && (
              <div
                className='mb-3 text-sm text-muted-foreground'
                dangerouslySetInnerHTML={{ __html: question.instruction_for_choice }}
              />
            )}
            <div className='space-y-2'>
              {question.choices?.map((choice) => (
                <div key={choice.choice_id} className='flex items-center space-x-3'>
                  <input
                    type='radio'
                    name={`question-${question.question_id}`}
                    className='h-4 w-4 text-blue-600'
                    disabled
                  />
                  <label className='text-sm'>{choice.content}</label>
                </div>
              ))}
            </div>
            {question.explanation && (
              <div className='mt-4 p-3 bg-yellow-50 rounded-md'>
                <p className='text-sm font-medium text-yellow-800 mb-2'>Explanation:</p>
                <div
                  className='text-sm prose prose-sm max-w-none'
                  dangerouslySetInnerHTML={{ __html: question.explanation }}
                />
              </div>
            )}
          </div>
        );

      case 1: // Fill in the Blanks
        return (
          <div key={question.question_id} className='mb-6 p-4 border rounded-lg'>
            <div className='flex items-center gap-2 mb-3'>
              <Badge variant='outline'>{questionNumber}</Badge>
              <Badge variant='secondary'>Fill in the Blanks</Badge>
            </div>
            <div className='flex items-center space-x-2'>
              <span className='text-sm'>Answer:</span>
              <input
                type='text'
                className='border rounded px-3 py-1 w-32'
                placeholder='Your answer'
                disabled
              />
            </div>
            {question.explanation && (
              <div className='mt-4 p-3 bg-yellow-50 rounded-md'>
                <p className='text-sm font-medium text-yellow-800 mb-2'>Explanation:</p>
                <div
                  className='text-sm prose prose-sm max-w-none'
                  dangerouslySetInnerHTML={{ __html: question.explanation }}
                />
              </div>
            )}
          </div>
        );

      case 2: // Matching
        return (
          <div key={question.question_id} className='mb-6 p-4 border rounded-lg'>
            <div className='flex items-center gap-2 mb-3'>
              <Badge variant='outline'>{questionNumber}</Badge>
              <Badge variant='secondary'>Matching</Badge>
            </div>
            {question.instruction_for_matching && (
              <div
                className='mb-3 text-sm text-muted-foreground'
                dangerouslySetInnerHTML={{ __html: question.instruction_for_matching }}
              />
            )}
            <div className='flex items-center space-x-2'>
              <span className='text-sm'>Match with:</span>
              <input
                type='text'
                className='border rounded px-3 py-1 w-32'
                placeholder='Your answer'
                disabled
              />
            </div>
            {question.explanation && (
              <div className='mt-4 p-3 bg-yellow-50 rounded-md'>
                <p className='text-sm font-medium text-yellow-800 mb-2'>Explanation:</p>
                <div
                  className='text-sm prose prose-sm max-w-none'
                  dangerouslySetInnerHTML={{ __html: question.explanation }}
                />
              </div>
            )}
          </div>
        );

      case 3: // Drag and Drop
        return (
          <div key={question.question_id} className='mb-6 p-4 border rounded-lg'>
            <div className='flex items-center gap-2 mb-3'>
              <Badge variant='outline'>{questionNumber}</Badge>
              <Badge variant='secondary'>Drag and Drop</Badge>
            </div>
            <div className='flex items-center space-x-2'>
              <span className='text-sm'>Drop zone {question.zone_index}:</span>
              <div className='border-2 border-dashed border-gray-300 rounded px-4 py-2 min-w-[100px] min-h-[40px] flex items-center justify-center'>
                <span className='text-gray-400 text-sm'>Drop here</span>
              </div>
            </div>
            {question.explanation && (
              <div className='mt-4 p-3 bg-yellow-50 rounded-md'>
                <p className='text-sm font-medium text-yellow-800 mb-2'>Explanation:</p>
                <div
                  className='text-sm prose prose-sm max-w-none'
                  dangerouslySetInnerHTML={{ __html: question.explanation }}
                />
              </div>
            )}
          </div>
        );

      default:
        return (
          <div key={question.question_id} className='mb-6 p-4 border rounded-lg'>
            <div className='flex items-center gap-2 mb-3'>
              <Badge variant='outline'>{questionNumber}</Badge>
              <Badge variant='destructive'>Unknown Type</Badge>
            </div>
          </div>
        );
    }
  };

  if (isLoading.getPassageById) {
    return (
      <div className='container mx-auto py-6 max-w-7xl'>
        <div className='flex justify-center items-center h-64'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4'></div>
            <p className='text-muted-foreground'>Loading passage preview...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!passageData) {
    return (
      <div className='container mx-auto py-6 max-w-7xl'>
        <div className='text-center'>
          <p className='text-muted-foreground'>Passage not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto py-6 max-w-5xl'>
      {/* Header */}
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-4'>
          <Button variant='ghost' onClick={() => router.push('/creator/passages')}>
            <ArrowLeft className='h-4 w-4 mr-2' />
            Back to Passages
          </Button>
          <div>
            <h1 className='text-3xl font-bold'>Passage Preview</h1>
            <p className='text-muted-foreground'>
              Preview how this passage will appear to students
            </p>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <Badge variant='outline'>{getIeltsTypeLabel(passageData.ielts_type)}</Badge>
          <Badge variant='outline'>{getPartLabel(passageData.part_number)}</Badge>
        </div>
      </div>

      {/* Passage Info */}
      <Card className='mb-6'>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle className='flex items-center gap-2'>
              <BookOpen className='h-5 w-5' />
              {passageData.title}
            </CardTitle>
            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
              <User className='h-4 w-4' />
              Creator
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className='mb-4'>
            <h3 className='font-semibold mb-2'>Instructions</h3>
            <div
              className='text-sm text-muted-foreground p-3 bg-blue-50 rounded-md'
              dangerouslySetInnerHTML={{ __html: passageData.instruction }}
            />
          </div>
        </CardContent>
      </Card>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Reading Passage */}
        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <FileText className='h-5 w-5' />
                Reading Passage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className='prose prose-sm max-w-none'
                dangerouslySetInnerHTML={{ __html: passageData.content }}
              />
            </CardContent>
          </Card>

          {/* Drag Items for Drag & Drop Questions */}
          {passageData.question_groups.some((group) => group.drag_items.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle>Available Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='flex flex-wrap gap-2'>
                  {passageData.question_groups
                    .flatMap((group) => group.drag_items)
                    .map((item) => (
                      <div
                        key={item.drag_item_id}
                        className='px-3 py-2 bg-blue-100 text-blue-800 rounded-md cursor-pointer hover:bg-blue-200 transition-colors'
                      >
                        {item.content}
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Questions */}
        <div className='space-y-6'>
          {passageData.question_groups
            .sort((a, b) => a.section_order - b.section_order)
            .map((group, groupIndex) => (
              <Card key={group.group_id}>
                <CardHeader>
                  <CardTitle className='flex items-center justify-between'>
                    <span>{group.section_label}</span>
                    <Badge variant='outline'>
                      {group.questions.length} question{group.questions.length !== 1 ? 's' : ''}
                    </Badge>
                  </CardTitle>
                  {group.instruction && (
                    <div
                      className='text-sm text-muted-foreground'
                      dangerouslySetInnerHTML={{ __html: group.instruction }}
                    />
                  )}
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    {group.questions
                      .sort((a, b) => a.question_order - b.question_order)
                      .map((question, questionIndex) =>
                        renderQuestion(question, groupIndex, questionIndex)
                      )}
                  </div>

                  {group.questions.length === 0 && (
                    <div className='text-center py-8 text-muted-foreground'>
                      No questions in this group yet
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

          {passageData.question_groups.length === 0 && (
            <Card>
              <CardContent className='text-center py-8'>
                <p className='text-muted-foreground'>No question groups created yet</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
