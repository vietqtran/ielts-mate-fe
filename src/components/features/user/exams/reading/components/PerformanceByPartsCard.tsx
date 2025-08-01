'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface PartStat {
  title: string;
  questions: number;
  correct: number;
  points: number;
  percentage: number;
}

interface PerformanceByPartsCardProps {
  partStats: PartStat[];
}

export const PerformanceByPartsCard = ({ partStats }: PerformanceByPartsCardProps) => {
  return (
    <Card className='bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl'>
      <CardHeader>
        <CardTitle className='text-tekhelet-400'>Performance by Parts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {partStats.map((part, index) => (
            <div key={index} className='bg-white/50 rounded-lg p-4'>
              <h3 className='font-semibold text-tekhelet-400 mb-2'>{part.title}</h3>
              <div className='space-y-2'>
                <Progress value={part.percentage} className='h-2' />
                <div className='flex justify-between text-sm'>
                  <span className='text-tekhelet-500'>
                    {part.correct}/{part.questions}
                  </span>
                  <span className='font-medium text-tekhelet-400'>{part.percentage}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
