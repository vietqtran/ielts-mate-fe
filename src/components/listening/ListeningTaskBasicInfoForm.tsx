'use client';

import { Badge } from '@/components/ui/badge';
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
import { UseFormReturn } from 'react-hook-form';

interface ListeningTaskBasicInfoFormProps {
  isEdit: boolean;
  form: UseFormReturn<any>;
  onSubmit: (data: any) => void;
  isLoading: boolean;
  isCompleted: boolean;
}

const getIeltsTypeLabel = (type: number): string => {
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

export function ListeningTaskBasicInfoForm({
  isEdit = false,
  form,
  onSubmit,
  isLoading,
  isCompleted,
}: Readonly<ListeningTaskBasicInfoFormProps>) {
  const formData = form.getValues();

  if (isCompleted) {
    return (
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <span className='h-5 w-5 text-green-600'>✔</span>
              <CardTitle>Listening Task - Completed</CardTitle>
            </div>
            <Button variant='outline' onClick={() => form.reset()}>
              Edit Information
            </Button>
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-2 gap-6'>
            <div>
              <h3 className='font-semibold text-lg'>{formData.title}</h3>
              <div className='flex gap-2 mt-2'>
                <Badge variant='outline'>{getIeltsTypeLabel(formData.ielts_type)}</Badge>
                <Badge variant='outline'>Part {formData.part_number}</Badge>
                <Badge variant='outline'>{getStatusLabel(formData.status)}</Badge>
              </div>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>Instruction</p>
              <p className='text-sm mt-1'>{formData.instruction}</p>
            </div>
          </div>
          <div>
            <p className='text-sm text-muted-foreground mb-2'>Audio File</p>
            {formData.audio_file && (
              <audio
                controls
                src={typeof formData.audio_file === 'string' ? formData.audio_file : undefined}
              />
            )}
          </div>
          <div className='flex justify-end'>
            <p className='text-sm text-green-600 flex items-center gap-2'>
              Listening task created successfully. You can now add question groups.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 1: Listening Task Information</CardTitle>
        <p className='text-sm text-muted-foreground'>
          Enter the basic information and upload audio for your IELTS listening task
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='title'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Listening Task Title *</FormLabel>
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
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IELTS Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value?.toString() ?? ''}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select IELTS type' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='0'>Academic</SelectItem>
                        <SelectItem value='1'>General Training</SelectItem>
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
                render={({ field }) => (
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
                        <SelectItem value='0'>Part 1 (Easy)</SelectItem>
                        <SelectItem value='1'>Part 2 (Medium)</SelectItem>
                        <SelectItem value='2'>Part 3 (Hard)</SelectItem>
                        <SelectItem value='3'>Part 4 (Very Hard)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                    <p className='text-xs text-muted-foreground'>
                      Part 1: Simple | Part 2: Medium | Part 3: Hard | Part 4: Very Hard
                    </p>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='status'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value?.toString() ?? ''}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select status' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='0'>Draft</SelectItem>
                        <SelectItem value='1'>Published</SelectItem>
                        <SelectItem value='2'>Deactivated</SelectItem>
                        <SelectItem value='3'>Finished</SelectItem>
                        <SelectItem value='4'>Test</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name='instruction'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Listening Instruction *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter the general instruction for this listening task (e.g., 'Listen and answer questions 1-10')"
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
              name='audio_file'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Audio File *</FormLabel>
                  <FormControl>
                    <Input
                      type='file'
                      accept='audio/*'
                      onChange={(e) => field.onChange(e.target.files?.[0])}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='is_automatic_transcription'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Automatic Transcription</FormLabel>
                  <FormControl>
                    <input
                      type='checkbox'
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='transcription'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transcription (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Paste or edit the transcription here if available.'
                      className='min-h-[80px]'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='flex justify-end'>
              <Button type='submit' disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save & Continue'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
