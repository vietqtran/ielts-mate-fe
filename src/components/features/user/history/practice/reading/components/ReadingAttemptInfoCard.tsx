'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadAttemptResponse } from '@/types/attempt.types';
import { BookOpen, Clock, FileText } from 'lucide-react';

interface ReadingAttemptInfoCardProps {
  attemptDetails: LoadAttemptResponse;
  formatDuration: (seconds: number) => string;
}

export const ReadingAttemptInfoCard = ({
  attemptDetails,
  formatDuration,
}: ReadingAttemptInfoCardProps) => {
  const passage = attemptDetails.task_data;
  return (
    <Card className='bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-tekhelet-400'>
          <BookOpen className='w-5 h-5' />
          {passage.title}
        </CardTitle>
        {passage.instruction && (
          <div
            className='text-tekhelet-500 prose prose-sm max-w-none'
            dangerouslySetInnerHTML={{ __html: passage.instruction }}
          />
        )}
        <div className='flex flex-wrap gap-2 mt-2'>
          <Badge variant='outline' className='text-xs text-tekhelet-500'>
            Attempt ID: {attemptDetails.attempt_id}
          </Badge>
          <Badge variant='outline' className='text-xs text-tekhelet-500'>
            IELTS Type: {passage.ielts_type === 0 ? 'Academic' : 'General'}
          </Badge>
          <Badge variant='outline' className='text-xs text-tekhelet-500'>
            Part: {passage.part_number + 1}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div className='flex items-center gap-2'>
            <Clock className='w-4 h-4 text-tekhelet-400' />
            <div>
              <p className='text-sm text-tekhelet-500'>Duration</p>
              <p className='font-medium text-tekhelet-400'>
                {formatDuration(attemptDetails.duration)}
              </p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <FileText className='w-4 h-4 text-tekhelet-400' />
            <div>
              <p className='text-sm text-tekhelet-500'>Question Groups</p>
              <p className='font-medium text-tekhelet-400'>{passage.question_groups.length}</p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <BookOpen className='w-4 h-4 text-tekhelet-400' />
            <div>
              <p className='text-sm text-tekhelet-500'>Passage ID</p>
              <p className='font-medium text-tekhelet-400 text-xs break-all'>
                {passage.passage_id}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
