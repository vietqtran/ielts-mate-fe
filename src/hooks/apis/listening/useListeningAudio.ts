import instance from '@/lib/axios';
import { useRef, useState } from 'react';

const useListeningAudio = () => {
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<Record<string, Error | null>>({});
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const setLoadingState = (key: string, value: boolean) => {
    setIsLoading((prev) => ({ ...prev, [key]: value }));
  };

  const setErrorState = (key: string, value: Error | null) => {
    setError((prev) => ({ ...prev, [key]: value }));
  };

  const getAudio = async (audio_file_id: string) => {
    // Huỷ các request cũ
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const currentController = abortControllerRef.current;

    setLoadingState('getAudio', true);
    setErrorState('getAudio', null);

    // cleanup url cũ nếu có
    setAudioUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });

    try {
      const res = await instance.get(`/resource/files/download/${audio_file_id}`, {
        responseType: 'blob',
        signal: abortControllerRef.current.signal,
        notify: false,
      });
      // tạo object url
      const url = URL.createObjectURL(res.data);
      if (abortControllerRef.current === currentController) {
        setAudioUrl(url);
        return url;
      }
    } catch (error: any) {
      if (abortControllerRef.current === currentController) {
        if (error.name !== 'AbortError') {
          setErrorState('getAudio', error as Error);
          throw error;
        }
      }
    } finally {
      if (abortControllerRef.current === currentController) {
        setLoadingState('getAudio', false);
      }
      abortControllerRef.current = null;
    }
    return null;
  };

  // Cleanup url khi unmount
  const cleanup = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
  };

  return {
    getAudio,
    audioUrl,
    isLoading,
    error,
    cleanup,
  };
};

export default useListeningAudio;
