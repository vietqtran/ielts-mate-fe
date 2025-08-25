import instance from '@/lib/axios';
import { useEffect, useRef } from 'react';
import useSWR from 'swr';

interface AudioPreloaderResult {
  audioUrls: Record<string, string | null>;
  isFirstAudioLoading: boolean;
  backgroundLoadingProgress: {
    part1: boolean;
    part2: boolean;
    part3: boolean;
    part4: boolean;
  };
  allAudioLoaded: boolean;
  errors: Record<string, any>;
}

const useListeningExamAudioPreloader = (audioFileIds: {
  part1: string | null;
  part2: string | null;
  part3: string | null;
  part4: string | null;
}): AudioPreloaderResult => {
  const revokeUrlsRef = useRef<string[]>([]);

  // Audio fetcher function
  const audioFetcher = async (audioId: string) => {
    const res = await instance.get(`/resource/files/download/${audioId}`, {
      responseType: 'blob',
      notify: false,
    });
    const url = URL.createObjectURL(res.data as Blob);
    revokeUrlsRef.current.push(url);
    return url;
  };

  // Load cái đầu tiên với ưu tiên cao hơn
  const {
    data: part1Audio,
    error: part1Error,
    isLoading: part1Loading,
  } = useSWR(
    audioFileIds.part1 ? ['audio', audioFileIds.part1, 'priority'] : null,
    () => audioFetcher(audioFileIds.part1!),
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
      // High priority for first audio
      suspense: false,
      errorRetryCount: 3,
      errorRetryInterval: 1000,
    }
  );

  // Preload remaining audio files with lower priority
  const {
    data: part2Audio,
    error: part2Error,
    isLoading: part2Loading,
  } = useSWR(
    audioFileIds.part2 ? ['audio', audioFileIds.part2] : null,
    () => audioFetcher(audioFileIds.part2!),
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
      // Start loading after a small delay to prioritize part1
      refreshInterval: 0,
      errorRetryCount: 2,
    }
  );

  const {
    data: part3Audio,
    error: part3Error,
    isLoading: part3Loading,
  } = useSWR(
    audioFileIds.part3 ? ['audio', audioFileIds.part3] : null,
    () => audioFetcher(audioFileIds.part3!),
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
      refreshInterval: 0,
      errorRetryCount: 2,
    }
  );

  const {
    data: part4Audio,
    error: part4Error,
    isLoading: part4Loading,
  } = useSWR(
    audioFileIds.part4 ? ['audio', audioFileIds.part4] : null,
    () => audioFetcher(audioFileIds.part4!),
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
      refreshInterval: 0,
      errorRetryCount: 2,
    }
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      revokeUrlsRef.current.forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
      revokeUrlsRef.current = [];
    };
  }, []);

  // Build result object
  const audioUrls = {
    part1: part1Audio || null,
    part2: part2Audio || null,
    part3: part3Audio || null,
    part4: part4Audio || null,
  };

  const backgroundLoadingProgress = {
    part1: !part1Loading && !!part1Audio,
    part2: !part2Loading && !!part2Audio,
    part3: !part3Loading && !!part3Audio,
    part4: !part4Loading && !!part4Audio,
  };

  const errors = {
    part1: part1Error,
    part2: part2Error,
    part3: part3Error,
    part4: part4Error,
  };

  const allAudioLoaded = Object.values(backgroundLoadingProgress).every(Boolean);

  return {
    audioUrls,
    isFirstAudioLoading: part1Loading && !part1Audio,
    backgroundLoadingProgress,
    allAudioLoaded,
    errors,
  };
};

export default useListeningExamAudioPreloader;
