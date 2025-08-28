'use client';

import {
  ExamStatusPanel,
  ExamTakeHeader,
  ExamTakeShell,
  ExamTakeTabs,
} from '@/components/features/user/exams/common/take';
import { SelectableText } from '@/components/features/user/exams/reading/components/SelectableText';
import ConfirmSubmitModal from '@/components/features/user/reading/finish/ConfirmSubmitModal';
import { QuestionRenderer } from '@/components/features/user/reading/questions';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import useReadingExamAttempt from '@/hooks/apis/reading/useReadingExamAttempt';
import { useDecrementTimer } from '@/hooks/utils/useTimer';
import {
  ReadingExamData,
  SubmitExamAnswerRequest,
  SubmitExamAttemptAnswersRequest,
} from '@/types/reading/reading-exam-attempt.types';
import { QuestionTypeEnumIndex } from '@/types/reading/reading.types';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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

            // Always push the question with either answers or null
            transformedAnswers.push({
              question_id: question.question_id,
              selected_answers: selectedAnswers,
              choice_ids: choiceIds,
            });
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

      // Submit the exam attempt
      const result = await submitExamAttempt({
        attemptId: examData.exam_attempt_id,
        payload: payload,
      });

      setIsModalOpen(false);
      if (result) {
        router.push(`/history/exams/details?mode=reading&examId=${examData.exam_attempt_id}`);
      } else {
        alert('Exam submitted successfully!');
        router.push('/exams');
      }
    } catch (error) {
      console.error('Error submitting exam:', error);

      // Show specific error message if available
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      alert(`Failed to submit exam: ${errorMessage}`);

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
          if (!isLoading.submitExamAttempt) setIsModalOpen(open);
        }}
        onConfirm={handleSubmit}
        onCancel={() => {
          if (!isLoading.submitExamAttempt) setIsModalOpen(false);
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

      <ExamTakeShell
        header={
          <ExamTakeHeader
            title={examData.reading_exam.reading_exam_name || 'Reading Exam'}
            description={examData.reading_exam.reading_exam_description}
            answered={answeredQuestions}
            total={totalQuestions}
            timeLeftSec={timeLeft}
            onSubmit={() => setIsModalOpen(true)}
            submitting={isLoading.submitExamAttempt}
            showUnansweredWarning={notAnsweredQuestions.length > 0}
            unansweredCount={notAnsweredQuestions.length}
            submitText='Submit'
            glass={false}
          />
        }
      >
        <ExamTakeTabs
          parts={parts}
          activeKey={activeTab}
          onChange={setActiveTab}
          renderLeftColumn={(part) => (
            <>
              <CardHeader className='flex-shrink-0'>
                <CardTitle className='text-center text-lg text-medium-slate-blue-400'>
                  {part.title} - {part?.data?.title ?? 'Reading Passage'}
                </CardTitle>
              </CardHeader>
              <CardContent className='flex-1 overflow-y-auto p-4 min-h-0'>
                <SelectableText
                  content={part.data.content}
                  examAttemptId={examData.exam_attempt_id}
                  partKey={part.key}
                  passageId={part.data.passage_id || ''}
                  className='prose prose-sm max-w-none text-tekhelet-600 leading-relaxed'
                />
              </CardContent>
            </>
          )}
          renderCenterColumn={(part) => (
            <>
              <CardHeader className='bg-medium-slate-blue-50 flex-shrink-0'>
                <CardTitle className='text-center text-lg text-medium-slate-blue-400'>
                  {part.title} - Questions
                </CardTitle>
              </CardHeader>
              <CardContent className='flex-1 min-h-0 p-4 overflow-y-auto'>
                <QuestionRenderer
                  questionGroups={part.data.question_groups}
                  onAnswerChange={handleAnswerChange}
                  answers={answers[part.key] || {}}
                />
              </CardContent>
            </>
          )}
          renderRightColumn={() => {
            const partsProgress = parts.map((p) => {
              const partAnswers = answers[p.key] || {};
              const partTotal = p.data.question_groups.reduce(
                (total, group) => total + group.questions.length,
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

export default TakeExam;
