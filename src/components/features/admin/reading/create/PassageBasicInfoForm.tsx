'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { TiptapEditor } from '@/components/ui/tiptap-editor';
import { IeltsType, PassageStatus } from '@/types/reading/reading.types';
import { ArrowRight } from 'lucide-react';

interface PassageBasicInfoFormProps {
  isEdit: boolean;
  form: any;
  onSubmit: (data: any) => void;
  isLoading: boolean;
  isCompleted: boolean;
  hasChanges?: boolean;
  onEdit?: () => void;
  originalStatus?: string;
  hasQuestionGroups?: boolean;
  questionGroups?: any[];
}

const getielts_typeLabel = (type: IeltsType): string => {
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

export function PassageBasicInfoForm({
  isEdit = false,
  form,
  onSubmit,
  isLoading,
  isCompleted,
  hasChanges = true,
  onEdit,
  originalStatus,
  hasQuestionGroups = false,
  questionGroups = [],
}: Readonly<PassageBasicInfoFormProps>) {
  const handleSubmit = (data: any) => {
    onSubmit(data);
  };

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle>Step 1: Passage Information</CardTitle>
            <p className='text-sm text-muted-foreground'>
              Enter the basic information and content for your IELTS reading passage
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='title'
                render={({ field }: any) => (
                  <FormItem>
                    <FormLabel>Passage Title *</FormLabel>
                    <FormControl>
                      <Input placeholder='e.g., The Future of Renewable Energy' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='ielts_type'
                render={({ field }: any) => (
                  <FormItem>
                    <FormLabel>IELTS Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? ''}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select IELTS type' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={IeltsType.ACADEMIC}>Academic</SelectItem>
                        <SelectItem value={IeltsType.GENERAL_TRAINING}>General Training</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='part_number'
                render={({ field }: any) => (
                  <FormItem>
                    <FormLabel>Part Number *</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value?.toString() ?? ''}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select part number' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='1'>Part 1 (Easy)</SelectItem>
                        <SelectItem value='2'>Part 2 (Medium)</SelectItem>
                        <SelectItem value='3'>Part 3 (Hard)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                    <p className='text-xs text-muted-foreground'>
                      Part 1: Simple factual texts | Part 2: Descriptive texts | Part 3: Complex
                      analytical texts
                    </p>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='passage_status'
                render={({ field }: any) => {
                  const currentStatus = field.value;
                  const formData = form.getValues();

                  // Check if the original status from database was TEST
                  const isOriginalTestStatus = originalStatus === PassageStatus.TEST;
                  // Only enable status if we have question groups or this is edit mode with existing status
                  const shouldDisable = isOriginalTestStatus || (!isEdit && !hasQuestionGroups);

                  // Calculate total points
                  const totalPoints = questionGroups.reduce((total, group) => {
                    return (
                      total +
                      group.questions.reduce((groupTotal: number, question: any) => {
                        return groupTotal + (question.point || 1);
                      }, 0)
                    );
                  }, 0);

                  const requiredPoints = formData.part_number === 1 ? 14 : 13;
                  const hasEnoughPoints = totalPoints === requiredPoints;

                  return (
                    <FormItem>
                      <FormLabel>Status *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value ?? ''}
                        disabled={shouldDisable}
                      >
                        <FormControl>
                          <SelectTrigger
                            className={shouldDisable ? 'opacity-50 cursor-not-allowed' : ''}
                          >
                            <SelectValue placeholder='Select status' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={PassageStatus.DRAFT}>Draft</SelectItem>
                          <SelectItem value={PassageStatus.PUBLISHED} disabled={!hasEnoughPoints}>
                            Published{' '}
                            {!hasEnoughPoints
                              ? `(Need exactly ${requiredPoints} points, have ${totalPoints})`
                              : ''}
                          </SelectItem>
                          <SelectItem value={PassageStatus.TEST} disabled={!hasEnoughPoints}>
                            Test{' '}
                            {!hasEnoughPoints
                              ? `(Need exactly ${requiredPoints} points, have ${totalPoints})`
                              : ''}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {shouldDisable && (
                        <p className='text-xs text-muted-foreground'>
                          {isOriginalTestStatus
                            ? 'Status cannot be changed when passage is in Test mode'
                            : 'Create question groups first to enable status selection'}
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>

            <FormField
              control={form.control}
              name='instruction'
              render={({ field }: any) => (
                <FormItem>
                  <FormLabel>Reading Instruction *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter the general instruction for this reading passage (e.g., 'Read the passage and answer questions 1-13')"
                      className='min-h-[100px]'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='content'
              render={({ field }: any) => (
                <FormItem>
                  <FormLabel>Reading Passage Content *</FormLabel>
                  <FormControl>
                    <TiptapEditor
                      content={field.value}
                      onChange={field.onChange}
                      placeholder='Enter the reading passage content. You can format the text with paragraphs, headings, and emphasis.'
                    />
                  </FormControl>
                  <FormMessage />
                  <p className='text-xs text-muted-foreground'>
                    Tip: For IELTS passages, aim for 700-1000 words. Include clear paragraph
                    divisions (A, B, C, etc.) for matching questions.
                  </p>
                </FormItem>
              )}
            />

            <div className='bg-blue-50 p-4 rounded-lg'>
              <h4 className='font-medium text-blue-900 mb-2'>IELTS Reading Passage Guidelines</h4>
              <ul className='text-sm text-blue-700 space-y-1'>
                <li>• Academic passages: Scientific articles, academic journals, books</li>
                <li>• General Training passages: Advertisements, notices, magazines, newspapers</li>
                <li>• Length: 700-1000 words with clear paragraph structure</li>
                <li>• Include varied vocabulary appropriate to the IELTS level</li>
                <li>• Consider different question types when structuring content</li>
              </ul>
            </div>

            <div className='flex justify-end'>
              {isEdit ? (
                <Button type='submit' disabled={isLoading} className='gap-2'>
                  {isLoading
                    ? 'Saving Changes...'
                    : hasChanges
                      ? 'Save Changes & Go to Questions'
                      : 'Go to Questions'}
                  <ArrowRight className='h-4 w-4' />
                </Button>
              ) : (
                <Button type='submit' disabled={isLoading} className='gap-2'>
                  {isLoading ? 'Creating Passage...' : 'Create Passage & Continue'}
                  <ArrowRight className='h-4 w-4' />
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
