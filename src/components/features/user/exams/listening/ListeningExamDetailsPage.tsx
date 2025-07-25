'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Clock, Headphones } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ListeningExamDetailsPageProps {
  examId: string;
}

const ListeningExamDetailsPage = ({ examId }: ListeningExamDetailsPageProps) => {
  const router = useRouter();

  return (
    <div className='min-h-screen bg-medium-slate-blue-900 p-4'>
      <div className='max-w-4xl mx-auto'>
        {/* Header */}
        <div className='flex items-center justify-between mb-6'>
          <div className='flex gap-3 items-center'>
            <Headphones className='w-8 h-8 text-selective-yellow-400' />
            <div>
              <h1 className='text-3xl font-bold text-white'>Listening Exam Details</h1>
              <p className='text-medium-slate-blue-300'>Coming soon...</p>
            </div>
          </div>
          <Button
            variant='outline'
            onClick={() => router.push('/history/exams/listening')}
            className='bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm'
          >
            <ArrowLeft className='w-4 h-4 mr-2' />
            Back to History
          </Button>
        </div>

        {/* Coming Soon Card */}
        <Card className='bg-white/70 backdrop-blur-lg border border-tekhelet-200 rounded-2xl shadow-xl'>
          <CardHeader className='text-center'>
            <CardTitle className='flex items-center justify-center gap-2 text-tekhelet-400'>
              <Clock className='w-5 h-5' />
              Feature Under Development
            </CardTitle>
          </CardHeader>
          <CardContent className='text-center py-8'>
            <div className='max-w-md mx-auto space-y-4'>
              <div className='w-24 h-24 mx-auto bg-gradient-to-br from-selective-yellow-400 to-tangerine-400 rounded-full flex items-center justify-center'>
                <Headphones className='w-12 h-12 text-white' />
              </div>
              <h2 className='text-xl font-semibold text-tekhelet-400'>Listening Exam Details</h2>
              <p className='text-tekhelet-500'>
                We're working hard to bring you detailed listening exam analytics. This feature will
                include audio playback analysis, question breakdown, and performance insights.
              </p>
              <div className='bg-tekhelet-100/50 rounded-lg p-3 text-sm text-tekhelet-600'>
                <strong>Exam ID:</strong> {examId}
              </div>
              <p className='text-sm text-tekhelet-400 font-medium'>Stay tuned for updates!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ListeningExamDetailsPage;
