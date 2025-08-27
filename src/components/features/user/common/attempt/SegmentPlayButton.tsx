// components/features/user/common/attempt/SegmentPlayButton.tsx
'use client';

import { Button } from '@/components/ui/button';
import { useSegmentAudioPlay } from '@/hooks/utils/useSegmentAudioPlay';
import { Play, Square } from 'lucide-react';
import { RefObject } from 'react';

export function SegmentPlayButton({
  audioRef,
  segmentKey,
  start,
  end,
  label = 'Play answer',
}: {
  audioRef: RefObject<HTMLAudioElement>;
  segmentKey: string; // e.g., question_id
  start?: string | number | null;
  end?: string | number | null;
  label?: string;
}) {
  const { playSegment, stopSegment, isSegmentPlaying } = useSegmentAudioPlay(audioRef, segmentKey);

  const disabled = !start || !end;

  if (disabled) {
    return null;
  }

  return (
    <div className='inline-flex items-center gap-2'>
      <Button
        type='button'
        size='sm'
        className='bg-selective-yellow-300 hover:bg-selective-yellow-400'
        disabled={disabled}
        onClick={() => start && end && playSegment(start, end)}
        title={disabled ? 'No segment data' : 'Play the audio segment'}
      >
        <Play className='w-4 h-4' />
        {isSegmentPlaying ? 'Playing...' : label}
      </Button>
      {isSegmentPlaying && (
        <Button
          type='button'
          size='sm'
          variant='outline'
          onClick={stopSegment}
          title='Stop'
          className='text-amber-600 hover:text-amber-700'
        >
          <Square className='w-4 h-4' />
          Stop
        </Button>
      )}
      {/* <div className='text-xs text-tekhelet-500'>
        {start && end && (
          <span>
            From <span className='font-semibold'>{start}</span> to{' '}
            <span className='font-semibold'>{end}</span>
          </span>
        )}
      </div> */}
    </div>
  );
}
