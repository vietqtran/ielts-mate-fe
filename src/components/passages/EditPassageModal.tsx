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
import { CURRENT_PAGE_SESSION_STORAGE_KEY, PAGES } from '@/constants/pages';
import { PassageGetResponse, ielts_type, passage_status } from '@/types/reading.types';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { TiptapEditor } from '@/components/ui/tiptap-editor';
import { usePassage } from '@/hooks/usePassage';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

const passageSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  instruction: z.string().min(1, 'Instruction is required'),
  content: z.string().min(1, 'Content is required'),
  contentWithHighlightKeywords: z.string().min(1, 'Content with highlights is required'),
  ielts_type: z.nativeEnum(ielts_type),
  part_number: z.number().min(1).max(3),
  passage_status: z.nativeEnum(passage_status),
});

type PassageFormData = z.infer<typeof passageSchema>;

interface EditPassageModalProps {
  passage: PassageGetResponse;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const getielts_typeFromNumber = (type: number): ielts_type => {
  switch (type) {
    case 0:
      return ielts_type.ACADEMIC;
    case 1:
      return ielts_type.GENERAL_TRAINING;
    default:
      return ielts_type.ACADEMIC;
  }
};

const getpassage_statusFromNumber = (status: number): passage_status => {
  switch (status) {
    case 0:
      return passage_status.DRAFT;
    case 1:
      return passage_status.PUBLISHED;
    case 2:
      return passage_status.DEACTIVATED;
    case 3:
      return passage_status.FINISHED;
    case 4:
      return passage_status.TEST;
    default:
      return passage_status.DRAFT;
  }
};

export function EditPassageModal({ passage, isOpen, onClose, onSuccess }: EditPassageModalProps) {
  const { updatePassage, isLoading } = usePassage();

  const form = useForm<PassageFormData>({
    resolver: zodResolver(passageSchema),
    defaultValues: {
      title: passage.title,
      instruction: passage.instruction,
      content: passage.content,
      contentWithHighlightKeywords: passage.contentWithHighlightKeywords,
      ielts_type: getielts_typeFromNumber(passage.ielts_type),
      part_number: passage.part_number,
      passage_status: getpassage_statusFromNumber(passage.passage_status),
    },
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(CURRENT_PAGE_SESSION_STORAGE_KEY, PAGES.PASSAGES.EDIT);
    }
  }, []);

  // Reset form when passage changes
  useEffect(() => {
    if (passage) {
      form.reset({
        title: passage.title,
        instruction: passage.instruction,
        content: passage.content,
        contentWithHighlightKeywords: passage.contentWithHighlightKeywords,
        ielts_type: getielts_typeFromNumber(passage.ielts_type),
        part_number: passage.part_number,
        passage_status: getpassage_statusFromNumber(passage.passage_status),
      });
    }
  }, [passage, form]);

  // Session storage persistence logic
  useEffect(() => {
    const handleBeforeUnload = () => {
      // You can implement form data persistence here if needed
    };

    if (typeof window !== 'undefined') {
      const currentPage = sessionStorage.getItem(CURRENT_PAGE_SESSION_STORAGE_KEY);
      if (currentPage === PAGES.PASSAGES.EDIT) {
        // Restore form data if needed
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const handleSubmit = async (data: PassageFormData) => {
    try {
      const request = {
        title: data.title,
        instruction: data.instruction,
        content: data.content,
        content_with_highlight_keywords: data.contentWithHighlightKeywords,
        ielts_type: Object.values(ielts_type).indexOf(data.ielts_type),
        part_number: data.part_number,
        passage_status: Object.values(passage_status).indexOf(data.passage_status),
      };

      await updatePassage(passage.passage_id, request);
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Failed to update passage:', error);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Edit Reading Passage</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select IELTS type' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={ielts_type.ACADEMIC}>Academic</SelectItem>
                        <SelectItem value={ielts_type.GENERAL_TRAINING}>
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
                      value={field.value?.toString()}
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select status' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={passage_status.DRAFT}>Draft</SelectItem>
                        <SelectItem value={passage_status.PUBLISHED}>Published</SelectItem>
                        <SelectItem value={passage_status.TEST}>Test</SelectItem>
                        <SelectItem value={passage_status.DEACTIVATED}>Deactivated</SelectItem>
                        <SelectItem value={passage_status.FINISHED}>Finished</SelectItem>
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
              name='contentWithHighlightKeywords'
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

            <div className='flex justify-end gap-2'>
              <Button type='button' variant='outline' onClick={handleClose}>
                Cancel
              </Button>
              <Button type='submit' disabled={isLoading.updatePassage}>
                {isLoading.updatePassage ? 'Updating...' : 'Update Passage'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
