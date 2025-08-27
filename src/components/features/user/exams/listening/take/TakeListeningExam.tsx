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
  const audioRef = useRef<HTMLAudioElement>(null);

  // 30 minutes = 1800 seconds for listening exam
  const EXAM_DURATION = 30 * 60;
  const timeLeft = useDecrementTimer(EXAM_DURATION, startTime);
  const router = useRouter();
  const { submitListeningExamAnswers, isLoading } = useListeningExam();

  // Preload all audios for each part on mount using SWR
  const part1AudioId = examData.listening_exam.listening_task_id_part1?.audio_file_id ?? null;
  const part2AudioId = examData.listening_exam.listening_task_id_part2?.audio_file_id ?? null;
  const part3AudioId = examData.listening_exam.listening_task_id_part3?.audio_file_id ?? null;
  const part4AudioId = examData.listening_exam.listening_task_id_part4?.audio_file_id ?? null;

  const audioPart1 = useListeningAudio(part1AudioId);
  const audioPart2 = useListeningAudio(part2AudioId);
  const audioPart3 = useListeningAudio(part3AudioId);
  const audioPart4 = useListeningAudio(part4AudioId);

  const audioByPart: Record<string, { objectUrl: string | undefined; isLoading: boolean }> = {
    part1: { objectUrl: audioPart1.objectUrl, isLoading: audioPart1.isLoading },
    part2: { objectUrl: audioPart2.objectUrl, isLoading: audioPart2.isLoading },
    part3: { objectUrl: audioPart3.objectUrl, isLoading: audioPart3.isLoading },
    part4: { objectUrl: audioPart4.objectUrl, isLoading: audioPart4.isLoading },
  };

  // Initialize answers and start timer when component mounts
  useEffect(() => {
    setAnswers(initialAnswers);
    setStartTime(true);
  }, [initialAnswers]);

  // All audios are preloaded above via SWR hooks; no per-tab fetch needed

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

            let selectedAnswers: string[] | null = null;
            if (answer) {
              if (Array.isArray(answer.answer_id)) {
                const filtered = answer.answer_id.filter((id) => id && id.trim() !== '');
                selectedAnswers = filtered.length > 0 ? filtered : null;
              } else {
                const answerStr = answer.answer_id.toString().trim();
                selectedAnswers = answerStr !== '' ? [answerStr] : null;
              }
            }

            // Get all choice IDs for multiple choice questions
            const choiceIds: string[] = [];
            if (question.choices && question.choices.length > 0) {
              choiceIds.push(...question.choices.map((choice) => choice.choice_id));
            }

            // Always include the question in payload
            transformedAnswers.push({
              question_id: question.question_id,
              selected_answers: selectedAnswers,
              choice_ids: choiceIds,
            });
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
        router.push(`/history/exams/details?mode=listening&examId=${examData.exam_attempt_id}`);
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
          centerColClassName='col-span-5'
          rightColClassName='col-span-2'
          glass
          renderLeftColumn={(part) => (
            <>
              <CardHeader className='flex-shrink-0 backdrop-blur-md rounded-t-2xl'>
                <CardTitle className='text-center text-lg text-tekhelet-400 flex items-center justify-center gap-2'>
                  {part.title} - Audio
                </CardTitle>
              </CardHeader>
              <CardContent className='flex-1 px-6 space-y-4 min-h-0 overflow-y-auto'>
                {/* Audio Info */}
                <div className='space-y-2'>
                  <h3 className='font-semibold text-tekhelet-400'>{part.data.title}</h3>
                  <p className='text-sm text-tekhelet-500'>{part.data.instruction}</p>
                </div>

                {audioByPart[part.key]?.objectUrl ? (
                  <>
                    <audio
                      ref={audioRef}
                      src={audioByPart[part.key]?.objectUrl}
                      preload='metadata'
                      controls
                      controlsList='nodownload'
                      className='w-full'
                    />
                  </>
                ) : (
                  <div className='text-center text-selective-yellow-300'>
                    {audioByPart[part.key]?.isLoading ? 'Loading audio...' : 'No audio available'}
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
