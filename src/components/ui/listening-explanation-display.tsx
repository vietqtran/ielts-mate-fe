'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { SafeHtmlRenderer } from '@/lib/utils/safeHtml';
import { Clock, Play, Square } from 'lucide-react';

interface ListeningExplanationDisplayProps {
  explanation: string;
  className?: string;
}

export function ListeningExplanationDisplay({
  explanation,
  className = '',
}: ListeningExplanationDisplayProps) {
  // Check if explanation is a JSON string with time data
  const isTimeRangeExplanation = (): boolean => {
    if (!explanation) return false;

    try {
      const parsed = JSON.parse(explanation);
      return parsed.start_time && parsed.end_time;
    } catch (e) {
      return false;
    }
  };

  // Parse time range from JSON
  const parseTimeRange = () => {
    try {
      const parsed = JSON.parse(explanation);
      return {
        start_time: parsed.start_time,
        end_time: parsed.end_time,
      };
    } catch (e) {
      return null;
    }
  };

  // Convert time string to seconds for display
  const timeToSeconds = (timeString: string): number => {
    const parts = timeString.split(':').map(Number);
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  };

  // Format seconds to readable time
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
  };

  if (isTimeRangeExplanation()) {
    const timeRange = parseTimeRange();
    if (timeRange) {
      const startSeconds = timeToSeconds(timeRange.start_time);
      const endSeconds = timeToSeconds(timeRange.end_time);
      const duration = endSeconds - startSeconds;

      return (
        <Card className={`border-tekhelet-200 ${className}`}>
          <CardContent className='p-4'>
            <div className='flex items-center gap-2 mb-3'>
              <Clock className='w-4 h-4 text-tekhelet-600' />
              <span className='font-medium text-tekhelet-600'>Audio Time Range</span>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
              <div className='flex items-center gap-2'>
                <Play className='w-4 h-4 text-green-600' />
                <div>
                  <p className='text-xs text-tekhelet-500'>Start Time</p>
                  <p className='font-mono text-sm font-medium'>{timeRange.start_time}</p>
                </div>
              </div>

              <div className='flex items-center gap-2'>
                <Square className='w-4 h-4 text-red-600' />
                <div>
                  <p className='text-xs text-tekhelet-500'>End Time</p>
                  <p className='font-mono text-sm font-medium'>{timeRange.end_time}</p>
                </div>
              </div>

              <div className='flex items-center gap-2'>
                <Clock className='w-4 h-4 text-tekhelet-600' />
                <div>
                  <p className='text-xs text-tekhelet-500'>Duration</p>
                  <p className='font-mono text-sm font-medium'>{formatTime(duration)}</p>
                </div>
              </div>
            </div>

            <div className='mt-3 pt-3 border-t border-tekhelet-100'>
              <Badge variant='outline' className='text-xs'>
                Listen to this time range for the answer
              </Badge>
            </div>
          </CardContent>
        </Card>
      );
    }
  }

  // Fallback to original HTML rendering for non-JSON explanations
  return (
    <div className={className}>
      <SafeHtmlRenderer htmlContent={explanation} className='text-sm text-tekhelet-400' />
    </div>
  );
}
