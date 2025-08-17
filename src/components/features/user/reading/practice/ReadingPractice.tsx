'use client';

import {
  PracticeContentRenderer,
  PracticeHeader,
  PracticeShell,
} from '@/components/features/user/common/take';
import PassageBox from '@/components/features/user/reading/PassageBox';
import ConfirmSubmitModal from '@/components/features/user/reading/finish/ConfirmSubmitModal';
import FinishScreen from '@/components/features/user/reading/finish/FinishScreen';
import { QuestionRenderer } from '@/components/features/user/reading/questions';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import useReadingAttempt from '@/hooks/apis/reading/useReadingAttempt';
import { useIncrementalTimer } from '@/hooks/utils/useTimer';
import { AttemptData, DataResponse } from '@/types/attempt.types';
import { QuestionTypeEnumIndex } from '@/types/reading/reading.types';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
// import { useUnloadSubmit } from "@/hooks/utils/useUnloadSubmit";

export interface HandleAnswerChangeParams {
  questionId: string;
  answer_id: string | string[];
  questionType: QuestionTypeEnumIndex;
  questionOrder: number;
  content: string;
}

interface ReadingPracticeProps {
  passages: AttemptData;
  initialAnswers: Record<
    string,
    {
      answer_id: string | string[];
      questionType: QuestionTypeEnumIndex;
      questionOrder: number;
      content: string;
    }
  >;
  initialDuration: number;
}

const ReadingPractice = ({ passages, initialAnswers, initialDuration }: ReadingPracticeProps) => {
  const [answers, setAnswers] =
    useState<
      Record<
        string,
        {
          answer_id: string | string[];
          questionType: QuestionTypeEnumIndex;
          questionOrder: number;
          content: string;
        }
      >
    >(initialAnswers);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<boolean>(false);
  const [submittedData, setSubmittedData] = useState<DataResponse>();
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const time = useIncrementalTimer(initialDuration, startTime);
  const { submitAttempt, saveAttemptProgress } = useReadingAttempt();
  const router = useRouter();

  // Initialize answers when initialAnswers prop changes
  useEffect(() => {
    setAnswers(initialAnswers);
    setStartTime(true); // Start the timer when component mounts
  }, [initialAnswers]);

  const totalQuestions = useMemo(
    () =>
      passages?.question_groups?.reduce(
        (acc, g) => acc + (g?.questions ? g.questions.length : 0),
        0
      ) || 0,
    [passages]
  );

  const notAnsweredQuestions = useMemo(
    () =>
      passages?.question_groups?.flatMap(
        (g) =>
          g?.questions?.filter((q: any) => {
            const a = answers[q.question_id];
            if (!a) return true;
            if (Array.isArray(a.answer_id)) return a.answer_id.length === 0;
            return a.answer_id.toString().trim() === '';
          }) || []
      ) || [],
    [answers, passages]
  );

  const answeredCount = totalQuestions - notAnsweredQuestions.length;

  const buildPayload = () => ({
    answers: Object.entries(answers).map(([questionId, { answer_id: answer, questionType }]) => ({
      question_id: questionId,
      choices:
        questionType === QuestionTypeEnumIndex.MULTIPLE_CHOICE && answer
          ? Array.isArray(answer)
            ? answer.filter((a) => a.trim() !== '')
            : answer.toString().trim() !== ''
              ? [answer]
              : null
          : null,
      data_filled:
        questionType === QuestionTypeEnumIndex.FILL_IN_THE_BLANKS && answer
          ? Array.isArray(answer)
            ? answer.join(', ')
            : answer
          : null,
      drag_item_id:
        questionType === QuestionTypeEnumIndex.DRAG_AND_DROP && answer
          ? Array.isArray(answer)
            ? answer.join(', ')
            : answer
          : null,
      data_matched:
        questionType === QuestionTypeEnumIndex.MATCHING && answer
          ? Array.isArray(answer)
            ? answer.join(', ')
            : answer
          : null,
    })),
    duration: time,
  });

  const handleSave = async () => {
    if (!passages) return;
    try {
      setSaving(true);
      const payload = buildPayload();
      const res = await saveAttemptProgress({
        attempt_id: passages.attempt_id as string,
        payload,
      });
      if (!res) console.error('Failed to save attempt');
    } catch (e) {
      console.error('Error saving attempt:', e);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!passages) return;
    try {
      setSubmitting(true);
      const payload = buildPayload();
      const res = await submitAttempt({
        attempt_id: passages.attempt_id as string,
        payload,
      });
      if (res) {
        // @ts-ignore
        setSubmittedData(res.data);
        setStartTime(false);
        setIsSubmitted(true);
      } else {
        console.error('Failed to submit attempt');
      }
    } catch (e) {
      console.error('Error submitting attempt:', e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAnswerChange = (params: HandleAnswerChangeParams) => {
    setAnswers((prev) => ({
      ...prev,
      [params.questionId]: {
        answer_id: params.answer_id,
        questionType: params.questionType,
        questionOrder: params.questionOrder,
        content: params.content,
      },
    }));
  };

  if (isSubmitted) {
    return (
      <FinishScreen
        duration={submittedData?.duration}
        key={passages?.attempt_id}
        resultSets={submittedData?.result_sets || []}
        score={submittedData?.result_sets?.filter((r) => r.is_correct).length || 0}
        total={submittedData?.result_sets?.length || 0}
        onHome={() => {
          router.push('/reading');
        }}
        onReview={() => {}}
      />
    );
  }

  const payloadSize = JSON.stringify(buildPayload()).length;
  console.log(payloadSize);

  // useUnloadSubmit({
  //   endpoint: `reading/attempts/submit/${passages.attempt_id}`,
  //   getPayload: buildPayload,
  //   enabled: !isSubmitted,
  //   minIntervalMs: 3000,
  //   closeOnly: true,
  // });

  return (
    <>
      <ConfirmSubmitModal
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        onConfirm={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
        title='Submit Reading Practice'
        description={`Are you sure you want to submit your answers? ${
          notAnsweredQuestions.length > 0
            ? `You have ${notAnsweredQuestions.length} unanswered questions.`
            : 'All questions answered!'
        }`}
        confirmText={submitting ? 'Submitting...' : 'Submit'}
        cancelText={submitting ? 'Please wait...' : 'Cancel'}
      />
      <PracticeShell
        header={
          <PracticeHeader
            title={passages.title}
            description={'IELTS Reading Practice'}
            answered={answeredCount}
            total={totalQuestions}
            timeLeftSec={time}
            onSubmit={() => setIsModalOpen(true)}
            submitting={submitting}
            showUnansweredWarning={notAnsweredQuestions.length > 0}
            unansweredCount={notAnsweredQuestions.length}
            submitText='Submit'
            glass
            onSave={handleSave}
            saving={saving}
          />
        }
      >
        <PracticeContentRenderer
          leftColClassName='col-span-5'
          // passage
          renderLeftColumn={
            <>
              <CardHeader className='flex-shrink-0 bg-medium-slate-blue-50'>
                <CardTitle className='text-center text-lg text-medium-slate-blue-400'>
                  Reading Passage
                </CardTitle>
              </CardHeader>
              <CardContent className='flex-1 overflow-y-auto p-6 min-h-0'>
                <PassageBox content={passages.content} />
              </CardContent>
            </>
          }
          centerColClassName='col-span-5'
          renderCenterColumn={
            <>
              <CardHeader className='bg-medium-slate-blue-50 flex-shrink-0'>
                <CardTitle className='text-center text-lg text-medium-slate-blue-400'>
                  Questions
                </CardTitle>
              </CardHeader>
              <CardContent className='flex-1 overflow-y-auto p-6 min-h-0'>
                <QuestionRenderer
                  questionGroups={passages.question_groups}
                  onAnswerChange={handleAnswerChange}
                  answers={answers}
                />
              </CardContent>
            </>
          }
          rightColClassName='col-span-2'
          renderRightColumn={
            <>
              <CardHeader className='flex-shrink-0 bg-medium-slate-blue-50'>
                <CardTitle className='text-center text-lg text-tekhelet-600'>Progress</CardTitle>
              </CardHeader>
              <CardContent className='flex-1 space-y-4 overflow-y-auto p-4 min-h-0'>
                <div className='space-y-2'>
                  <h4 className='font-semibold text-sm text-tekhelet-600'>Summary</h4>
                  <div className='space-y-1 text-xs'>
                    <div className='flex justify-between'>
                      <span className='text-medium-slate-blue-500'>Answered:</span>
                      <span className='font-medium text-tekhelet-600'>{answeredCount}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-medium-slate-blue-500'>Remaining:</span>
                      <span className='font-medium text-tekhelet-600'>
                        {notAnsweredQuestions.length}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-medium-slate-blue-500'>Total:</span>
                      <span className='font-medium text-tekhelet-600'>{totalQuestions}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </>
          }
        />
      </PracticeShell>
    </>
  );
};

export default ReadingPractice;
