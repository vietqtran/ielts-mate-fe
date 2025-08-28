'use client';
import { TaskSelectionTable } from '@/components/features/listening-exams/TaskSelectionTable';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { SlugInput } from '@/components/ui/slug-input';
import { Textarea } from '@/components/ui/textarea';
import { createRequiredStringValidation } from '@/constants/validate';
import { useListeningExam } from '@/hooks/apis/admin/useListeningExam';
import { usePageTitle } from '@/hooks/usePageTitle';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

// Form validation schema
const formSchema = z
  .object({
    exam_name: createRequiredStringValidation('Exam name', 3),
    exam_description: createRequiredStringValidation('Description', 10),
    url_slug: createRequiredStringValidation('URL slug', 3),
    part1_id: createRequiredStringValidation('Task for part 1', 1),
    part2_id: createRequiredStringValidation('Task for part 2', 1),
    part3_id: createRequiredStringValidation('Task for part 3', 1),
    part4_id: createRequiredStringValidation('Task for part 4', 1),
    status: z.number().min(0).max(1),
  })
  .refine(
    (data) => {
      const partIds = [data.part1_id, data.part2_id, data.part3_id, data.part4_id];
      return new Set(partIds).size === 4;
    },
    {
      message: 'Each part must be a different task',
      path: ['part1_id'], // This will show the error on the first part field
    }
  );

type FormValues = z.infer<typeof formSchema>;

export default function CreateListeningExamPage() {
  usePageTitle('Create Listening Exam');

  const router = useRouter();
  const { createExam, generateSlug, checkSlug, isLoading } = useListeningExam();
  const [selectedTasks, setSelectedTasks] = useState({
    part1: '',
    part2: '',
    part3: '',
    part4: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Memoize the checkSlug function to prevent infinite re-renders
  const memoizedCheckSlug = useCallback(
    async (slug: string) => {
      return await checkSlug(slug);
    },
    [checkSlug]
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      exam_name: '',
      exam_description: '',
      url_slug: '',
      part1_id: '',
      part2_id: '',
      part3_id: '',
      part4_id: '',
      status: 1, // Default to active
    },
  });

  // Update form values when selected tasks change
  useEffect(() => {
    form.setValue('part1_id', selectedTasks.part1);
    form.setValue('part2_id', selectedTasks.part2);
    form.setValue('part3_id', selectedTasks.part3);
    form.setValue('part4_id', selectedTasks.part4);
  }, [selectedTasks, form]);

  const handleTaskSelect = (taskId: string, _taskTitle: string, partNumber: number) => {
    const partKey = `part${partNumber}` as keyof typeof selectedTasks;
    setSelectedTasks((prev) => ({ ...prev, [partKey]: taskId }));
  };

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitted(true);
      await createExam(values);
      toast.success('Listening exam created successfully');
      router.push('/creator/listening-exams');
    } catch (error) {
      setIsSubmitted(false);
      console.log(error);
    }
  };

  return (
    <div className='container mx-auto p-6'>
      <div className='mb-6'>
        <Button variant='ghost' asChild className='mb-6'>
          <Link href='/creator/listening-exams'>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Back to Listening Exams
          </Link>
        </Button>
        <h1 className='text-3xl font-bold'>Create Listening Exam</h1>
      </div>

      <div className='space-y-6'>
        <Card>
          <CardHeader>
            <CardTitle>New Listening Exam</CardTitle>
            <CardDescription>
              Create a new IELTS listening exam with four listening tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                <FormField
                  control={form.control}
                  name='exam_name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exam Name</FormLabel>
                      <FormControl>
                        <Input placeholder='Enter exam name' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='exam_description'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='Enter detailed description of the exam'
                          {...field}
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='url_slug'
                  render={({ field }) => (
                    <SlugInput
                      value={field.value}
                      onChange={field.onChange}
                      onGenerateSlug={async () => {
                        const examName = form.getValues('exam_name');
                        return await generateSlug(examName);
                      }}
                      onCheckSlug={memoizedCheckSlug}
                      examName={form.watch('exam_name')}
                    />
                  )}
                />

                <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                  <FormField
                    control={form.control}
                    name='part1_id'
                    render={() => (
                      <FormItem>
                        <FormLabel>Listening Task (Part 1)</FormLabel>
                        <FormControl>
                          <div className='p-2 border rounded-md'>
                            {selectedTasks.part1 ? (
                              <div className='text-sm font-medium'>
                                Selected task ID: {selectedTasks.part1}
                              </div>
                            ) : (
                              <div className='text-sm text-muted-foreground'>No task selected</div>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='part2_id'
                    render={() => (
                      <FormItem>
                        <FormLabel>Listening Task (Part 2)</FormLabel>
                        <FormControl>
                          <div className='p-2 border rounded-md'>
                            {selectedTasks.part2 ? (
                              <div className='text-sm font-medium'>
                                Selected task ID: {selectedTasks.part2}
                              </div>
                            ) : (
                              <div className='text-sm text-muted-foreground'>No task selected</div>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='part3_id'
                    render={() => (
                      <FormItem>
                        <FormLabel>Listening Task (Part 3)</FormLabel>
                        <FormControl>
                          <div className='p-2 border rounded-md'>
                            {selectedTasks.part3 ? (
                              <div className='text-sm font-medium'>
                                Selected task ID: {selectedTasks.part3}
                              </div>
                            ) : (
                              <div className='text-sm text-muted-foreground'>No task selected</div>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='part4_id'
                    render={() => (
                      <FormItem>
                        <FormLabel>Listening Task (Part 4)</FormLabel>
                        <FormControl>
                          <div className='p-2 border rounded-md'>
                            {selectedTasks.part4 ? (
                              <div className='text-sm font-medium'>
                                Selected task ID: {selectedTasks.part4}
                              </div>
                            ) : (
                              <div className='text-sm text-muted-foreground'>No task selected</div>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {!isSubmitted && (
                  <CardFooter className='flex justify-end px-0 pt-4'>
                    <Button
                      type='submit'
                      disabled={
                        isLoading['createExam'] ||
                        !selectedTasks.part1 ||
                        !selectedTasks.part2 ||
                        !selectedTasks.part3 ||
                        !selectedTasks.part4
                      }
                    >
                      {isLoading['createExam'] ? (
                        <>
                          <LoadingSpinner color='white' />
                          <span className='ml-2'>Creating...</span>
                        </>
                      ) : (
                        'Create Listening Exam'
                      )}
                    </Button>
                  </CardFooter>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>

        <TaskSelectionTable onSelect={handleTaskSelect} selectedTasks={selectedTasks} />
      </div>
    </div>
  );
}
