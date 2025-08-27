'use client';

import useExamIELTSBand from '@/components/features/user/exams/common/useExamIELTSBand';
import { AttemptStatisticsCard } from '@/components/features/user/history/practice/common/AttemptStatisticsCard';
import useReadingExamAttempt from '@/hooks/apis/reading/useReadingExamAttempt';
import { ReadingExamAttemptDetailsResponse } from '@/types/reading/reading-exam-attempt.types';
import { IeltsTypeEnumIndex } from '@/types/reading/reading.types';
import { useEffect, useState } from 'react';
import {
  ExamErrorState,
  ExamInfoCard,
  ExamLoadingState,
  ExamResultHeader,
  IELTSBandScoreCard,
  OverallScoreCard,
  PerformanceByPartsCard,
  QuestionAnalysis,
} from './components';
import { useExamStatistics } from './hooks/useExamStatistics';
import { formatDate, formatDuration } from './utils/examUtils';

interface ReadingExamDetailsPageProps {
  examId: string;
}

const ReadingExamDetailsPage = ({ examId }: ReadingExamDetailsPageProps) => {
  const { getReadingExamHistoryDetails } = useReadingExamAttempt();

  const [examDetails, setExamDetails] = useState<ReadingExamAttemptDetailsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load exam details
  useEffect(() => {
    const loadExamDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getReadingExamHistoryDetails({
          attemptId: examId,
        });

        if (response) {
          setExamDetails(response);
        } else {
          setError('Failed to load exam details');
        }
      } catch (err) {
        console.error('Error loading exam details:', err);
        setError('An error occurred while loading exam details');
      } finally {
        setIsLoading(false);
      }
    };

    if (examId) {
      loadExamDetails();
    }
  }, [examId]);

  // Calculate statistics using custom hook
  const stats = useExamStatistics(examDetails);
  const { headline } = useExamIELTSBand(
    examDetails?.estimated_ielts_band!,
    'listening',
    IeltsTypeEnumIndex.ACADEMIC
  );

  // Loading state
  if (isLoading) {
    return <ExamLoadingState />;
  }

  // Error state
  if (error || !examDetails) {
    return <ExamErrorState error={error || 'Exam details not found'} />;
  }

  const bandScore = examDetails?.estimated_ielts_band || 0;

  return (
    <div className='min-h-screen  p-4'>
      <div className='max-w-6xl mx-auto space-y-6'>
        {/* Header */}
        <ExamResultHeader />

        {/* Exam Info Card */}
        <ExamInfoCard
          examDetails={examDetails}
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
          />

          {/* IELTS Band Score */}
          <IELTSBandScoreCard bandScore={bandScore} slogan={headline} />

          {/* Statistics */}
          <AttemptStatisticsCard
            totalQuestions={stats?.totalQuestions || 0}
            notAnswered={stats?.notAnswered || 0}
            correctAnswers={stats?.correctAnswers || 0}
            incorrectAnswers={stats?.incorrectAnswers || 0}
          />
        </div>

        {/* Parts Performance */}
        {stats && <PerformanceByPartsCard partStats={stats.partStats} />}

        {/* Detailed Question Analysis */}
        <QuestionAnalysis examDetails={examDetails} />
      </div>
    </div>
  );
};

export default ReadingExamDetailsPage;
