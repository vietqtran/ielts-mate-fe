'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardOverviewData } from '@/types/dashboard.types';
import { Award, BarChart3, Calendar } from 'lucide-react';

interface BandStatsCardProps {
  data: DashboardOverviewData;
}

export const BandStatsCard = ({ data }: BandStatsCardProps) => {
  const { band_stats } = data;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getBandColor = (band: number | null) => {
    if (!band) return 'bg-gray-500';
    if (band >= 8) return 'bg-green-600';
    if (band >= 7) return 'bg-green-500';
    if (band >= 6) return 'bg-yellow-500';
    if (band >= 5) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getBandLabel = (band: number | null) => {
    if (!band) return 'N/A';
    if (band >= 8) return 'Excellent';
    if (band >= 7) return 'Very Good';
    if (band >= 6) return 'Good';
    if (band >= 5) return 'Modest';
    return 'Limited';
  };

  return (
    <Card className='backdrop-blur-lg border rounded-2xl shadow-sm'>
      <CardHeader>
        <div className='flex items-center gap-3'>
          <div className='p-3 bg-gradient-to-br from-tekhelet-900/30 to-tekhelet-800/10 rounded-xl border border-tekhelet-800/20 backdrop-blur-sm'>
            <BarChart3 className='h-6 w-6 text-tekhelet-400' />
          </div>
          <div>
            <CardTitle className='text-tekhelet-400'>Band Score Statistics</CardTitle>
            <p className='text-sm text-tekhelet-500 capitalize'>{band_stats.time_frame} overview</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className='space-y-6'>
        {/* Time Period */}
        <div className='flex items-center gap-2 p-3 bg-medium-slate-blue-900/30 rounded-xl border border-medium-slate-blue-800/20'>
          <Calendar className='h-4 w-4 text-medium-slate-blue-400' />
          <span className='text-sm text-medium-slate-blue-400'>
            {formatDate(band_stats.start_date)} - {formatDate(band_stats.end_date)}
          </span>
        </div>

        {/* Band Scores */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {/* Overall Band */}
          <div className='text-center p-4 bg-gradient-to-br from-selective-yellow-900/30 to-selective-yellow-800/10 rounded-xl border border-selective-yellow-800/20'>
            <Award className='h-8 w-8 text-selective-yellow-400 mx-auto mb-2' />
            <div className='space-y-2'>
              <p className='text-2xl font-bold text-selective-yellow-300'>
                {band_stats.average_overall_band || 'N/A'}
              </p>
              <p className='text-xs text-selective-yellow-400 font-medium'>Overall Band</p>
              <Badge
                className={`${getBandColor(band_stats.average_overall_band)} text-white text-xs`}
              >
                {getBandLabel(band_stats.average_overall_band)}
              </Badge>
            </div>
          </div>

          {/* Reading Band */}
          <div className='text-center p-4 bg-gradient-to-br from-tangerine-900/30 to-tangerine-800/10 rounded-xl border border-tangerine-800/20'>
            <div className='space-y-2'>
              <p className='text-2xl font-bold text-tangerine-300'>
                {band_stats.average_reading_band || 'N/A'}
              </p>
              <p className='text-xs text-tangerine-400 font-medium'>Reading</p>
              <p className='text-xs text-tangerine-500'>
                {band_stats.number_of_reading_exams} exams
              </p>
            </div>
          </div>

          {/* Listening Band */}
          <div className='text-center p-4 bg-gradient-to-br from-medium-slate-blue-900/30 to-medium-slate-blue-800/10 rounded-xl border border-medium-slate-blue-800/20'>
            <div className='space-y-2'>
              <p className='text-2xl font-bold text-medium-slate-blue-300'>
                {band_stats.average_listening_band || 'N/A'}
              </p>
              <p className='text-xs text-medium-slate-blue-400 font-medium'>Listening</p>
              <p className='text-xs text-medium-slate-blue-500'>
                {band_stats.number_of_listening_exams} exams
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
