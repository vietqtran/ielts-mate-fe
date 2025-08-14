'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardOverviewData } from '@/types/dashboard.types';
import { BookOpen, Headphones, Target, TrendingUp } from 'lucide-react';

interface OverviewCardsProps {
  data: DashboardOverviewData;
}

export const OverviewCards = ({ data }: OverviewCardsProps) => {
  const readingProgress =
    data.reading.total_exams > 0 ? (data.reading.exam / data.reading.total_exams) * 100 : 0;

  const listeningProgress =
    data.listening.total_exams > 0 ? (data.listening.exam / data.listening.total_exams) * 100 : 0;

  const cards = [
    {
      title: 'Reading Exams',
      icon: BookOpen,
      completed: data.reading.exam,
      total: data.reading.total_exams,
      progress: readingProgress,
      color: 'selective-yellow',
      bgGradient: 'from-selective-yellow-900/30 to-selective-yellow-800/10',
      borderColor: 'border-selective-yellow-800/20',
      iconColor: 'text-selective-yellow-400',
      textColor: 'text-selective-yellow-300',
    },
    {
      title: 'Reading Tasks',
      icon: Target,
      completed: data.reading.task,
      total: data.reading.total_tasks,
      progress:
        data.reading.total_tasks > 0 ? (data.reading.task / data.reading.total_tasks) * 100 : 0,
      color: 'tangerine',
      bgGradient: 'from-tangerine-900/30 to-tangerine-800/10',
      borderColor: 'border-tangerine-800/20',
      iconColor: 'text-tangerine-400',
      textColor: 'text-tangerine-300',
    },
    {
      title: 'Listening Exams',
      icon: Headphones,
      completed: data.listening.exam,
      total: data.listening.total_exams,
      progress: listeningProgress,
      color: 'medium-slate-blue',
      bgGradient: 'from-medium-slate-blue-900/30 to-medium-slate-blue-800/10',
      borderColor: 'border-medium-slate-blue-800/20',
      iconColor: 'text-medium-slate-blue-400',
      textColor: 'text-medium-slate-blue-300',
    },
    {
      title: 'Listening Tasks',
      icon: TrendingUp,
      completed: data.listening.task,
      total: data.listening.total_tasks,
      progress:
        data.listening.total_tasks > 0
          ? (data.listening.task / data.listening.total_tasks) * 100
          : 0,
      color: 'tekhelet',
      bgGradient: 'from-tekhelet-900/30 to-tekhelet-800/10',
      borderColor: 'border-tekhelet-800/20',
      iconColor: 'text-tekhelet-400',
      textColor: 'text-tekhelet-300',
    },
  ];

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card
            key={index}
            className={`backdrop-blur-lg ${card.borderColor} rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-101`}
          >
            <CardHeader className='pb-3'>
              <div className='flex items-center justify-between'>
                <Icon className={`h-8 w-8 ${card.iconColor}`} />
                <div
                  className={`px-3 py-1 bg-gradient-to-r ${card.bgGradient} rounded-full border ${card.borderColor} backdrop-blur-sm`}
                >
                  <span className={`text-sm font-semibold ${card.textColor}`}>
                    {card.progress.toFixed(0)}%
                  </span>
                </div>
              </div>
              <CardTitle className='text-tekhelet-400 text-sm font-medium'>{card.title}</CardTitle>
            </CardHeader>
            <CardContent className='pt-0'>
              <div className='space-y-3'>
                <div className='flex items-end gap-2'>
                  <span className='text-3xl font-bold text-tekhelet-300'>{card.completed}</span>
                  <span className='text-tekhelet-500 text-sm mb-1'>/ {card.total}</span>
                </div>

                {/* Progress Bar */}
                <div className='w-full bg-tekhelet-900/20 rounded-full h-2'>
                  <div
                    className={`bg-gradient-to-r ${card.bgGradient} h-2 rounded-full transition-all duration-500 ease-out`}
                    style={{ width: `${Math.min(card.progress, 100)}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
