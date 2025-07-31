'use client';

import {
  ExamErrorState,
  ExamLoadingState,
  ExamResultHeader,
  IELTSBandScoreCard,
  OverallScoreCard,
  PerformanceByPartsCard,
  StatisticsCard,
} from '@/components/features/user/exams/reading/components';
import {
  formatDate,
  formatDuration,
  getIELTSBandScore,
  getPerformanceLevel,
} from '@/components/features/user/exams/reading/utils/examUtils';
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
  const [openQuestions, setOpenQuestions] = useState<Set<string>>(new Set());

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

  // Calculate statistics using custom hook
  const stats = useListeningExamStatistics(attemptDetails);

  // Toggle question details
  const toggleQuestion = (questionId: string) => {
    const newOpen = new Set(openQuestions);
    if (newOpen.has(questionId)) {
      newOpen.delete(questionId);
    } else {
      newOpen.add(questionId);
    }
    setOpenQuestions(newOpen);
  };

  // Loading state
  if (isLoading) {
    return <ExamLoadingState />;
  }

  // Error state
  if (error || !attemptDetails) {
    return <ExamErrorState error={error || 'Listening attempt details not found'} />;
  }

  const bandScore = stats ? getIELTSBandScore(stats.scorePercentage) : 0;
  const performance = stats
    ? getPerformanceLevel(stats.scorePercentage)
    : { level: 'Unknown', color: 'bg-gray-500 text-white' };

  return (
    <div className='min-h-screen bg-medium-slate-blue-900 p-4'>
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
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Overall Score */}
          <OverallScoreCard
            scorePercentage={stats?.scorePercentage || 0}
            correctAnswers={stats?.correctAnswers || 0}
            totalQuestions={stats?.totalQuestions || 0}
            performance={performance}
          />

          {/* IELTS Band Score */}
          <IELTSBandScoreCard bandScore={bandScore} />

          {/* Statistics */}
          <StatisticsCard
            totalPoints={stats?.totalPoints || 0}
            examTotalPoints={attemptDetails.total_points}
            correctAnswers={stats?.correctAnswers || 0}
            incorrectAnswers={stats?.incorrectAnswers || 0}
          />
        </div>

        {/* Parts Performance */}
        {stats && <PerformanceByPartsCard partStats={stats.partStats} />}

        {/* Detailed Question Analysis */}
        <ListeningQuestionAnalysis
          attemptDetails={attemptDetails}
          openQuestions={openQuestions}
          onToggleQuestion={toggleQuestion}
        />
      </div>
    </div>
  );
};

export default ListeningAttemptResult;
