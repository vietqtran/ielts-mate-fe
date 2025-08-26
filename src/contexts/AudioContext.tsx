'use client';

import React, { ReactNode, createContext, useContext } from 'react';

interface AudioContextType {
  audioRef: React.RefObject<HTMLAudioElement | null> | null;
  playAtTime: (startTime: string, endTime?: string) => void;
}

const AudioContext = createContext<AudioContextType>({
  audioRef: null,
  playAtTime: () => {},
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

    // Play the audio
    audio.play().catch(console.error);

    // If end time is provided, pause at that time
    if (endTime) {
      const endSeconds = timeStringToSeconds(endTime);
      const duration = endSeconds - startSeconds;

      setTimeout(() => {
        if (audio && !audio.paused) {
          audio.pause();
        }
      }, duration * 1000);
    }
  };

  const value = {
    audioRef: audioRef || null,
    playAtTime,
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
