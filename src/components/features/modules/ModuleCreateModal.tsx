'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { Textarea } from '@/components/ui/textarea';
import { useModules } from '@/hooks/apis/modules/useModules';
import { useVocabulary } from '@/hooks/apis/vocabulary/useVocabulary';
import { VocabularyResponse } from '@/lib/api/vocabulary';
import { zodResolver } from '@hookform/resolvers/zod';
import { BookOpen, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
  module_name: z
    .string()
    .min(1, 'Module name is required')
    .max(100, 'Module name must be less than 100 characters'),
  module_description: z
    .string()
    .min(1, 'Description is required')
    .max(500, 'Description must be less than 500 characters'),
  vocabulary_ids: z.array(z.string()).min(1, 'At least one vocabulary must be selected'),
  is_public: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface ModuleCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ModuleCreateModal({ isOpen, onClose, onSuccess }: ModuleCreateModalProps) {
  const { createModule, isLoading } = useModules();
  const { getMyVocabulary } = useVocabulary();
  const [vocabularies, setVocabularies] = useState<VocabularyResponse[]>([]);
  const [selectedVocabIds, setSelectedVocabIds] = useState<string[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      module_name: '',
      module_description: '',
      vocabulary_ids: [],
      is_public: true,
    },
  });

  // Fetch vocabularies when modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchVocabularies = async () => {
        const response = await getMyVocabulary({
          page: 1,
          size: 100,
          sortBy: 'createdAt',
          sortDirection: 'desc',
        });

        if (response) {
          setVocabularies(response.data);
        }
      };
      fetchVocabularies();
    }
  }, [isOpen]);

  const onSubmit = async (values: FormValues) => {
    const result = await createModule({
      ...values,
      vocabulary_ids: selectedVocabIds,
    });
    if (result) {
      form.reset();
      setSelectedVocabIds([]);
      onClose();
      onSuccess?.();
    }
  };

  const handleVocabToggle = (vocabId: string) => {
    setSelectedVocabIds((prev) =>
      prev.includes(vocabId) ? prev.filter((id) => id !== vocabId) : [...prev, vocabId]
    );
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      form.reset();
      setSelectedVocabIds([]);
    }
  }, [isOpen, form]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='bg-white/60 backdrop-blur-lg border border-tekhelet-200 rounded-2xl shadow-xl max-w-2xl max-h-[80vh] overflow-y-auto'>
        <DialogHeader>
          <div className='flex items-center justify-between'>
            <DialogTitle className='text-xl font-semibold text-tekhelet-400'>
              Create New Module
            </DialogTitle>
            <Button
              variant='ghost'
              size='icon'
              onClick={onClose}
              className='h-6 w-6 text-medium-slate-blue-500 hover:text-tekhelet-400'
            >
              <X className='h-4 w-4' />
            </Button>
          </div>
          <DialogDescription className='text-medium-slate-blue-500'>
            Create a new learning module with your vocabulary
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <FormField
              control={form.control}
              name='module_name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-tekhelet-400 font-medium'>Module Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Enter module name'
                      {...field}
                      className='bg-white/80 border-tekhelet-200 focus:border-tekhelet-400'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='module_description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-tekhelet-400 font-medium'>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Enter module description'
                      {...field}
                      rows={3}
                      className='bg-white/80 border-tekhelet-200 focus:border-tekhelet-400 resize-none'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='is_public'
              render={({ field }) => (
                <FormItem className='flex flex-row items-start space-x-3 space-y-0'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className='border-tekhelet-200'
                    />
                  </FormControl>
                  <div className='space-y-1 leading-none'>
                    <FormLabel className='text-tekhelet-400 font-medium'>
                      Make this module public
                    </FormLabel>
                    <p className='text-sm text-medium-slate-blue-500'>
                      Other users can view and use this module
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <div className='space-y-3'>
              <FormLabel className='text-tekhelet-400 font-medium'>
                Select Vocabulary ({selectedVocabIds.length} selected)
              </FormLabel>
              <div className='max-h-60 overflow-y-auto space-y-2 border border-tekhelet-200 rounded-lg p-3 bg-white/80'>
                {vocabularies.length === 0 ? (
                  <p className='text-medium-slate-blue-500 text-center py-4'>
                    No vocabulary found. Create some vocabulary first.
                  </p>
                ) : (
                  vocabularies.map((vocab) => (
                    <div
                      key={vocab.vocabulary_id}
                      className={`flex items-center space-x-3 p-2 rounded-md cursor-pointer transition-colors ${
                        selectedVocabIds.includes(vocab.vocabulary_id)
                          ? 'bg-tekhelet-100 border border-tekhelet-300'
                          : 'hover:bg-tekhelet-50 border border-transparent'
                      }`}
                      onClick={() => handleVocabToggle(vocab.vocabulary_id)}
                    >
                      <Checkbox
                        checked={selectedVocabIds.includes(vocab.vocabulary_id)}
                        className='border-tekhelet-200'
                      />
                      <div className='flex-1 min-w-0'>
                        <p className='font-medium text-tekhelet-400 truncate'>{vocab.word}</p>
                        <p className='text-sm text-medium-slate-blue-500 truncate'>
                          {vocab.meaning}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {selectedVocabIds.length === 0 && (
                <p className='text-sm text-red-500'>Please select at least one vocabulary</p>
              )}
            </div>

            <DialogFooter className='pt-4'>
              <Button
                type='button'
                variant='outline'
                onClick={onClose}
                className='border-tekhelet-200 text-tekhelet-400 hover:bg-tekhelet-50'
              >
                Cancel
              </Button>
              <Button
                type='submit'
                disabled={isLoading.createModule || selectedVocabIds.length === 0}
                className='bg-tekhelet-400 hover:bg-tekhelet-500 text-white'
              >
                {isLoading.createModule ? (
                  <>
                    <LoadingSpinner color='white' />
                    <span className='ml-2'>Creating...</span>
                  </>
                ) : (
                  <>
                    <BookOpen className='h-4 w-4 mr-2' />
                    Create Module
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
