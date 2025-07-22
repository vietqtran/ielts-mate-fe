'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/ui/loading-spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useReadingExam } from '@/hooks/apis/admin/useReadingExam';
import { useListeningExam } from '@/hooks/apis/listening/useListeningExam';
import { ReadingExamResponse } from '@/types/reading-exam.types';
import { BookOpen, Eye, Headphones } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type ExamType = 'reading' | 'listening';

interface CombinedExam {
  id: string;
  title: string;
  type: ExamType;
  urlSlug?: string;
  description?: string;
  passages?: {
    part1: string;
    part2: string;
    part3: string;
  };
}

interface AllExamsTableProps {
  className?: string;
  onRetry?: () => void;
}

export default function AllExamsTable({ className, onRetry }: AllExamsTableProps) {
  const { getAllExams: getReadingExams, isLoading: isReadingLoading } = useReadingExam();
  const {
    fetchExams: fetchListeningExams,
    isLoading: isListeningLoading,
    exams: listeningExams,
  } = useListeningExam();

  const [readingExams, setReadingExams] = useState<ReadingExamResponse['data'][]>([]);
  const [combinedExams, setCombinedExams] = useState<CombinedExam[]>([]);

  const fetchReadingExams = async () => {
    try {
      const response = await getReadingExams();
      if (response && response.data) {
        setReadingExams(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch reading exams:', error);
    }
  };

  const loadListeningExams = async () => {
    try {
      await fetchListeningExams();
    } catch (error) {
      console.error('Failed to fetch listening exams:', error);
    }
  };

  useEffect(() => {
    fetchReadingExams();
    loadListeningExams();
  }, []);

  useEffect(() => {
    const combined: CombinedExam[] = [];

    // Add reading exams
    readingExams.forEach((exam) => {
      combined.push({
        id: exam.reading_exam_id,
        title: exam.reading_exam_name,
        type: 'reading',
        urlSlug: exam.url_slug,
        description: exam.reading_exam_description,
        passages: {
          part1: exam.reading_passage_id_part1.reading_passage_name,
          part2: exam.reading_passage_id_part2.reading_passage_name,
          part3: exam.reading_passage_id_part3.reading_passage_name,
        },
      });
    });

    // Add listening exams
    listeningExams.forEach((exam) => {
      combined.push({
        id: exam.id,
        title: exam.title || 'Listening Exam',
        type: 'listening',
        description: exam.description,
      });
    });

    // Sort by title
    combined.sort((a, b) => a.title.localeCompare(b.title));
    setCombinedExams(combined);
  }, [readingExams, listeningExams]);

  const isLoading = isReadingLoading['getAllExams'] || isListeningLoading;

  if (isLoading) {
    return (
      <div className='flex justify-center py-8'>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className={className}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Exam Type</TableHead>
            <TableHead>Exam Name</TableHead>
            <TableHead>Details</TableHead>
            <TableHead className='text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {combinedExams.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className='text-center py-6'>
                No exams found. Try selecting a different category.
              </TableCell>
            </TableRow>
          ) : (
            combinedExams.map((exam) => (
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
                <TableCell className='max-w-xs'>
                  {exam.type === 'reading' ? (
                    <div className='space-y-1'>
                      <div className='text-xs'>
                        <Badge variant='outline' className='text-xs mr-1'>
                          {exam.urlSlug}
                        </Badge>
                      </div>
                      <div className='text-xs space-y-0.5'>
                        <div>Part 1: {exam.passages?.part1}</div>
                        <div>Part 2: {exam.passages?.part2}</div>
                        <div>Part 3: {exam.passages?.part3}</div>
                      </div>
                    </div>
                  ) : (
                    <div className='space-y-1'>
                      <div className='flex flex-wrap gap-1'>
                        <Badge variant='outline' className='text-xs'>
                          Part 1
                        </Badge>
                        <Badge variant='outline' className='text-xs'>
                          Part 2
                        </Badge>
                        <Badge variant='outline' className='text-xs'>
                          Part 3
                        </Badge>
                        <Badge variant='outline' className='text-xs'>
                          Part 4
                        </Badge>
                      </div>
                      <div className='text-xs'>
                        <Badge variant='secondary' className='text-xs'>
                          30 minutes
                        </Badge>
                      </div>
                    </div>
                  )}
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
    </div>
  );
}
