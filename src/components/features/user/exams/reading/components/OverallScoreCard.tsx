'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Award } from 'lucide-react';

interface OverallScoreCardProps {
  scorePercentage: number;
  correctAnswers: number;
  totalQuestions: number;
  performance: {
    level: string;
    color: string;
  };
}

export const OverallScoreCard = ({
  scorePercentage,
  correctAnswers,
  totalQuestions,
  performance,
}: OverallScoreCardProps) => {
  return (
    <Card className='rounded-2xl'>
      <CardHeader className='text-center'>
        <Award className='w-12 h-12 mx-auto text-persimmon-400 mb-2' />
        <CardTitle className='text-tekhelet-400'>Overall Score</CardTitle>
      </CardHeader>
      <CardContent className='text-center'>
        <div className='text-4xl font-bold text-tekhelet-400 mb-2'>{scorePercentage}%</div>
        <Badge variant={'outline'} className={`mb-4 ${performance.color}`}>
          {performance.level}
        </Badge>
        <div className='space-y-2'>
          <Progress value={scorePercentage} className='h-3' />
          <p className='text-sm text-tekhelet-500'>
            {correctAnswers} out of {totalQuestions} correct
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
