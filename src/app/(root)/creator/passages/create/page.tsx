'use client';

import * as z from 'zod';

import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CURRENT_PAGE_SESSION_STORAGE_KEY, PAGES } from '@/constants/pages';
import { IeltsType, PassageStatus } from '@/types/reading.types';
import { ArrowLeft, Eye, Save } from 'lucide-react';
import { useEffect, useState } from 'react';

import { PassageBasicInfoForm } from '@/components/reading/create/PassageBasicInfoForm';
import { PassagePreview } from '@/components/reading/create/PassagePreview';
import {
  LocalQuestionGroup,
  QuestionGroupsManager,
} from '@/components/reading/create/QuestionGroupsManager';
import { Button } from '@/components/ui/button';
import { usePassage } from '@/hooks/apis/reading/usePassage';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

const passageSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  instruction: z.string().min(1, 'Instruction is required'),
  content: z.string().min(1, 'Content is required'),
  ielts_type: z.nativeEnum(IeltsType),
  part_number: z.number().min(1).max(3),
  passage_status: z.nativeEnum(PassageStatus),
});

type PassageFormData = z.infer<typeof passageSchema>;

export default function CreatePassagePage() {
  const router = useRouter();
  const { createPassage, isLoading } = usePassage();

  const [currentStep, setCurrentStep] = useState<'basic' | 'questions' | 'preview'>('basic');
  const [createdpassage_id, setCreatedpassage_id] = useState<string | null>(null);
  const [questionGroups, setQuestionGroups] = useState<LocalQuestionGroup[]>([]);
  const [activeTab, setActiveTab] = useState('passage');

  const form = useForm<PassageFormData>({
    resolver: zodResolver(passageSchema),
    defaultValues: {
      title: '',
      instruction: '',
      content: '',
      ielts_type: IeltsType.ACADEMIC,
      part_number: 1,
      passage_status: PassageStatus.DRAFT,
    },
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(CURRENT_PAGE_SESSION_STORAGE_KEY, PAGES.PASSAGES.CREATE);

      // Clear any previous passage data when starting a new passage creation
      if (!createdpassage_id) {
        sessionStorage.removeItem('draft-passage');
      }
    }
  }, [createdpassage_id]);

  // Auto-save functionality
  useEffect(() => {
    const interval = setInterval(() => {
      const formData = form.getValues();
      if (formData.title || formData.content) {
        sessionStorage.setItem(
          'draft-passage',
          JSON.stringify({
            ...formData,
            questionGroups,
            timestamp: Date.now(),
          })
        );
      }
    }, 30000); // Save every 30 seconds

    return () => clearInterval(interval);
  }, [form, questionGroups]);

  // Load draft on mount
  useEffect(() => {
    const savedDraft = sessionStorage.getItem('draft-passage');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        // Check if draft is less than 24 hours old
        if (Date.now() - draft.timestamp < 24 * 60 * 60 * 1000) {
          form.reset(draft);
          setQuestionGroups(draft.questionGroups ?? []);
        }
      } catch (error) {}
    }
  }, [form]);

  const handleBasicInfoSubmit = async (data: PassageFormData) => {
    try {
      // Map frontend enums to backend ordinal values
      const getielts_typeOrdinal = (ielts_type: IeltsType) => {
        switch (ielts_type) {
          case IeltsType.ACADEMIC:
            return 0;
          case IeltsType.GENERAL_TRAINING:
            return 1;
          default:
            return 0;
        }
      };

      const getpart_numberOrdinal = (part_number: number) => {
        // Convert 1,2,3 to 0,1,2 (PART_1, PART_2, PART_3)
        return part_number - 1;
      };

      const getpassage_statusOrdinal = (status: PassageStatus) => {
        switch (status) {
          case PassageStatus.DRAFT:
            return 0;
          case PassageStatus.PUBLISHED:
            return 1;
          case PassageStatus.DEACTIVATED:
            return 2;
          case PassageStatus.FINISHED:
            return 3;
          case PassageStatus.TEST:
            return 4; // But this might be rejected by DB constraint
          default:
            return 0; // Default to DRAFT
        }
      };

      const request = {
        title: data.title,
        instruction: data.instruction,
        content: data.content,
        content_with_highlight_keywords: data.content, // Use content as fallback for highlighted keywords
        ielts_type: getielts_typeOrdinal(data.ielts_type),
        part_number: getpart_numberOrdinal(data.part_number),
        passage_status: getpassage_statusOrdinal(data.passage_status),
      };

      const response = await createPassage(request);
      if (response.data?.passage_id) {
        setCreatedpassage_id(response.data.passage_id);
        setCurrentStep('questions');
        setActiveTab('questions');
        // Clear draft after successful creation
        sessionStorage.removeItem('draft-passage');
      }
    } catch (error) {}
  };

  const handleAddQuestionGroup = (group: LocalQuestionGroup) => {
    setQuestionGroups((prev) => [...prev, group]);
  };

  const handleUpdateQuestionGroup = (index: number, group: LocalQuestionGroup) => {
    // Check if this contains newly created questions that shouldn't be updated again
    // @ts-ignore - These properties aren't in the type definition but were added to prevent redundant updates
    const hasJustCreatedQuestions = group._justCreatedQuestions === true;

    // In create page, we're just updating local state without API calls,
    // but we still need to preserve the special flags
    setQuestionGroups((prev) => prev.map((g, i) => (i === index ? group : g)));
  };

  const handleDeleteQuestionGroup = (index: number) => {
    setQuestionGroups((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePreview = () => {
    setCurrentStep('preview');
    setActiveTab('preview');
  };

  const handleFinish = () => {
    // Clear the form fields
    form.reset({
      title: '',
      instruction: '',
      content: '',
      ielts_type: IeltsType.ACADEMIC,
      part_number: 1,
      passage_status: PassageStatus.DRAFT,
    });

    // Clear the question groups
    setQuestionGroups([]);

    // Reset the created passage ID
    setCreatedpassage_id(null);

    // Reset the current step to the beginning
    setCurrentStep('basic');
    setActiveTab('passage');

    // Clear the draft from session storage
    sessionStorage.removeItem('draft-passage');

    // Navigate back to the passages list
    router.push('/creator/passages');
  };

  const getStepStatus = (step: 'basic' | 'questions' | 'preview') => {
    if (step === 'basic') return createdpassage_id ? 'completed' : 'current';
    if (step === 'questions')
      return questionGroups.length > 0 ? 'completed' : createdpassage_id ? 'current' : 'pending';
    if (step === 'preview') return currentStep === 'preview' ? 'current' : 'pending';
    return 'pending';
  };

  const canProceedToQuestions = createdpassage_id !== null;
  const canPreview = canProceedToQuestions && questionGroups.length > 0;

  return (
    <div className='container mx-auto p-6 max-w-7xl'>
      {/* Header */}
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-start flex-col gap-4'>
          <Button variant='ghost' onClick={() => router.push('/creator/passages')}>
            <ArrowLeft className='h-4 w-4 mr-2' />
            Back to Passages
          </Button>
          <div>
            <h1 className='text-3xl font-bold'>Create New Reading Passage</h1>
            <p className='text-muted-foreground'>
              Build a comprehensive IELTS reading passage with questions
            </p>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <Button variant='outline' onClick={handlePreview} disabled={!canPreview}>
            <Eye className='h-4 w-4 mr-2' />
            Preview
          </Button>
          <Button onClick={handleFinish} disabled={!canPreview}>
            <Save className='h-4 w-4 mr-2' />
            Finish & Save
          </Button>
        </div>
      </div>

      {/* Progress Steps */}
      <Card className='mb-6'>
        <CardContent className='pt-6'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-4'>
              <div
                className={`flex items-center ${getStepStatus('basic') === 'completed' ? 'text-green-600' : getStepStatus('basic') === 'current' ? 'text-blue-600' : 'text-gray-400'}`}
              >
                <div
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold
                  ${
                    getStepStatus('basic') === 'completed'
                      ? 'bg-green-600 border-green-600 text-white'
                      : getStepStatus('basic') === 'current'
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-gray-400'
                  }`}
                >
                  1
                </div>
                <span className='ml-2 font-medium'>Passage Information</span>
              </div>

              <div
                className={`w-8 h-0.5 ${getStepStatus('questions') !== 'pending' ? 'bg-green-600' : 'bg-gray-300'}`}
              />

              <div
                className={`flex items-center ${getStepStatus('questions') === 'completed' ? 'text-green-600' : getStepStatus('questions') === 'current' ? 'text-blue-600' : 'text-gray-400'}`}
              >
                <div
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold
                  ${
                    getStepStatus('questions') === 'completed'
                      ? 'bg-green-600 border-green-600 text-white'
                      : getStepStatus('questions') === 'current'
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-gray-400'
                  }`}
                >
                  2
                </div>
                <span className='ml-2 font-medium'>Question Groups</span>
              </div>

              <div
                className={`w-8 h-0.5 ${getStepStatus('preview') !== 'pending' ? 'bg-green-600' : 'bg-gray-300'}`}
              />

              <div
                className={`flex items-center ${getStepStatus('preview') === 'current' ? 'text-blue-600' : 'text-gray-400'}`}
              >
                <div
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold
                  ${getStepStatus('preview') === 'current' ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-400'}`}
                >
                  3
                </div>
                <span className='ml-2 font-medium'>Preview & Finish</span>
              </div>
            </div>

            <div className='text-sm text-muted-foreground'>
              {questionGroups.length} question group(s) created
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className='grid w-full grid-cols-3'>
          <TabsTrigger value='passage'>Passage Information</TabsTrigger>
          <TabsTrigger value='questions' disabled={!canProceedToQuestions}>
            Question Groups
          </TabsTrigger>
          <TabsTrigger value='preview' disabled={!canPreview}>
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value='passage' className='space-y-6'>
          <PassageBasicInfoForm
            isEdit={false}
            form={form}
            onSubmit={handleBasicInfoSubmit}
            isLoading={isLoading.createPassage}
            isCompleted={!!createdpassage_id}
          />
        </TabsContent>

        <TabsContent value='questions' className='space-y-6'>
          {createdpassage_id && (
            <QuestionGroupsManager
              passage_id={createdpassage_id}
              questionGroups={questionGroups}
              onAddGroup={handleAddQuestionGroup}
              onUpdateGroup={handleUpdateQuestionGroup}
              onDeleteGroup={handleDeleteQuestionGroup}
              refetchPassageData={() => {}}
            />
          )}
        </TabsContent>

        <TabsContent value='preview' className='space-y-6'>
          {createdpassage_id && (
            <PassagePreview
              passageData={form.getValues()}
              questionGroups={questionGroups}
              onFinish={handleFinish}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
