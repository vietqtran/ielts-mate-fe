'use client';

import * as z from 'zod';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CURRENT_PAGE_SESSION_STORAGE_KEY, PAGES } from '@/constants/pages';
import { IeltsType, PassageStatus } from '@/types/reading.types';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { TiptapEditor } from '@/components/ui/tiptap-editor';
import { usePassage } from '@/hooks/apis/reading/usePassage';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { GroupQuestionForm } from './GroupQuestionForm';

const passageSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  instruction: z.string().min(1, 'Instruction is required'),
  content: z.string().min(1, 'Content is required'),
  content_with_highlight_keywords: z.string().min(1, 'Content with highlights is required'),
  ielts_type: z.nativeEnum(IeltsType),
  part_number: z.number().min(1).max(3),
  passage_status: z.nativeEnum(PassageStatus),
});

type PassageFormData = z.infer<typeof passageSchema>;

interface CreatePassageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreatePassageModal({
  isOpen,
  onClose,
  onSuccess,
}: Readonly<CreatePassageModalProps>) {
  const { createPassage, addGroupQuestion, isLoading } = usePassage();
  const [currentTab, setCurrentTab] = useState('passage');
  const [createdpassage_id, setCreatedpassage_id] = useState<string | null>(null);
  const [questionGroups, setQuestionGroups] = useState<any[]>([]);
  const form = useForm<PassageFormData>({
    resolver: zodResolver(passageSchema),
    defaultValues: {
      title: '',
      instruction: '',
      content: '',
      content_with_highlight_keywords: '',
      ielts_type: IeltsType.ACADEMIC,
      part_number: 1,
      passage_status: PassageStatus.DRAFT,
    },
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(CURRENT_PAGE_SESSION_STORAGE_KEY, PAGES.PASSAGES.CREATE);
    }
  }, []);

  // Session storage persistence logic
  useEffect(() => {
    const handleBeforeUnload = () => {
      // You can implement form data persistence here if needed
    };

    if (typeof window !== 'undefined') {
      const currentPage = sessionStorage.getItem(CURRENT_PAGE_SESSION_STORAGE_KEY);
      if (currentPage === PAGES.PASSAGES.CREATE) {
        // Restore form data if needed
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const handleSubmitPassage = async (data: PassageFormData) => {
    try {
      const request = {
        title: data.title,
        instruction: data.instruction,
        content: data.content,
        content_with_highlight_keywords: data.content_with_highlight_keywords,
        ielts_type: Object.values(IeltsType).indexOf(data.ielts_type),
        part_number: data.part_number,
        passage_status: Object.values(PassageStatus).indexOf(data.passage_status),
      };

      const response = await createPassage(request);
      if (response.data?.passage_id) {
        setCreatedpassage_id(response.data.passage_id);
        setCurrentTab('questions');
      }
    } catch (error) {}
  };

  const handleAddQuestionGroup = (groupData: any) => {
    setQuestionGroups((prev) => [...prev, groupData]);
  };

  const handleSaveQuestionGroup = async (groupData: any) => {
    if (!createdpassage_id) return;

    try {
      await addGroupQuestion(createdpassage_id, groupData);
      // Group saved successfully
    } catch (error) {}
  };

  const handleFinish = () => {
    onSuccess();
    handleClose();
  };

  const handleClose = () => {
    form.reset();
    setCurrentTab('passage');
    setCreatedpassage_id(null);
    setQuestionGroups([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='max-w-6xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Create New Reading Passage</DialogTitle>
        </DialogHeader>

        <Tabs value={currentTab} onValueChange={setCurrentTab} className='w-full'>
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger value='passage'>Passage Information</TabsTrigger>
            <TabsTrigger value='questions' disabled={!createdpassage_id}>
              Question Groups
            </TabsTrigger>
          </TabsList>

          <TabsContent value='passage' className='space-y-6'>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmitPassage)} className='space-y-6'>
                <div className='grid grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='title'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder='Enter passage title' {...field} />
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
                        <FormLabel>IELTS Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select IELTS type' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={IeltsType.ACADEMIC}>Academic</SelectItem>
                            <SelectItem value={IeltsType.GENERAL_TRAINING}>
                              General Training
                            </SelectItem>
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
                        <FormLabel>Part Number</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(Number(value))}
                          defaultValue={field.value?.toString()}
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
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='passage_status'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select status' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={PassageStatus.DRAFT}>Draft</SelectItem>
                            <SelectItem value={PassageStatus.PUBLISHED}>Published</SelectItem>
                            <SelectItem value={PassageStatus.DEACTIVATED}>Deactivated</SelectItem>
                            <SelectItem value={PassageStatus.FINISHED}>Finished</SelectItem>
                            <SelectItem value={PassageStatus.TEST}>Test</SelectItem>
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
                        <Textarea
                          placeholder='Enter reading instruction'
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
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <TiptapEditor
                          content={field.value}
                          onChange={field.onChange}
                          placeholder='Enter the reading passage content'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='content_with_highlight_keywords'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content with Highlighted Keywords</FormLabel>
                      <FormControl>
                        <TiptapEditor
                          content={field.value}
                          onChange={field.onChange}
                          placeholder='Enter the content with highlighted keywords for answer explanations'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className='flex justify-end'>
                  <Button type='submit' disabled={isLoading.createPassage}>
                    {isLoading.createPassage ? 'Creating...' : 'Create Passage & Continue'}
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value='questions' className='space-y-6'>
            {createdpassage_id && (
              <GroupQuestionForm
                passage_id={createdpassage_id}
                onAddGroup={handleAddQuestionGroup}
                onSaveGroup={handleSaveQuestionGroup}
                onFinish={handleFinish}
              />
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
