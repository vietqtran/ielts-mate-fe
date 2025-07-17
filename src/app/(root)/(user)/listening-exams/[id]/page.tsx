'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useListeningExam } from '@/hooks/useListeningExam';
import { ArrowLeft, Headphones, PlayCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ListeningExamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isLoading, error, exam, fetchExamById } = useListeningExam();
  const examId = params.id as string;

  useEffect(() => {
    if (examId) {
      fetchExamById(examId);
    }
  }, [examId, fetchExamById]);

  const handleStartExam = () => {
    // Navigate to the exam taking page
    router.push(`/listening-exams/${examId}/take`);
  };

  // Group tasks by part number
  const groupedTasks =
    exam?.tasks?.reduce(
      (acc, task) => {
        const partNumber = task.partNumber || 0;
        if (!acc[partNumber]) {
          acc[partNumber] = [];
        }
        acc[partNumber].push(task);
        return acc;
      },
      {} as Record<number, any[]>
    ) || {};

  return (
    <div className='container mx-auto p-6'>
      <div className='mb-6'>
        <Button variant='ghost' asChild className='pl-0 mb-4'>
          <Link href='/listening-exams'>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Back to Listening Exams
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className='flex justify-center py-16'>
          <LoadingSpinner />
        </div>
      ) : error ? (
        <Card>
          <CardContent className='pt-6'>
            <div className='text-center py-8'>
              <p className='text-red-500'>Failed to load listening exam details.</p>
              <Button variant='outline' className='mt-4' onClick={() => fetchExamById(examId)}>
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : exam ? (
        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <div className='flex justify-between items-start'>
                <div>
                  <CardTitle className='text-2xl'>{exam.title || 'Listening Exam'}</CardTitle>
                  <CardDescription className='mt-2'>
                    {exam.description || 'Complete this IELTS listening exam to test your skills'}
                  </CardDescription>
                </div>
                <Button onClick={handleStartExam}>
                  <PlayCircle className='mr-2 h-4 w-4' />
                  Start Exam
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className='mb-4'>
                <h3 className='text-lg font-medium mb-2'>Exam Overview</h3>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
                  <div className='flex items-center space-x-2'>
                    <Headphones className='h-5 w-5 text-muted-foreground' />
                    <span>4 parts, approximately 30 minutes</span>
                  </div>
                </div>
              </div>

              <Tabs defaultValue='overview'>
                <TabsList>
                  <TabsTrigger value='overview'>Exam Structure</TabsTrigger>
                  <TabsTrigger value='instructions'>Instructions</TabsTrigger>
                </TabsList>
                <TabsContent value='overview' className='space-y-4 mt-4'>
                  {Object.entries(groupedTasks).length > 0 ? (
                    Object.entries(groupedTasks).map(([partNumber, tasks]) => (
                      <Card key={partNumber}>
                        <CardHeader className='py-3'>
                          <CardTitle className='text-md'>Part {Number(partNumber) + 1}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className='space-y-2'>
                            {tasks.map((task) => (
                              <div key={task.id} className='flex items-center space-x-2'>
                                <Badge variant='outline' className='px-2 py-1'>
                                  {task.questions?.length || 0} questions
                                </Badge>
                                <span>{task.title || `Listening Task ${task.id}`}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className='text-center py-4'>
                      <p className='text-muted-foreground'>
                        No listening tasks found in this exam.
                      </p>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value='instructions' className='space-y-4 mt-4'>
                  <div className='prose max-w-none dark:prose-invert'>
                    <h3>Instructions</h3>
                    <ul className='list-disc pl-6 space-y-2'>
                      <li>
                        You will hear several audio recordings and answer questions based on what
                        you hear.
                      </li>
                      <li>
                        For each part, you will have time to look at the questions before the
                        recording begins.
                      </li>
                      <li>Each recording will be played once only.</li>
                      <li>Answer all questions. There are 40 questions in total.</li>
                      <li>Write your answers on the answer sheet during the test.</li>
                      <li>
                        At the end of the test, you will have 10 minutes to transfer your answers to
                        the answer sheet.
                      </li>
                    </ul>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className='pt-6'>
            <div className='text-center py-8'>
              <p className='text-muted-foreground'>Listening exam not found.</p>
              <Button variant='outline' className='mt-4' asChild>
                <Link href='/listening-exams'>Back to Listening Exams</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
