'use client';

import * as z from 'zod';

import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CURRENT_PAGE_SESSION_STORAGE_KEY, PAGES } from '@/constants/pages';
import {
  AddGroupQuestionRequest,
  IeltsType,
  PassageStatus,
  QuestionCreationRequest,
  QuestionType,
} from '@/types/reading.types';
import { ArrowLeft, Eye, Save } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { PassageBasicInfoForm } from '@/components/passages/create/PassageBasicInfoForm';
import { PassagePreview } from '@/components/passages/create/PassagePreview';
import { QuestionGroupsManager } from '@/components/passages/create/QuestionGroupsManager';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePassage } from '@/hooks/usePassage';
import { zodResolver } from '@hookform/resolvers/zod';
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

interface QuestionGroup {
  id?: string;
  section_order: number;
  section_label: string;
  instruction: string;
  question_type: QuestionType;
  questions: any[];
  drag_items?: string[];
}

export default function EditPassagePage() {
  const router = useRouter();
  const params = useParams();
  const { updatePassage, getPassageById, getAllQuestionGroups, addGroupQuestion, isLoading } =
    usePassage();
  const passage_id = params.id as string;

  const [currentStep, setCurrentStep] = useState<'basic' | 'questions' | 'preview'>('basic');
  const [questionGroups, setQuestionGroups] = useState<QuestionGroup[]>([]);
  const [activeTab, setActiveTab] = useState('passage');
  const [isDataLoaded, setIsDataLoaded] = useState(false);

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
      sessionStorage.setItem(CURRENT_PAGE_SESSION_STORAGE_KEY, PAGES.PASSAGES.EDIT);
    }
  }, []);

  // Load existing passage data
  useEffect(() => {
    const loadPassageData = async () => {
      try {
        const passageResponse = await getPassageById(passage_id);
        if (passageResponse.data) {
          // Map backend ordinal values to frontend enums
          const getielts_typeEnum = (ielts_type: number) => {
            switch (ielts_type) {
              case 0:
                return 'ACADEMIC' as IeltsType;
              case 1:
                return 'GENERAL_TRAINING' as IeltsType;
              default:
                return 'ACADEMIC' as IeltsType;
            }
          };

          const getpart_numberEnum = (part_number: number) => {
            // Convert 0,1,2 to 1,2,3
            return part_number + 1;
          };

          const getpassage_statusEnum = (status: number) => {
            switch (status) {
              case 0:
                return PassageStatus.DRAFT;
              case 1:
                return PassageStatus.PUBLISHED;
              case 2:
                return PassageStatus.DEACTIVATED;
              case 3:
                return PassageStatus.FINISHED;
              case 4:
                return PassageStatus.TEST;
              default:
                return PassageStatus.DRAFT;
            }
          };

          form.reset({
            title: passageResponse.data.title,
            instruction: passageResponse.data.instruction,
            content: passageResponse.data.content,
            ielts_type: getielts_typeEnum(passageResponse.data.ielts_type),
            part_number: getpart_numberEnum(passageResponse.data.part_number),
            passage_status: getpassage_statusEnum(passageResponse.data.passage_status),
          });

          // Load question groups from the passage detail response which includes question_groups
          const passageDetail = passageResponse.data as any;
          if (passageDetail.question_groups) {
            // Map the API response to QuestionGroup format
            const mappedGroups = passageDetail.question_groups.map((group: any) => ({
              id: group.group_id, // Use group_id from the API response
              section_order: group.section_order,
              section_label: group.section_label,
              instruction: group.instruction,
              // Infer question_type from the first question in the group, default to MULTIPLE_CHOICE
              question_type:
                group.questions[0]?.question_type === 0
                  ? QuestionType.MULTIPLE_CHOICE
                  : group.questions[0]?.question_type === 1
                    ? QuestionType.FILL_IN_THE_BLANKS
                    : group.questions[0]?.question_type === 2
                      ? QuestionType.MATCHING
                      : group.questions[0]?.question_type === 3
                        ? QuestionType.DRAG_AND_DROP
                        : QuestionType.MULTIPLE_CHOICE,
              questions: group.questions || [],
              drag_items: group.drag_items || [],
            }));
            setQuestionGroups(mappedGroups);
          }
        }

        // Set data loaded state after both passage and groups are loaded
        setIsDataLoaded(true);
      } catch (error) {
        console.error('Failed to load passage data:', error);
        setIsDataLoaded(true); // Set to true even on error to show the form
      }
    };

    if (passage_id) {
      loadPassageData();
    }
  }, [passage_id]);

  const handleBasicInfoSubmit = async (data: PassageFormData) => {
    try {
      // Map frontend enums to backend ordinal values
      const getielts_typeOrdinal = (ielts_type: IeltsType) => {
        switch (ielts_type) {
          case 'ACADEMIC':
            return 0;
          case 'GENERAL_TRAINING':
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
            return 4;
          default:
            return 0;
        }
      };

      const request = {
        title: data.title,
        instruction: data.instruction,
        content: data.content,
        content_with_highlight_keywords: data.content,
        ielts_type: getielts_typeOrdinal(data.ielts_type),
        part_number: getpart_numberOrdinal(data.part_number),
        passage_status: getpassage_statusOrdinal(data.passage_status),
      };

      await updatePassage(passage_id, request);
      setCurrentStep('questions');
      setActiveTab('questions');
    } catch (error) {
      console.error('Failed to update passage:', error);
    }
  };

  const handleAddQuestionGroup = (group: QuestionGroup) => {
    setQuestionGroups((prev) => [...prev, group]);
  };

  const handleUpdateQuestionGroup = (index: number, group: QuestionGroup) => {
    setQuestionGroups((prev) => prev.map((g, i) => (i === index ? group : g)));
  };

  const handleDeleteQuestionGroup = (index: number) => {
    setQuestionGroups((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePreview = () => {
    setCurrentStep('preview');
    setActiveTab('preview');
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleFinish = async () => {
    try {
      setIsSaving(true);
      const formData = form.getValues();

      // First save all unsaved question groups
      const unsavedGroups = questionGroups.filter((group) => !group.id);

      for (const group of unsavedGroups) {
        try {
          const questions: QuestionCreationRequest[] = group.questions.map((q) => ({
            question_order: q.question_order,
            point: q.point,
            explanation: q.explanation,
            number_of_correct_answers: q.number_of_correct_answers,
            instruction_for_choice: q.instruction_for_choice,
            question_type: Object.values(QuestionType).indexOf(group.question_type),
            question_group_id: '', // Will be set by backend
            question_categories: [],
            choices: q.choices?.map(
              (c: {
                label: string;
                content: string;
                choice_order: number;
                is_correct: boolean;
              }) => ({
                label: c.label,
                content: c.content,
                choice_order: c.choice_order,
                is_correct: c.is_correct,
              })
            ),
          }));

          const groupRequest: AddGroupQuestionRequest = {
            section_order: group.section_order,
            section_label: group.section_label,
            instruction: group.instruction,
            questions: questions,
            drag_items: group.drag_items,
          };

          await addGroupQuestion(passage_id, groupRequest);
        } catch (groupError) {
          console.error('Failed to save question group:', groupError);
          throw new Error('Failed to save all question groups');
        }
      }

      // Then save the passage with latest data
      const passageRequest = {
        title: formData.title,
        instruction: formData.instruction,
        content: formData.content,
        content_with_highlight_keywords: formData.content,
        ielts_type: Object.values(IeltsType).indexOf(formData.ielts_type),
        part_number: formData.part_number - 1,
        passage_status: Object.values(PassageStatus).indexOf(formData.passage_status),
      };

      await updatePassage(passage_id, passageRequest);
      router.push('/passages');
    } catch (error) {
      console.error('Failed to save changes:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getStepStatus = (step: 'basic' | 'questions' | 'preview') => {
    if (step === 'basic') return currentStep === 'basic' ? 'current' : 'completed';
    if (step === 'questions') {
      if (questionGroups.length > 0) return 'completed';
      if (currentStep === 'questions') return 'current';
      return 'pending';
    }
    if (step === 'preview') return currentStep === 'preview' ? 'current' : 'pending';
    return 'pending';
  };

  const canProceedToQuestions = true; // Since we're editing, we can always proceed
  const canPreview = questionGroups.length > 0;

  return (
    <div className='container mx-auto py-6 max-w-7xl'>
      {/* Header */}
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-4'>
          <Button variant='ghost' onClick={() => router.push('/passages')}>
            <ArrowLeft className='h-4 w-4 mr-2' />
            Back to Passages
          </Button>
          <div>
            <h1 className='text-3xl font-bold'>Edit Reading Passage</h1>
            <p className='text-muted-foreground'>Modify your IELTS reading passage and questions</p>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <Badge variant='outline' className='px-3 py-1'>
            Auto-saved
          </Badge>
          <Button variant='outline' onClick={() => router.push(`/passages/${passage_id}/preview`)}>
            <Eye className='h-4 w-4 mr-2' />
            Preview
          </Button>
          <Button
            onClick={handleFinish}
            disabled={
              !canPreview || isLoading.updatePassage || isLoading.addGroupQuestion || isSaving
            }
          >
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
                className={`flex items-center ${
                  getStepStatus('basic') === 'completed'
                    ? 'text-green-600'
                    : getStepStatus('basic') === 'current'
                      ? 'text-blue-600'
                      : 'text-gray-400'
                }`}
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
                className={`w-8 h-0.5 ${
                  getStepStatus('questions') !== 'pending' ? 'bg-green-600' : 'bg-gray-300'
                }`}
              />

              <div
                className={`flex items-center ${
                  getStepStatus('questions') === 'completed'
                    ? 'text-green-600'
                    : getStepStatus('questions') === 'current'
                      ? 'text-blue-600'
                      : 'text-gray-400'
                }`}
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
                className={`w-8 h-0.5 ${
                  getStepStatus('preview') !== 'pending' ? 'bg-green-600' : 'bg-gray-300'
                }`}
              />

              <div
                className={`flex items-center ${
                  getStepStatus('preview') === 'current' ? 'text-blue-600' : 'text-gray-400'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold
                  ${
                    getStepStatus('preview') === 'current'
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-gray-400'
                  }`}
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
          {isDataLoaded && (
            <PassageBasicInfoForm
              key={`passage-form-${isDataLoaded}`}
              form={form}
              onSubmit={handleBasicInfoSubmit}
              isLoading={isLoading.updatePassage}
              isCompleted={false}
            />
          )}
          {!isDataLoaded && (
            <div className='flex justify-center items-center h-64'>
              <div className='text-center'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4'></div>
                <p className='text-muted-foreground'>Loading passage data...</p>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value='questions' className='space-y-6'>
          <QuestionGroupsManager
            passage_id={passage_id}
            questionGroups={questionGroups}
            onAddGroup={handleAddQuestionGroup}
            onUpdateGroup={handleUpdateQuestionGroup}
            onDeleteGroup={handleDeleteQuestionGroup}
          />
        </TabsContent>

        <TabsContent value='preview' className='space-y-6'>
          <PassagePreview
            passageData={form.getValues()}
            questionGroups={questionGroups}
            onFinish={handleFinish}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
