import instance from '@/lib/axios';
import { useEffect } from 'react';
import useSWR from 'swr';

const useListeningAudio = (audioId: string | null) => {
  const {
    data: objectUrl,
    error,
    isLoading,
    mutate,
  } = useSWR(
    audioId ? ['audio', audioId] : null,
    async () => {
      const res = await instance.get(`/resource/files/download/${audioId}`, {
        responseType: 'blob',
        notify: false,
      });
      return URL.createObjectURL(res.data as Blob);
    },
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
    }
  );

  // Clean up when the cached url changes or SWR key is cleared
  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  return { objectUrl, error, isLoading, mutate };
};

export default useListeningAudio;
