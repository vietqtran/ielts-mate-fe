'use client';

import { HandleAnswerChangeParams } from '@/components/features/user/reading/practice/ReadingPractice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DragItem } from '@/types/attempt.types';
import { QuestionTypeEnumIndex } from '@/types/reading/reading.types';
import { useState } from 'react';
import React from 'react';

interface Question {
  question_id: string;
  question_order: number;
  zone_index: number;
  instruction_for_choice: string;
}

interface DragDropQuestionProps {
  questionGroup: {
    question_group_id: string;
    section_order: number;
    section_label: string;
    instruction: string;
    questions: Question[];
    drag_items: DragItem[];
  };
  onAnswerChange: (params: HandleAnswerChangeParams) => void;
  answers: Record<
    string,
    {
      answer_id: string | string[];
      questionType: QuestionTypeEnumIndex;
      questionOrder: number;
      content: string;
    }
  >;
}

const DragDropQuestion = ({ questionGroup, onAnswerChange, answers }: DragDropQuestionProps) => {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dropZoneAnswers, setDropZoneAnswers] = useState<
    Record<
      string,
      {
        answer_id: string;
        questionType: QuestionTypeEnumIndex;
        questionOrder: number;
        content: string;
      }
    >
  >(
    Object.fromEntries(
      Object.entries(answers).map(([key, value]) => [
        key,
        {
          answer_id: Array.isArray(value.answer_id) ? value.answer_id.join(', ') : value.answer_id,
          questionType: value.questionType,
          questionOrder: value.questionOrder,
          content: value.content,
        },
      ])
    )
  );

  const handleDragStart = (item: string) => {
    setDraggedItem(item);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, questionId: string, questionOrder: number) => {
    e.preventDefault();
    if (draggedItem) {
      setDropZoneAnswers((prev) => ({
        ...prev,
        [questionId]: {
          answer_id: draggedItem,
          questionType: QuestionTypeEnumIndex.DRAG_AND_DROP,
          questionOrder: questionOrder,
          content:
            questionGroup.drag_items.find((item) => item.drag_item_id === draggedItem)?.content ||
            '', // Get the content of the dragged item
        },
      }));
      const params: HandleAnswerChangeParams = {
        questionId,
        answer_id: draggedItem,
        questionType: QuestionTypeEnumIndex.DRAG_AND_DROP,
        questionOrder,
        content:
          questionGroup.drag_items.find((item) => item.drag_item_id === draggedItem)?.content || '',
      };
      onAnswerChange(params);
      setDraggedItem(null);
    }
  };

  const handleRemoveItem = (questionId: string, questionOrder: number) => {
    setDropZoneAnswers((prev) => ({
      ...prev,
      [questionId]: {
        answer_id: '',
        questionType: QuestionTypeEnumIndex.DRAG_AND_DROP,
        questionOrder: questionOrder,
        content: '', // Clear the content when removing
      },
    }));
    const params: HandleAnswerChangeParams = {
      questionId,
      answer_id: '',
      questionType: QuestionTypeEnumIndex.DRAG_AND_DROP,
      questionOrder,
      content: '',
    };
    onAnswerChange(params);
  };

  // Parse instruction to create drop zones
  const renderInstructionWithDropZones = (instruction: string) => {
    if (!questionGroup.questions[0]?.instruction_for_choice) return null;

    let content = questionGroup.questions[0].instruction_for_choice;

    // Replace [ZONE:X] with actual drop zones
    questionGroup.questions.forEach((question) => {
      const zonePattern = new RegExp(`\\[ZONE:${question.zone_index}\\]`, 'g');
      const dropZoneElement = `
        <div class="inline-block mx-1 min-w-[120px] p-2 border-2 border-dashed border-gray-300 rounded bg-gray-50 text-center" 
             id="drop-zone-${question.question_id}">
          ${dropZoneAnswers[question.question_id] || 'Drop here'}
        </div>
      `;
      content = content.replace(zonePattern, dropZoneElement);
    });

    return content;
  };

  return (
    <Card className='mb-6'>
      <CardHeader>
        <CardTitle className='text-lg font-semibold'>{questionGroup.section_label}</CardTitle>
        <div
          className='text-sm text-muted-foreground'
          dangerouslySetInnerHTML={{ __html: questionGroup.instruction }}
        />
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Drag Items */}
        <div className='space-y-2'>
          <h4 className='font-medium text-sm'>Drag the items below to the correct zones:</h4>
          <div className='flex flex-wrap gap-2 p-4 bg-blue-50 rounded-lg'>
            {questionGroup.drag_items.map((item, index) => (
              <div
                key={index}
                draggable
                onDragStart={() => handleDragStart(item.drag_item_id)}
                className='px-3 py-2 bg-white border rounded cursor-move hover:shadow-md transition-shadow select-none'
              >
                {item.content}
              </div>
            ))}
          </div>
        </div>

        {/* Drop Zones */}
        <div className='space-y-4'>
          {questionGroup.questions[0]?.instruction_for_choice ? (
            <div
              className='p-4 border rounded-lg bg-gray-50'
              dangerouslySetInnerHTML={{
                __html:
                  renderInstructionWithDropZones(
                    questionGroup.questions[0].instruction_for_choice
                  ) || '',
              }}
            />
          ) : (
            // Fallback: Individual drop zones
            <div className='space-y-3'>
              {questionGroup.questions
                .sort((a, b) => a.zone_index - b.zone_index)
                .map((question) => (
                  <div key={question.question_id} className='flex items-center gap-4'>
                    <span className='text-sm font-medium'>Zone {question.zone_index}:</span>
                    <div
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, question.question_id, question.question_order)}
                      className='flex-1 min-h-[50px] p-3 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 flex items-center justify-between'
                    >
                      <span
                        className={
                          dropZoneAnswers[question.question_id] ? 'text-black' : 'text-gray-500'
                        }
                      >
                        {dropZoneAnswers[question.question_id]?.content || 'Drop item here'}
                      </span>
                      {dropZoneAnswers[question.question_id] && (
                        <button
                          onClick={() =>
                            handleRemoveItem(question.question_id, question.question_order)
                          }
                          className='text-red-500 hover:text-red-700 text-sm'
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        <div className='text-xs text-gray-600 bg-gray-50 p-3 rounded'>
          <strong>How to use:</strong> Click and drag items from the blue box above to the drop
          zones. You can remove items by clicking "Remove" or drag different items to replace them.
        </div>
      </CardContent>
    </Card>
  );
};

export default DragDropQuestion;
