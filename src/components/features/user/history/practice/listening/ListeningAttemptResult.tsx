'use client';

import {
  ExamErrorState,
  ExamLoadingState,
  ExamResultHeader,
  OverallScoreCard,
} from '@/components/features/user/exams/reading/components';
import {
  formatDate,
  formatDuration,
} from '@/components/features/user/exams/reading/utils/examUtils';
import { AttemptStatisticsCard } from '@/components/features/user/history/practice/common/AttemptStatisticsCard';
import { useListeningExamStatistics } from '@/components/features/user/history/practice/listening/hooks/useListeningExamStatistics';
import useListeningAttempt from '@/hooks/apis/listening/useListeningAttempt';
import { LoadListeningAttemptResultResponse } from '@/types/listening/listening-attempt.types';
import { useEffect, useState } from 'react';
import { ListeningAttemptInfoCard, ListeningQuestionAnalysis } from './components';

interface ListeningAttemptResultProps {
  attemptId: string;
}

const ListeningAttemptResult = ({ attemptId }: ListeningAttemptResultProps) => {
  const { getAttemptResultById } = useListeningAttempt();

  const [attemptDetails, setAttemptDetails] = useState<LoadListeningAttemptResultResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load attempt details
  useEffect(() => {
    const loadAttemptDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getAttemptResultById({
          attempt_id: attemptId,
        });

        if (response?.data) {
          setAttemptDetails(response.data);
        } else {
          setError('Failed to load listening attempt details');
        }
      } catch (err) {
        console.error('Error loading listening attempt details:', err);
        setError('An error occurred while loading listening attempt details');
      } finally {
        setIsLoading(false);
      }
    };

    if (attemptId) {
      loadAttemptDetails();
    }
  }, [attemptId]);

  const stats = useListeningExamStatistics(attemptDetails);

  if (isLoading) {
    return <ExamLoadingState />;
  }

  if (error || !attemptDetails) {
    return <ExamErrorState error={error || 'Listening attempt details not found'} />;
  }

  return (
    <div className='min-h-screen p-4'>
      <div className='max-w-6xl mx-auto space-y-6'>
        {/* Header */}
        <ExamResultHeader
          title='Listening Practice Results'
          subtitle='Detailed analysis of your listening performance'
          backUrl='/history/practices/listening'
        />

        {/* Attempt Info Card */}
        <ListeningAttemptInfoCard
          attemptDetails={attemptDetails}
          formatDate={formatDate}
          formatDuration={formatDuration}
        />

        {/* Main Results Section */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Overall Score */}
          <OverallScoreCard
            scorePercentage={stats?.correctPercentage || 0}
            correctAnswers={stats?.correctAnswers || 0}
            totalQuestions={stats?.totalQuestions || 0}
          />

          {/* Statistics */}
          <AttemptStatisticsCard
            notAnswered={stats?.notAnswered || 0}
            totalQuestions={stats?.totalQuestions || 0}
            correctAnswers={stats?.correctAnswers || 0}
            incorrectAnswers={stats?.incorrectAnswers || 0}
            key={attemptDetails.attempt_id}
          />
        </div>

        {/* Detailed Question Analysis */}
        <ListeningQuestionAnalysis attemptDetails={attemptDetails} />
      </div>
    </div>
  );
};

export default ListeningAttemptResult;
