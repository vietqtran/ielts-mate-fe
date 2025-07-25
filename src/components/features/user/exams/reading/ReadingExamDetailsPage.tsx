'use client';

import useReadingExamAttempt from '@/hooks/apis/reading/useReadingExamAttempt';
import { ReadingExamAttemptDetailsResponse } from '@/types/reading-exam-attempt.types';
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
  StatisticsCard,
} from './components';
import { useExamStatistics } from './hooks/useExamStatistics';
import {
  formatDate,
  formatDuration,
  getIELTSBandScore,
  getPerformanceLevel,
} from './utils/examUtils';

interface ReadingExamDetailsPageProps {
  examId: string;
}

const ReadingExamDetailsPage = ({ examId }: ReadingExamDetailsPageProps) => {
  const { getReadingExamHistoryDetails } = useReadingExamAttempt();

  const [examDetails, setExamDetails] = useState<ReadingExamAttemptDetailsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openQuestions, setOpenQuestions] = useState<Set<string>>(new Set());

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
  if (error || !examDetails) {
    return <ExamErrorState error={error || 'Exam details not found'} />;
  }

  const bandScore = stats ? getIELTSBandScore(stats.scorePercentage) : 0;
  const performance = stats
    ? getPerformanceLevel(stats.scorePercentage)
    : { level: 'Unknown', color: 'bg-gray-500 text-white' };

  return (
    <div className='min-h-screen bg-medium-slate-blue-900 p-4'>
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
            performance={performance}
          />

          {/* IELTS Band Score */}
          <IELTSBandScoreCard bandScore={bandScore} />

          {/* Statistics */}
          <StatisticsCard
            totalPoints={stats?.totalPoints || 0}
            examTotalPoints={examDetails.total_point}
            correctAnswers={stats?.correctAnswers || 0}
            incorrectAnswers={stats?.incorrectAnswers || 0}
          />
        </div>

        {/* Parts Performance */}
        {stats && <PerformanceByPartsCard partStats={stats.partStats} />}

        {/* Detailed Question Analysis */}
        <QuestionAnalysis
          examDetails={examDetails}
          openQuestions={openQuestions}
          onToggleQuestion={toggleQuestion}
        />
      </div>
    </div>
  );
};

export default ReadingExamDetailsPage;
