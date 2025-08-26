'use client';

import { Badge } from '@/components/ui/badge';
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
import { TiptapEditor } from '@/components/ui/tiptap-editor';
import { useToast } from '@/components/ui/use-toast';
import { useListeningTask } from '@/hooks';
import {
  IeltsListeningType,
  ListeningTaskCreationRequest,
  ListeningTaskStatus,
  ListeningTaskUpdateRequest,
} from '@/types/listening/listening.types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  ListeningQuestionGroupsManager,
  LocalListeningQuestionGroup,
} from './ListeningQuestionGroupsManager';

const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30MB
const ACCEPTED_AUDIO_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'];

// We need to conditionally validate the audio file based on mode
const createSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  ielts_type: z.number().int().min(1, 'IELTS type is required'),
  part_number: z
    .number()
    .int()
    .min(0, 'Part number is required')
    .max(3, 'Part number must be between 1-4'),
  instruction: z.string().min(10, 'Instruction must be at least 10 characters'),
  status: z.number().int(),
  is_automatic_transcription: z.boolean().default(true),
  transcript: z.string().optional(),
  audio_file: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, 'File size must be less than 30MB')
    .refine(
      (file) => ACCEPTED_AUDIO_TYPES.includes(file.type),
      'File must be an audio file (MP3, WAV, OGG)'
    )
    .optional(),
});

const editSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  ielts_type: z.number().int().min(1, 'IELTS type is required'),
  part_number: z
    .number()
    .int()
    .min(0, 'Part number is required')
    .max(3, 'Part number must be between 1-4'),
  instruction: z.string().min(10, 'Instruction must be at least 10 characters'),
  status: z.number().int(),
  is_automatic_transcription: z.boolean().default(true),
  transcript: z.string().optional(),
  audio_file: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, 'File size must be less than 30MB')
    .refine(
      (file) => ACCEPTED_AUDIO_TYPES.includes(file.type),
      'File must be an audio file (MP3, WAV, OGG)'
    )
    .optional(),
});

interface ListeningTaskFormProps {
  taskId?: string;
  initialData?: {
    task_id?: string;
    ielts_type: number;
    part_number: number;
    instruction: string;
    title: string;
    transcript?: string;
    status: number;
    audio_file_id?: string;
  };
  mode: 'create' | 'edit';
  originalStatus?: number;
}

type CreateFormType = z.infer<typeof createSchema>;
type EditFormType = z.infer<typeof editSchema>;
type FormType = CreateFormType | EditFormType;

export function ListeningTaskForm({
  taskId,
  initialData,
  mode,
  originalStatus,
}: ListeningTaskFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { createListeningTask, updateListeningTask, isLoading, deleteGroupQuestion } =
    useListeningTask();

  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [serverAudioUrl, setServerAudioUrl] = useState<string | null>(null);
  const [useAutomaticTranscription, setUseAutomaticTranscription] = useState(true);
  const [createdTaskId, setCreatedTaskId] = useState<string | undefined>(taskId);
  const [questionGroups, setQuestionGroups] = useState<LocalListeningQuestionGroup[]>([]);
  const [currentOriginalStatus, setCurrentOriginalStatus] = useState<number | undefined>(
    originalStatus
  );

  const schema = mode === 'create' ? createSchema : editSchema;
  const form = useForm<FormType>({
    resolver: zodResolver(schema),
    defaultValues:
      mode === 'create'
        ? {
            title: initialData?.title || '',
            ielts_type: initialData?.ielts_type || 1,
            part_number: initialData?.part_number || 0,
            instruction: initialData?.instruction || '',
            status: initialData?.status || 0,
            is_automatic_transcription: true,
            transcript: initialData?.transcript || '',
            audio_file: undefined as unknown as File,
          }
        : {
            title: initialData?.title || '',
            ielts_type: initialData?.ielts_type || 1,
            part_number: initialData?.part_number || 0,
            instruction: initialData?.instruction || '',
            status: initialData?.status || 0,
            is_automatic_transcription: true,
            transcript: initialData?.transcript || '',
          },
  });

  useEffect(() => {
    if (initialData && mode === 'edit') {
      // In edit mode, we only need to validate the audio file if it's changed
      form.clearErrors('audio_file');

      // Fetch audio from server if audio_file_id exists and no local preview
      if (initialData.audio_file_id) {
        const fetchAudio = async () => {
          try {
            const audioRes = await fetch(
              `${process.env.NEXT_PUBLIC_API_BASE_URL || ''}/resource/files/download/${initialData.audio_file_id}`,
              { credentials: 'include' }
            );
            if (audioRes.ok) {
              const blob = await audioRes.blob();
              setServerAudioUrl(URL.createObjectURL(blob));
            } else {
              setServerAudioUrl(null);
            }
          } catch {
            setServerAudioUrl(null);
          }
        };
        fetchAudio();
      } else {
        setServerAudioUrl(null);
      }
    }
  }, [initialData, mode, form]);

  // Khi vào edit, nếu có initialData và taskId, tự động fetch group/question
  useEffect(() => {
    if (mode === 'edit' && initialData && Array.isArray((initialData as any).question_groups)) {
      // Map from initialData.question_groups to LocalListeningQuestionGroup[]
      const groups = (initialData as any).question_groups.map((g: any) => ({
        id: g.group_id,
        section_order: g.section_order,
        section_label: g.section_label,
        instruction: g.instruction,
        question_type: g.question_type,
        questions: g.questions ?? [],
        drag_items: g.drag_items ?? [],
      }));
      setQuestionGroups(groups);
      setCreatedTaskId(initialData.task_id || taskId);
      setCurrentOriginalStatus(initialData.status); // Set original status from initial data
    } else if (mode === 'create') {
      setQuestionGroups([]);
      setCreatedTaskId(undefined);
      setCurrentOriginalStatus(undefined); // Reset original status in create mode
    }
  }, [mode, initialData, taskId]);

  const onSubmit = async (values: FormType) => {
    try {
      // Check if the original status was TEST and prevent status change
      if (currentOriginalStatus === ListeningTaskStatus.TEST) {
        if (values.status !== ListeningTaskStatus.TEST) {
          // Status is being changed from TEST, which is not allowed
          toast({
            title: 'Error',
            description: 'Status cannot be changed when task is in Test mode',
            variant: 'destructive',
          });
          return;
        }
      }

      if (mode === 'create') {
        // In create mode, audio_file is required
        if (!values.audio_file) {
          toast({
            title: 'Error',
            description: 'Audio file is required',
            variant: 'destructive',
          });
          return;
        }
        const request: ListeningTaskCreationRequest = {
          title: values.title,
          ielts_type: values.ielts_type,
          part_number: values.part_number,
          instruction: values.instruction,
          status: values.status,
          is_automatic_transcription: values.is_automatic_transcription,
          // Only include transcription if automatic is disabled and value exists
          ...(!values.is_automatic_transcription &&
            values.transcript && {
              transcript: values.transcript,
            }),
          audio_file: values.audio_file,
        };

        const response = await createListeningTask(request);
        // Lưu lại taskId để hiển thị phần tạo group/question
        if (response?.data?.task_id) {
          setCreatedTaskId(response.data.task_id);
          setCurrentOriginalStatus(values.status); // Store the original status after successful creation
        }
        toast({
          title: 'Success',
          description: 'Listening task created successfully',
        });
      } else if (mode === 'edit' && taskId) {
        const request: ListeningTaskUpdateRequest = {
          title: values.title,
          ielts_type: values.ielts_type,
          part_number: values.part_number,
          instruction: values.instruction,
          status: values.status,
          transcript: values.transcript || '',
          // Only include audio_file if provided in edit mode
          ...(values.audio_file && { audio_file: values.audio_file }),
        };

        await updateListeningTask(taskId, request);
        setCreatedTaskId(taskId);
        setCurrentOriginalStatus(values.status); // Update original status after successful update

        // Reset form with updated values to clear dirty state
        form.reset({
          title: values.title,
          ielts_type: values.ielts_type,
          part_number: values.part_number,
          instruction: values.instruction,
          status: values.status,
          is_automatic_transcription: values.is_automatic_transcription,
          transcript: values.transcript,
        });

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

  const handleAddGroup = (group: LocalListeningQuestionGroup) => {
    setQuestionGroups((prev) => [...prev, group]);
  };
  const handleUpdateGroup = (index: number, group: LocalListeningQuestionGroup) => {
    setQuestionGroups((prev) => prev.map((g, i) => (i === index ? group : g)));
  };
  const handleDeleteGroup = async (index: number) => {
    const groupToDelete = questionGroups[index];
    if (!groupToDelete.id || !createdTaskId) {
      // If the group doesn't have an ID, it hasn't been saved to the backend yet.
      setQuestionGroups((prev) => prev.filter((_, i) => i !== index));
      return;
    }
    try {
      await deleteGroupQuestion(createdTaskId, groupToDelete.id);
      setQuestionGroups((prev) => prev.filter((_, i) => i !== index));
      toast({
        title: 'Success',
        description: 'Question group deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete question group',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle>
            {mode === 'create' ? 'Create New Listening Task' : 'Edit Listening Task'}
          </CardTitle>
          {mode === 'edit' && form.formState.isDirty && (
            <Badge variant='outline' className='bg-yellow-50 text-yellow-700 border-yellow-200'>
              Unsaved Changes
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <FormField
                control={form.control}
                name='title'
                render={({ field }: any) => (
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
                render={({ field }: any) => (
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
                render={({ field }: any) => (
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
                        <SelectItem value='0'>Part 1</SelectItem>
                        <SelectItem value='1'>Part 2</SelectItem>
                        <SelectItem value='2'>Part 3</SelectItem>
                        <SelectItem value='3'>Part 4</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='status'
                render={({ field }: any) => {
                  const currentStatus = field.value;
                  // Check if the original status from database was TEST
                  const isOriginalTestStatus = currentOriginalStatus === ListeningTaskStatus.TEST;

                  return (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        defaultValue={field.value.toString()}
                        disabled={isOriginalTestStatus || mode === 'create'}
                      >
                        <FormControl>
                          <SelectTrigger
                            className={
                              isOriginalTestStatus || mode === 'create'
                                ? 'opacity-50 cursor-not-allowed'
                                : ''
                            }
                          >
                            <SelectValue placeholder='Select status' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={ListeningTaskStatus.DRAFT.toString()}>
                            Draft
                          </SelectItem>
                          <SelectItem value={ListeningTaskStatus.PUBLISHED.toString()}>
                            Published
                          </SelectItem>
                          <SelectItem value={ListeningTaskStatus.TEST.toString()}>Test</SelectItem>
                        </SelectContent>
                      </Select>
                      {(isOriginalTestStatus || mode === 'create') && (
                        <p className='text-xs text-muted-foreground'>
                          {isOriginalTestStatus
                            ? 'Status cannot be changed when task is in Test mode'
                            : 'Status is set to Draft for new tasks'}
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
              render={({ field }: any) => (
                <FormItem>
                  <FormLabel>Audio File</FormLabel>
                  <FormControl>
                    <div className='flex flex-col space-y-2'>
                      <Input
                        type='file'
                        accept='audio/*'
                        onChange={(e) => handleFileChange(e, field.onChange)}
                      />
                      {audioPreview ? (
                        <div className='mt-2'>
                          <audio controls src={audioPreview} className='w-full' />
                        </div>
                      ) : serverAudioUrl ? (
                        <div className='mt-2'>
                          <audio controls src={serverAudioUrl} className='w-full' />
                        </div>
                      ) : null}
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
              render={({ field }: any) => (
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

            <FormField
              control={form.control}
              name='transcript'
              render={({ field }: any) => (
                <FormItem>
                  <FormLabel>Transcript</FormLabel>
                  <FormControl>
                    <TiptapEditor
                      content={field.value}
                      onChange={field.onChange}
                      placeholder='Enter transcript of the audio...'
                    />
                  </FormControl>
                  <FormDescription>Manual transcript of the audio</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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
        {/* Sau khi tạo xong task hoặc khi edit, hiển thị quản lý group/question */}
        {createdTaskId && (
          <div className='mt-8'>
            <ListeningQuestionGroupsManager
              task_id={createdTaskId}
              questionGroups={questionGroups}
              onAddGroup={handleAddGroup}
              onUpdateGroup={handleUpdateGroup}
              onDeleteGroup={handleDeleteGroup}
              refetchTaskData={async () => {
                if (createdTaskId) {
                  const { getAllQuestionGroups } = useListeningTask();
                  const response: { data?: any[] } = await getAllQuestionGroups(createdTaskId);
                  if (response?.data) {
                    // Map AddGroupQuestionResponse[] to LocalListeningQuestionGroup[]
                    const groups = (response.data as any[]).map((g) => ({
                      id: g.group_id,
                      section_order: g.section_order,
                      section_label: g.section_label,
                      instruction: g.instruction,
                      question_type: g.question_type,
                      questions: g.questions ?? [],
                      drag_items: g.drag_items ?? [],
                    }));
                    setQuestionGroups(groups);
                  }
                }
              }}
            />
            {/*
            {mode === 'edit' && questionGroups.length > 0 && (
              <div className='mt-8'>
                <Card>
                  <CardHeader>
                    <CardTitle>Question Groups</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {questionGroups.map((group, groupIdx) => (
                      <div key={group.id || groupIdx} className='mb-8'>
                        <h4 className='font-semibold mb-2'>{group.section_label}</h4>
                        <div
                          className='mb-2'
                          dangerouslySetInnerHTML={{ __html: group.instruction }}
                        />
                        {group.questions && group.questions.length > 0 ? (
                          <div className='space-y-4'>
                            {group.questions.map((q: any) => {
                              switch (q.question_type) {
                                case QuestionTypeEnumIndex.MULTIPLE_CHOICE: // Multiple Choice
                                  return (
                                    <div key={q.question_id} className='p-4 border rounded'>
                                      <div
                                        dangerouslySetInnerHTML={{
                                          __html: q.instruction_for_choice,
                                        }}
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
                                        <span className='font-semibold'>
                                          Blank {q.blank_index}:
                                        </span>{' '}
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
                                        dangerouslySetInnerHTML={{
                                          __html: q.instruction_for_matching,
                                        }}
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
                        ) : (
                          <div className='text-muted-foreground italic'>
                            No questions in this group.
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            )} */}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
