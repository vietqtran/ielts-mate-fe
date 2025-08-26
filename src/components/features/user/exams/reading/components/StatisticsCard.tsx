'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, CheckCircle, XCircle } from 'lucide-react';

interface StatisticsCardProps {
  totalPoints: number;
  examTotalPoints: number;
  correctAnswers: number;
  incorrectAnswers: number;
}

export const StatisticsCard = ({
  totalPoints,
  examTotalPoints,
  correctAnswers,
  incorrectAnswers,
}: StatisticsCardProps) => {
  return (
    <Card>
      <CardHeader className='text-center'>
        <BarChart3 className='w-12 h-12 mx-auto text-persimmon-400 mb-2' />
        <CardTitle className='text-tekhelet-400'>Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-3'>
          <div className='flex justify-between items-center'>
            <span className='text-tekhelet-500'>Exam Total Points</span>
            <span className='font-bold text-tekhelet-400'>{examTotalPoints}</span>
          </div>
          <div className='flex justify-between items-center'>
            <span className='text-green-600 flex items-center gap-1'>
              <CheckCircle className='w-4 h-4' />
              Correct
            </span>
            <span className='font-bold text-green-600'>{correctAnswers}</span>
          </div>
          <div className='flex justify-between items-center'>
            <span className='text-persimmon-300 flex items-center gap-1'>
              <XCircle className='w-4 h-4' />
              Incorrect
            </span>
            <span className='font-bold text-persimmon-300'>{incorrectAnswers}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
