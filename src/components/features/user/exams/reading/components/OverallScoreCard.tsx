'use client';

// import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Award } from 'lucide-react';

interface OverallScoreCardProps {
  scorePercentage: number;
  correctAnswers: number;
  totalQuestions: number;
}

export const OverallScoreCard = ({
  scorePercentage,
  correctAnswers,
  totalQuestions,
}: OverallScoreCardProps) => {
  return (
    <Card className='rounded-2xl'>
      <CardHeader className='text-center'>
        <Award className='w-12 h-12 mx-auto text-persimmon-400 mb-2' />
        <CardTitle className='text-tekhelet-400'>Correct Percentage</CardTitle>
      </CardHeader>
      <CardContent className='text-center gap-4'>
        <div className='text-4xl font-bold text-tekhelet-400 mb-2'>{scorePercentage}%</div>
        <div className='space-y-2 mt-5'>
          <Progress value={scorePercentage} className='h-3 [&>div]:bg-green-600' />
          <p className='text-sm text-tekhelet-500'>
            <span className='font-semibold'>{correctAnswers}</span> out of{' '}
            <span className='font-semibold'>{totalQuestions}</span> correct
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
