'use client';

import * as z from 'zod';

import { ArrowLeft, Eye, Plus, Save } from 'lucide-react';
import { CURRENT_PAGE_SESSION_STORAGE_KEY, PAGES } from '@/constants/pages';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IeltsType, PassageStatus, QuestionType } from '@/types/reading.types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PassageBasicInfoForm } from '@/components/passages/create/PassageBasicInfoForm';
import { PassagePreview } from '@/components/passages/create/PassagePreview';
import { QuestionGroupsManager } from '@/components/passages/create/QuestionGroupsManager';
import { Separator } from '@/components/ui/separator';
import { useForm } from 'react-hook-form';
import { usePassage } from '@/hooks/usePassage';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';

const passageSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  instruction: z.string().min(1, 'Instruction is required'),
  content: z.string().min(1, 'Content is required'),
  ieltsType: z.nativeEnum(IeltsType),
  partNumber: z.number().min(1).max(3),
  passageStatus: z.nativeEnum(PassageStatus),
});

type PassageFormData = z.infer<typeof passageSchema>;

interface QuestionGroup {
  id?: string;
  sectionOrder: number;
  sectionLabel: string;
  instruction: string;
  questionType: QuestionType;
  questions: any[];
  dragItems?: string[];
}

export default function CreatePassagePage() {
  const router = useRouter();
  const { createPassage, isLoading } = usePassage();
  
  const [currentStep, setCurrentStep] = useState<'basic' | 'questions' | 'preview'>('basic');
  const [createdPassageId, setCreatedPassageId] = useState<string | null>(null);
  const [questionGroups, setQuestionGroups] = useState<QuestionGroup[]>([]);
  const [activeTab, setActiveTab] = useState('passage');

  const form = useForm<PassageFormData>({
    resolver: zodResolver(passageSchema),
    defaultValues: {
      title: '',
      instruction: '',
      content: '',
      ieltsType: IeltsType.ACADEMIC,
      partNumber: 1,
      passageStatus: PassageStatus.DRAFT,
    },
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(CURRENT_PAGE_SESSION_STORAGE_KEY, PAGES.PASSAGES.CREATE);
    }
  }, []);

  // Auto-save functionality
  useEffect(() => {
    const interval = setInterval(() => {
      const formData = form.getValues();
      if (formData.title || formData.content) {
        sessionStorage.setItem('draft-passage', JSON.stringify({
          ...formData,
          questionGroups,
          timestamp: Date.now()
        }));
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
          setQuestionGroups(draft.questionGroups || []);
        }
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
  }, [form]);

  const handleBasicInfoSubmit = async (data: PassageFormData) => {
    try {
      // Map frontend enums to backend ordinal values
      const getIeltsTypeOrdinal = (ieltsType: IeltsType) => {
        switch (ieltsType) {
          case IeltsType.ACADEMIC: return 0;
          case IeltsType.GENERAL_TRAINING: return 1;
          default: return 0;
        }
      };

      const getPartNumberOrdinal = (partNumber: number) => {
        // Convert 1,2,3 to 0,1,2 (PART_1, PART_2, PART_3)
        return partNumber - 1;
      };

      const getPassageStatusOrdinal = (status: PassageStatus) => {
        switch (status) {
          case PassageStatus.DRAFT: return 0;
          case PassageStatus.PUBLISHED: return 1;
          case PassageStatus.DEACTIVATED: return 2;
          case PassageStatus.FINISHED: return 3;
          case PassageStatus.TEST: return 4; // But this might be rejected by DB constraint
          default: return 0; // Default to DRAFT
        }
      };

      const request = {
        title: data.title,
        instruction: data.instruction,
        content: data.content,
        content_with_highlight_keywords: data.content, // Use content as fallback for highlighted keywords
        ielts_type: getIeltsTypeOrdinal(data.ieltsType),
        part_number: getPartNumberOrdinal(data.partNumber),
        passage_status: getPassageStatusOrdinal(data.passageStatus),
      };

      const response = await createPassage(request);
      if (response.data?.passageId) {
        setCreatedPassageId(response.data.passageId);
        setCurrentStep('questions');
        setActiveTab('questions');
        // Clear draft after successful creation
        sessionStorage.removeItem('draft-passage');
      }
    } catch (error) {
      console.error('Failed to create passage:', error);
    }
  };

  const handleAddQuestionGroup = (group: QuestionGroup) => {
    setQuestionGroups(prev => [...prev, group]);
  };

  const handleUpdateQuestionGroup = (index: number, group: QuestionGroup) => {
    setQuestionGroups(prev => prev.map((g, i) => i === index ? group : g));
  };

  const handleDeleteQuestionGroup = (index: number) => {
    setQuestionGroups(prev => prev.filter((_, i) => i !== index));
  };

  const handlePreview = () => {
    setCurrentStep('preview');
    setActiveTab('preview');
  };

  const handleFinish = () => {
    sessionStorage.removeItem('draft-passage');
    router.push('/passages');
  };

  const getStepStatus = (step: 'basic' | 'questions' | 'preview') => {
    if (step === 'basic') return createdPassageId ? 'completed' : 'current';
    if (step === 'questions') return questionGroups.length > 0 ? 'completed' : createdPassageId ? 'current' : 'pending';
    if (step === 'preview') return currentStep === 'preview' ? 'current' : 'pending';
    return 'pending';
  };

  const canProceedToQuestions = createdPassageId !== null;
  const canPreview = canProceedToQuestions && questionGroups.length > 0;

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/passages')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Passages
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create New Reading Passage</h1>
            <p className="text-muted-foreground">
              Build a comprehensive IELTS reading passage with questions
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1">
            Auto-saved
          </Badge>
          <Button variant="outline" onClick={handlePreview} disabled={!canPreview}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button onClick={handleFinish} disabled={!canPreview}>
            <Save className="h-4 w-4 mr-2" />
            Finish & Save
          </Button>
        </div>
      </div>

      {/* Progress Steps */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center ${getStepStatus('basic') === 'completed' ? 'text-green-600' : getStepStatus('basic') === 'current' ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold
                  ${getStepStatus('basic') === 'completed' ? 'bg-green-600 border-green-600 text-white' : 
                    getStepStatus('basic') === 'current' ? 'bg-blue-600 border-blue-600 text-white' : 
                    'border-gray-400'}`}>
                  1
                </div>
                <span className="ml-2 font-medium">Passage Information</span>
              </div>
              
              <div className={`w-8 h-0.5 ${getStepStatus('questions') !== 'pending' ? 'bg-green-600' : 'bg-gray-300'}`} />
              
              <div className={`flex items-center ${getStepStatus('questions') === 'completed' ? 'text-green-600' : getStepStatus('questions') === 'current' ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold
                  ${getStepStatus('questions') === 'completed' ? 'bg-green-600 border-green-600 text-white' : 
                    getStepStatus('questions') === 'current' ? 'bg-blue-600 border-blue-600 text-white' : 
                    'border-gray-400'}`}>
                  2
                </div>
                <span className="ml-2 font-medium">Question Groups</span>
              </div>
              
              <div className={`w-8 h-0.5 ${getStepStatus('preview') !== 'pending' ? 'bg-green-600' : 'bg-gray-300'}`} />
              
              <div className={`flex items-center ${getStepStatus('preview') === 'current' ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold
                  ${getStepStatus('preview') === 'current' ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-400'}`}>
                  3
                </div>
                <span className="ml-2 font-medium">Preview & Finish</span>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              {questionGroups.length} question group(s) created
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="passage">Passage Information</TabsTrigger>
          <TabsTrigger value="questions" disabled={!canProceedToQuestions}>
            Question Groups
          </TabsTrigger>
          <TabsTrigger value="preview" disabled={!canPreview}>
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="passage" className="space-y-6">
          <PassageBasicInfoForm
            form={form}
            onSubmit={handleBasicInfoSubmit}
            isLoading={isLoading.createPassage}
            isCompleted={!!createdPassageId}
          />
        </TabsContent>

        <TabsContent value="questions" className="space-y-6">
          {createdPassageId && (
            <QuestionGroupsManager
              passageId={createdPassageId}
              questionGroups={questionGroups}
              onAddGroup={handleAddQuestionGroup}
              onUpdateGroup={handleUpdateQuestionGroup}
              onDeleteGroup={handleDeleteQuestionGroup}
            />
          )}
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          {createdPassageId && (
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
