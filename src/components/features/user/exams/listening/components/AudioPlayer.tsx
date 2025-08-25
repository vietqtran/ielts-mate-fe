'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingSpinner from '@/components/ui/loading-spinner';
import useListeningAudio from '@/hooks/apis/listening/useListeningAudio';
import { Volume2 } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface AudioPlayerProps {
  audioFileId: string;
  title: string;
  partNumber: number;
}

const AudioPlayer = ({ audioFileId, title, partNumber }: AudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { mutate, objectUrl, isLoading, error } = useListeningAudio(audioFileId);

  // Load audio when component mounts
  useEffect(() => {
    if (audioFileId) {
      mutate(audioFileId);
    }
  }, [audioFileId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-tekhelet-400'>
          <Volume2 className='w-5 h-5' />
          Part {partNumber}: {title}
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {isLoading && (
          <div className='flex items-center justify-center py-8'>
            <LoadingSpinner color='var(--color-tekhelet-500)' />
            <span className='ml-2 text-tekhelet-500'>Loading audio...</span>
          </div>
        )}

        {error && (
          <div className='text-center py-8'>
            <p className='text-persimmon-400'>Failed to load audio file</p>
            <Button variant='outline' size='sm' onClick={() => audioFileId} className='mt-2'>
              Retry
            </Button>
          </div>
        )}

        {objectUrl && (
          <>
            <audio
              ref={audioRef}
              src={objectUrl}
              preload='metadata'
              controls
              controlsList='nodownload'
              className='w-full'
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AudioPlayer;
