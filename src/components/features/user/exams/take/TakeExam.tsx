'use client';

import PassageBox from '@/components/features/user/reading/PassageBox';
import ConfirmSubmitModal from '@/components/features/user/reading/finish/ConfirmSubmitModal';
import { QuestionRenderer } from '@/components/features/user/reading/questions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useReadingExamAttempt from '@/hooks/apis/reading/useReadingExamAttempt';
import { formatTime, useDecrementTimer } from '@/hooks/utils/useTimer';
import {
  ReadingExamData,
  SubmitExamAnswerRequest,
  SubmitExamAttemptAnswersRequest,
  SubmitExamResultResponse,
} from '@/types/reading/reading-exam-attempt.types';
import { QuestionTypeEnumIndex } from '@/types/reading/reading.types';
import { AlertTriangle, BookOpen, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ExamResult from './ExamResult';

export interface HandleAnswerChangeParams {
  questionId: string;
  answer_id: string | string[];
  questionType: QuestionTypeEnumIndex;
  questionOrder: number;
  content: string;
}

interface TakeExamProps {
  examData: ReadingExamData;
  initialAnswers: Record<
    string,
    Record<
      string,
      {
        answer_id: string | string[];
        questionType: QuestionTypeEnumIndex;
        questionOrder: number;
        content: string;
      }
    >
  >;
}

const TakeExam = ({ examData, initialAnswers }: TakeExamProps) => {
  const [answers, setAnswers] =
    useState<
      Record<
        string,
        Record<
          string,
          {
            answer_id: string | string[];
            questionType: QuestionTypeEnumIndex;
            questionOrder: number;
            content: string;
          }
        >
      >
    >(initialAnswers);

  const [activeTab, setActiveTab] = useState<string>('part1');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<boolean>(false);
  const [examResult, setExamResult] = useState<SubmitExamResultResponse | null>(null);
  const [showResult, setShowResult] = useState<boolean>(false);

  // 60 minutes = 3600 seconds
  const EXAM_DURATION = 60 * 60;
  const timeLeft = useDecrementTimer(EXAM_DURATION, startTime);

  const router = useRouter();
  const { submitExamAttempt, isLoading } = useReadingExamAttempt();

  // Initialize answers when component mounts
  useEffect(() => {
    setAnswers(initialAnswers);
    setStartTime(true);
  }, [initialAnswers]);

  // Auto-submit when time runs out
  useEffect(() => {
    if (timeLeft === 0) {
      handleSubmit();
    }
  }, [timeLeft]);

  const parts = [
    {
      key: 'part1',
      data: examData.reading_exam.reading_passage_id_part1,
      title: 'Part 1',
    },
    {
      key: 'part2',
      data: examData.reading_exam.reading_passage_id_part2,
      title: 'Part 2',
    },
    {
      key: 'part3',
      data: examData.reading_exam.reading_passage_id_part3,
      title: 'Part 3',
    },
  ];

  const currentPart = parts.find((part) => part.key === activeTab);

  // Calculate total questions and answered questions
  const getTotalQuestions = () => {
    return parts.reduce((total, part) => {
      return (
        total +
        part.data.question_groups.reduce((partTotal, group) => {
          return partTotal + group.questions.length;
        }, 0)
      );
    }, 0);
  };

  const getAnsweredQuestions = () => {
    let answered = 0;
    parts.forEach((part) => {
      const partAnswers = answers[part.key] || {};
      Object.values(partAnswers).forEach((answer) => {
        if (Array.isArray(answer.answer_id)) {
          if (answer.answer_id.length > 0) answered++;
        } else {
          if (answer.answer_id.toString().trim() !== '') answered++;
        }
      });
    });
    return answered;
  };

  const getNotAnsweredQuestions = () => {
    const notAnswered: Array<{ part: string; questionId: string }> = [];
    parts.forEach((part) => {
      const partAnswers = answers[part.key] || {};
      part.data.question_groups.forEach((group) => {
        group.questions.forEach((question) => {
          const answer = partAnswers[question.question_id];
          if (!answer) {
            notAnswered.push({
              part: part.title,
              questionId: question.question_id,
            });
            return;
          }

          if (Array.isArray(answer.answer_id)) {
            if (answer.answer_id.length === 0) {
              notAnswered.push({
                part: part.title,
                questionId: question.question_id,
              });
            }
          } else {
            if (answer.answer_id.toString().trim() === '') {
              notAnswered.push({
                part: part.title,
                questionId: question.question_id,
              });
            }
          }
        });
      });
    });
    return notAnswered;
  };

  console.log(examData.reading_exam.reading_passage_id_part3.passage_id);

  const handleSubmit = async () => {
    try {
      // Transform answers data to match the required payload format
      const transformedAnswers: SubmitExamAnswerRequest[] = [];
      const passageIds: string[] = [];
      const questionGroupIds: string[] = [];
      const itemIds: string[] = [];

      // Extract passage IDs (with null checks)
      if (examData.reading_exam.reading_passage_id_part1.passage_id) {
        passageIds.push(examData.reading_exam.reading_passage_id_part1.passage_id);
      }
      if (examData.reading_exam.reading_passage_id_part2.passage_id) {
        passageIds.push(examData.reading_exam.reading_passage_id_part2.passage_id);
      }
      if (examData.reading_exam.reading_passage_id_part3.passage_id) {
        passageIds.push(examData.reading_exam.reading_passage_id_part3.passage_id);
      }

      // Process each part and collect data
      parts.forEach((part) => {
        const partAnswers = answers[part.key] || {};

        // Extract question group IDs and item IDs from this part
        part.data.question_groups.forEach((group) => {
          questionGroupIds.push(group.question_group_id);

          // Extract item IDs from drag_items if available
          if (group.drag_items && group.drag_items.length > 0) {
            group.drag_items.forEach((item) => {
              itemIds.push(item.drag_item_id);
            });
          }

          // Process each question in the group
          group.questions.forEach((question) => {
            const answer = partAnswers[question.question_id];

            // Only include answers that have actual data
            if (answer) {
              let hasValidAnswer = false;
              let selectedAnswers: string[] = [];

              if (Array.isArray(answer.answer_id)) {
                selectedAnswers = answer.answer_id.filter((id) => id && id.trim() !== '');
                hasValidAnswer = selectedAnswers.length > 0;
              } else {
                const answerStr = answer.answer_id.toString().trim();
                if (answerStr !== '') {
                  selectedAnswers = [answerStr];
                  hasValidAnswer = true;
                }
              }

              // Only add to payload if there's a valid answer
              if (hasValidAnswer) {
                // Get all choice IDs for multiple choice questions
                const choiceIds: string[] = [];
                if (question.choices && question.choices.length > 0) {
                  choiceIds.push(...question.choices.map((choice) => choice.choice_id));
                }

                transformedAnswers.push({
                  question_id: question.question_id,
                  selected_answers: selectedAnswers,
                  choice_ids: choiceIds,
                });
              }
            }
          });
        });
      });

      // Calculate duration (time spent in seconds)
      const duration = EXAM_DURATION - timeLeft;

      // Prepare the submission payload
      const payload: SubmitExamAttemptAnswersRequest = {
        passage_id: passageIds,
        question_group_ids: questionGroupIds,
        item_ids: itemIds,
        answers: transformedAnswers,
        duration: duration,
      };

      console.log('Submitting exam with payload:', payload);

      // Submit the exam attempt
      const result = await submitExamAttempt({
        attemptId: examData.exam_attempt_id,
        payload: payload,
      });

      // Close modal on success
      setIsModalOpen(false);

      // Store result and show result screen
      if (result) {
        setExamResult(result);
        setShowResult(true);
      } else {
        // Fallback if no result is returned
        alert('Exam submitted successfully!');
        router.push('/exams');
      }
    } catch (error) {
      console.error('Error submitting exam:', error);

      // Show specific error message if available
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      alert(`Failed to submit exam: ${errorMessage}`);

      // Close modal to allow user to retry
      setIsModalOpen(false);
    }
  };

  const handleAnswerChange = (params: HandleAnswerChangeParams) => {
    setAnswers((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        [params.questionId]: {
          answer_id: params.answer_id,
          questionType: params.questionType,
          questionOrder: params.questionOrder,
          content: params.content,
        },
      },
    }));
  };

  const totalQuestions = getTotalQuestions();
  const answeredQuestions = getAnsweredQuestions();
  const notAnsweredQuestions = getNotAnsweredQuestions();
  const progressPercentage = (answeredQuestions / totalQuestions) * 100;

  // Timer color based on remaining time
  const getTimerColor = () => {
    if (timeLeft <= 300) return 'text-persimmon-600'; // Last 5 minutes - red
    if (timeLeft <= 600) return 'text-tangerine-600'; // Last 10 minutes - orange
    return 'text-tekhelet-600'; // Normal - blue
  };

  return (
    <>
      {/* Show result screen if exam is completed */}
      {showResult && examResult ? (
        <ExamResult
          result={examResult}
          examName={examData.reading_exam.reading_exam_name}
          examDescription={examData.reading_exam.reading_exam_description}
        />
      ) : (
        <>
          <ConfirmSubmitModal
            isOpen={isModalOpen}
            setIsOpen={(open) => {
              // Prevent closing modal while submitting
              if (!isLoading.submitExamAttempt) {
                setIsModalOpen(open);
              }
            }}
            onConfirm={handleSubmit}
            onCancel={() => {
              // Prevent canceling while submitting
              if (!isLoading.submitExamAttempt) {
                setIsModalOpen(false);
              }
            }}
            title='Submit Exam'
            description={`Are you sure you want to submit your exam? ${
              notAnsweredQuestions.length > 0
                ? `You have ${notAnsweredQuestions.length} unanswered questions. These will not be graded.`
                : 'All questions answered!'
            }`}
            confirmText={isLoading.submitExamAttempt ? 'Submitting...' : 'Submit'}
            cancelText={isLoading.submitExamAttempt ? 'Please wait...' : 'Cancel'}
          />

          <div className='h-screen w-full grid grid-rows-[auto_1fr] bg-medium-slate-blue-900'>
            {/* Header with timer and exam info */}
            <div className='bg-white border-b shadow-sm'>
              <div className='grid grid-cols-2 md:grid-cols-3 items-center p-4'>
                <div className='col-span-1'>
                  <h1 className='text-xl font-bold text-tekhelet-600'>
                    {examData.reading_exam.reading_exam_name}
                  </h1>
                  <p className='text-sm text-medium-slate-blue-400 mt-1'>
                    {examData.reading_exam.reading_exam_description}
                  </p>
                </div>

                <div className='col-span-1 flex items-center gap-6 justify-center'>
                  {/* Progress indicator */}
                  <div className='flex items-center gap-2'>
                    <BookOpen className='w-4 h-4 text-medium-slate-blue-400' />
                    <span className='text-sm font-medium text-tekhelet-600'>
                      {answeredQuestions}/{totalQuestions} questions
                    </span>
                  </div>

                  {/* Timer */}
                  <div
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 ${
                      timeLeft <= 300
                        ? 'border-persimmon-300 bg-persimmon-50'
                        : timeLeft <= 600
                          ? 'border-tangerine-300 bg-tangerine-50'
                          : 'border-tekhelet-300 bg-tekhelet-50'
                    }`}
                  >
                    <Clock className={`w-5 h-5 ${getTimerColor()}`} />
                    <span className={`text-lg font-bold ${getTimerColor()}`}>
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                </div>

                <div className='col-span-1 flex justify-end'>
                  {/* Submit button */}
                  <Button
                    onClick={() => setIsModalOpen(true)}
                    className='bg-tekhelet-600 hover:bg-tekhelet-700 text-white'
                    size='lg'
                    disabled={isLoading.submitExamAttempt}
                  >
                    {isLoading.submitExamAttempt ? 'Submitting...' : 'Submit Exam'}
                  </Button>
                </div>
              </div>

              {/* Progress bar */}
              <div className='px-4 pb-3'>
                <Progress value={progressPercentage} className='h-2' />
                <div className='flex justify-between text-xs text-medium-slate-blue-400 mt-1'>
                  <span>Progress: {Math.round(progressPercentage)}%</span>
                  {notAnsweredQuestions.length > 0 && (
                    <span className='flex items-center gap-1 text-tangerine-400'>
                      <AlertTriangle className='w-3 h-3' />
                      {notAnsweredQuestions.length} unanswered
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Main content with tabs */}
            <div className='flex overflow-hidden'>
              <Tabs value={activeTab} onValueChange={setActiveTab} className='h-full flex flex-col'>
                {/* Part navigation */}
                <div className='bg-white border-b px-4 py-2 flex-shrink-0'>
                  <TabsList className='grid w-full max-w-md grid-cols-3'>
                    {parts.map((part) => (
                      <TabsTrigger
                        key={part.key}
                        value={part.key}
                        className='data-[state=active]:bg-tekhelet-500 data-[state=active]:text-tangerine-600'
                      >
                        {part.title}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>

                {/* Content for each part */}
                {parts.map((part) => (
                  <TabsContent key={part.key} value={part.key} className='flex-1 overflow-hidden'>
                    <div className='h-full grid grid-cols-12 gap-4 p-4'>
                      {/* Passage Column */}
                      <Card className='bg-white rounded-lg shadow-sm overflow-hidden flex flex-col col-span-5 border-tekhelet-200 h-full'>
                        <CardHeader className='bg-tekhelet-50 flex-shrink-0'>
                          <CardTitle className='text-center text-lg text-medium-slate-blue-400'>
                            {part.title} - Reading Passage
                          </CardTitle>
                        </CardHeader>
                        <CardContent className='flex-1 overflow-y-auto p-4 min-h-0'>
                          <PassageBox content={part.data.content} />
                        </CardContent>
                      </Card>

                      {/* Questions Column */}
                      <Card className='bg-white rounded-lg shadow-sm overflow-hidden flex flex-col col-span-5 border-medium-slate-blue-200 h-full'>
                        <CardHeader className='bg-medium-slate-blue-50 flex-shrink-0'>
                          <CardTitle className='text-center text-lg text-medium-slate-blue-400'>
                            {part.title} - Questions
                          </CardTitle>
                        </CardHeader>
                        <CardContent className='flex-1 overflow-y-auto p-4 min-h-0'>
                          <QuestionRenderer
                            questionGroups={part.data.question_groups}
                            onAnswerChange={handleAnswerChange}
                            answers={answers[part.key] || {}}
                          />
                        </CardContent>
                      </Card>

                      {/* Navigation and status */}
                      <Card className='col-span-2 flex flex-col border-selective-yellow-300 h-full'>
                        <CardHeader className='bg-selective-yellow-50 flex-shrink-0'>
                          <CardTitle className='text-center text-sm text-selective-yellow-300'>
                            Exam Status
                          </CardTitle>
                        </CardHeader>
                        <CardContent className='flex-1 space-y-4 overflow-y-auto p-4 min-h-0'>
                          {/* Part progress */}
                          <div className='space-y-2'>
                            <h4 className='font-medium text-sm text-tekhelet-600'>
                              {part.title} Progress
                            </h4>
                            {parts.map((p) => {
                              const partAnswers = answers[p.key] || {};
                              const partTotal = p.data.question_groups.reduce(
                                (total, group) => total + group.questions.length,
                                0
                              );
                              const partAnswered = Object.values(partAnswers).filter((answer) => {
                                if (Array.isArray(answer.answer_id)) {
                                  return answer.answer_id.length > 0;
                                }
                                return answer.answer_id.toString().trim() !== '';
                              }).length;

                              return (
                                <div key={p.key} className='flex justify-between text-xs'>
                                  <span
                                    className={
                                      p.key === activeTab
                                        ? 'font-semibold text-tekhelet-600'
                                        : 'text-medium-slate-blue-400'
                                    }
                                  >
                                    {p.title}
                                  </span>
                                  <span
                                    className={
                                      p.key === activeTab
                                        ? 'font-semibold text-tekhelet-600'
                                        : 'text-medium-slate-blue-400'
                                    }
                                  >
                                    {partAnswered}/{partTotal}
                                  </span>
                                </div>
                              );
                            })}
                          </div>

                          {/* Navigation buttons */}
                          <div className='space-y-2'>
                            {parts.map((p, index) => (
                              <Button
                                key={p.key}
                                variant={p.key === activeTab ? 'default' : 'outline'}
                                size='sm'
                                onClick={() => setActiveTab(p.key)}
                                className={`w-full ${
                                  p.key === activeTab
                                    ? 'bg-tekhelet-600 hover:bg-tekhelet-700'
                                    : 'border-tekhelet-300 text-tekhelet-600 hover:bg-tekhelet-50'
                                }`}
                              >
                                Go to {p.title}
                              </Button>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default TakeExam;
