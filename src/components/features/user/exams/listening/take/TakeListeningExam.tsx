'use client';

import ConfirmSubmitModal from '@/components/features/user/reading/finish/ConfirmSubmitModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useListeningAudio from '@/hooks/apis/listening/useListeningAudio';
import { useListeningExam } from '@/hooks/apis/listening/useListeningExam';
import { formatTime, useDecrementTimer } from '@/hooks/utils/useTimer';
import {
  StartListeningExamResponse,
  SubmitListeningExamAttemptAnswersRequest,
} from '@/types/listening/listening-exam.types';
import { SubmitExamAnswerRequest } from '@/types/reading/reading-exam-attempt.types';
import { QuestionTypeEnumIndex } from '@/types/reading/reading.types';
import {
  AlertTriangle,
  Clock,
  Headphones,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import ListeningQuestionRenderer from './components/ListeningQuestionRenderer';

export interface HandleAnswerChangeParams {
  questionId: string;
  answer_id: string | string[];
  questionType: QuestionTypeEnumIndex;
  questionOrder: number;
  content: string;
}

interface TakeListeningExamProps {
  examData: StartListeningExamResponse;
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

const TakeListeningExam = ({ examData, initialAnswers }: TakeListeningExamProps) => {
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

  // Audio controls
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  console.log(initialAnswers);

  // 30 minutes = 1800 seconds for listening exam
  const EXAM_DURATION = 30 * 60;
  const timeLeft = useDecrementTimer(EXAM_DURATION, startTime);

  const router = useRouter();
  const { submitListeningExamAnswers, isLoading } = useListeningExam();
  const { getAudio, audioUrl, isLoading: audioLoading, cleanup } = useListeningAudio();

  console.log(answers);

  // Initialize answers and start timer when component mounts
  useEffect(() => {
    setAnswers(initialAnswers);
    setStartTime(true);
  }, [initialAnswers]);

  // Load audio for current part
  useEffect(() => {
    const loadCurrentPartAudio = async () => {
      const currentPart = parts.find((part) => part.key === activeTab);
      if (currentPart?.data.audio_file_id) {
        try {
          await getAudio(currentPart.data.audio_file_id);
        } catch (error) {
          console.error('Failed to load audio:', error);
        }
      }
    };

    loadCurrentPartAudio();
  }, [activeTab]);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);
    const handleError = () => {
      console.error('Audio playback error');
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [audioUrl]);

  // Auto-submit when time runs out
  useEffect(() => {
    if (timeLeft === 0) {
      handleSubmit();
    }
  }, [timeLeft]);

  const parts = [
    {
      key: 'part1',
      data: examData.listening_exam.listening_task_id_part1,
      title: 'Part 1',
    },
    {
      key: 'part2',
      data: examData.listening_exam.listening_task_id_part2,
      title: 'Part 2',
    },
    {
      key: 'part3',
      data: examData.listening_exam.listening_task_id_part3,
      title: 'Part 3',
    },
    {
      key: 'part4',
      data: examData.listening_exam.listening_task_id_part4,
      title: 'Part 4',
    },
  ];

  const currentPart = parts.find((part) => part.key === activeTab);

  // Audio control functions
  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch((error) => {
        console.error('Error playing audio:', error);
        setIsPlaying(false);
      });
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = (parseFloat(e.target.value) / 100) * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    const newVolume = parseFloat(e.target.value) / 100;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    if (audio) {
      audio.volume = newVolume;
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = volume;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const restartAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = 0;
    setCurrentTime(0);
  };

  // Calculate total questions and answered questions
  const getTotalQuestions = () => {
    let total = 0;
    parts.forEach((part) => {
      const partQuestions = part.data.question_groups || [];
      partQuestions.forEach((group) => {
        if (Array.isArray(group.questions)) {
          total += group.questions.length;
        }
      });
    });
    return total || 40; // Fallback to 40 for standard IELTS listening
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
      const partQuestions = part.data.question_groups || [];
      const partAnswers = answers[part.key] || {};

      partQuestions.forEach((group) => {
        if (Array.isArray(group.questions)) {
          group.questions.forEach((question: any) => {
            const answer = partAnswers[question.question_id];
            const hasAnswer =
              answer &&
              ((Array.isArray(answer.answer_id) && answer.answer_id.length > 0) ||
                (!Array.isArray(answer.answer_id) && answer.answer_id.toString().trim() !== ''));

            if (!hasAnswer) {
              notAnswered.push({
                part: part.key,
                questionId: question.question_id,
              });
            }
          });
        }
      });
    });
    return notAnswered;
  };

  const handleSubmit = async () => {
    try {
      // Transform answers data to match the required payload format
      const transformedAnswers: SubmitExamAnswerRequest[] = [];
      const questionGroupIds: string[] = [];
      const itemIds: string[] = [];
      const listeningTaskIds: string[] = [];

      if (examData.listening_exam.listening_task_id_part1.task_id) {
        listeningTaskIds.push(examData.listening_exam.listening_task_id_part1.task_id);
      }
      if (examData.listening_exam.listening_task_id_part2.task_id) {
        listeningTaskIds.push(examData.listening_exam.listening_task_id_part2.task_id);
      }
      if (examData.listening_exam.listening_task_id_part3.task_id) {
        listeningTaskIds.push(examData.listening_exam.listening_task_id_part3.task_id);
      }
      if (examData.listening_exam.listening_task_id_part4.task_id) {
        listeningTaskIds.push(examData.listening_exam.listening_task_id_part4.task_id);
      }
      // parts.forEach((part) => {
      //   const partAnswers = answers[part.key] || {};
      //   const partQuestionGroups = part.data.question_groups || [];

      //   // Collect question group IDs
      //   partQuestionGroups.forEach((group) => {
      //     questionGroupIds.push(group.question_group_id);
      //   });

      //   // Process answers for this part
      //   Object.entries(partAnswers).forEach(([questionId, answer]) => {
      //     if (answer) {
      //       let choices: string[] = [];
      //       let data_filled: string | null = null;
      //       const data_matched: string | null = null;
      //       const drag_item_id: string | null = null;

      //       if (Array.isArray(answer.answer_id)) {
      //         choices = answer.answer_id;
      //       } else {
      //         const answerString = answer.answer_id.toString().trim();
      //         if (answerString) {
      //           // Determine type based on question type
      //           switch (answer.questionType) {
      //             case QuestionTypeEnumIndex.MULTIPLE_CHOICE:
      //               choices = [answerString];
      //               break;
      //             case QuestionTypeEnumIndex.MATCHING:
      //               data_filled = answerString;
      //               break;
      //             case QuestionTypeEnumIndex.DRAG_AND_DROP:
      //               itemIds.push(answerString);
      //               break;
      //             default:
      //               data_filled = answerString;
      //           }
      //         }
      //       }

      //       transformedAnswers.push({
      //         question_id: questionId,
      //         choice_ids: choices,
      //         selected_answers
      //       });
      //     }
      //   });
      // });

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
          group.questions!.forEach((question) => {
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
      const examDuration = EXAM_DURATION - timeLeft;

      // Prepare the submission payload with required fields
      const payload: SubmitListeningExamAttemptAnswersRequest = {
        task_id: listeningTaskIds,
        question_group_ids: questionGroupIds,
        item_ids: itemIds,
        answers: transformedAnswers,
        duration: examDuration,
      };
      const result = await submitListeningExamAnswers({
        attempt_id: examData.exam_attempt_id,
        payload: payload,
      });
      setIsModalOpen(false);

      if (result) {
        router.push(`/exams/listening/details?mode=listening&examId=${examData.exam_attempt_id}`);
      }
    } catch (error) {
      console.error('Error submitting listening exam:', error);
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
  const progressPercentage = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

  const formatAudioTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <ConfirmSubmitModal
        isOpen={isModalOpen}
        setIsOpen={(open) => {
          if (!isLoading) {
            setIsModalOpen(open);
          }
        }}
        onConfirm={handleSubmit}
        onCancel={() => {
          if (!isLoading) {
            setIsModalOpen(false);
          }
        }}
        title='Submit Listening Exam'
        description={`Are you sure you want to submit your listening exam? ${
          notAnsweredQuestions.length > 0
            ? `You have ${notAnsweredQuestions.length} unanswered questions.`
            : 'All questions answered!'
        }`}
        confirmText={isLoading ? 'Submitting...' : 'Submit'}
        cancelText={isLoading ? 'Please wait...' : 'Cancel'}
      />

      <div className='h-screen w-full grid grid-rows-[auto_1fr] bg-medium-slate-blue-900'>
        {/* Header with timer and exam info */}
        <div className='bg-white/80 backdrop-blur-lg border-b border-tekhelet-200 shadow-sm'>
          <div className='grid grid-cols-1 md:grid-cols-3 items-center p-4 gap-4'>
            <div className='col-span-1'>
              <h2 className='text-lg font-semibold text-tekhelet-600'>
                {examData.listening_exam.listening_exam_name}
              </h2>
              <p className='text-sm text-medium-slate-blue-500'>IELTS Listening Exam</p>
            </div>

            <div className='col-span-1 flex items-center gap-4 justify-center'>
              <div className='flex items-center gap-2 bg-white/60 backdrop-blur-md rounded-lg px-3 py-2'>
                <Clock className='w-4 h-4 text-tekhelet-600' />
                <span
                  className={`font-mono text-lg ${
                    timeLeft < 300 ? 'text-persimmon-400' : 'text-tekhelet-600'
                  }`}
                >
                  {formatTime(timeLeft)}
                </span>
              </div>

              {timeLeft < 300 && (
                <div className='flex items-center gap-2 text-persimmon-400 bg-persimmon-100/60 backdrop-blur-md rounded-lg px-3 py-2'>
                  <AlertTriangle className='w-4 h-4' />
                  <span className='text-sm font-medium'>Time Running Out!</span>
                </div>
              )}
            </div>

            <div className='col-span-1 flex justify-end gap-2'>
              <Button
                variant='outline'
                onClick={() => setIsModalOpen(true)}
                disabled={isLoading}
                className='bg-tekhelet-600 backdrop-blur-md border-tekhelet-300 text-white hover:bg-tekhelet-50'
              >
                Submit Exam
              </Button>
            </div>
          </div>

          {/* Progress bar */}
          <div className='px-4 pb-4'>
            <div className='flex justify-between text-sm text-medium-slate-blue-500 mb-2'>
              <span>
                Progress: {answeredQuestions}/{totalQuestions} questions
              </span>
              <span>{Math.round(progressPercentage)}% complete</span>
            </div>
            <Progress value={progressPercentage} className='h-2' />
          </div>
        </div>

        {/* Main content */}
        <div className='flex-1 overflow-hidden p-6'>
          <Tabs value={activeTab} onValueChange={setActiveTab} className='h-full flex flex-col'>
            <TabsList className='bg-white/80 backdrop-blur-lg border rounded-xl p-1 mb-4'>
              {parts.map((part) => (
                <TabsTrigger
                  key={part.key}
                  value={part.key}
                  className='data-[state=active]:bg-tekhelet-600 data-[state=active]:text-white px-6'
                >
                  {part.title}
                </TabsTrigger>
              ))}
            </TabsList>

            {parts.map((part) => (
              <TabsContent key={part.key} value={part.key} className='flex-1 mt-0'>
                <div className='grid grid-cols-12 gap-6 h-[calc(100vh-250px)]'>
                  {/* Audio Controls Column */}
                  <Card className='backdrop-blur-lg border rounded-2xl shadow-xl overflow-hidden flex flex-col col-span-4'>
                    <CardHeader className='flex-shrink-0 backdrop-blur-md rounded-t-2xl'>
                      <CardTitle className='text-center text-lg text-tekhelet-400 flex items-center justify-center gap-2'>
                        <Headphones className='w-5 h-5' />
                        Audio Controls
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='flex-1 p-6 space-y-4'>
                      {/* Audio Info */}
                      <div className='text-center space-y-2'>
                        <h3 className='font-semibold text-tekhelet-600'>{part.data.title}</h3>
                        <p className='text-sm text-medium-slate-blue-500'>
                          {part.data.instruction}
                        </p>
                      </div>

                      {/* Audio Player */}
                      {audioUrl ? (
                        <>
                          <audio ref={audioRef} src={audioUrl} preload='metadata' />

                          {/* Play/Pause and Restart Controls */}
                          <div className='flex justify-center gap-3'>
                            <Button
                              onClick={togglePlayPause}
                              size='lg'
                              className='bg-tekhelet-600 hover:bg-tekhelet-700 text-white rounded-full w-14 h-14'
                            >
                              {isPlaying ? (
                                <Pause className='w-6 h-6' />
                              ) : (
                                <Play className='w-6 h-6 ml-1' />
                              )}
                            </Button>
                            <Button
                              onClick={restartAudio}
                              variant='outline'
                              size='lg'
                              className='rounded-full w-14 h-14 border-tekhelet-300 text-tekhelet-600'
                            >
                              <RotateCcw className='w-5 h-5' />
                            </Button>
                          </div>

                          {/* Progress Bar */}
                          <div className='space-y-2'>
                            <input
                              type='range'
                              min='0'
                              max='100'
                              value={duration > 0 ? (currentTime / duration) * 100 : 0}
                              onChange={handleSeek}
                              className='w-full h-2 bg-tekhelet-200 rounded-lg appearance-none cursor-pointer slider'
                            />
                            <div className='flex justify-between text-xs text-medium-slate-blue-500'>
                              <span>{formatAudioTime(currentTime)}</span>
                              <span>{formatAudioTime(duration)}</span>
                            </div>
                          </div>

                          {/* Volume Control */}
                          <div className='flex items-center gap-3'>
                            <Button
                              onClick={toggleMute}
                              variant='ghost'
                              size='sm'
                              className='text-tekhelet-600'
                            >
                              {isMuted ? (
                                <VolumeX className='w-4 h-4' />
                              ) : (
                                <Volume2 className='w-4 h-4' />
                              )}
                            </Button>
                            <input
                              type='range'
                              min='0'
                              max='100'
                              value={isMuted ? 0 : volume * 100}
                              onChange={handleVolumeChange}
                              className='flex-1 h-2 bg-tekhelet-200 rounded-lg appearance-none cursor-pointer slider'
                            />
                          </div>
                        </>
                      ) : (
                        <div className='text-center text-medium-slate-blue-500'>
                          {audioLoading ? 'Loading audio...' : 'No audio available'}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Questions Column */}
                  <Card className='bg-white/80 backdrop-blur-lg border rounded-2xl shadow-xl overflow-hidden flex flex-col col-span-6 h-full'>
                    <CardHeader className='flex-shrink-0 backdrop-blur-md rounded-t-2xl'>
                      <CardTitle className='text-center text-lg text-tekhelet-400'>
                        Questions - {part.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='flex-1 overflow-y-auto p-6 min-h-0'>
                      {part.data.question_groups && part.data.question_groups.length > 0 ? (
                        <ListeningQuestionRenderer
                          questionGroups={part.data.question_groups}
                          answers={answers[part.key] || {}}
                          onAnswerChange={handleAnswerChange}
                        />
                      ) : (
                        <div className='text-center text-medium-slate-blue-500 p-8'>
                          <div className='space-y-3'>
                            <Headphones className='w-12 h-12 mx-auto text-tekhelet-400' />
                            <h3 className='text-lg font-semibold text-tekhelet-600'>
                              Listening Questions for {part.title}
                            </h3>
                            <p className='text-sm text-medium-slate-blue-500'>
                              No questions available for this part.
                            </p>
                            {process.env.NODE_ENV === 'development' && (
                              <div className='text-xs text-medium-slate-blue-400 bg-yellow-100/50 rounded-lg p-3 mt-2'>
                                <p>
                                  <strong>Debug Info:</strong>
                                </p>
                                <p>Task ID: {part.data.task_id}</p>
                                <p>
                                  Questions available:{' '}
                                  {part.data.question_groups ? part.data.question_groups.length : 0}
                                </p>
                              </div>
                            )}
                            <div className='text-xs text-medium-slate-blue-400 bg-tekhelet-100/50 rounded-lg p-3'>
                              <p>
                                <strong>Instructions:</strong> {part.data.instruction}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Status Column */}
                  <Card className='col-span-2 flex flex-col border backdrop-blur-lg rounded-2xl shadow-xl h-fit'>
                    <CardHeader className='flex-shrink-0 backdrop-blur-md rounded-t-2xl'>
                      <CardTitle className='text-center text-xl text-selective-yellow-300'>
                        Progress
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='flex-1 space-y-4 overflow-y-auto p-4 min-h-0'>
                      {/* Time Info */}
                      <div className='space-y-2'>
                        <h4 className='font-medium text-sm text-tekhelet-600'>Time Remaining</h4>
                        <div className='text-lg font-mono text-tekhelet-400'>
                          {formatTime(timeLeft)}
                        </div>
                      </div>

                      {/* Progress Info */}
                      <div className='space-y-2'>
                        <h4 className='font-medium text-sm text-tekhelet-600'>Progress</h4>
                        <div className='space-y-1 text-xs'>
                          <div className='flex justify-between'>
                            <span className='text-medium-slate-blue-500'>Answered:</span>
                            <span className='text-tekhelet-600 font-medium'>
                              {answeredQuestions}
                            </span>
                          </div>
                          <div className='flex justify-between'>
                            <span className='text-medium-slate-blue-500'>Remaining:</span>
                            <span className='text-tekhelet-600 font-medium'>
                              {totalQuestions - answeredQuestions}
                            </span>
                          </div>
                          <div className='flex justify-between'>
                            <span className='text-medium-slate-blue-500'>Total:</span>
                            <span className='text-tekhelet-600 font-medium'>{totalQuestions}</span>
                          </div>
                        </div>
                      </div>

                      {/* Tips */}
                      <div className='space-y-2'>
                        <h4 className='font-medium text-sm text-tekhelet-600'>Tips</h4>
                        <div className='text-xs text-medium-slate-blue-500 space-y-1'>
                          <p>• Listen carefully to the audio</p>
                          <p>• You can replay the audio anytime</p>
                          <p>• Take notes while listening</p>
                          <p>• Review your answers before submitting</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>

      {/* Custom slider styles */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--color-tekhelet-600);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--color-tekhelet-600);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </>
  );
};

export default TakeListeningExam;
