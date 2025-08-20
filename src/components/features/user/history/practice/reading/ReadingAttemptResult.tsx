'use client';

import {
  ExamErrorState,
  ExamLoadingState,
  ExamResultHeader,
  OverallScoreCard,
  PerformanceByPartsCard,
  StatisticsCard,
} from '@/components/features/user/exams/reading/components';
import {
  formatDuration,
  getPerformanceLevel,
} from '@/components/features/user/exams/reading/utils/examUtils';
import useReadingAttempt from '@/hooks/apis/reading/useReadingAttempt';
import { LoadAttemptResponse } from '@/types/attempt.types';
import { useEffect, useState } from 'react';
import { ReadingAttemptInfoCard } from './components/ReadingAttemptInfoCard';
import { ReadingQuestionAnalysis } from './components/ReadingQuestionAnalysis';
import { useReadingPracticeStatistics } from './hooks/useReadingPracticeStatistics';

interface ReadingAttemptResultProps {
  attemptId: string;
}

const ReadingAttemptResult = ({ attemptId }: ReadingAttemptResultProps) => {
  const { getAttemptResultById } = useReadingAttempt();

  const [attemptDetails, setAttemptDetails] = useState<LoadAttemptResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openQuestions, setOpenQuestions] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadAttemptDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getAttemptResultById({ attempt_id: attemptId });
        if (response?.data) {
          setAttemptDetails(response.data as unknown as LoadAttemptResponse);
        } else {
          setError('Failed to load reading attempt details');
        }
      } catch (e) {
        console.error('Error loading reading attempt details:', e);
        setError('An error occurred while loading reading attempt details');
      } finally {
        setIsLoading(false);
      }
    };

    if (attemptId) {
      loadAttemptDetails();
    }
  }, [attemptId]);

  const stats = useReadingPracticeStatistics(attemptDetails);

  const toggleQuestion = (questionId: string) => {
    setOpenQuestions((prev) => {
      const next = new Set(prev);
      next.has(questionId) ? next.delete(questionId) : next.add(questionId);
      return next;
    });
  };

  if (isLoading) return <ExamLoadingState />;
  if (error || !attemptDetails)
    return <ExamErrorState error={error || 'Reading attempt not found'} />;

  const performance = stats
    ? getPerformanceLevel(stats.scorePercentage)
    : { level: 'Unknown', color: 'bg-gray-500 text-white' };

  return (
    <div className='min-h-screen bg-medium-slate-blue-900 p-4'>
      <div className='max-w-6xl mx-auto space-y-6'>
        <ExamResultHeader
          title='Reading Practice Results'
          subtitle='Detailed analysis of your reading practice'
          backUrl='/history/practices/reading'
        />

        <ReadingAttemptInfoCard attemptDetails={attemptDetails} formatDuration={formatDuration} />

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          <OverallScoreCard
            scorePercentage={stats?.scorePercentage || 0}
            correctAnswers={stats?.correctAnswers || 0}
            totalQuestions={stats?.totalQuestions || 0}
            performance={performance}
          />

          <StatisticsCard
            totalPoints={stats?.totalPoints || 0}
            examTotalPoints={stats?.totalQuestions || 0}
            correctAnswers={stats?.correctAnswers || 0}
            incorrectAnswers={stats?.incorrectAnswers || 0}
          />
        </div>

        {stats && <PerformanceByPartsCard partStats={stats.partStats} />}

        <ReadingQuestionAnalysis
          attemptDetails={attemptDetails}
          openQuestions={openQuestions}
          onToggleQuestion={toggleQuestion}
        />
      </div>
    </div>
  );
};

export default ReadingAttemptResult;
