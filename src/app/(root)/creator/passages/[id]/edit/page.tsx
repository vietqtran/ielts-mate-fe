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
  QuestionTypeEnumIndex,
} from '@/types/reading/reading.types';
import { ArrowLeft, Eye } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { PassageBasicInfoForm } from '@/components/features/admin/reading/create/PassageBasicInfoForm';
import { PassagePreview } from '@/components/features/admin/reading/create/PassagePreview';
import {
  LocalQuestionGroup,
  QuestionGroupsManager,
} from '@/components/features/admin/reading/create/QuestionGroupsManager';
import { Button } from '@/components/ui/button';
import { usePassage } from '@/hooks/apis/reading/usePassage';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

const passageSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  instruction: z.string().min(1, 'Instruction is required'),
  content: z.string().min(1, 'Content is required'),
  ielts_type: z.nativeEnum(IeltsType),
  part_number: z.number().min(1).max(3),
  passage_status: z.nativeEnum(PassageStatus),
});

type PassageFormData = z.infer<typeof passageSchema>;

export default function EditPassagePage() {
  const router = useRouter();
  const params = useParams();
  const {
    updatePassage,
    getPassageById,
    addGroupQuestion,
    updateGroupQuestion,
    deleteGroupQuestion,
    isLoading,
  } = usePassage();
  const passage_id = params.id as string;

  const [currentStep, setCurrentStep] = useState<'basic' | 'questions' | 'preview'>('basic');
  const [questionGroups, setQuestionGroups] = useState<LocalQuestionGroup[]>([]);
  const [activeTab, setActiveTab] = useState('passage');
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [originalFormData, setOriginalFormData] = useState<PassageFormData | null>(null);
  const [isPassageCompleted, setIsPassageCompleted] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

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

  const refetchPassageData = async () => {
    try {
      const passageResponse = await getPassageById(passage_id);
      if (passageResponse.data) {
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
        const getpart_numberEnum = (part_number: number) => part_number + 1;
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

        const formData = {
          title: passageResponse.data.title,
          instruction: passageResponse.data.instruction,
          content: passageResponse.data.content,
          ielts_type: getielts_typeEnum(passageResponse.data.ielts_type),
          part_number: getpart_numberEnum(passageResponse.data.part_number),
          passage_status: getpassage_statusEnum(passageResponse.data.passage_status),
        };

        form.reset(formData);
        setOriginalFormData(formData);

        const passageDetail = passageResponse.data as any;
        if (passageDetail.question_groups) {
          const mappedGroups = passageDetail.question_groups.map((group: any) => ({
            id: group.group_id,
            section_order: group.section_order,
            section_label: group.section_label,
            instruction: group.instruction,
            // Prefer group's question_type from API; fallback to first question's type; default to MULTIPLE_CHOICE
            question_type:
              typeof group?.question_type === 'number'
                ? group.question_type
                : typeof group?.questions?.[0]?.question_type === 'number'
                  ? group.questions[0].question_type
                  : QuestionTypeEnumIndex.MULTIPLE_CHOICE,
            questions: group.questions ?? [],
            drag_items: group.drag_items ?? [],
          }));
          setQuestionGroups(mappedGroups);
        }
      }
      setIsDataLoaded(true);
    } catch (error) {
      setIsDataLoaded(true);
    }
  };

  // Load existing passage data on initial render
  useEffect(() => {
    if (passage_id) {
      refetchPassageData();
    }
  }, [passage_id]);

  // Watch for form changes to update unsaved changes state
  useEffect(() => {
    if (!originalFormData) return;

    const subscription = form.watch((data) => {
      const hasChanges =
        data.title !== originalFormData.title ||
        data.instruction !== originalFormData.instruction ||
        data.content !== originalFormData.content ||
        data.ielts_type !== originalFormData.ielts_type ||
        data.part_number !== originalFormData.part_number ||
        data.passage_status !== originalFormData.passage_status;
      setHasUnsavedChanges(hasChanges);
    });

    return () => subscription.unsubscribe();
  }, [form, originalFormData]);

  const handleBasicInfoSubmit = async (data: PassageFormData) => {
    try {
      console.log('Edit page handleBasicInfoSubmit called with passage_id:', passage_id);
      console.log('Form data:', data);

      // Check if the original status was TEST and prevent status change
      if (originalFormData && originalFormData.passage_status === PassageStatus.TEST) {
        if (data.passage_status !== PassageStatus.TEST) {
          // Status is being changed from TEST, which is not allowed
          toast.error('Status cannot be changed when passage is in Test mode');
          return;
        }
      }

      // Check if form data has changed
      if (originalFormData) {
        const hasChanged =
          data.title !== originalFormData.title ||
          data.instruction !== originalFormData.instruction ||
          data.content !== originalFormData.content ||
          data.ielts_type !== originalFormData.ielts_type ||
          data.part_number !== originalFormData.part_number ||
          data.passage_status !== originalFormData.passage_status;

        if (!hasChanged) {
          // No changes made, just proceed to questions tab
          setCurrentStep('questions');
          setActiveTab('questions');
          return;
        }
      }

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

      console.log('Calling updatePassage with request:', request);
      await updatePassage(passage_id, request);
      console.log('updatePassage completed successfully');

      // Reset form with updated data to make it the new default
      form.reset(data);

      // Update the original form data after successful update (this will clear hasUnsavedChanges)
      setOriginalFormData(data);

      // Clear unsaved changes state
      setHasUnsavedChanges(false);

      // Set passage as completed after successful save
      setIsPassageCompleted(true);

      setCurrentStep('questions');
      setActiveTab('questions');
    } catch (error) {}
  };

  const checkFormChanges = (): boolean => {
    if (!originalFormData) return false;

    const currentData = form.getValues();
    return (
      currentData.title !== originalFormData.title ||
      currentData.instruction !== originalFormData.instruction ||
      currentData.content !== originalFormData.content ||
      currentData.ielts_type !== originalFormData.ielts_type ||
      currentData.part_number !== originalFormData.part_number ||
      currentData.passage_status !== originalFormData.passage_status
    );
  };

  const handleAddQuestionGroup = (group: LocalQuestionGroup) => {
    // The group object is now passed with the ID from the backend,
    // as the API call is handled by the QuestionGroupsManager component.
    // We just need to update the local state.
    setQuestionGroups((prev) => [...prev, group]);
  };

  const handleUpdateQuestionGroup = async (
    index: number,
    group: LocalQuestionGroup,
    skipApiCall: boolean = false
  ) => {
    // Check if this contains newly created questions that shouldn't be updated again
    // @ts-ignore - These properties aren't in the type definition but were added to prevent redundant updates
    const hasJustCreatedQuestions = group._justCreatedQuestions === true;
    // @ts-ignore
    const createdQuestionIds = group._createdQuestionIds || [];
    // @ts-ignore - Check if this is just a state sync after individual question update
    const isStateSyncOnly = group._isStateSyncOnly === true;

    if (hasJustCreatedQuestions || skipApiCall || isStateSyncOnly) {
      // Just update the local state without making an API call
      setQuestionGroups((prev) => prev.map((g, i) => (i === index ? group : g)));
      return;
    }

    if (!group.id) {
      setQuestionGroups((prev) => prev.map((g, i) => (i === index ? group : g)));
      return;
    }

    try {
      const questions: QuestionCreationRequest[] = group.questions.map((q) => ({
        ...q,
        question_type: group.question_type,
        question_group_id: group.id, // Will be set by backend
      }));

      const groupRequest: AddGroupQuestionRequest = {
        section_order: group.section_order,
        section_label: group.section_label,
        instruction: group.instruction,
        questions: questions,
        drag_items: group.drag_items?.map((i) => i.content),
      };

      const response = await updateGroupQuestion(passage_id, group.id, groupRequest);
      if (response.data) {
        // Update local state with the new group from the backend, which includes the ID
        const updatedGroup = {
          ...group,
          id: response.data.group_id,
          questions: response.data.questions.map((q) => ({
            ...q,
            id: q.question_id,
          })),
        };
        setQuestionGroups((prev) => prev.map((g, i) => (i === index ? updatedGroup : g)));
      }
    } catch (error) {
      // TODO: Show a toast notification and potentially revert the optimistic update.
    }
  };

  const handleDeleteQuestionGroup = async (index: number) => {
    const groupToDelete = questionGroups[index];
    if (!groupToDelete.id) {
      // If the group doesn't have an ID, it hasn't been saved to the backend yet.
      // We can just remove it from the local state.
      setQuestionGroups((prev) => prev.filter((_, i) => i !== index));
      return;
    }

    try {
      await deleteGroupQuestion(passage_id, groupToDelete.id);
      // On successful deletion, update the local state.
      setQuestionGroups((prev) => prev.filter((_, i) => i !== index));
      toast.success('Question group deleted successfully');
    } catch (error) {
      toast.error('Failed to delete question group');
    }
  };

  const handlePreview = () => {
    setCurrentStep('preview');
    setActiveTab('preview');
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleFinish = async (status?: PassageStatus) => {
    try {
      setIsSaving(true);
      const formData = form.getValues();

      // If status is provided, use it instead of the form data
      if (status) {
        formData.passage_status = status;
      }

      // Check if the original status was TEST and prevent status change
      if (originalFormData && originalFormData.passage_status === PassageStatus.TEST) {
        if (formData.passage_status !== PassageStatus.TEST) {
          // Status is being changed from TEST, which is not allowed
          toast.error('Status cannot be changed when passage is in Test mode');
          setIsSaving(false);
          return;
        }
      }

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
            question_type: group.question_type,
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
            drag_items: group.drag_items?.map((i) => i.content),
          };

          await addGroupQuestion(passage_id, groupRequest);
        } catch (groupError) {
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
      router.push('/creator/passages');
    } catch (error) {
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
    <div className='container mx-auto p-6 max-w-7xl'>
      {/* Header */}
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-start flex-col gap-4'>
          <Button variant='ghost' onClick={() => router.push('/creator/passages')}>
            <ArrowLeft className='h-4 w-4 mr-2' />
            Back to Passages
          </Button>
          <div>
            <h1 className='text-3xl font-bold'>Edit Reading Passage</h1>
            <p className='text-muted-foreground'>Modify your IELTS reading passage and questions</p>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            onClick={() => router.push(`/creator/passages/${passage_id}/preview`)}
          >
            <Eye className='h-4 w-4 mr-2' />
            Preview
          </Button>
          {/* <Button
            onClick={handleFinish}
            disabled={
              !canPreview || isLoading.updatePassage || isLoading.addGroupQuestion || isSaving
            }
          >
            <Save className='h-4 w-4 mr-2' />
            Finish & Save
          </Button> */}
        </div>
      </div>

      {/* Progress Steps */}
      <Card className='mb-6'>
        <CardContent className=''>
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
              isEdit={true}
              key={`passage-form-${isDataLoaded}-${isPassageCompleted}`}
              form={form}
              onSubmit={handleBasicInfoSubmit}
              isLoading={isLoading.updatePassage}
              isCompleted={isPassageCompleted}
              hasChanges={hasUnsavedChanges}
              onEdit={() => {
                setIsPassageCompleted(false);
              }}
              originalStatus={originalFormData?.passage_status}
              hasQuestionGroups={questionGroups.length > 0}
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
            refetchPassageData={refetchPassageData}
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
