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
      <DialogContent className='bg-white/60 backdrop-blur-lg border border-tekhelet-200 rounded-2xl shadow-xl max-w-md'>
        <DialogHeader>
          <div className='flex items-center justify-between'>
            <DialogTitle className='text-xl font-semibold text-tekhelet-400'>
              Add New Vocabulary
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
            Add a new word to your personal vocabulary collection
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='word'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-tekhelet-400 font-medium'>Word</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Enter the word'
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
              name='meaning'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-tekhelet-400 font-medium'>Meaning</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Enter the meaning'
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
              name='context'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-tekhelet-400 font-medium'>Context</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Enter the context or example sentence'
                      {...field}
                      rows={3}
                      className='bg-white/80 border-tekhelet-200 focus:border-tekhelet-400 resize-none'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                disabled={isLoading.createVocabulary}
                className='bg-tekhelet-400 hover:bg-tekhelet-500 text-white'
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
