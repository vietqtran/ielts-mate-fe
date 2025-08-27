import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { BarChart3, CheckCircle, CircleQuestionMark, XCircle } from 'lucide-react';

interface StatisticsCardProps {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  notAnswered: number;
}

export const AttemptStatisticsCard = ({
  totalQuestions,
  notAnswered,
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
            <span className='text-tekhelet-500 font-semibold'>Total Questions</span>
            <span className='font-bold text-tekhelet-400'>{totalQuestions}</span>
          </div>
          <div className='flex justify-between items-center'>
            <span className='text-green-600 flex items-center gap-1 font-semibold'>
              <CheckCircle className='w-4 h-4' />
              Correct
            </span>
            <span className='text-green-600'>{correctAnswers}</span>
          </div>
          <div className='flex justify-between items-center'>
            <span className='text-persimmon-300 flex items-center gap-1 font-semibold'>
              <XCircle className='w-4 h-4' />
              Incorrect
            </span>
            <span className='text-persimmon-300'>{incorrectAnswers}</span>
          </div>
          <div className='flex justify-between items-center'>
            <span className='text-gray-700 flex items-center gap-1 font-semibold'>
              <CircleQuestionMark className='w-4 h-4' />
              Not Answered
            </span>
            <span className='text-gray-700'>{notAnswered}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
