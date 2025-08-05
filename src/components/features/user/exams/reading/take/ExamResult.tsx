'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SubmitExamResultResponse } from '@/types/reading/reading-exam-attempt.types';
import {
  Award,
  BarChart3,
  BookOpen,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Home,
  RotateCcw,
  Target,
  Trophy,
  XCircle,
  //   Download
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface ExamResultProps {
  result: SubmitExamResultResponse;
  examName: string;
  examDescription?: string;
}

const ExamResult = ({ result, examName, examDescription }: ExamResultProps) => {
  const router = useRouter();
  const [openQuestions, setOpenQuestions] = useState<Set<number>>(new Set());

  // Enhanced time formatting for better readability
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  };

  // Calculate statistics
  const totalQuestions = result.result_sets.length;
  const correctAnswers = result.result_sets.filter((q) => q.is_correct).length;
  const incorrectAnswers = totalQuestions - correctAnswers;
  const scorePercentage = Math.round((correctAnswers / totalQuestions) * 100) || 0;

  // IELTS band score approximation (this could be adjusted based on actual IELTS scoring)
  const getIELTSBandScore = (percentage: number): number => {
    if (percentage >= 95) return 9.0;
    if (percentage >= 89) return 8.5;
    if (percentage >= 83) return 8.0;
    if (percentage >= 75) return 7.5;
    if (percentage >= 67) return 7.0;
    if (percentage >= 58) return 6.5;
    if (percentage >= 50) return 6.0;
    if (percentage >= 42) return 5.5;
    if (percentage >= 33) return 5.0;
    if (percentage >= 25) return 4.5;
    if (percentage >= 17) return 4.0;
    if (percentage >= 8) return 3.5;
    return 3.0;
  };

  const bandScore = getIELTSBandScore(scorePercentage);

  // Get performance level and color
  const getPerformanceLevel = (score: number) => {
    if (score >= 85)
      return {
        level: 'Excellent',
        color: 'bg-selective-yellow-500 text-tekhelet-900',
      };
    if (score >= 70) return { level: 'Good', color: 'bg-medium-slate-blue-500 text-white' };
    if (score >= 55) return { level: 'Fair', color: 'bg-tangerine-500 text-white' };
    return { level: 'Needs Improvement', color: 'bg-persimmon-500 text-white' };
  };

  const performance = getPerformanceLevel(scorePercentage);

  // Toggle question details
  const toggleQuestion = (index: number) => {
    const newOpen = new Set(openQuestions);
    if (newOpen.has(index)) {
      newOpen.delete(index);
    } else {
      newOpen.add(index);
    }
    setOpenQuestions(newOpen);
  };

  // Format answers for display
  const formatAnswer = (answers: string[] | undefined): string => {
    if (!Array.isArray(answers) || answers.length === 0) return 'No answer provided';
    return answers.join(', ');
  };

  // Group questions by parts (assuming 13-14 questions per part)
  const groupQuestionsByPart = () => {
    const questionsPerPart = Math.ceil(totalQuestions / 3);
    const parts = [];

    for (let i = 0; i < 3; i++) {
      const startIndex = i * questionsPerPart;
      const endIndex = Math.min(startIndex + questionsPerPart, totalQuestions);
      const partQuestions = result.result_sets.slice(startIndex, endIndex);
      const correctInPart = partQuestions.filter((q) => q.is_correct).length;

      parts.push({
        title: `Part ${i + 1}`,
        questions: partQuestions,
        correct: correctInPart,
        total: partQuestions.length,
        percentage: Math.round((correctInPart / partQuestions.length) * 100) || 0,
      });
    }

    return parts;
  };

  const partResults = groupQuestionsByPart();

  return (
    <div className='min-h-screen bg-medium-slate-blue-900 p-4 print:bg-white print:p-0'>
      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .print-break {
            page-break-before: always;
          }
        }
      `}</style>
      <div className='max-w-6xl mx-auto space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between mb-6'>
          <div className='flex gap-3 items-center'>
            <Trophy className='w-8 h-8 text-selective-yellow-400' />
            <h1 className='text-3xl font-bold text-tekhelet-400'>Exam Results</h1>
          </div>
          <div className='space-y-1'>
            <Badge className='text-xl font-semibold text-tekhelet-600' variant='outline'>
              Exam: {examName}
            </Badge>
            {/* {examDescription && (
              <p className="text-medium-slate-blue-400">{examDescription}</p>
            )} */}
          </div>
        </div>

        {/* Overall Score Card */}
        <Card className='bg-white border-tekhelet-200 shadow-lg'>
          <CardHeader className='text-center pb-4'>
            <CardTitle className='text-2xl text-tekhelet-700'>Overall Performance</CardTitle>
          </CardHeader>
          <CardContent className='space-y-6'>
            {/* Score Circle */}
            <div className='flex items-center justify-center'>
              <div className='relative w-32 h-32'>
                <svg className='w-32 h-32 transform -rotate-90' viewBox='0 0 100 100'>
                  <circle
                    cx='50'
                    cy='50'
                    r='45'
                    stroke='currentColor'
                    strokeWidth='8'
                    fill='transparent'
                    className='text-tekhelet-200'
                  />
                  <circle
                    cx='50'
                    cy='50'
                    r='45'
                    stroke='currentColor'
                    strokeWidth='8'
                    fill='transparent'
                    strokeDasharray={`${scorePercentage * 2.83} 283`}
                    className='text-selective-yellow-500'
                    strokeLinecap='round'
                  />
                </svg>
                <div className='absolute inset-0 flex items-center justify-center'>
                  <div className='text-center'>
                    <div className='text-3xl font-bold text-tekhelet-700'>{scorePercentage}%</div>
                    <div className='text-sm text-medium-slate-blue-400'>Score</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Badge */}
            <div className='flex justify-center'>
              <Badge
                variant={'outline'}
                className={`px-4 py-2 text-lg font-semibold ${performance.color}`}
              >
                {performance.level}
              </Badge>
            </div>

            {/* IELTS Band Score */}
            <div className='text-center space-y-2'>
              <div className='flex items-center justify-center gap-2'>
                <Award className='w-5 h-5 text-selective-yellow-500' />
                <span className='text-lg font-semibold text-tekhelet-700'>
                  Estimated IELTS Band Score
                </span>
              </div>
              <div className='text-3xl font-bold text-persimmon-600'>{bandScore}</div>
            </div>

            {/* Quick Stats */}
            <div className='grid grid-cols-3 gap-4 text-center'>
              <div className='space-y-2'>
                <div className='flex items-center justify-center gap-2'>
                  <CheckCircle className='w-5 h-5 text-green-600' />
                  <span className='text-sm font-medium text-tekhelet-600'>Correct</span>
                </div>
                <div className='text-2xl font-bold text-green-600'>{correctAnswers}</div>
              </div>
              <div className='space-y-2'>
                <div className='flex items-center justify-center gap-2'>
                  <XCircle className='w-5 h-5 text-persimmon-500' />
                  <span className='text-sm font-medium text-tekhelet-600'>Incorrect</span>
                </div>
                <div className='text-2xl font-bold text-persimmon-600'>{incorrectAnswers}</div>
              </div>
              <div className='space-y-2'>
                <div className='flex items-center justify-center gap-2'>
                  <Clock className='w-5 h-5 text-medium-slate-blue-500' />
                  <span className='text-sm font-medium text-tekhelet-600'>Time Taken</span>
                </div>
                <div className='text-2xl font-bold text-medium-slate-blue-600'>
                  {formatDuration(result.duration)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Part-wise Performance */}
        <Card className='bg-white border-tekhelet-200'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-tekhelet-700'>
              <BarChart3 className='w-5 h-5' />
              Part-wise Performance
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            {partResults.map((part, index) => (
              <div key={index} className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <h3 className='text-lg font-semibold text-tekhelet-600'>{part.title}</h3>
                  <div className='flex items-center gap-2'>
                    <span className='text-sm text-medium-slate-blue-400'>
                      {part.correct}/{part.total}
                    </span>
                    <Badge variant='outline' className='border-tekhelet-300 text-tekhelet-600'>
                      {part.percentage}%
                    </Badge>
                  </div>
                </div>
                <Progress value={part.percentage} className='h-3' />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Detailed Question Review */}
        <Card className='bg-white border-tekhelet-200'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-tekhelet-700'>
              <BookOpen className='w-5 h-5' />
              Detailed Question Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue='all' className='w-full'>
              <TabsList className='grid w-full grid-cols-4'>
                <TabsTrigger value='all'>All Questions</TabsTrigger>
                <TabsTrigger value='correct' className='text-green-600'>
                  Correct ({correctAnswers})
                </TabsTrigger>
                <TabsTrigger value='incorrect' className='text-persimmon-400'>
                  Incorrect ({incorrectAnswers})
                </TabsTrigger>
                <TabsTrigger value='parts'>By Parts</TabsTrigger>
              </TabsList>

              <TabsContent value='all' className='space-y-3 mt-6'>
                {result.result_sets.map((question, index) => (
                  <Collapsible key={index}>
                    <CollapsibleTrigger className='w-full' onClick={() => toggleQuestion(index)}>
                      <div className='flex items-center justify-between p-4 border border-tekhelet-200 rounded-lg hover:bg-tekhelet-50 transition-colors'>
                        <div className='flex items-center gap-3'>
                          {question.is_correct ? (
                            <CheckCircle className='w-5 h-5 text-green-600' />
                          ) : (
                            <XCircle className='w-5 h-5 text-red-600' />
                          )}
                          <span className='font-medium text-tekhelet-700'>
                            Question {question.question_index}
                          </span>
                        </div>
                        {openQuestions.has(index) ? (
                          <ChevronUp className='w-5 h-5 text-medium-slate-blue-400' />
                        ) : (
                          <ChevronDown className='w-5 h-5 text-medium-slate-blue-400' />
                        )}
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className='border-l-4 border-l-tekhelet-200 ml-6 pl-4 py-3 space-y-3'>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                          <div className='space-y-2'>
                            <h4 className='font-semibold text-tekhelet-600'>Your Answer:</h4>
                            <p className='text-medium-slate-blue-500 bg-medium-slate-blue-50 p-2 rounded'>
                              {formatAnswer(question.user_answer)}
                            </p>
                          </div>
                          <div className='space-y-2'>
                            <h4 className='font-semibold text-tekhelet-600'>Correct Answer:</h4>
                            <p className='text-selective-yellow-700 bg-selective-yellow-50 p-2 rounded'>
                              {formatAnswer(question.correct_answer)}
                            </p>
                          </div>
                        </div>
                        {question.explanation && (
                          <div className='space-y-2'>
                            <h4 className='font-semibold text-tekhelet-600'>Explanation:</h4>
                            <p className='text-medium-slate-blue-600 bg-tekhelet-50 p-3 rounded leading-relaxed'>
                              {question.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </TabsContent>

              <TabsContent value='correct' className='space-y-3 mt-6'>
                {result.result_sets
                  .filter((q) => q.is_correct)
                  .map((question, index) => (
                    <div
                      key={index}
                      className='p-4 border border-selective-yellow-200 bg-selective-yellow-50 rounded-lg'
                    >
                      <div className='flex items-center gap-3 mb-2'>
                        <CheckCircle className='w-5 h-5 text-selective-yellow-500' />
                        <span className='font-medium text-tekhelet-700'>
                          Question {question.question_index}
                        </span>
                      </div>
                      <p className='text-medium-slate-blue-600'>
                        Your answer:{' '}
                        <span className='font-semibold text-selective-yellow-700'>
                          {formatAnswer(question.user_answer)}
                        </span>
                      </p>
                    </div>
                  ))}
              </TabsContent>

              <TabsContent value='incorrect' className='space-y-3 mt-6'>
                {result.result_sets
                  .filter((q) => !q.is_correct)
                  .map((question, index) => (
                    <div
                      key={index}
                      className='p-4 border border-persimmon-200 bg-persimmon-50 rounded-lg'
                    >
                      <div className='flex items-center gap-3 mb-3'>
                        <XCircle className='w-5 h-5 text-persimmon-500' />
                        <span className='font-medium text-tekhelet-700'>
                          Question {question.question_index}
                        </span>
                      </div>
                      <div className='space-y-2'>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                          <div>
                            <span className='text-sm font-medium text-tekhelet-600'>
                              Your answer:
                            </span>
                            <p className='text-persimmon-600 font-medium'>
                              {formatAnswer(question.user_answer)}
                            </p>
                          </div>
                          <div>
                            <span className='text-sm font-medium text-tekhelet-600'>
                              Correct answer:
                            </span>
                            <p className='text-selective-yellow-600 font-medium'>
                              {formatAnswer(question.correct_answer)}
                            </p>
                          </div>
                        </div>
                        {question.explanation && (
                          <div className='mt-3'>
                            <span className='text-sm font-medium text-tekhelet-600'>
                              Explanation:
                            </span>
                            <p className='text-medium-slate-blue-600 mt-1'>
                              {question.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </TabsContent>

              <TabsContent value='parts' className='space-y-4 mt-6'>
                {partResults.map((part, partIndex) => (
                  <Card key={partIndex} className='border-tekhelet-200'>
                    <CardHeader className='pb-3'>
                      <div className='flex items-center justify-between'>
                        <CardTitle className='text-lg text-tekhelet-700'>{part.title}</CardTitle>
                        <Badge variant='outline' className='border-tekhelet-300 text-tekhelet-600'>
                          {part.correct}/{part.total} ({part.percentage}%)
                        </Badge>
                      </div>
                      <Progress value={part.percentage} className='h-2' />
                    </CardHeader>
                    <CardContent className='space-y-3'>
                      {part.questions.map((question, qIndex) => (
                        <div
                          key={qIndex}
                          className={`p-3 rounded-lg border ${
                            question.is_correct
                              ? 'border-selective-yellow-200 bg-selective-yellow-50'
                              : 'border-persimmon-200 bg-persimmon-50'
                          }`}
                        >
                          <div className='flex items-center gap-2 mb-2'>
                            {question.is_correct ? (
                              <CheckCircle className='w-4 h-4 text-selective-yellow-500' />
                            ) : (
                              <XCircle className='w-4 h-4 text-persimmon-500' />
                            )}
                            <span className='font-medium text-tekhelet-600'>
                              Question {question.question_index}
                            </span>
                          </div>
                          <div className='text-sm space-y-1'>
                            <div>
                              <span className='text-medium-slate-blue-500'>Your:</span>
                              <span className='ml-1 font-medium'>
                                {formatAnswer(question.user_answer)}
                              </span>
                            </div>
                            <div>
                              <span className='text-medium-slate-blue-500'>Correct:</span>
                              <span className='ml-1 font-medium text-selective-yellow-600'>
                                {formatAnswer(question.correct_answer)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className='flex flex-col sm:flex-row gap-4 justify-center no-print'>
          <Button
            onClick={() => router.push('/exams')}
            className='bg-tekhelet-600 hover:bg-tekhelet-700 text-white px-8 py-3'
            size='lg'
          >
            <Home className='w-5 h-5 mr-2' />
            Back to Exams
          </Button>
          <Button
            onClick={() => window.location.reload()}
            variant='outline'
            className='border-tekhelet-300 text-tekhelet-600 hover:bg-tekhelet-50 px-8 py-3'
            size='lg'
          >
            <RotateCcw className='w-5 h-5 mr-2' />
            Take Another Exam
          </Button>
          {/* <Button
            onClick={() => {
              window.print();
            }}
            variant="outline"
            className="border-tekhelet-300 text-tekhelet-600 hover:bg-tekhelet-50 px-8 py-3"
            size="lg"
          >
            <Download className="w-5 h-5 mr-2" />
            Download/Print Results
          </Button> */}
        </div>

        {/* Performance Tips */}
        <Card className='bg-gradient-to-r from-tekhelet-50 to-medium-slate-blue-50 border-tekhelet-200'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-tekhelet-700'>
              <Target className='w-5 h-5' />
              Performance Tips
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            {scorePercentage >= 85 ? (
              <div className='space-y-2'>
                <p className='text-tekhelet-600'>
                  🎉 Excellent performance! You're well-prepared for the IELTS Reading test.
                </p>
                <ul className='list-disc list-inside text-medium-slate-blue-600 space-y-1'>
                  <li>Maintain your reading speed and comprehension skills</li>
                  <li>Continue practicing with varied question types</li>
                  <li>Focus on time management during the actual test</li>
                </ul>
              </div>
            ) : scorePercentage >= 70 ? (
              <div className='space-y-2'>
                <p className='text-tekhelet-600'>
                  👍 Good performance! With some focused practice, you can achieve even better
                  results.
                </p>
                <ul className='list-disc list-inside text-medium-slate-blue-600 space-y-1'>
                  <li>Review the questions you got wrong and understand the patterns</li>
                  <li>Practice skimming and scanning techniques</li>
                  <li>Work on expanding your vocabulary, especially academic words</li>
                </ul>
              </div>
            ) : scorePercentage >= 55 ? (
              <div className='space-y-2'>
                <p className='text-tekhelet-600'>
                  📚 You're making progress! Focus on these key areas for improvement.
                </p>
                <ul className='list-disc list-inside text-medium-slate-blue-600 space-y-1'>
                  <li>Practice identifying main ideas and supporting details</li>
                  <li>Work on inference and implication questions</li>
                  <li>Improve your reading speed without sacrificing comprehension</li>
                  <li>Study common IELTS vocabulary and collocations</li>
                </ul>
              </div>
            ) : (
              <div className='space-y-2'>
                <p className='text-tekhelet-600'>
                  💪 Keep practicing! Here are specific areas to focus on:
                </p>
                <ul className='list-disc list-inside text-medium-slate-blue-600 space-y-1'>
                  <li>Start with easier reading materials and gradually increase difficulty</li>
                  <li>Practice basic reading strategies: prediction, scanning, skimming</li>
                  <li>Build your vocabulary systematically</li>
                  <li>Take more practice tests to familiarize yourself with question types</li>
                  <li>Consider getting additional help or tutoring</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExamResult;
