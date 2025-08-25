'use client';

import { Button } from '@/components/ui/button';
import { useAudio } from '@/contexts/AudioContext';
import { SafeHtmlRenderer } from '@/lib/utils/safeHtml';
import { Play } from 'lucide-react';

interface ListeningExplanationDisplayProps {
  explanation: string;
  className?: string;
}

export function ListeningExplanationDisplay({
  explanation,
  className = '',
}: ListeningExplanationDisplayProps) {
  // Try to use audio context, but don't require it (for create/edit modes)
  let audioRef = null;
  let playAtTime = (_startTime: string, _endTime?: string) => {};

  try {
    const audioContext = useAudio();
    audioRef = audioContext.audioRef;
    playAtTime = audioContext.playAtTime;
  } catch (e) {
    // AudioContext not available (in create/edit mode)
  }
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

      const handlePlayAudio = () => {
        playAtTime(timeRange.start_time, timeRange.end_time);
      };

      return (
        <div className={`text-sm ${className}`}>
          <div className='flex items-center justify-between mb-2'>
            <span className='font-medium'>Audio Time Range:</span>
            {audioRef?.current && (
              <Button
                variant='outline'
                size='sm'
                onClick={handlePlayAudio}
                className='gap-1 h-6 px-2 text-xs'
              >
                <Play className='h-3 w-3' />
                Play
              </Button>
            )}
          </div>
          <div className='space-y-1'>
            <div>
              Start: <span className='font-mono'>{timeRange.start_time}</span>
            </div>
            <div>
              End: <span className='font-mono'>{timeRange.end_time}</span>
            </div>
            <div>
              Duration: <span className='font-mono'>{formatTime(duration)}</span>
            </div>
          </div>
        </div>
      );
    }
  }

  // Fallback to original HTML rendering for non-JSON explanations
  return (
    <div className={className}>
      <SafeHtmlRenderer htmlContent={explanation} className='text-sm' />
    </div>
  );
}
