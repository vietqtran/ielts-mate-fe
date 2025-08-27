'use client';

import React, { ReactNode, createContext, useContext } from 'react';

interface AudioContextType {
  audioRef: React.RefObject<HTMLAudioElement | null> | null;
  playAtTime: (startTime: string, endTime?: string) => void;
  stopAudio: () => void;
}

const AudioContext = createContext<AudioContextType>({
  audioRef: null,
  playAtTime: () => {},
  stopAudio: () => {},
});

interface AudioProviderProps {
  children: ReactNode;
  audioRef?: React.RefObject<HTMLAudioElement | null>;
}

export function AudioProvider({ children, audioRef }: AudioProviderProps) {
  const playAtTime = (startTime: string, endTime?: string) => {
    if (!audioRef?.current) return;

    const audio = audioRef.current;
    const startSeconds = timeStringToSeconds(startTime);

    // Set the current time to start time
    audio.currentTime = startSeconds;

    // If end time is provided, set up listener to stop at that time
    if (endTime) {
      const endSeconds = timeStringToSeconds(endTime);

      // Remove any existing timeupdate listener to prevent conflicts
      const existingListener = (audio as any)._segmentTimeUpdateListener;
      if (existingListener) {
        audio.removeEventListener('timeupdate', existingListener);
      }

      // Create new listener for this segment
      const timeUpdateListener = () => {
        if (audio.currentTime >= endSeconds) {
          audio.pause();
          audio.removeEventListener('timeupdate', timeUpdateListener);
          // Clean up the reference
          delete (audio as any)._segmentTimeUpdateListener;
        }
      };

      // Store reference to listener for cleanup
      (audio as any)._segmentTimeUpdateListener = timeUpdateListener;
      audio.addEventListener('timeupdate', timeUpdateListener);
    }

    // Play the audio
    audio.play().catch(console.error);
  };

  const stopAudio = () => {
    if (!audioRef?.current) return;

    const audio = audioRef.current;

    // Pause the audio
    audio.pause();

    // Remove any existing timeupdate listener
    const existingListener = (audio as any)._segmentTimeUpdateListener;
    if (existingListener) {
      audio.removeEventListener('timeupdate', existingListener);
      delete (audio as any)._segmentTimeUpdateListener;
    }
  };

  const value = {
    audioRef: audioRef || null,
    playAtTime,
    stopAudio,
  };

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
}

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within AudioProvider');
  }
  return context;
};

// Helper function to convert time string (HH:MM:SS) to seconds
function timeStringToSeconds(timeString: string): number {
  const parts = timeString.split(':').map(Number);
  return parts[0] * 3600 + parts[1] * 60 + parts[2];
}
