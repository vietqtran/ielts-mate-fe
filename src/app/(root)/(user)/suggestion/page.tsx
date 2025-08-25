'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Wavy from '@/components/ui/custom-icons/wavy';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import instance from '@/lib/axios';
import { BaseResponse } from '@/types/reading/reading.types';

interface StreakConfigResponse {
  start_date: string; // ISO date string
  last_updated: string; // ISO date string
  streak: number;
}

interface TargetConfigResponse {
  listening_target: number;
  listening_target_date: string | null;
  reading_target: number;
  reading_target_date: string | null;
}
import {
  AlertCircle,
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  Brain,
  Calendar,
  CheckCircle2,
  Clock,
  Headphones,
  Lightbulb,
  Play,
  Star,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Suggestion {
  id: string;
  type: 'skill_focus' | 'practice_recommendation' | 'study_plan' | 'weakness_improvement';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: string;
  targetSkill: 'reading' | 'listening' | 'writing' | 'speaking' | 'vocabulary';
  actionUrl?: string;
  progress?: number;
  completed?: boolean;
}

interface LearningInsight {
  id: string;
  metric: string;
  value: string;
  trend: 'up' | 'down' | 'stable';
  description: string;
  icon: any;
}

export default function SuggestionPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [insights, setInsights] = useState<LearningInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [isCheckingTarget, setIsCheckingTarget] = useState(false);
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const router = useRouter();

  // Fetch streak data
  const fetchStreakData = async () => {
    try {
      const response = await instance.get<BaseResponse<StreakConfigResponse>>(
        'personal/config/streak',
        { notify: false }
      );

      if (response.data.status === 'success' && response.data.data) {
        setCurrentStreak(response.data.data.streak);
      }
    } catch (error: any) {
      console.error('Error fetching streak data:', error);
      // Keep default streak value (0) if API fails
    }
  };

  // Check target configuration automatically on page load
  const checkTargetConfigurationAuto = async () => {
    try {
      const response = await instance.get<BaseResponse<TargetConfigResponse>>(
        'personal/config/target',
        { notify: false }
      );

      // Check if target is actually configured
      if (response.data.status === 'success' && response.data.data) {
        const { listening_target, reading_target, listening_target_date, reading_target_date } =
          response.data.data;

        // If both targets are 0.0 or dates are null, target is not configured
        if (
          (listening_target === 0.0 && reading_target === 0.0) ||
          (!listening_target_date && !reading_target_date)
        ) {
          setIsTargetModalOpen(true);
        } else {
          // User has target configured
          console.log('Target is configured:', response.data.data);
        }
      }
    } catch (error: any) {
      console.error('Error checking target configuration:', error);
      // Show modal on any API error as well
      setIsTargetModalOpen(true);
    }
  };

  // Check if user has configured target (for button click)
  const checkTargetConfiguration = async () => {
    setIsCheckingTarget(true);
    try {
      const response = await instance.get<BaseResponse<TargetConfigResponse>>(
        'personal/config/target',
        { notify: false }
      );

      // Check if target is actually configured
      if (response.data.status === 'success' && response.data.data) {
        const { listening_target, reading_target, listening_target_date, reading_target_date } =
          response.data.data;

        // If both targets are 0.0 or dates are null, target is not configured
        if (
          (listening_target === 0.0 && reading_target === 0.0) ||
          (!listening_target_date && !reading_target_date)
        ) {
          setIsTargetModalOpen(true);
        } else {
          // User has target configured - could show success message or do nothing
          console.log('Target is configured:', response.data.data);
        }
      }
    } catch (error: any) {
      console.error('Error checking target configuration:', error);
      // Show modal on any API error as well
      setIsTargetModalOpen(true);
    } finally {
      setIsCheckingTarget(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      // Fetch streak data first
      await fetchStreakData();

      // Check target configuration automatically
      await checkTargetConfigurationAuto();

      // Then simulate API call for suggestions
      setTimeout(() => {
        setSuggestions([
          {
            id: '1',
            type: 'weakness_improvement',
            title: 'Focus on Reading Comprehension',
            description:
              'Your recent reading practice shows difficulty with inference questions. Practice identifying implied meanings in academic texts.',
            priority: 'high',
            estimatedTime: '30 min/day',
            targetSkill: 'reading',
            actionUrl: '/reading',
            progress: 65,
          },
          {
            id: '2',
            type: 'practice_recommendation',
            title: 'Take a Listening Mock Test',
            description:
              "You haven't taken a full listening exam in 2 weeks. Practice with a complete mock test to maintain timing skills.",
            priority: 'medium',
            estimatedTime: '45 min',
            targetSkill: 'listening',
            actionUrl: '/exams',
          },
          {
            id: '3',
            type: 'skill_focus',
            title: 'Expand Academic Vocabulary',
            description:
              'Build your vocabulary with academic word lists. Focus on words commonly used in IELTS reading passages.',
            priority: 'medium',
            estimatedTime: '20 min/day',
            targetSkill: 'vocabulary',
            actionUrl: '/personalized',
            progress: 40,
          },
          {
            id: '4',
            type: 'study_plan',
            title: 'Create Weekly Study Schedule',
            description:
              'Establish a consistent study routine with dedicated time for each skill area to improve overall performance.',
            priority: 'low',
            estimatedTime: '15 min setup',
            targetSkill: 'reading',
            actionUrl: '/target',
          },
        ]);

        setInsights([
          {
            id: '1',
            metric: 'Study Streak',
            value: `${currentStreak} days`,
            trend: currentStreak > 0 ? 'up' : 'stable',
            description:
              currentStreak > 0 ? 'Great consistency! Keep it up' : 'Start your study streak today',
            icon: Calendar,
          },
          {
            id: '2',
            metric: 'Avg. Reading Score',
            value: '6.5',
            trend: 'up',
            description: 'Improving steadily',
            icon: BookOpen,
          },
          {
            id: '3',
            metric: 'Listening Accuracy',
            value: '78%',
            trend: 'stable',
            description: 'Consistent performance',
            icon: Headphones,
          },
          {
            id: '4',
            metric: 'Study Time Today',
            value: '45 min',
            trend: 'up',
            description: 'Above your daily goal',
            icon: Clock,
          },
        ]);

        setIsLoading(false);
      }, 1000);
    };

    fetchData();
  }, [currentStreak]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-persimmon-100 text-persimmon-600 border-persimmon-200';
      case 'medium':
        return 'bg-selective-yellow-100 text-selective-yellow-600 border-selective-yellow-200';
      case 'low':
        return 'bg-tekhelet-100 text-tekhelet-600 border-tekhelet-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getSkillIcon = (skill: string) => {
    switch (skill) {
      case 'reading':
        return BookOpen;
      case 'listening':
        return Headphones;
      case 'vocabulary':
        return Brain;
      default:
        return Target;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return TrendingUp;
      case 'down':
        return TrendingUp; // rotated in CSS
      default:
        return BarChart3;
    }
  };

  if (isLoading) {
    return (
      <div className='relative isolate'>
        <Wavy className='pointer-events-none absolute inset-x-0 -top-4 -z-10' />
        <div className='container mx-auto p-6 pt-12 space-y-6 min-h-screen'>
          {/* Loading Header */}
          <div className='flex flex-col space-y-4'>
            <div className='flex items-center space-x-3'>
              <div className='p-3 rounded-xl ring-2 ring-persimmon-200/50 animate-pulse'>
                <div className='h-6 w-6 bg-gray-300 rounded'></div>
              </div>
              <div>
                <div className='h-8 w-64 bg-gray-300 rounded animate-pulse mb-2'></div>
                <div className='h-4 w-96 bg-gray-200 rounded animate-pulse'></div>
              </div>
            </div>
          </div>

          {/* Loading Cards */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            {[...Array(4)].map((_, i) => (
              <Card key={i} className='bg-white backdrop-blur-xl animate-pulse'>
                <CardContent className='p-6'>
                  <div className='h-16 bg-gray-200 rounded'></div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            <div className='lg:col-span-2'>
              <Card className='bg-white backdrop-blur-xl animate-pulse'>
                <CardContent className='p-6'>
                  <div className='h-64 bg-gray-200 rounded'></div>
                </CardContent>
              </Card>
            </div>
            <div>
              <Card className='bg-white backdrop-blur-xl animate-pulse'>
                <CardContent className='p-6'>
                  <div className='h-64 bg-gray-200 rounded'></div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='relative isolate'>
      <Wavy className='pointer-events-none absolute inset-x-0 -top-4 -z-10' />
      <div className='container mx-auto p-6 pt-12 space-y-6 min-h-screen'>
        {/* Header */}
        <div className='flex flex-col space-y-4'>
          <div className='flex items-center space-x-3'>
            <div className='p-3 rounded-xl ring-2 ring-persimmon-200/50'>
              <Brain className='h-6 w-6 text-persimmon-300' />
            </div>
            <div>
              <h1 className='text-3xl font-bold text-tekhelet-400'>AI Suggestions</h1>
              <p className='text-tekhelet-300/70 font-medium'>
                Personalized recommendations to boost your IELTS performance
              </p>
            </div>
          </div>
        </div>

        {/* Learning Insights */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          {insights.map((insight) => {
            const IconComponent = insight.icon;
            const TrendIcon = getTrendIcon(insight.trend);

            return (
              <Card
                key={insight.id}
                className='bg-white backdrop-blur-xl ring ring-persimmon-200/95'
              >
                <CardContent className='p-6'>
                  <div className='flex items-center justify-between mb-3'>
                    <div className='p-2 bg-persimmon-700 rounded-lg'>
                      <IconComponent className='h-4 w-4 text-tekhelet-400' />
                    </div>
                    <div
                      className={`p-1 rounded-full ${
                        insight.trend === 'up'
                          ? 'bg-green-100'
                          : insight.trend === 'down'
                            ? 'bg-red-100'
                            : 'bg-gray-100'
                      }`}
                    >
                      <TrendIcon
                        className={`h-3 w-3 ${
                          insight.trend === 'up'
                            ? 'text-green-600'
                            : insight.trend === 'down'
                              ? 'text-red-600 rotate-180'
                              : 'text-gray-600'
                        }`}
                      />
                    </div>
                  </div>
                  <p className='text-sm text-tekhelet-300 font-medium mb-1'>{insight.metric}</p>
                  <p className='text-2xl font-bold text-tekhelet-600 mb-1'>{insight.value}</p>
                  <p className='text-xs text-tekhelet-400'>{insight.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* AI Suggestions */}
          <div className='lg:col-span-2 space-y-6'>
            <Card className='bg-white backdrop-blur-xl ring ring-persimmon-200'>
              <CardHeader>
                <CardTitle className='text-tekhelet-400 flex items-center'>
                  <Lightbulb className='h-5 w-5 mr-2' />
                  Personalized Recommendations
                </CardTitle>
                <CardDescription className='text-tekhelet-300'>
                  AI-powered suggestions based on your learning patterns and performance
                </CardDescription>
              </CardHeader>
            </Card>

            <div className='space-y-4'>
              {suggestions.map((suggestion) => {
                const SkillIcon = getSkillIcon(suggestion.targetSkill);

                return (
                  <Card
                    key={suggestion.id}
                    className='bg-white backdrop-blur-xl ring ring-persimmon-200/50 hover:shadow-lg transition-all duration-300'
                  >
                    <CardContent className='p-6'>
                      <div className='flex items-start justify-between mb-4'>
                        <div className='flex items-center space-x-3'>
                          <div className='p-2 bg-tekhelet-100 rounded-lg'>
                            <SkillIcon className='h-5 w-5 text-tekhelet-500' />
                          </div>
                          <div className='flex-1'>
                            <h3 className='text-lg font-semibold text-tekhelet-400 mb-1'>
                              {suggestion.title}
                            </h3>
                            <p className='text-sm text-tekhelet-300 mb-2'>
                              {suggestion.description}
                            </p>
                          </div>
                        </div>
                        <Badge className={`${getPriorityColor(suggestion.priority)} border`}>
                          {suggestion.priority} priority
                        </Badge>
                      </div>

                      <div className='flex items-center justify-between mb-4'>
                        <div className='flex items-center space-x-4 text-sm text-tekhelet-400'>
                          <div className='flex items-center'>
                            <Clock className='h-4 w-4 mr-1' />
                            {suggestion.estimatedTime}
                          </div>
                          <div className='flex items-center capitalize'>
                            <Target className='h-4 w-4 mr-1' />
                            {suggestion.targetSkill}
                          </div>
                        </div>
                        {suggestion.completed && (
                          <Badge className='bg-green-100 text-green-600 border-green-200'>
                            <CheckCircle2 className='h-3 w-3 mr-1' />
                            Completed
                          </Badge>
                        )}
                      </div>

                      {suggestion.progress !== undefined && (
                        <div className='mb-4'>
                          <div className='flex justify-between text-sm mb-2'>
                            <span className='text-tekhelet-400'>Progress</span>
                            <span className='text-tekhelet-500 font-medium'>
                              {suggestion.progress}%
                            </span>
                          </div>
                          <Progress value={suggestion.progress} className='h-2' />
                        </div>
                      )}

                      <div className='flex justify-between items-center'>
                        <div className='flex items-center text-xs text-tekhelet-300'>
                          <Zap className='h-3 w-3 mr-1' />
                          AI Recommendation
                        </div>
                        {suggestion.actionUrl && (
                          <Button
                            asChild
                            className='bg-tekhelet-400 hover:bg-tekhelet-500 text-white'
                          >
                            <Link href={suggestion.actionUrl}>
                              Start Practice
                              <ArrowRight className='h-4 w-4 ml-1' />
                            </Link>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Quick Actions & Tips */}
          <div className='space-y-6'>
            {/* Quick Actions */}
            <Card className='bg-white backdrop-blur-xl ring ring-persimmon-200'>
              <CardHeader>
                <CardTitle className='text-tekhelet-400 flex items-center'>
                  <Play className='h-5 w-5 mr-2' />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <Button
                  asChild
                  variant='outline'
                  className='w-full justify-start border-tekhelet-200 text-tekhelet-400'
                >
                  <Link href='/reading'>
                    <BookOpen className='h-4 w-4 mr-2' />
                    Practice Reading
                  </Link>
                </Button>
                <Button
                  asChild
                  variant='outline'
                  className='w-full justify-start border-tekhelet-200 text-tekhelet-400'
                >
                  <Link href='/listening'>
                    <Headphones className='h-4 w-4 mr-2' />
                    Practice Listening
                  </Link>
                </Button>
                <Button
                  asChild
                  variant='outline'
                  className='w-full justify-start border-tekhelet-200 text-tekhelet-400'
                >
                  <Link href='/exams'>
                    <Target className='h-4 w-4 mr-2' />
                    Take Mock Test
                  </Link>
                </Button>
                <Button
                  asChild
                  variant='outline'
                  className='w-full justify-start border-tekhelet-200 text-tekhelet-400'
                >
                  <Link href='/personalized'>
                    <Brain className='h-4 w-4 mr-2' />
                    Study Vocabulary
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Study Tips */}
            <Card className='bg-white backdrop-blur-xl ring ring-persimmon-200'>
              <CardHeader>
                <CardTitle className='text-tekhelet-600 flex items-center'>
                  <Star className='h-5 w-5 mr-2' />
                  Today's Study Tips
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='p-4 bg-selective-yellow-50 rounded-lg border border-selective-yellow-200'>
                  <div className='flex items-start space-x-3'>
                    <div className='p-1 bg-selective-yellow-200 rounded-full mt-1'>
                      <Lightbulb className='h-3 w-3 text-selective-yellow-600' />
                    </div>
                    <div>
                      <h4 className='text-sm font-medium text-tekhelet-600 mb-1'>
                        Reading Strategy
                      </h4>
                      <p className='text-xs text-tekhelet-500'>
                        Skim the passage first, then read questions before detailed reading. This
                        improves comprehension speed.
                      </p>
                    </div>
                  </div>
                </div>

                <div className='p-4 bg-tekhelet-50 rounded-lg border border-tekhelet-200'>
                  <div className='flex items-start space-x-3'>
                    <div className='p-1 bg-tekhelet-200 rounded-full mt-1'>
                      <Clock className='h-3 w-3 text-tekhelet-600' />
                    </div>
                    <div>
                      <h4 className='text-sm font-medium text-tekhelet-600 mb-1'>
                        Time Management
                      </h4>
                      <p className='text-xs text-tekhelet-500'>
                        Spend no more than 20 minutes per reading passage. Practice with a timer to
                        build speed.
                      </p>
                    </div>
                  </div>
                </div>

                <div className='p-4 bg-persimmon-50 rounded-lg border border-persimmon-200'>
                  <div className='flex items-start space-x-3'>
                    <div className='p-1 bg-persimmon-200 rounded-full mt-1'>
                      <Award className='h-3 w-3 text-persimmon-600' />
                    </div>
                    <div>
                      <h4 className='text-sm font-medium text-tekhelet-600 mb-1'>Daily Goal</h4>
                      <p className='text-xs text-tekhelet-500'>
                        Aim for 30 minutes of focused practice daily. Consistency beats intensity
                        for IELTS preparation.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Alert */}
            <Card className='bg-gradient-to-br from-medium-slate-blue-50 to-tekhelet-50 border border-tekhelet-200'>
              <CardContent className='p-6 text-center'>
                <div className='p-3 bg-tekhelet-100 rounded-full w-fit mx-auto mb-4'>
                  <AlertCircle className='h-6 w-6 text-tekhelet-500' />
                </div>
                <h3 className='text-lg font-semibold text-tekhelet-400 mb-2'>Stay on Track!</h3>
                <p className='text-sm text-tekhelet-300 mb-4'>
                  You're doing great! Follow the AI suggestions to maximize your improvement and
                  reach your target band score.
                </p>
                <Button
                  asChild
                  className='bg-selective-yellow-400 hover:bg-selective-yellow-300 text-tekhelet-600 font-semibold'
                >
                  <Link href='/target'>
                    <Target className='h-4 w-4 mr-1' />
                    Update Goals
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Target Setup Modal */}
        <Dialog open={isTargetModalOpen} onOpenChange={setIsTargetModalOpen}>
          <DialogContent className='bg-white/90 backdrop-blur-xl border border-tekhelet-200 rounded-2xl shadow-2xl max-w-md'>
            <DialogHeader>
              <DialogTitle className='text-xl font-bold text-tekhelet-400 flex items-center'>
                <Target className='h-5 w-5 mr-2' />
                Target Setup Required
              </DialogTitle>
              <DialogDescription className='text-tekhelet-300'>
                Please setup target to continue
              </DialogDescription>
            </DialogHeader>

            <div className='py-4'>
              <div className='p-4 bg-selective-yellow-50 rounded-lg border border-selective-yellow-200'>
                <div className='flex items-start space-x-3'>
                  <div className='p-1 bg-selective-yellow-200 rounded-full mt-1'>
                    <Lightbulb className='h-3 w-3 text-selective-yellow-600' />
                  </div>
                  <div>
                    <h4 className='text-sm font-medium text-tekhelet-600 mb-1'>
                      Set your IELTS goals
                    </h4>
                    <p className='text-xs text-tekhelet-500'>
                      Configure your target band scores and dates to get personalized AI suggestions
                      and track your progress effectively.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className='flex flex-col gap-2 sm:flex-row'>
              <Button
                variant='outline'
                onClick={() => setIsTargetModalOpen(false)}
                className='border-tekhelet-200 text-tekhelet-400'
              >
                Maybe Later
              </Button>
              <Button
                onClick={() => {
                  setIsTargetModalOpen(false);
                  router.push('/target');
                }}
                className='bg-selective-yellow-400 hover:bg-selective-yellow-300 text-tekhelet-600 font-semibold'
              >
                <Target className='h-4 w-4 mr-1' />
                Setup Target Now
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
