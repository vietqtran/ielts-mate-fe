'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingSpinner from '@/components/ui/loading-spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useListeningExam } from '@/hooks/useListeningExam';
import { useReadingExam } from '@/hooks/useReadingExam';
import { BookOpen, Eye, Headphones } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type ExamType = 'reading' | 'listening';

interface Exam {
  id: string;
  title: string;
  description?: string;
  type: ExamType;
}

export default function AllExamsPage() {
  const readingExamHook = useReadingExam();
  const listeningExamHook = useListeningExam();

  const [readingExams, setReadingExams] = useState<any[]>([]);
  const [listeningExams, setListeningExams] = useState<any[]>([]);
  const [allExams, setAllExams] = useState<Exam[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');

  const isReadingLoading = readingExamHook.isLoading['getAllExams'];
  const readingError = readingExamHook.error['getAllExams'];
  const isListeningLoading = listeningExamHook.isLoading;
  const listeningError = listeningExamHook.error;

  // Fetch reading exams
  const fetchReadingExams = async () => {
    try {
      const response = await readingExamHook.getAllExams();
      if (response && response.data) {
        setReadingExams(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch reading exams:', error);
    }
  };

  // Fetch listening exams
  const fetchListeningExams = async () => {
    try {
      await listeningExamHook.fetchExams();
      if (listeningExamHook.exams) {
        setListeningExams(listeningExamHook.exams);
      }
    } catch (error) {
      console.error('Failed to fetch listening exams:', error);
    }
  };

  useEffect(() => {
    fetchReadingExams();
    fetchListeningExams();
  }, []);

  useEffect(() => {
    const combinedExams: Exam[] = [];

    // Add reading exams
    if (readingExams && readingExams.length > 0) {
      readingExams.forEach((exam) => {
        combinedExams.push({
          id: exam.id,
          title: exam.title || 'Reading Exam',
          description: exam.description,
          type: 'reading',
        });
      });
    }

    // Add listening exams
    if (listeningExams && listeningExams.length > 0) {
      listeningExams.forEach((exam) => {
        combinedExams.push({
          id: exam.id,
          title: exam.title || 'Listening Exam',
          description: exam.description,
          type: 'listening',
        });
      });
    }

    // Sort by title
    combinedExams.sort((a, b) => a.title.localeCompare(b.title));

    setAllExams(combinedExams);
  }, [readingExams, listeningExams]);

  const filteredExams =
    activeTab === 'all' ? allExams : allExams.filter((exam) => exam.type === activeTab);

  const isLoading = isReadingLoading || isListeningLoading;
  const hasError = readingError || listeningError;

  return (
    <div className='container mx-auto p-6'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-3xl font-bold'>IELTS Exams</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Exams</CardTitle>
          <CardDescription>
            Practice with a variety of IELTS exams to improve your skills
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue='all' className='w-full' onValueChange={setActiveTab}>
            <TabsList className='mb-4'>
              <TabsTrigger value='all'>All Exams</TabsTrigger>
              <TabsTrigger value='reading'>Reading</TabsTrigger>
              <TabsTrigger value='listening'>Listening</TabsTrigger>
            </TabsList>

            {isLoading ? (
              <div className='flex justify-center py-8'>
                <LoadingSpinner />
              </div>
            ) : hasError ? (
              <div className='text-center py-6'>
                <p className='text-red-500'>Failed to load exams. Please try again later.</p>
                <div className='flex gap-2 justify-center mt-4'>
                  <Button variant='outline' onClick={() => fetchReadingExams()}>
                    Retry Reading Exams
                  </Button>
                  <Button variant='outline' onClick={() => fetchListeningExams()}>
                    Retry Listening Exams
                  </Button>
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Exam Type</TableHead>
                    <TableHead>Exam Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExams.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className='text-center py-6'>
                        No exams found. Try selecting a different category.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredExams.map((exam) => (
                      <TableRow key={`${exam.type}-${exam.id}`}>
                        <TableCell>
                          <Badge variant={exam.type === 'reading' ? 'default' : 'secondary'}>
                            {exam.type === 'reading' ? (
                              <>
                                <BookOpen className='h-3 w-3 mr-1' /> Reading
                              </>
                            ) : (
                              <>
                                <Headphones className='h-3 w-3 mr-1' /> Listening
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell className='font-medium'>{exam.title}</TableCell>
                        <TableCell className='max-w-xs truncate'>
                          {exam.description || 'No description available'}
                        </TableCell>
                        <TableCell className='text-right'>
                          <Button variant='outline' size='icon' asChild>
                            <Link
                              href={
                                exam.type === 'reading'
                                  ? `/reading-exams/${exam.id}`
                                  : `/listening-exams/${exam.id}`
                              }
                            >
                              <Eye className='h-4 w-4' />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
