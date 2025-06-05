'use client';

import * as z from 'zod';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { QuestionType } from '@/types/reading.types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { DragDropForm } from './questions/DragDropForm';
import { FillInBlankForm } from './questions/FillInBlankForm';
import { MatchingForm } from './questions/MatchingForm';
import { MultipleChoiceForm } from './questions/MultipleChoiceForm';

const groupSchema = z.object({
  sectionOrder: z.number().min(1),
  sectionLabel: z.string().min(1, 'Section label is required'),
  instruction: z.string().min(1, 'Instruction is required'),
  questionType: z.nativeEnum(QuestionType),
});

type GroupFormData = z.infer<typeof groupSchema>;

interface GroupQuestionFormProps {
  passage_id: string;
  onAddGroup: (groupData: any) => void;
  onSaveGroup: (groupData: any) => void;
  onFinish: () => void;
}

export function GroupQuestionForm({
  passage_id,
  onAddGroup,
  onSaveGroup,
  onFinish,
}: GroupQuestionFormProps) {
  const [groups, setGroups] = useState<any[]>([]);
  const [currentGroupIndex, setCurrentGroupIndex] = useState<number | null>(null);

  const form = useForm<GroupFormData>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      sectionOrder: 1,
      sectionLabel: '',
      instruction: '',
      questionType: QuestionType.MULTIPLE_CHOICE,
    },
  });

  const handleCreateGroup = (data: GroupFormData) => {
    const newGroup = {
      ...data,
      questions: [],
      dragItems: data.questionType === QuestionType.DRAG_AND_DROP ? [] : undefined,
    };

    setGroups((prev) => [...prev, newGroup]);
    setCurrentGroupIndex(groups.length);
    form.reset({
      sectionOrder: groups.length + 2,
      sectionLabel: '',
      instruction: '',
      questionType: QuestionType.MULTIPLE_CHOICE,
    });
  };

  const handleSaveCurrentGroup = async () => {
    if (currentGroupIndex !== null && groups[currentGroupIndex]) {
      try {
        await onSaveGroup(groups[currentGroupIndex]);
        setCurrentGroupIndex(null);
      } catch (error) {
        console.error('Failed to save group:', error);
      }
    }
  };

  const handleDeleteGroup = (index: number) => {
    setGroups((prev) => prev.filter((_, i) => i !== index));
    if (currentGroupIndex === index) {
      setCurrentGroupIndex(null);
    } else if (currentGroupIndex !== null && currentGroupIndex > index) {
      setCurrentGroupIndex(currentGroupIndex - 1);
    }
  };

  const handleUpdateGroupQuestions = (questions: any[]) => {
    if (currentGroupIndex !== null) {
      setGroups((prev) =>
        prev.map((group, index) => (index === currentGroupIndex ? { ...group, questions } : group))
      );
    }
  };

  const handleUpdateGroupDragItems = (dragItems: string[]) => {
    if (currentGroupIndex !== null) {
      setGroups((prev) =>
        prev.map((group, index) => (index === currentGroupIndex ? { ...group, dragItems } : group))
      );
    }
  };

  const renderQuestionForm = () => {
    if (currentGroupIndex === null) return null;

    const group = groups[currentGroupIndex];
    const questionType = group.questionType;

    switch (questionType) {
      case QuestionType.MULTIPLE_CHOICE:
        return (
          <MultipleChoiceForm
            questions={group.questions}
            onQuestionsChange={handleUpdateGroupQuestions}
          />
        );
      case QuestionType.FILL_IN_THE_BLANKS:
        return (
          <FillInBlankForm
            questions={group.questions}
            onQuestionsChange={handleUpdateGroupQuestions}
          />
        );
      case QuestionType.MATCHING:
        return (
          <MatchingForm
            questions={group.questions}
            onQuestionsChange={handleUpdateGroupQuestions}
          />
        );
      case QuestionType.DRAG_AND_DROP:
        return (
          <DragDropForm
            questions={group.questions}
            dragItems={group.dragItems || []}
            onQuestionsChange={handleUpdateGroupQuestions}
            onDragItemsChange={handleUpdateGroupDragItems}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Group Creation Form */}
        <Card className='lg:col-span-1'>
          <CardHeader>
            <CardTitle>Create Question Group</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleCreateGroup)} className='space-y-4'>
                <FormField
                  control={form.control}
                  name='sectionOrder'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Section Order</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='sectionLabel'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Section Label</FormLabel>
                      <FormControl>
                        <Input placeholder='e.g., Questions 1-7' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='questionType'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Question Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select question type' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={QuestionType.MULTIPLE_CHOICE}>
                            Multiple Choice
                          </SelectItem>
                          <SelectItem value={QuestionType.FILL_IN_THE_BLANKS}>
                            Fill in Blanks
                          </SelectItem>
                          <SelectItem value={QuestionType.MATCHING}>Matching</SelectItem>
                          <SelectItem value={QuestionType.DRAG_AND_DROP}>Drag & Drop</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='instruction'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instruction</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='Enter instruction for this group of questions'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type='submit' className='w-full'>
                  <Plus className='h-4 w-4 mr-2' />
                  Add Group
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Groups List */}
        <Card className='lg:col-span-2'>
          <CardHeader>
            <CardTitle>Question Groups ({groups.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {groups.length === 0 ? (
              <p className='text-muted-foreground text-center py-8'>
                No question groups added yet. Create your first group to get started.
              </p>
            ) : (
              <div className='space-y-4'>
                {groups.map((group, index) => (
                  <div
                    key={index}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      currentGroupIndex === index
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setCurrentGroupIndex(index)}
                  >
                    <div className='flex items-center justify-between'>
                      <div>
                        <h3 className='font-medium'>{group.sectionLabel}</h3>
                        <p className='text-sm text-muted-foreground'>
                          {group.questionType.replace('_', ' ')}
                        </p>
                        <p className='text-sm text-muted-foreground'>
                          {group.questions.length} question(s)
                        </p>
                      </div>
                      <div className='flex gap-2'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteGroup(index);
                          }}
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Question Form for Selected Group */}
      {currentGroupIndex !== null && (
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <CardTitle>Questions for {groups[currentGroupIndex]?.sectionLabel}</CardTitle>
              <div className='flex gap-2'>
                <Button onClick={handleSaveCurrentGroup}>Save Group</Button>
                <Button variant='outline' onClick={() => setCurrentGroupIndex(null)}>
                  Close
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>{renderQuestionForm()}</CardContent>
        </Card>
      )}

      {/* Finish Button */}
      {groups.length > 0 && (
        <div className='flex justify-end'>
          <Button onClick={onFinish} size='lg'>
            Finish Creating Passage
          </Button>
        </div>
      )}
    </div>
  );
}
