'use client';

import {
  ExamStatusPanel,
  ExamTakeHeader,
  ExamTakeShell,
  ExamTakeTabs,
} from '@/components/features/user/exams/common/take';
import ConfirmSubmitModal from '@/components/features/user/reading/finish/ConfirmSubmitModal';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import useListeningAudio from '@/hooks/apis/listening/useListeningAudio';
import { useListeningExam } from '@/hooks/apis/listening/useListeningExam';
import { useDecrementTimer } from '@/hooks/utils/useTimer';
import {
  StartListeningExamResponse,
  SubmitListeningExamAttemptAnswersRequest,
} from '@/types/listening/listening-exam.types';
import { SubmitExamAnswerRequest } from '@/types/reading/reading-exam-attempt.types';
import { QuestionTypeEnumIndex } from '@/types/reading/reading.types';
import { Headphones } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
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
  const [audioId, setAudioId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // 30 minutes = 1800 seconds for listening exam
  const EXAM_DURATION = 30 * 60;
  const timeLeft = useDecrementTimer(EXAM_DURATION, startTime);
  const router = useRouter();
  const { submitListeningExamAnswers, isLoading } = useListeningExam();
  const { error, isLoading: audioLoading, mutate, objectUrl } = useListeningAudio(audioId);

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
          setAudioId(currentPart.data.audio_file_id);
        } catch (error) {
          console.error('Failed to load audio:', error);
        }
      }
    };

    loadCurrentPartAudio();
  }, [activeTab]);

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

      <ExamTakeShell
        header={
          <ExamTakeHeader
            title={examData.listening_exam.listening_exam_name}
            description={'IELTS Listening Exam'}
            answered={answeredQuestions}
            total={totalQuestions}
            timeLeftSec={timeLeft}
            onSubmit={() => setIsModalOpen(true)}
            submitting={!!isLoading}
            showUnansweredWarning={notAnsweredQuestions.length > 0}
            unansweredCount={notAnsweredQuestions.length}
            submitText='Submit Exam'
          />
        }
      >
        <ExamTakeTabs
          parts={parts}
          activeKey={activeTab}
          onChange={setActiveTab}
          // Listening layout: 4-6-2 columns
          gridClassName='gap-6 p-6'
          leftColClassName='col-span-4'
          centerColClassName='col-span-6'
          rightColClassName='col-span-2'
          glass
          renderLeftColumn={(part) => (
            <>
              <CardHeader className='flex-shrink-0 backdrop-blur-md rounded-t-2xl'>
                <CardTitle className='text-center text-lg text-tekhelet-400 flex items-center justify-center gap-2'>
                  <Headphones className='w-5 h-5' />
                  Audio Controls
                </CardTitle>
              </CardHeader>
              <CardContent className='flex-1 p-6 space-y-4 min-h-0 overflow-y-auto'>
                {/* Audio Info */}
                <div className='text-center space-y-2'>
                  <h3 className='font-semibold text-tekhelet-600'>{part.data.title}</h3>
                  <p className='text-sm text-medium-slate-blue-500'>{part.data.instruction}</p>
                </div>

                {objectUrl ? (
                  <>
                    <audio
                      ref={audioRef}
                      src={objectUrl}
                      preload='metadata'
                      controls
                      controlsList='nodownload'
                    />
                  </>
                ) : (
                  <div className='text-center text-medium-slate-blue-500'>
                    {audioLoading ? 'Loading audio...' : 'No audio available'}
                  </div>
                )}
              </CardContent>
            </>
          )}
          renderCenterColumn={(part) => (
            <>
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
                    </div>
                  </div>
                )}
              </CardContent>
            </>
          )}
          renderRightColumn={() => {
            const partsProgress = parts.map((p) => {
              const partAnswers = answers[p.key] || {};
              const groups = p.data.question_groups || [];
              const partTotal = groups.reduce(
                (t: number, g: any) => t + (g.questions?.length || 0),
                0
              );
              const partAnswered = Object.values(partAnswers).filter((answer: any) =>
                Array.isArray(answer.answer_id)
                  ? answer.answer_id.length > 0
                  : answer.answer_id.toString().trim() !== ''
              ).length;
              return {
                key: p.key,
                title: p.title,
                answered: partAnswered,
                total: partTotal,
              };
            });

            return (
              <ExamStatusPanel
                parts={partsProgress}
                activeKey={activeTab}
                onNavigate={setActiveTab}
              />
            );
          }}
        />
      </ExamTakeShell>
    </>
  );
};

export default TakeListeningExam;
