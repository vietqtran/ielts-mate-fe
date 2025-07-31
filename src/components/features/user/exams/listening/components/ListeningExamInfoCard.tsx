'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ListeningExamAttemptDetailsResponse } from '@/types/listening/listening-exam.types';
import { CalendarDays, Clock, Headphones, User } from 'lucide-react';

interface ListeningExamInfoCardProps {
  examDetails: ListeningExamAttemptDetailsResponse;
  formatDate: (dateString: string) => string;
  formatDuration: (duration: number) => string;
}

export const ListeningExamInfoCard = ({
  examDetails,
  formatDate,
  formatDuration,
}: ListeningExamInfoCardProps) => {
  return (
    <Card className='bg-white/70 backdrop-blur-lg border rounded-2xl'>
      <CardContent className='p-6'>
        <div className='flex flex-col gap-4'>
          {/* Exam Info */}
          <div className='space-y-2'>
            <div className='flex items-center gap-2'>
              <Headphones className='w-5 h-5 text-selective-yellow-400' />
              <h2 className='text-xl font-semibold text-tekhelet-400'>
                {examDetails.listening_exam.listening_exam_name}
              </h2>
            </div>
            <p className='text-tekhelet-500'>
              {examDetails.listening_exam.listening_exam_description}
            </p>
          </div>
          <Separator />
          {/* Exam Stats */}
          <div className='flex flex-wrap gap-4 justify-between items-center'>
            <div className='flex items-center gap-2 text-sm text-tekhelet-500'>
              <User className='w-4 h-4' />
              <span>
                {examDetails.created_by.first_name} {examDetails.created_by.last_name}
              </span>
            </div>
            <div className='flex items-center gap-2 text-sm text-tekhelet-500'>
              <CalendarDays className='w-4 h-4' />
              <span>Completed: {formatDate(examDetails.created_at)}</span>
            </div>
            <div className='flex items-center gap-2 text-sm text-tekhelet-500'>
              <Clock className='w-4 h-4' />
              <span>Duration: {formatDuration(examDetails.duration)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
