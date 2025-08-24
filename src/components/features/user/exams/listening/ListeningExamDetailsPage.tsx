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
import { useListeningExam } from '@/hooks/apis/listening/useListeningExam';
import { ListeningExamAttemptDetailsResponse } from '@/types/listening/listening-exam.types';
import { useEffect, useState } from 'react';
import { ListeningExamInfoCard, ListeningQuestionAnalysis } from './components';
import { useListeningExamStatistics } from './hooks/useListeningExamStatistics';

interface ListeningExamDetailsPageProps {
  examId: string;
}

const ListeningExamDetailsPage = ({ examId }: ListeningExamDetailsPageProps) => {
  const { getListeningExamAttemptResult } = useListeningExam();

  const [examDetails, setExamDetails] = useState<ListeningExamAttemptDetailsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openQuestions, setOpenQuestions] = useState<Set<string>>(new Set());

  // Load exam details
  useEffect(() => {
    const loadExamDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getListeningExamAttemptResult({
          attempt_id: examId,
        });

        if (response?.data) {
          setExamDetails(response.data);
        } else {
          setError('Failed to load listening exam details');
        }
      } catch (err) {
        console.error('Error loading listening exam details:', err);
        setError('An error occurred while loading listening exam details');
      } finally {
        setIsLoading(false);
      }
    };

    if (examId) {
      loadExamDetails();
    }
  }, [examId, getListeningExamAttemptResult]);

  // Calculate statistics using custom hook
  const stats = useListeningExamStatistics(examDetails);

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
    return <ExamErrorState error={error || 'Listening exam details not found'} />;
  }

  const bandScore = stats ? getIELTSBandScore(stats.scorePercentage) : 0;
  const performance = stats
    ? getPerformanceLevel(stats.scorePercentage)
    : { level: 'Unknown', color: 'bg-gray-500 text-white' };

  return (
    <div className='min-h-screen p-4'>
      <div className='max-w-6xl mx-auto space-y-6'>
        {/* Header */}
        <ExamResultHeader
          title='Listening Exam Results'
          subtitle='Detailed analysis of your listening performance'
          backUrl='/history/exams/listening'
        />

        {/* Exam Info Card */}
        <ListeningExamInfoCard
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

        {/* Detailed Question Analysis with Audio */}
        <ListeningQuestionAnalysis
          examDetails={examDetails}
          openQuestions={openQuestions}
          onToggleQuestion={toggleQuestion}
        />
      </div>
    </div>
  );
};

export default ListeningExamDetailsPage;
