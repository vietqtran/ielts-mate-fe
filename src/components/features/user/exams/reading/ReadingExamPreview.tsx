'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ReadingExamResponse } from '@/types/reading/reading-exam.types';
import { ArrowLeft, ArrowRight, BookOpen, Clock, FileText } from 'lucide-react';

interface ExamPreviewProps {
  examData: ReadingExamResponse['data'];
  onStartExam: () => void;
  onBack: () => void;
}

const ReadingExamPreview = ({ examData, onStartExam, onBack }: ExamPreviewProps) => {
  const passages = [
    {
      part: 'Part 1',
      title: examData.reading_passage_id_part1.reading_passage_name,
      id: examData.reading_passage_id_part1.reading_passage_id,
    },
    {
      part: 'Part 2',
      title: examData.reading_passage_id_part2.reading_passage_name,
      id: examData.reading_passage_id_part2.reading_passage_id,
    },
    {
      part: 'Part 3',
      title: examData.reading_passage_id_part3.reading_passage_name,
      id: examData.reading_passage_id_part3.reading_passage_id,
    },
  ];

  return (
    <div className='min-h-screen py-8 px-4'>
      <div className='max-w-4xl mx-auto'>
        {/* Header */}
        <div className='rounded-lg border bg-white p-6 mb-6'>
          <div className='flex items-center justify-between mb-4'>
            <Button
              variant='outline'
              onClick={onBack}
              className='text-tekhelet-600 hover:text-tekhelet-600'
            >
              <ArrowLeft className='w-4 h-4' />
              Back to Exams
            </Button>
            <Button
              onClick={onStartExam}
              className='bg-selective-yellow-300 hover:bg-selective-yellow-400 text-white'
            >
              Start Exam
              <ArrowRight className='w-5 h-5' />
            </Button>
          </div>

          <div className='text-center'>
            <h1 className='text-3xl font-bold text-tekhelet-500 mb-2'>
              {examData.reading_exam_name}
            </h1>
            <p className='text-medium-slate-blue-400 text-lg max-w-2xl mx-auto'>
              {examData.reading_exam_description}
            </p>
          </div>
        </div>

        {/* Exam Details */}
        <div className='grid md:grid-cols-2 gap-6 mb-8'>
          {/* Duration and Info */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-tekhelet-600'>
                <Clock className='w-5 h-5' />
                Exam Information
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex justify-between items-center'>
                <span className='text-medium-slate-blue-400'>Duration:</span>
                <span className='font-semibold text-tekhelet-600'>60 minutes</span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-medium-slate-blue-400'>Total Parts:</span>
                <span className='font-semibold text-tekhelet-600'>3 parts</span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-medium-slate-blue-400'>Exam Type:</span>
                <span className='font-semibold text-tekhelet-600'>IELTS Reading</span>
              </div>
              <Separator />
              <div className='text-sm text-medium-slate-blue-400'>
                <ul className='list-disc pl-5 space-y-2'>
                  <li>You will have 60 minutes to complete all three parts</li>
                  <li>You can navigate between parts during the exam</li>
                  <li>Submit your answers before time runs out</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Passages Overview */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-tekhelet-600'>
                <BookOpen className='w-5 h-5' />
                Reading Passages
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              {passages.map((passage, index) => (
                <div key={passage.id} className='space-y-2'>
                  <div className='flex items-center gap-3'>
                    <Badge
                      variant='outline'
                      className='bg-selective-yellow-100 text-selective-yellow-700'
                    >
                      {passage.part}
                    </Badge>
                    <span className='font-medium text-tekhelet-600'>{passage.title}</span>
                  </div>
                  {index < passages.length - 1 && <Separator />}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className='mb-8'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-tangerine-400'>
              <FileText className='w-5 h-5' />
              Important Instructions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid md:grid-cols-2 gap-6'>
              <div className='space-y-3'>
                <h4 className='font-semibold text-tekhelet-600'>Before You Start:</h4>
                <ul className='space-y-2 text-sm text-medium-slate-blue-400'>
                  <li className='flex items-start gap-2'>
                    <span className='w-1.5 h-1.5 bg-tekhelet-400 rounded-full mt-2 flex-shrink-0'></span>
                    Ensure you have a stable internet connection
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='w-1.5 h-1.5 bg-tekhelet-400 rounded-full mt-2 flex-shrink-0'></span>
                    Find a quiet environment for concentration
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='w-1.5 h-1.5 bg-tekhelet-400 rounded-full mt-2 flex-shrink-0'></span>
                    Have scratch paper ready if needed
                  </li>
                </ul>
              </div>
              <div className='space-y-3'>
                <h4 className='font-semibold text-tekhelet-600'>During the Exam:</h4>
                <ul className='space-y-2 text-sm text-medium-slate-blue-400'>
                  <li className='flex items-start gap-2'>
                    <span className='w-1.5 h-1.5 bg-tekhelet-400 rounded-full mt-2 flex-shrink-0'></span>
                    Read all passages and questions carefully
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='w-1.5 h-1.5 bg-tekhelet-400 rounded-full mt-2 flex-shrink-0'></span>
                    Manage your time across all three parts
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
      </div>
    </div>
  );
};

export default ReadingExamPreview;
