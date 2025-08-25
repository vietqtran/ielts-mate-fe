'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target } from 'lucide-react';

interface IELTSBandScoreCardProps {
  bandScore: number;
}

export const IELTSBandScoreCard = ({ bandScore }: IELTSBandScoreCardProps) => {
  return (
    <Card>
      <CardHeader className='text-center'>
        <Target className='w-12 h-12 mx-auto text-medium-slate-blue-500 mb-2' />
        <CardTitle className='text-tekhelet-400'>IELTS Band Score</CardTitle>
      </CardHeader>
      <CardContent className='text-center'>
        <div className='text-4xl font-bold text-medium-slate-blue-500 mb-2'>
          {bandScore.toFixed(1)}
        </div>
        <p className='text-tekhelet-500 text-sm'>Based on your performance</p>
      </CardContent>
    </Card>
  );
};
