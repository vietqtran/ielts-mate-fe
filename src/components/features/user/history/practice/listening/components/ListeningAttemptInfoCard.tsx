'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadListeningAttemptResultResponse } from '@/types/listening/listening-attempt.types';
import { Clock, FileText, Trophy, Volume2 } from 'lucide-react';

interface ListeningAttemptInfoCardProps {
  attemptDetails: LoadListeningAttemptResultResponse;
  formatDate: (dateString: string) => string;
  formatDuration: (seconds: number) => string;
}

export const ListeningAttemptInfoCard = ({
  attemptDetails,
  formatDate,
  formatDuration,
}: ListeningAttemptInfoCardProps) => {
  return (
    <Card className='bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-tekhelet-400'>
          <Volume2 className='w-5 h-5' />
          {attemptDetails.task_data.title}
        </CardTitle>
        {attemptDetails.task_data.instruction && (
          <p className='text-tekhelet-500'>{attemptDetails.task_data.instruction}</p>
        )}
        <div className='flex gap-2 mt-2'>
          <Badge variant='outline' className='text-xs text-tekhelet-500'>
            Attempt ID: {attemptDetails.attempt_id}
          </Badge>
          <Badge variant='outline' className='text-xs text-tekhelet-500'>
            IELTS Type: {attemptDetails.task_data.ielts_type === 0 ? 'Academic' : 'General'}
          </Badge>
          <Badge variant='outline' className='text-xs text-tekhelet-500'>
            Part: {attemptDetails.task_data.part_number}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
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
            <Trophy className='w-4 h-4 text-tekhelet-400' />
            <div>
              <p className='text-sm text-tekhelet-500'>Total Points</p>
              <p className='font-medium text-tekhelet-400'>{attemptDetails.total_points}</p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <FileText className='w-4 h-4 text-tekhelet-400' />
            <div>
              <p className='text-sm text-tekhelet-500'>Question Groups</p>
              <p className='font-medium text-tekhelet-400'>
                {attemptDetails.task_data.question_groups.length}
              </p>
            </div>
          </div>
        </div>

        {/* Audio Info Section */}
        <div className='mt-4 pt-4 border-t border-tekhelet-200'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='flex items-center gap-2'>
              <Volume2 className='w-4 h-4 text-tekhelet-400' />
              <div>
                <p className='text-sm text-tekhelet-500'>Audio File ID</p>
                <p className='font-medium text-tekhelet-400 text-xs break-all'>
                  {attemptDetails.task_data.audio_file_id}
                </p>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <FileText className='w-4 h-4 text-tekhelet-400' />
              <div>
                <p className='text-sm text-tekhelet-500'>Status</p>
                <p className='font-medium text-tekhelet-400'>
                  {attemptDetails.task_data.status === 0
                    ? 'Draft'
                    : attemptDetails.task_data.status === 1
                      ? 'Published'
                      : 'Archived'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
