'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingSpinner from '@/components/ui/loading-spinner';
import useListeningAudio from '@/hooks/apis/listening/useListeningAudio';
import { Pause, Play, RotateCcw, Volume2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface AudioPlayerProps {
  audioFileId: string;
  title: string;
  partNumber: number;
}

const AudioPlayer = ({ audioFileId, title, partNumber }: AudioPlayerProps) => {
  const { getAudio, audioUrl, isLoading, error } = useListeningAudio();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Load audio when component mounts
  useEffect(() => {
    if (audioFileId) {
      getAudio(audioFileId);
    }
  }, [audioFileId]);

  // Set up audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const resetAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = 0;
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <Card className='backdrop-blur-lg border rounded-2xl'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-tekhelet-400'>
          <Volume2 className='w-5 h-5' />
          Part {partNumber}: {title}
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {isLoading.getAudio && (
          <div className='flex items-center justify-center py-8'>
            <LoadingSpinner color='var(--color-tekhelet-500)' />
            <span className='ml-2 text-tekhelet-500'>Loading audio...</span>
          </div>
        )}

        {error.getAudio && (
          <div className='text-center py-8'>
            <p className='text-persimmon-400'>Failed to load audio file</p>
            <Button
              variant='outline'
              size='sm'
              onClick={() => getAudio(audioFileId)}
              className='mt-2'
            >
              Retry
            </Button>
          </div>
        )}

        {audioUrl && (
          <>
            <audio ref={audioRef} src={audioUrl} preload='metadata' />

            {/* Progress Bar */}
            <div className='space-y-2'>
              <div className='w-full bg-tekhelet-800 rounded-full h-2'>
                <div
                  className='bg-selective-yellow-400 h-2 rounded-full transition-all duration-100'
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <div className='flex justify-between text-sm text-tekhelet-500'>
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className='flex items-center justify-center gap-4'>
              <Button
                variant='outline'
                size='sm'
                onClick={resetAudio}
                className='bg-white/50 border-tekhelet-300 hover:bg-white/70'
              >
                <RotateCcw className='w-4 h-4' />
              </Button>

              <Button
                variant='default'
                size='lg'
                onClick={togglePlayPause}
                disabled={!audioUrl}
                className='bg-selective-yellow-400 hover:bg-selective-yellow-300 text-white rounded-full w-12 h-12'
              >
                {isPlaying ? <Pause className='w-5 h-5' /> : <Play className='w-5 h-5 ml-0.5' />}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AudioPlayer;
