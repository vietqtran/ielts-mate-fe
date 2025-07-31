'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ListActiveListeningExamsResponse } from '@/types/listening/listening-exam.types';
import { ArrowLeft, ArrowRight, Clock, FileText, Headphones } from 'lucide-react';

interface ListeningExamPreviewProps {
  examData: ListActiveListeningExamsResponse;
  onStartExam: () => void;
  onBack: () => void;
}

const ListeningExamPreview = ({ examData, onStartExam, onBack }: ListeningExamPreviewProps) => {
  const parts = [
    {
      part: 'Part 1',
      title: examData.part1.title,
      id: examData.part1.task_id,
      instruction: examData.part1.instruction,
    },
    {
      part: 'Part 2',
      title: examData.part2.title,
      id: examData.part2.task_id,
      instruction: examData.part2.instruction,
    },
    {
      part: 'Part 3',
      title: examData.part3.title,
      id: examData.part3.task_id,
      instruction: examData.part3.instruction,
    },
    {
      part: 'Part 4',
      title: examData.part4.title,
      id: examData.part4.task_id,
      instruction: examData.part4.instruction,
    },
  ];

  return (
    <div className='min-h-screen bg-medium-slate-blue-900 py-8 px-4'>
      <div className='max-w-4xl mx-auto'>
        {/* Header */}
        <div className='bg-white/80 backdrop-blur-lg border rounded-2xl shadow-xl p-6 mb-6'>
          <div className='flex items-center justify-between mb-4'>
            <Button
              variant='outline'
              onClick={onBack}
              className='text-tekhelet-600 hover:bg-tekhelet-50 bg-white/60 backdrop-blur-md'
            >
              <ArrowLeft className='w-4 h-4 mr-2' />
              Back to Exams
            </Button>
            <Badge variant='outline' className='text-tekhelet-600 backdrop-blur-md'>
              {examData.url_slug}
            </Badge>
          </div>

          <div className='text-center'>
            <h1 className='text-3xl font-bold text-tekhelet-400 mb-2'>{examData.exam_name}</h1>
            <p className='text-medium-slate-blue-400 text-lg max-w-2xl mx-auto'>
              {examData.exam_description}
            </p>
          </div>
        </div>

        {/* Exam Details */}
        <div className='grid md:grid-cols-2 gap-6 mb-8'>
          {/* Duration and Info */}
          <Card className='bg-white/80 backdrop-blur-lg border rounded-2xl shadow-xl'>
            <CardHeader className='backdrop-blur-md rounded-t-2xl'>
              <CardTitle className='flex items-center gap-2 text-tekhelet-400'>
                <Clock className='w-5 h-5' />
                Exam Information
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4 p-6'>
              <div className='flex justify-between items-center'>
                <span className='text-medium-slate-blue-500'>Duration:</span>
                <span className='font-semibold text-tekhelet-400'>30 minutes</span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-medium-slate-blue-500'>Total Parts:</span>
                <span className='font-semibold text-tekhelet-400'>4 parts</span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-medium-slate-blue-500'>Exam Type:</span>
                <span className='font-semibold text-tekhelet-400'>IELTS Listening</span>
              </div>
              <Separator className='bg-tekhelet-800' />
              <div className='text-sm text-medium-slate-blue-500'>
                <p>• You will have 30 minutes to complete all four parts</p>
                <p>• Audio will be played only once for each part</p>
                <p>• Take notes while listening to help answer questions</p>
              </div>
            </CardContent>
          </Card>

          {/* Tasks Overview */}
          <Card className='bg-white/80 backdrop-blur-lg border rounded-2xl shadow-xl'>
            <CardHeader className='backdrop-blur-md rounded-t-2xl'>
              <CardTitle className='flex items-center gap-2 text-tekhelet-400'>
                <Headphones className='w-5 h-5' />
                Listening Tasks
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 p-6'>
              {parts.map((part, index) => (
                <div key={part.id} className='space-y-2'>
                  <div className='flex items-center gap-3'>
                    <Badge
                      variant='secondary'
                      className='bg-selective-yellow-100/80 text-selective-yellow-400 backdrop-blur-sm'
                    >
                      {part.part}
                    </Badge>
                    <span className='font-medium text-tekhelet-400'>{part.title}</span>
                  </div>
                  {part.instruction && (
                    <p className='text-xs text-medium-slate-blue-500 ml-16'>
                      {part.instruction.substring(0, 80)}...
                    </p>
                  )}
                  {index < parts.length - 1 && <Separator className='bg-tekhelet-800' />}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className='bg-white/80 backdrop-blur-lg border rounded-2xl shadow-xl mb-8'>
          <CardHeader className='backdrop-blur-md rounded-t-2xl'>
            <CardTitle className='flex items-center gap-2 text-tangerine-400'>
              <FileText className='w-5 h-5' />
              Important Instructions
            </CardTitle>
          </CardHeader>
          <CardContent className='p-6'>
            <div className='grid md:grid-cols-2 gap-6'>
              <div className='space-y-3'>
                <h4 className='font-semibold text-tekhelet-400'>Before You Start:</h4>
                <ul className='space-y-2 text-sm text-medium-slate-blue-500'>
                  <li className='flex items-start gap-2'>
                    <span className='w-1.5 h-1.5 bg-tekhelet-400 rounded-full mt-2 flex-shrink-0'></span>
                    Ensure you have a stable internet connection
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='w-1.5 h-1.5 bg-tekhelet-400 rounded-full mt-2 flex-shrink-0'></span>
                    Test your audio/headphones for clear sound
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='w-1.5 h-1.5 bg-tekhelet-400 rounded-full mt-2 flex-shrink-0'></span>
                    Find a quiet environment for concentration
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='w-1.5 h-1.5 bg-tekhelet-400 rounded-full mt-2 flex-shrink-0'></span>
                    Have pen and paper ready for note-taking
                  </li>
                </ul>
              </div>
              <div className='space-y-3'>
                <h4 className='font-semibold text-tekhelet-400'>During the Exam:</h4>
                <ul className='space-y-2 text-sm text-medium-slate-blue-500'>
                  <li className='flex items-start gap-2'>
                    <span className='w-1.5 h-1.5 bg-tekhelet-400 rounded-full mt-2 flex-shrink-0'></span>
                    Listen carefully as audio plays only once
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='w-1.5 h-1.5 bg-tekhelet-400 rounded-full mt-2 flex-shrink-0'></span>
                    Read questions before each section begins
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='w-1.5 h-1.5 bg-tekhelet-400 rounded-full mt-2 flex-shrink-0'></span>
                    Take notes while listening to help with answers
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='w-1.5 h-1.5 bg-tekhelet-400 rounded-full mt-2 flex-shrink-0'></span>
                    Submit your exam before time expires
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Start Exam Button */}
        <div className='text-center'>
          <Card className='backdrop-blur-lg border rounded-2xl shadow-xl'>
            <CardContent className='p-6'>
              <div className='space-y-4'>
                <div className='text-center'>
                  <h3 className='text-lg font-semibold text-tekhelet-400 mb-2'>Ready to Begin?</h3>
                  <p className='text-medium-slate-blue-500 text-sm mb-4'>
                    Once you start, the 30-minute timer will begin immediately.
                  </p>
                </div>
                <Button
                  onClick={onStartExam}
                  size='lg'
                  className='bg-tekhelet-400 hover:bg-tekhelet-300 text-white px-8 py-3 text-lg shadow-lg'
                >
                  Start Exam
                  <ArrowRight className='w-5 h-5 ml-2' />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ListeningExamPreview;
