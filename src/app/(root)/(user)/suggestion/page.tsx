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

interface BandScoreResponse {
  listening: number;
  reading: number;
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

interface APISuggestion {
  title: string;
  description: string;
  priority: number;
  duration: string;
  skill: string;
}

interface APISuggestionResponse {
  suggestion: string; // JSON string containing array of suggestions
}

interface GeminiSuggestionResponse {
  content: string; // JSON string containing array of suggestions
  success: boolean;
  provider: string;
  model: string;
  errorMessage: string | null;
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
  const [isGettingSuggestions, setIsGettingSuggestions] = useState(false);
  const [isRefreshingSuggestions, setIsRefreshingSuggestions] = useState(false);
  const [isAINotificationModalOpen, setIsAINotificationModalOpen] = useState(false);
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [bandScores, setBandScores] = useState<BandScoreResponse>({ listening: 0, reading: 0 });
  const router = useRouter();

  // Helper function to clean JSON content from markdown code blocks
  const cleanJsonContent = (content: string): string => {
    let cleanContent = content.trim();

    // Handle different markdown code block formats
    const patterns = [
      { start: '```json\n', end: '\n```' },
      { start: '```json', end: '```' },
      { start: '```\n', end: '\n```' },
      { start: '```', end: '```' },
    ];

    for (const pattern of patterns) {
      if (cleanContent.startsWith(pattern.start) && cleanContent.endsWith(pattern.end)) {
        cleanContent = cleanContent.slice(pattern.start.length, -pattern.end.length).trim();
        break;
      }
    }

    return cleanContent;
  };

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

  // Fetch band score data
  const fetchBandScoreData = async () => {
    try {
      const response = await instance.get<BaseResponse<BandScoreResponse>>(
        'personal/progress/band-score',
        { notify: false }
      );

      if (response.data.status === 'success' && response.data.data) {
        setBandScores(response.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching band score data:', error);
      // Keep default band scores (0) if API fails
    }
  };

  // Fetch suggestions from API
  const fetchSuggestions = async (): Promise<Suggestion[]> => {
    try {
      const response = await instance.get<BaseResponse<APISuggestionResponse>>(
        'personal/chat/suggestion',
        { notify: false }
      );

      if (response.data.status === 'success' && response.data.data) {
        // Check if suggestion content exists
        if (!response.data.data.suggestion) {
          console.log('No suggestions available from API');
          return [];
        }

        // Log the raw content for debugging
        console.log('Raw suggestion content:', response.data.data.suggestion);

        // Clean the content by removing markdown code blocks if present
        const cleanContent = cleanJsonContent(response.data.data.suggestion);

        // Parse the JSON string to get the array of suggestions
        let apiSuggestions: APISuggestion[];
        try {
          apiSuggestions = JSON.parse(cleanContent);
        } catch (parseError) {
          console.error('Error parsing suggestions JSON:', parseError);
          console.error('Raw content that failed to parse:', response.data.data.suggestion);
          console.error('Cleaned content that failed to parse:', cleanContent);
          return [];
        }

        // Validate that we have an array and not null
        if (!apiSuggestions || !Array.isArray(apiSuggestions)) {
          console.log('Parsed suggestions is not a valid array:', apiSuggestions);
          console.log('Type of parsed result:', typeof apiSuggestions);
          return [];
        }

        // Additional validation - check if array is empty
        if (apiSuggestions.length === 0) {
          console.log('Suggestions array is empty');
          return [];
        }

        return apiSuggestions.map((apiSuggestion, index) => {
          // Map priority number to string
          const priorityMap: Record<number, 'high' | 'medium' | 'low'> = {
            0: 'high',
            1: 'medium',
          };
          const priority = priorityMap[apiSuggestion.priority] || 'low';

          // Map skill to lowercase and determine action URL and type
          const skill = apiSuggestion.skill.toLowerCase();
          let targetSkill: 'reading' | 'listening' | 'writing' | 'speaking' | 'vocabulary' =
            'reading';
          let actionUrl = '/reading';
          let type:
            | 'skill_focus'
            | 'practice_recommendation'
            | 'study_plan'
            | 'weakness_improvement' = 'practice_recommendation';

          switch (skill) {
            case 'reading':
              targetSkill = 'reading';
              actionUrl = '/reading';
              break;
            case 'listening':
              targetSkill = 'listening';
              actionUrl = '/listening';
              break;
            case 'writing':
              targetSkill = 'writing';
              actionUrl = '/exams';
              break;
            case 'speaking':
              targetSkill = 'speaking';
              actionUrl = '/exams';
              break;
            case 'vocabulary':
              targetSkill = 'vocabulary';
              actionUrl = '/personalized';
              type = 'skill_focus';
              break;
            default:
              targetSkill = 'reading';
              actionUrl = '/reading';
          }

          // Determine type based on description content
          if (
            apiSuggestion.description.toLowerCase().includes('vocabulary') ||
            apiSuggestion.description.toLowerCase().includes('word')
          ) {
            type = 'skill_focus';
          } else if (
            apiSuggestion.description.toLowerCase().includes('practice') ||
            apiSuggestion.description.toLowerCase().includes('test')
          ) {
            type = 'practice_recommendation';
          } else if (
            apiSuggestion.description.toLowerCase().includes('weakness') ||
            apiSuggestion.description.toLowerCase().includes('improve')
          ) {
            type = 'weakness_improvement';
          } else if (
            apiSuggestion.description.toLowerCase().includes('plan') ||
            apiSuggestion.description.toLowerCase().includes('schedule')
          ) {
            type = 'study_plan';
          }

          return {
            id: `suggestion-${index + 1}`,
            type,
            title: apiSuggestion.title,
            description: apiSuggestion.description,
            priority,
            estimatedTime: apiSuggestion.duration,
            targetSkill,
            actionUrl,
          };
        });
      }

      return [];
    } catch (error: any) {
      console.error('Error fetching suggestions:', error);
      return [];
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

  // Handle "Get Suggestions" button click
  const handleGetSuggestions = async () => {
    setIsGettingSuggestions(true);
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
          // Show target setup modal
          setIsTargetModalOpen(true);
        } else {
          // Target is configured - show AI notification modal
          setIsAINotificationModalOpen(true);
        }
      } else {
        // Error or no data - show target setup modal
        setIsTargetModalOpen(true);
      }
    } catch (error: any) {
      console.error('Error checking target configuration:', error);
      // Show target setup modal on error
      setIsTargetModalOpen(true);
    } finally {
      setIsGettingSuggestions(false);
    }
  };

  // Fetch AI-generated suggestions using Gemini API
  const fetchGeminiSuggestions = async (): Promise<Suggestion[]> => {
    try {
      const response = await instance.get<BaseResponse<GeminiSuggestionResponse>>(
        'personal/chat/gemini/suggest',
        { notify: false }
      );

      if (response.data.status === 'success' && response.data.data) {
        // Check if the Gemini API call was successful
        if (!response.data.data.success) {
          console.error('Gemini API returned error:', response.data.data.errorMessage);
          return [];
        }

        // Check if content exists
        if (!response.data.data.content) {
          console.log('No content available from Gemini API');
          return [];
        }

        // Log the raw content for debugging
        console.log('Raw Gemini content:', response.data.data.content);

        // Clean the content by removing markdown code blocks if present
        const cleanContent = cleanJsonContent(response.data.data.content);

        // Parse the JSON string to get the array of suggestions
        let apiSuggestions: APISuggestion[];
        try {
          apiSuggestions = JSON.parse(cleanContent);
        } catch (parseError) {
          console.error('Error parsing Gemini suggestions JSON:', parseError);
          console.error('Raw Gemini content that failed to parse:', response.data.data.content);
          console.error('Cleaned Gemini content that failed to parse:', cleanContent);
          return [];
        }

        // Validate that we have an array and not null
        if (!apiSuggestions || !Array.isArray(apiSuggestions)) {
          console.log('Parsed Gemini suggestions is not a valid array:', apiSuggestions);
          console.log('Type of parsed Gemini result:', typeof apiSuggestions);
          return [];
        }

        // Additional validation - check if array is empty
        if (apiSuggestions.length === 0) {
          console.log('Gemini suggestions array is empty');
          return [];
        }

        return apiSuggestions.map((apiSuggestion, index) => {
          // Map priority number to string
          const priorityMap: Record<number, 'high' | 'medium' | 'low'> = {
            0: 'high',
            1: 'medium',
          };
          const priority = priorityMap[apiSuggestion.priority] || 'low';

          // Map skill to lowercase and determine action URL and type
          const skill = apiSuggestion.skill.toLowerCase();
          let targetSkill: 'reading' | 'listening' | 'writing' | 'speaking' | 'vocabulary' =
            'reading';
          let actionUrl = '/reading';
          let type:
            | 'skill_focus'
            | 'practice_recommendation'
            | 'study_plan'
            | 'weakness_improvement' = 'practice_recommendation';

          switch (skill) {
            case 'reading':
              targetSkill = 'reading';
              actionUrl = '/reading';
              break;
            case 'listening':
              targetSkill = 'listening';
              actionUrl = '/listening';
              break;
            case 'vocabulary':
              targetSkill = 'vocabulary';
              actionUrl = '/personalized';
              type = 'skill_focus';
              break;
            default:
              targetSkill = 'reading';
              actionUrl = '/reading';
          }

          // Determine type based on description content
          if (
            apiSuggestion.description.toLowerCase().includes('vocabulary') ||
            apiSuggestion.description.toLowerCase().includes('word')
          ) {
            type = 'skill_focus';
          } else if (
            apiSuggestion.description.toLowerCase().includes('practice') ||
            apiSuggestion.description.toLowerCase().includes('test')
          ) {
            type = 'practice_recommendation';
          } else if (
            apiSuggestion.description.toLowerCase().includes('weakness') ||
            apiSuggestion.description.toLowerCase().includes('improve')
          ) {
            type = 'weakness_improvement';
          } else if (
            apiSuggestion.description.toLowerCase().includes('plan') ||
            apiSuggestion.description.toLowerCase().includes('schedule')
          ) {
            type = 'study_plan';
          }

          return {
            id: `gemini-suggestion-${index + 1}`,
            type,
            title: apiSuggestion.title,
            description: apiSuggestion.description,
            priority,
            estimatedTime: apiSuggestion.duration,
            targetSkill,
            actionUrl,
          };
        });
      }

      return [];
    } catch (error: any) {
      console.error('Error fetching Gemini suggestions:', error);
      return [];
    }
  };

  // Handle AI notification modal confirmation - fetch suggestions using Gemini API
  const handleConfirmAINotification = async () => {
    // Always use suggestions area loading only (no full page loading)
    setIsRefreshingSuggestions(true);
    // Close modal immediately to show loading state in suggestions area
    setIsAINotificationModalOpen(false);

    try {
      // Always use Gemini API for enhanced AI suggestions
      // Both "Get AI Suggestions" and "Refresh AI" will use Gemini
      const apiSuggestions = await fetchGeminiSuggestions();

      if (apiSuggestions.length > 0) {
        setSuggestions(apiSuggestions);
      } else {
        // Set fallback suggestions if API returns empty
        setSuggestions([
          {
            id: 'fallback-1',
            type: 'practice_recommendation',
            title: 'Start with Reading Practice',
            description:
              'Begin your IELTS preparation with reading exercises to build foundational skills.',
            priority: 'high',
            estimatedTime: '30 min',
            targetSkill: 'reading',
            actionUrl: '/reading',
          },
          {
            id: 'fallback-2',
            type: 'practice_recommendation',
            title: 'Practice Listening Skills',
            description: 'Improve your listening comprehension with practice exercises.',
            priority: 'medium',
            estimatedTime: '30 min',
            targetSkill: 'listening',
            actionUrl: '/listening',
          },
        ]);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setIsRefreshingSuggestions(false);
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
      try {
        // Fetch streak data first
        await fetchStreakData();

        // Fetch band score data
        await fetchBandScoreData();

        // Fetch suggestions from API immediately on page load
        const apiSuggestions = await fetchSuggestions();

        // If API returns suggestions, display them
        if (apiSuggestions.length > 0) {
          setSuggestions(apiSuggestions);
        } else {
          // If no suggestions, leave empty array (will show "Get Suggestions" button)
          setSuggestions([]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        // On error, show empty suggestions (will display "Get Suggestions" button)
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Set insights whenever streak or band scores change
  useEffect(() => {
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
        metric: 'Reading Band Score',
        value: bandScores.reading > 0 ? bandScores.reading.toString() : 'N/A',
        trend: bandScores.reading >= 6.5 ? 'up' : bandScores.reading >= 5.5 ? 'stable' : 'down',
        description:
          bandScores.reading > 0
            ? bandScores.reading >= 6.5
              ? 'Good progress'
              : 'Keep practicing'
            : 'Take a practice test',
        icon: BookOpen,
      },
      {
        id: '3',
        metric: 'Listening Band Score',
        value: bandScores.listening > 0 ? bandScores.listening.toString() : 'N/A',
        trend: bandScores.listening >= 6.5 ? 'up' : bandScores.listening >= 5.5 ? 'stable' : 'down',
        description:
          bandScores.listening > 0
            ? bandScores.listening >= 6.5
              ? 'Excellent performance'
              : 'Room for improvement'
            : 'Take a practice test',
        icon: Headphones,
      },
    ]);
  }, [currentStreak, bandScores.listening, bandScores.reading]);

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
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            {[...Array(3)].map((_, i) => (
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
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
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
                <div className='flex items-center justify-between'>
                  <div>
                    <CardTitle className='text-tekhelet-400 flex items-center'>
                      <Lightbulb className='h-5 w-5 mr-2' />
                      Personalized Recommendations
                    </CardTitle>
                    <CardDescription className='text-tekhelet-300'>
                      Enhanced Gemini AI-powered suggestions based on your learning patterns and
                      performance
                    </CardDescription>
                  </div>
                  {suggestions.length > 0 && (
                    <Button
                      onClick={handleGetSuggestions}
                      disabled={isGettingSuggestions || isRefreshingSuggestions}
                      size='sm'
                      className='bg-tekhelet-400 hover:bg-tekhelet-500 text-white'
                    >
                      {isGettingSuggestions || isRefreshingSuggestions
                        ? 'Updating...'
                        : 'Refresh AI'}
                      {!(isGettingSuggestions || isRefreshingSuggestions) && (
                        <Brain className='h-3 w-3 ml-1' />
                      )}
                    </Button>
                  )}
                </div>
              </CardHeader>
            </Card>

            <div className='space-y-4'>
              {isRefreshingSuggestions ? (
                <Card className='bg-white backdrop-blur-xl ring ring-persimmon-200/50'>
                  <CardContent className='p-8 text-center'>
                    <div className='space-y-4'>
                      <div className='p-4 bg-tekhelet-100 rounded-full w-fit mx-auto animate-pulse'>
                        <Brain className='h-8 w-8 text-tekhelet-500' />
                      </div>
                      <h3 className='text-lg font-semibold text-tekhelet-400'>
                        AI Generating Suggestions
                      </h3>
                      <p className='text-sm text-tekhelet-300'>
                        AI is analyzing your performance data to create enhanced personalized
                        recommendations...
                      </p>
                      <div className='flex justify-center'>
                        <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-tekhelet-400'></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : suggestions.length === 0 ? (
                <Card className='bg-white backdrop-blur-xl ring ring-persimmon-200/50'>
                  <CardContent className='p-8 text-center'>
                    <div className='space-y-4'>
                      <div className='p-4 bg-tekhelet-100 rounded-full w-fit mx-auto'>
                        <Brain className='h-8 w-8 text-tekhelet-500' />
                      </div>
                      <h3 className='text-lg font-semibold text-tekhelet-400'>
                        Get AI Suggestions
                      </h3>
                      <p className='text-sm text-tekhelet-300'>
                        Click below to get enhanced personalized recommendations powered by AI based
                        on your IELTS preparation goals and performance data.
                      </p>
                      <Button
                        onClick={handleGetSuggestions}
                        disabled={isGettingSuggestions}
                        className='bg-tekhelet-400 hover:bg-tekhelet-500 text-white'
                      >
                        {isGettingSuggestions ? 'Checking...' : 'Get AI Suggestions'}
                        {!isGettingSuggestions && <Brain className='h-4 w-4 ml-1' />}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                suggestions.map((suggestion) => {
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
                })
              )}
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

        {/* AI Notification Modal */}
        <Dialog open={isAINotificationModalOpen} onOpenChange={setIsAINotificationModalOpen}>
          <DialogContent className='bg-white/90 backdrop-blur-xl border border-tekhelet-200 rounded-2xl shadow-2xl max-w-md'>
            <DialogHeader>
              <DialogTitle className='text-xl font-bold text-tekhelet-400 flex items-center'>
                <Brain className='h-5 w-5 mr-2' />
                AI Suggestion Generation
              </DialogTitle>
              <DialogDescription className='text-tekhelet-300'>
                Enhanced personalized recommendations powered by AI
              </DialogDescription>
            </DialogHeader>

            <div className='py-4'>
              <div className='p-4 bg-persimmon-50 rounded-lg border border-persimmon-200'>
                <div className='flex items-start space-x-3'>
                  <div className='p-1 bg-persimmon-200 rounded-full mt-1'>
                    <Brain className='h-3 w-3 text-persimmon-600' />
                  </div>
                  <div>
                    <h4 className='text-sm font-medium text-tekhelet-600 mb-1'>
                      AI will use your test performance data for suggestions
                    </h4>
                    <p className='text-xs text-tekhelet-500'>
                      Our advanced AI will analyze your practice history, performance patterns, and
                      target goals to provide enhanced personalized study recommendations tailored
                      to help you achieve your IELTS band score.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className='flex flex-col gap-2 sm:flex-row'>
              <Button
                variant='outline'
                onClick={() => setIsAINotificationModalOpen(false)}
                className='border-tekhelet-200 text-tekhelet-400'
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmAINotification}
                className='bg-tekhelet-400 hover:bg-tekhelet-500 text-white font-semibold'
              >
                <Brain className='h-4 w-4 mr-1' />
                Generate Suggestions
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
