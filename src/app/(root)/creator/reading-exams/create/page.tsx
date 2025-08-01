'use client';

import { PassageSelectionTable } from '@/components/features/reading-exams/PassageSelectionTable';
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
import { Textarea } from '@/components/ui/textarea';
import { useReadingExam } from '@/hooks/apis/admin/useReadingExam';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

// Form validation schema
const formSchema = z.object({
  reading_exam_name: z.string().min(3, 'Exam name must be at least 3 characters'),
  reading_exam_description: z.string().min(10, 'Description must be at least 10 characters'),
  url_slug: z
    .string()
    .min(3, 'URL slug must be at least 3 characters')
    .regex(/^[a-z0-9-]+$/, 'URL slug can only contain lowercase letters, numbers, and hyphens'),
  reading_passage_id_part1: z.string().min(1, 'Reading passage for part 1 is required'),
  reading_passage_id_part2: z.string().min(1, 'Reading passage for part 2 is required'),
  reading_passage_id_part3: z.string().min(1, 'Reading passage for part 3 is required'),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateReadingExamPage() {
  const router = useRouter();
  const { createExam, isLoading } = useReadingExam();
  const [selectedPassages, setSelectedPassages] = useState({
    part1: '',
    part2: '',
    part3: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reading_exam_name: '',
      reading_exam_description: '',
      url_slug: '',
      reading_passage_id_part1: '',
      reading_passage_id_part2: '',
      reading_passage_id_part3: '',
    },
  });

  // Update form values when selected passages change
  useEffect(() => {
    form.setValue('reading_passage_id_part1', selectedPassages.part1);
    form.setValue('reading_passage_id_part2', selectedPassages.part2);
    form.setValue('reading_passage_id_part3', selectedPassages.part3);
  }, [selectedPassages, form]);

  const handlePassageSelect = (passageId: string, passageTitle: string, partNumber: number) => {
    switch (partNumber) {
      case 1:
        setSelectedPassages((prev) => ({ ...prev, part1: passageId }));
        break;
      case 2:
        setSelectedPassages((prev) => ({ ...prev, part2: passageId }));
        break;
      case 3:
        setSelectedPassages((prev) => ({ ...prev, part3: passageId }));
        break;
      default:
        break;
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitted(true);
      await createExam(values);
      toast.success('Reading exam created successfully');
      router.push('/creator/reading-exams');
    } catch (error) {
      setIsSubmitted(false);
      toast.error('Failed to create reading exam');
    }
  };

  return (
    <div className='container mx-auto p-6'>
      <div className='mb-6'>
        <Button variant='ghost' asChild className='mb-6'>
          <Link href='/creator/reading-exams'>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Back to Reading Exams
          </Link>
        </Button>
        <h1 className='text-3xl font-bold'>Create Reading Exam</h1>
      </div>

      <div className='space-y-6'>
        <Card>
          <CardHeader>
            <CardTitle>New Reading Exam</CardTitle>
            <CardDescription>
              Create a new IELTS reading exam with three reading passages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                <FormField
                  control={form.control}
                  name='reading_exam_name'
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
                  name='reading_exam_description'
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
                    <FormItem>
                      <FormLabel>URL Slug</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='example-exam-title'
                          {...field}
                          onChange={(e) => {
                            // Convert to lowercase and replace spaces with hyphens
                            const value = e.target.value
                              .toLowerCase()
                              .replace(/\s+/g, '-')
                              .replace(/[^a-z0-9-]/g, '');
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <FormField
                    control={form.control}
                    name='reading_passage_id_part1'
                    render={() => (
                      <FormItem>
                        <FormLabel>Reading Passage (Part 1)</FormLabel>
                        <FormControl>
                          <div className='p-2 border rounded-md'>
                            {selectedPassages.part1 ? (
                              <div className='text-sm font-medium'>
                                Selected passage ID: {selectedPassages.part1}
                              </div>
                            ) : (
                              <div className='text-sm text-muted-foreground'>
                                No passage selected
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='reading_passage_id_part2'
                    render={() => (
                      <FormItem>
                        <FormLabel>Reading Passage (Part 2)</FormLabel>
                        <FormControl>
                          <div className='p-2 border rounded-md'>
                            {selectedPassages.part2 ? (
                              <div className='text-sm font-medium'>
                                Selected passage ID: {selectedPassages.part2}
                              </div>
                            ) : (
                              <div className='text-sm text-muted-foreground'>
                                No passage selected
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='reading_passage_id_part3'
                    render={() => (
                      <FormItem>
                        <FormLabel>Reading Passage (Part 3)</FormLabel>
                        <FormControl>
                          <div className='p-2 border rounded-md'>
                            {selectedPassages.part3 ? (
                              <div className='text-sm font-medium'>
                                Selected passage ID: {selectedPassages.part3}
                              </div>
                            ) : (
                              <div className='text-sm text-muted-foreground'>
                                No passage selected
                              </div>
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
                        !selectedPassages.part1 ||
                        !selectedPassages.part2 ||
                        !selectedPassages.part3
                      }
                    >
                      {isLoading['createExam'] ? (
                        <>
                          <LoadingSpinner color='white' />
                          <span className='ml-2'>Creating...</span>
                        </>
                      ) : (
                        'Create Reading Exam'
                      )}
                    </Button>
                  </CardFooter>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>

        <PassageSelectionTable onSelect={handlePassageSelect} selectedPassages={selectedPassages} />
      </div>
    </div>
  );
}
