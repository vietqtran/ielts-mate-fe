'use client';

import { Button } from '@/components/ui/button';
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
import { useVocabulary } from '@/hooks/apis/vocabulary/useVocabulary';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
  word: z.string().min(1, 'Word is required').max(100, 'Word must be less than 100 characters'),
  context: z
    .string()
    .min(1, 'Context is required')
    .max(500, 'Context must be less than 500 characters'),
  meaning: z
    .string()
    .min(1, 'Meaning is required')
    .max(300, 'Meaning must be less than 300 characters'),
});

type FormValues = z.infer<typeof formSchema>;

interface VocabularyCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function VocabularyCreateModal({
  isOpen,
  onClose,
  onSuccess,
}: VocabularyCreateModalProps) {
  const { createVocabulary, isLoading } = useVocabulary();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      word: '',
      context: '',
      meaning: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    const result = await createVocabulary(values);
    if (result) {
      form.reset();
      onClose();
      onSuccess?.();
    }
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      form.reset();
    }
  }, [isOpen, form]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='bg-[#bfd7ed]/80 backdrop-blur-xl border border-[#60a3d9]/30 rounded-3xl shadow-2xl max-w-md ring-1 ring-[#60a3d9]/20'>
        <DialogHeader>
          <div className='flex items-center justify-between'>
            <DialogTitle className='text-xl font-semibold text-[#003b73]'>
              Add New Vocabulary
            </DialogTitle>
            <Button
              variant='ghost'
              size='icon'
              onClick={onClose}
              className='h-8 w-8 text-[#0074b7] hover:text-[#003b73] hover:bg-[#60a3d9]/20 rounded-full transition-all duration-200'
            >
              <X className='h-4 w-4' />
            </Button>
          </div>
          <DialogDescription className='text-[#0074b7] text-sm font-medium'>
            Add a new word to your personal vocabulary collection
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <FormField
              control={form.control}
              name='word'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-[#003b73] font-semibold text-sm'>Word</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Enter the word'
                      {...field}
                      className='bg-white/90 border-[#60a3d9]/40 focus:border-[#0074b7] focus:ring-2 focus:ring-[#60a3d9]/20 rounded-xl h-11 text-[#003b73] placeholder:text-[#60a3d9] transition-all duration-200'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='meaning'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-[#003b73] font-semibold text-sm'>Meaning</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Enter the meaning'
                      {...field}
                      className='bg-white/90 border-[#60a3d9]/40 focus:border-[#0074b7] focus:ring-2 focus:ring-[#60a3d9]/20 rounded-xl h-11 text-[#003b73] placeholder:text-[#60a3d9] transition-all duration-200'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='context'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-[#003b73] font-semibold text-sm'>Context</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Enter the context or example sentence'
                      {...field}
                      rows={3}
                      className='bg-white/90 border-[#60a3d9]/40 focus:border-[#0074b7] focus:ring-2 focus:ring-[#60a3d9]/20 rounded-xl resize-none text-[#003b73] placeholder:text-[#60a3d9] transition-all duration-200'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className='pt-6 gap-3'>
              <Button
                type='button'
                variant='outline'
                onClick={onClose}
                className='border-[#60a3d9]/40 text-[#0074b7] hover:bg-[#60a3d9]/10 hover:border-[#0074b7] rounded-xl px-6 py-2.5 font-medium transition-all duration-200'
              >
                Cancel
              </Button>
              <Button
                type='submit'
                disabled={isLoading.createVocabulary}
                className='bg-gradient-to-r from-[#0074b7] to-[#60a3d9] hover:from-[#003b73] hover:to-[#0074b7] text-white rounded-xl px-6 py-2.5 font-medium shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {isLoading.createVocabulary ? (
                  <>
                    <LoadingSpinner color='white' />
                    <span className='ml-2'>Adding...</span>
                  </>
                ) : (
                  'Add Vocabulary'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
