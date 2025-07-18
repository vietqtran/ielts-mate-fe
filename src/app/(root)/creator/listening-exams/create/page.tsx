'use client';

import {
  ListeningQuestionGroupsManager,
  LocalListeningQuestionGroup,
} from '@/components/listening/ListeningQuestionGroupsManager';
import { ListeningTaskBasicInfoForm } from '@/components/listening/ListeningTaskBasicInfoForm';
import { ListeningTaskPreview } from '@/components/listening/ListeningTaskPreview';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useListeningTask } from '@/hooks/useListeningTask';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const listeningTaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  instruction: z.string().min(1, 'Instruction is required'),
  ielts_type: z.number().min(0),
  part_number: z.number().min(0),
  status: z.number().min(0),
  audio_file: z.any(),
  is_automatic_transcription: z.boolean(),
  transcription: z.string().optional(),
});

type ListeningTaskFormData = z.infer<typeof listeningTaskSchema>;

export default function CreateListeningTaskPage() {
  const router = useRouter();
  const { createListeningTask, isLoading } = useListeningTask();

  const [currentStep, setCurrentStep] = useState<'basic' | 'questions' | 'preview'>('basic');
  const [createdTaskId, setCreatedTaskId] = useState<string | null>(null);
  const [questionGroups, setQuestionGroups] = useState<LocalListeningQuestionGroup[]>([]);
  const [activeTab, setActiveTab] = useState('task');

  const form = useForm<ListeningTaskFormData>({
    resolver: zodResolver(listeningTaskSchema),
    defaultValues: {
      title: '',
      instruction: '',
      ielts_type: 0,
      part_number: 0,
      status: 0,
      audio_file: undefined,
      is_automatic_transcription: false,
      transcription: '',
    },
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('CURRENT_PAGE_SESSION_STORAGE_KEY', 'LISTENING_TASKS_CREATE');
      if (!createdTaskId) {
        sessionStorage.removeItem('draft-listening-task');
      }
    }
  }, [createdTaskId]);

  useEffect(() => {
    const interval = setInterval(() => {
      const formData = form.getValues();
      if (formData.title || formData.instruction) {
        sessionStorage.setItem(
          'draft-listening-task',
          JSON.stringify({
            ...formData,
            questionGroups,
            timestamp: Date.now(),
          })
        );
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [form, questionGroups]);

  useEffect(() => {
    const savedDraft = sessionStorage.getItem('draft-listening-task');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        if (Date.now() - draft.timestamp < 24 * 60 * 60 * 1000) {
          form.reset(draft);
          setQuestionGroups(draft.questionGroups ?? []);
        }
      } catch (error) {}
    }
  }, [form]);

  const handleBasicInfoSubmit = async (data: ListeningTaskFormData) => {
    try {
      let payload: any = data;
      // Nếu có file audio, dùng FormData
      if (data.audio_file instanceof File) {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            // boolean phải chuyển thành string
            if (typeof value === 'boolean') {
              formData.append(key, value ? 'true' : 'false');
            } else {
              formData.append(key, value);
            }
          }
        });
        payload = formData;
      }
      const response = await createListeningTask(payload);
      if (response.data?.task_id) {
        setCreatedTaskId(response.data.task_id);
        setCurrentStep('questions');
        setActiveTab('questions');
        sessionStorage.removeItem('draft-listening-task');
      }
    } catch (error) {}
  };

  const handleAddQuestionGroup = (group: LocalListeningQuestionGroup) => {
    setQuestionGroups((prev) => [...prev, group]);
  };

  const handleUpdateQuestionGroup = (index: number, group: LocalListeningQuestionGroup) => {
    setQuestionGroups((prev) => prev.map((g, i) => (i === index ? group : g)));
  };

  const handleDeleteQuestionGroup = (index: number) => {
    setQuestionGroups((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePreview = () => {
    setCurrentStep('preview');
    setActiveTab('preview');
  };

  return (
    <div className='container py-8'>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className='grid w-full grid-cols-3'>
          <TabsTrigger value='task'>Listening Task Information</TabsTrigger>
          <TabsTrigger value='questions' disabled={!createdTaskId}>
            Question Groups
          </TabsTrigger>
          <TabsTrigger value='preview' disabled={!createdTaskId}>
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value='task' className='space-y-6'>
          <ListeningTaskBasicInfoForm
            isEdit={false}
            form={form}
            onSubmit={handleBasicInfoSubmit}
            isLoading={isLoading.createListeningTask}
            isCompleted={!!createdTaskId}
          />
        </TabsContent>

        <TabsContent value='questions' className='space-y-6'>
          {createdTaskId && (
            <ListeningQuestionGroupsManager
              task_id={createdTaskId}
              questionGroups={questionGroups}
              onAddGroup={handleAddQuestionGroup}
              onUpdateGroup={handleUpdateQuestionGroup}
              onDeleteGroup={handleDeleteQuestionGroup}
              refetchTaskData={() => {}}
            />
          )}
        </TabsContent>

        <TabsContent value='preview' className='space-y-6'>
          {createdTaskId && (
            <ListeningTaskPreview
              taskData={form.getValues()}
              questionGroups={questionGroups}
              onFinish={() => router.push('/creator/listening-exams')}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
