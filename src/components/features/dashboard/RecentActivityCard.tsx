'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, Clock } from 'lucide-react';

interface RecentActivityCardProps {
  lastLearningDate: string;
}

export const RecentActivityCard = ({ lastLearningDate }: RecentActivityCardProps) => {
  const formatLastActivity = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActivityStatus = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return { color: 'green', label: 'Active' };
    if (diffDays <= 3) return { color: 'yellow', label: 'Recent' };
    if (diffDays <= 7) return { color: 'orange', label: 'This Week' };
    return { color: 'red', label: 'Inactive' };
  };

  const status = getActivityStatus(lastLearningDate);

  return (
    <Card className='bg-white/70 backdrop-blur-lg border border-tekhelet-900/20 rounded-2xl shadow-xl'>
      <CardHeader>
        <div className='flex items-center gap-3'>
          <div className='p-3 bg-gradient-to-br from-persimmon-900/30 to-persimmon-800/10 rounded-xl border border-persimmon-800/20 backdrop-blur-sm'>
            <Clock className='h-6 w-6 text-persimmon-400' />
          </div>
          <div>
            <CardTitle className='text-tekhelet-400'>Recent Activity</CardTitle>
            <p className='text-sm text-tekhelet-500'>Your last study session</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className='space-y-4'>
        <div className='flex items-center justify-between p-4 bg-gradient-to-r from-medium-slate-blue-900/30 to-medium-slate-blue-800/10 rounded-xl border border-medium-slate-blue-800/20'>
          <div className='flex items-center gap-3'>
            <CalendarDays className='h-5 w-5 text-medium-slate-blue-400' />
            <div>
              <p className='font-semibold text-medium-slate-blue-300'>
                {formatLastActivity(lastLearningDate)}
              </p>
              <p className='text-sm text-medium-slate-blue-500'>
                {formatDateTime(lastLearningDate)}
              </p>
            </div>
          </div>

          <div
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              status.color === 'green'
                ? 'bg-green-500/20 text-green-400 border border-green-400/30'
                : status.color === 'yellow'
                  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-400/30'
                  : status.color === 'orange'
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-400/30'
                    : 'bg-red-500/20 text-red-400 border border-red-400/30'
            }`}
          >
            {status.label}
          </div>
        </div>

        <div className='text-center p-3 bg-tekhelet-900/10 rounded-xl border border-tekhelet-900/20'>
          <p className='text-sm text-tekhelet-500'>Keep up the momentum! 🚀</p>
        </div>
      </CardContent>
    </Card>
  );
};
