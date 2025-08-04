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
      <DialogContent className='bg-white/90 backdrop-blur-xl border border-[#60a3d9]/30 rounded-3xl shadow-2xl max-w-3xl max-h-[85vh] overflow-y-auto ring-1 ring-[#60a3d9]/20'>
        <DialogHeader>
          <div className='flex items-center justify-between'>
            <DialogTitle className='text-2xl font-bold text-[#003b73]'>
              Create New Module
            </DialogTitle>
            <Button
              variant='ghost'
              size='icon'
              onClick={onClose}
              className='h-8 w-8 text-[#0074b7] hover:text-[#003b73] hover:bg-[#60a3d9]/10 rounded-full transition-all duration-200'
            >
              <X className='h-5 w-5' />
            </Button>
          </div>
          <DialogDescription className='text-[#0074b7] text-base font-medium'>
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
                  <FormLabel className='text-[#003b73] font-semibold text-base'>
                    Module Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Enter module name'
                      {...field}
                      className='bg-white/90 rounded-xl'
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
                  <FormLabel className='text-[#003b73] font-semibold text-base'>
                    Description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Enter module description'
                      {...field}
                      rows={4}
                      className='bg-white/90 border-[#60a3d9]/40 focus:border-[#0074b7] focus:ring-2 focus:ring-[#60a3d9]/20 text-[#003b73] placeholder:text-[#60a3d9] transition-all duration-200 rounded-xl resize-none'
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
                <FormItem className='flex flex-row items-start space-x-3 space-y-0 p-4 bg-gradient-to-r from-[#bfd7ed]/20 to-[#60a3d9]/10 border border-[#60a3d9]/20 rounded-2xl'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className='border-[#60a3d9]/40 data-[state=checked]:bg-[#0074b7] data-[state=checked]:border-[#0074b7]'
                    />
                  </FormControl>
                  <div className='space-y-1 leading-none'>
                    <FormLabel className='text-[#003b73] font-semibold'>
                      Make this module public
                    </FormLabel>
                    <p className='text-sm text-[#0074b7] font-medium'>
                      Other users can view and use this module
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <div className='space-y-4'>
              <FormLabel className='text-[#003b73] font-semibold text-base'>
                Select Vocabulary ({selectedVocabIds.length} selected)
              </FormLabel>
              <div className='max-h-72 overflow-y-auto space-y-3 border border-[#60a3d9]/30 rounded-2xl p-4 bg-white/90 backdrop-blur-sm shadow-inner'>
                {vocabularies.length === 0 ? (
                  <p className='text-[#0074b7] text-center py-8 font-medium'>
                    No vocabulary found. Create some vocabulary first.
                  </p>
                ) : (
                  vocabularies.map((vocab) => (
                    <div
                      key={vocab.vocabulary_id}
                      className={`flex items-center space-x-4 p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                        selectedVocabIds.includes(vocab.vocabulary_id)
                          ? 'bg-gradient-to-r from-[#60a3d9]/20 to-[#0074b7]/10 border border-[#0074b7]/40 shadow-md'
                          : 'hover:bg-[#bfd7ed]/20 border border-transparent hover:border-[#60a3d9]/30'
                      }`}
                      onClick={() => handleVocabToggle(vocab.vocabulary_id)}
                    >
                      <Checkbox
                        checked={selectedVocabIds.includes(vocab.vocabulary_id)}
                        className='border-[#60a3d9]/40 data-[state=checked]:bg-[#0074b7] data-[state=checked]:border-[#0074b7]'
                      />
                      <div className='flex-1 min-w-0'>
                        <p className='font-semibold text-[#003b73] truncate text-base'>
                          {vocab.word}
                        </p>
                        <p className='text-sm text-[#0074b7] truncate font-medium mt-1'>
                          {vocab.meaning}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {selectedVocabIds.length === 0 && (
                <p className='text-sm text-red-500 font-medium'>
                  Please select at least one vocabulary
                </p>
              )}
            </div>

            <DialogFooter className='pt-6 gap-3'>
              <Button
                type='button'
                variant='outline'
                onClick={onClose}
                className='border-[#60a3d9]/40 text-[#0074b7] hover:bg-[#60a3d9]/10 hover:border-[#0074b7] rounded-xl px-6 py-3 font-medium transition-all duration-200'
              >
                Cancel
              </Button>
              <Button
                type='submit'
                disabled={isLoading.createModule || selectedVocabIds.length === 0}
                className='bg-gradient-to-r from-[#0074b7] to-[#60a3d9] hover:from-[#003b73] hover:to-[#0074b7] text-white rounded-xl px-6 py-3 font-medium shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {isLoading.createModule ? (
                  <>
                    <LoadingSpinner color='white' />
                    <span className='ml-2'>Creating...</span>
                  </>
                ) : (
                  <>
                    <BookOpen className='h-5 w-5 mr-2' />
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
