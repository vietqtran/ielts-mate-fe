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
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
  word: z.string().min(1, 'Word is required').max(100, 'Word must be less than 100 characters'),
  context: z
    .string()
    .min(1, 'Context is required')
    .max(500, 'Context must be less than 500 characters'),
  meaning: z.string().max(300, 'Meaning must be less than 300 characters').optional().nullable(),
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
    // Convert empty string to null for meaning
    const requestData = {
      ...values,
      meaning: values.meaning?.trim() || null,
    };

    const result = await createVocabulary(requestData);
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
      <DialogContent className='border rounded-3xl max-w-md'>
        <DialogHeader>
          <DialogTitle className='text-xl font-semibold text-tekhelet-400'>
            Add New Vocabulary
          </DialogTitle>
          <DialogDescription className='text-muted-foreground text-sm font-medium'>
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
                  <FormLabel className='text-tekhelet-400 font-semibold text-sm'>Word</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter the word' {...field} />
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
                  <FormLabel className='text-selective-yellow-200 font-semibold text-sm'>
                    Meaning (optional)
                  </FormLabel>
                  <FormControl>
                    <Input placeholder='Enter the meaning' {...field} value={field.value || ''} />
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
                  <FormLabel className='text-selective-yellow-200 font-semibold text-sm'>
                    Context
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Enter the context or example sentence'
                      {...field}
                      rows={3}
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
                className='text-tekhelet-500 hover:text-tekhelet-600'
              >
                Cancel
              </Button>
              <Button
                type='submit'
                disabled={isLoading.createVocabulary}
                className='bg-tekhelet-500 hover:bg-tekhelet-600 text-white'
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
