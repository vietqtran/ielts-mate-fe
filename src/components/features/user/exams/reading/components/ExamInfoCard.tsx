'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReadingExamAttemptDetailsResponse } from '@/types/reading-exam-attempt.types';
import { Calendar, Clock, FileText, Trophy, User } from 'lucide-react';

interface ExamInfoCardProps {
  examDetails: ReadingExamAttemptDetailsResponse;
  formatDate: (dateString: string) => string;
  formatDuration: (seconds: number) => string;
}

export const ExamInfoCard = ({ examDetails, formatDate, formatDuration }: ExamInfoCardProps) => {
  return (
    <Card className='bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-tekhelet-400'>
          <FileText className='w-5 h-5' />
          {examDetails.reading_exam.reading_exam_name}
        </CardTitle>
        {examDetails.reading_exam.reading_exam_description && (
          <p className='text-tekhelet-500'>{examDetails.reading_exam.reading_exam_description}</p>
        )}
        <div className='flex gap-2 mt-2'>
          <Badge variant='outline' className='text-xs text-tekhelet-500'>
            Attempt ID: {examDetails.exam_attempt_id}
          </Badge>
          {examDetails.reading_exam.url_slug && (
            <Badge variant='outline' className='text-xs text-tekhelet-500'>
              Slug: {examDetails.reading_exam.url_slug}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          <div className='flex items-center gap-2'>
            <Calendar className='w-4 h-4 text-tekhelet-400' />
            <div>
              <p className='text-sm text-tekhelet-500'>Started</p>
              <p className='font-medium text-tekhelet-400'>{formatDate(examDetails.created_at)}</p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <Calendar className='w-4 h-4 text-tekhelet-400' />
            <div>
              <p className='text-sm text-tekhelet-500'>Completed</p>
              <p className='font-medium text-tekhelet-400'>{formatDate(examDetails.updated_at)}</p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <Clock className='w-4 h-4 text-tekhelet-400' />
            <div>
              <p className='text-sm text-tekhelet-500'>Duration</p>
              <p className='font-medium text-tekhelet-400'>
                {formatDuration(examDetails.duration)}
              </p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <Trophy className='w-4 h-4 text-tekhelet-400' />
            <div>
              <p className='text-sm text-tekhelet-500'>Total Points</p>
              <p className='font-medium text-tekhelet-400'>{examDetails.total_point}</p>
            </div>
          </div>
        </div>
        <div className='mt-4 pt-4 border-t border-tekhelet-200'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='flex items-center gap-2'>
              <User className='w-4 h-4 text-tekhelet-400' />
              <div>
                <p className='text-sm text-tekhelet-500'>Student</p>
                <p className='font-medium text-tekhelet-400'>
                  {examDetails.created_by.first_name} {examDetails.created_by.last_name}
                </p>
                <p className='text-xs text-tekhelet-400'>{examDetails.created_by.email}</p>
              </div>
            </div>
            {examDetails.updated_by &&
              examDetails.updated_by.user_id !== examDetails.created_by.user_id && (
                <div className='flex items-center gap-2'>
                  <User className='w-4 h-4 text-tekhelet-400' />
                  <div>
                    <p className='text-sm text-tekhelet-500'>Last Updated By</p>
                    <p className='font-medium text-tekhelet-400'>
                      {examDetails.updated_by.first_name} {examDetails.updated_by.last_name}
                    </p>
                    <p className='text-xs text-tekhelet-400'>{examDetails.updated_by.email}</p>
                  </div>
                </div>
              )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
