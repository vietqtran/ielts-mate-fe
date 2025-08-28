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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SlugInput } from '@/components/ui/slug-input';
import { Textarea } from '@/components/ui/textarea';
import { createRequiredStringValidation } from '@/constants/validate';
import { useReadingExam } from '@/hooks/apis/admin/useReadingExam';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Status } from '@/types/reading/reading-exam.types';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

// Form validation schema
const readingExamSchema = z.object({
  reading_exam_name: createRequiredStringValidation('Exam name', 3),
  reading_exam_description: createRequiredStringValidation('Description', 10),
  url_slug: createRequiredStringValidation('URL slug', 3),
  reading_passage_id_part1: createRequiredStringValidation('Reading passage for part 1', 1),
  reading_passage_id_part2: createRequiredStringValidation('Reading passage for part 2', 1),
  reading_passage_id_part3: createRequiredStringValidation('Reading passage for part 3', 1),
  status: z.number().min(0).max(1),
});

type FormValues = z.infer<typeof readingExamSchema>;

export default function EditReadingExamPage() {
  usePageTitle('Edit Reading Exam');

  const router = useRouter();
  const params = useParams();
  const examId = params.id as string;

  const { getExamById, updateExam, generateSlug, checkSlug, isLoading } = useReadingExam();
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [selectedPassages, setSelectedPassages] = useState({
    part1: '',
    part2: '',
    part3: '',
  });

  // Memoize the checkSlug function to prevent infinite re-renders
  const memoizedCheckSlug = useCallback(
    async (slug: string) => {
      return await checkSlug(slug);
    },
    [checkSlug]
  );

  const [passageTitles, setPassageTitles] = useState({
    part1: '',
    part2: '',
    part3: '',
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(readingExamSchema),
    defaultValues: {
      reading_exam_name: '',
      reading_exam_description: '',
      url_slug: '',
      reading_passage_id_part1: '',
      reading_passage_id_part2: '',
      reading_passage_id_part3: '',
      status: Status.ACTIVE,
    },
  });

  // Load exam data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch exam data
        const examResponse = await getExamById(examId);
        if (examResponse && examResponse.data) {
          const examData = examResponse.data;

          // Set form values
          form.reset({
            reading_exam_name: examData.reading_exam_name,
            reading_exam_description: examData.reading_exam_description,
            url_slug: examData.url_slug,
            reading_passage_id_part1: examData.reading_passage_id_part1.reading_passage_id,
            reading_passage_id_part2: examData.reading_passage_id_part2.reading_passage_id,
            reading_passage_id_part3: examData.reading_passage_id_part3.reading_passage_id,
            status: examData.status,
          });

          // Set selected passages
          setSelectedPassages({
            part1: examData.reading_passage_id_part1.reading_passage_id,
            part2: examData.reading_passage_id_part2.reading_passage_id,
            part3: examData.reading_passage_id_part3.reading_passage_id,
          });

          // Set passage titles if available in the API response
          setPassageTitles({
            part1: examData.reading_passage_id_part1.reading_passage_name || '',
            part2: examData.reading_passage_id_part2.reading_passage_name || '',
            part3: examData.reading_passage_id_part3.reading_passage_name || '',
          });
        }

        setIsPageLoading(false);
      } catch (error) {
        toast.error('Failed to load exam data');
        setIsPageLoading(false);
      }
    };

    fetchData();
  }, [examId, form]);

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
        setPassageTitles((prev) => ({ ...prev, part1: passageTitle }));
        break;
      case 2:
        setSelectedPassages((prev) => ({ ...prev, part2: passageId }));
        setPassageTitles((prev) => ({ ...prev, part2: passageTitle }));
        break;
      case 3:
        setSelectedPassages((prev) => ({ ...prev, part3: passageId }));
        setPassageTitles((prev) => ({ ...prev, part3: passageTitle }));
        break;
      default:
        break;
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      await updateExam(examId, values);
      toast.success('Reading exam updated successfully');
      router.push('/creator/reading-exams');
    } catch (error) {
      toast.error('Failed to update reading exam');
    }
  };

  if (isPageLoading) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <LoadingSpinner color='black' />
      </div>
    );
  }

  return (
    <div className='container mx-auto p-6'>
      <div className='mb-6'>
        <Button variant='ghost' asChild className='mb-6'>
          <Link href='/creator/reading-exams'>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Back to Reading Exams
          </Link>
        </Button>
        <h1 className='text-3xl font-bold'>Edit Reading Exam</h1>
      </div>

      <div className='space-y-6'>
        <Card>
          <CardHeader>
            <CardTitle>Edit Reading Exam</CardTitle>
            <CardDescription>Update the details of this IELTS reading exam</CardDescription>
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
                    <SlugInput
                      value={field.value}
                      onChange={field.onChange}
                      onGenerateSlug={async () => {
                        const examName = form.getValues('reading_exam_name');
                        return await generateSlug(examName);
                      }}
                      onCheckSlug={memoizedCheckSlug}
                      examName={form.watch('reading_exam_name')}
                      skipValidation={true}
                    />
                  )}
                />

                <FormField
                  control={form.control}
                  name='status'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select status' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={Status.ACTIVE.toString()}>Active</SelectItem>
                          <SelectItem value={Status.INACTIVE.toString()}>Inactive</SelectItem>
                        </SelectContent>
                      </Select>
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
                                <div>{passageTitles.part1}</div>
                                <div className='text-xs text-muted-foreground mt-1'>
                                  ID: {selectedPassages.part1}
                                </div>
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
                                <div>{passageTitles.part2}</div>
                                <div className='text-xs text-muted-foreground mt-1'>
                                  ID: {selectedPassages.part2}
                                </div>
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
                                <div>{passageTitles.part3}</div>
                                <div className='text-xs text-muted-foreground mt-1'>
                                  ID: {selectedPassages.part3}
                                </div>
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

                <CardFooter className='flex justify-end px-0 pt-4'>
                  <Button
                    type='submit'
                    disabled={
                      isLoading['updateExam'] ||
                      !selectedPassages.part1 ||
                      !selectedPassages.part2 ||
                      !selectedPassages.part3
                    }
                  >
                    {isLoading['updateExam'] ? (
                      <>
                        <LoadingSpinner color='white' />
                        <span className='ml-2'>Updating...</span>
                      </>
                    ) : (
                      'Update Reading Exam'
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </CardContent>
        </Card>

        <PassageSelectionTable onSelect={handlePassageSelect} selectedPassages={selectedPassages} />
      </div>
    </div>
  );
}
