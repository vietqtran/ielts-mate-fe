'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
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
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useListeningTask } from '@/hooks';
import {
  IeltsListeningType,
  ListeningTaskCreationRequest,
  ListeningTaskStatus,
  ListeningTaskUpdateRequest,
} from '@/types/listening.types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30MB
const ACCEPTED_AUDIO_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'];

// We need to conditionally validate the audio file based on mode
const formSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  ielts_type: z.number().int().min(1, 'IELTS type is required'),
  part_number: z
    .number()
    .int()
    .min(1, 'Part number is required')
    .max(4, 'Part number must be between 1-4'),
  instruction: z.string().min(10, 'Instruction must be at least 10 characters'),
  status: z.number().int(),
  is_automatic_transcription: z.boolean().default(true),
  transcription: z.string().optional(),
  audio_file: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, 'File size must be less than 30MB')
    .refine(
      (file) => ACCEPTED_AUDIO_TYPES.includes(file.type),
      'File must be an audio file (MP3, WAV, OGG)'
    ),
});

interface ListeningTaskFormProps {
  taskId?: string;
  initialData?: {
    task_id?: string;
    ielts_type: number;
    part_number: number;
    instruction: string;
    title: string;
    transcription?: string;
    status: number;
  };
  mode: 'create' | 'edit';
}

export function ListeningTaskForm({ taskId, initialData, mode }: ListeningTaskFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { createListeningTask, updateListeningTask, isLoading } = useListeningTask();

  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [useAutomaticTranscription, setUseAutomaticTranscription] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || '',
      ielts_type: initialData?.ielts_type || 1,
      part_number: initialData?.part_number || 1,
      instruction: initialData?.instruction || '',
      status: initialData?.status || 0,
      is_automatic_transcription: true,
      transcription: initialData?.transcription || '',
      audio_file: undefined,
    },
  });

  useEffect(() => {
    if (initialData && mode === 'edit') {
      // In edit mode, we only need to validate the audio file if it's changed
      form.clearErrors('audio_file');
    }
  }, [initialData, mode, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (mode === 'create') {
        // In create mode, audio_file is required
        const request: ListeningTaskCreationRequest = {
          title: values.title,
          ielts_type: values.ielts_type,
          part_number: values.part_number,
          instruction: values.instruction,
          status: values.status,
          is_automatic_transcription: values.is_automatic_transcription,
          // Only include transcription if automatic is disabled and value exists
          ...(!values.is_automatic_transcription &&
            values.transcription && {
              transcription: values.transcription,
            }),
          audio_file: values.audio_file,
        };

        await createListeningTask(request);
        toast({
          title: 'Success',
          description: 'Listening task created successfully',
        });
        router.push('/creator/listenings');
      } else if (mode === 'edit' && taskId) {
        const request: ListeningTaskUpdateRequest = {
          title: values.title,
          ielts_type: values.ielts_type,
          part_number: values.part_number,
          instruction: values.instruction,
          status: values.status,
          transcription: values.transcription || '',
          // Only include audio_file if provided in edit mode
          ...(values.audio_file && { audio_file: values.audio_file }),
        };

        await updateListeningTask(taskId, request);
        toast({
          title: 'Success',
          description: 'Listening task updated successfully',
        });
        router.push('/creator/listenings');
      }
    } catch (error) {
      console.error('Failed to save listening task:', error);
      toast({
        title: 'Error',
        description: 'Failed to save listening task',
        variant: 'destructive',
      });
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (file: File) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange(file);
      const url = URL.createObjectURL(file);
      setAudioPreview(url);
    }
  };

  const handleCancel = () => {
    router.push('/creator/listenings');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {mode === 'create' ? 'Create New Listening Task' : 'Edit Listening Task'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <FormField
                control={form.control}
                name='title'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter title' {...field} />
                    </FormControl>
                    <FormDescription>Title of the listening task</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='ielts_type'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IELTS Type</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select IELTS type' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={IeltsListeningType.ACADEMIC.toString()}>
                          Academic
                        </SelectItem>
                        <SelectItem value={IeltsListeningType.GENERAL_TRAINING.toString()}>
                          General Training
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='part_number'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Part Number</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select part number' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='1'>Part 1</SelectItem>
                        <SelectItem value='2'>Part 2</SelectItem>
                        <SelectItem value='3'>Part 3</SelectItem>
                        <SelectItem value='4'>Part 4</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='status'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select status' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={ListeningTaskStatus.DRAFT.toString()}>Draft</SelectItem>
                        <SelectItem value={ListeningTaskStatus.PUBLISHED.toString()}>
                          Published
                        </SelectItem>
                        <SelectItem value={ListeningTaskStatus.DEACTIVATED.toString()}>
                          Deactivated
                        </SelectItem>
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
                  <FormLabel>Instruction</FormLabel>
                  <FormControl>
                    <Textarea placeholder='Enter instruction' {...field} rows={4} />
                  </FormControl>
                  <FormDescription>Instructions for the listening task</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='audio_file'
              render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel>Audio File</FormLabel>
                  <FormControl>
                    <div className='flex flex-col space-y-2'>
                      <Input
                        type='file'
                        accept='audio/*'
                        onChange={(e) => handleFileChange(e, onChange)}
                        {...fieldProps}
                      />
                      {audioPreview && (
                        <div className='mt-2'>
                          <audio controls src={audioPreview} className='w-full' />
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>
                    {mode === 'create'
                      ? 'Upload an audio file (MP3, WAV, OGG, max 30MB)'
                      : 'Upload a new audio file or leave empty to keep the current one'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='is_automatic_transcription'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                  <div className='space-y-0.5'>
                    <FormLabel className='text-base'>Automatic Transcription</FormLabel>
                    <FormDescription>
                      Use automatic transcription service to generate transcription
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={(value) => {
                        field.onChange(value);
                        setUseAutomaticTranscription(value);
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {!useAutomaticTranscription && (
              <FormField
                control={form.control}
                name='transcription'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transcription</FormLabel>
                    <FormControl>
                      <Textarea placeholder='Enter transcription' {...field} rows={10} />
                    </FormControl>
                    <FormDescription>Manual transcription of the audio</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className='flex justify-end space-x-2'>
              <Button type='button' variant='outline' onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                type='submit'
                disabled={isLoading['createListeningTask'] || isLoading['updateListeningTask']}
              >
                {isLoading['createListeningTask'] || isLoading['updateListeningTask']
                  ? 'Saving...'
                  : 'Save'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
