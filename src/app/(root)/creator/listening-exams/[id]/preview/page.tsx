'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { Separator } from '@/components/ui/separator';
import { useListeningExam } from '@/hooks/apis/admin/useListeningExam';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

// Helper to fetch audio file
async function getAudio(audio_file_id: string): Promise<string | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL || ''}/resource/files/download/${audio_file_id}`,
      { credentials: 'include' }
    );
    if (res.ok) {
      const blob = await res.blob();
      return URL.createObjectURL(blob);
    }
    return null;
  } catch {
    return null;
  }
}

export default function ListeningExamPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.id as string;
  const { getExamById, isLoading } = useListeningExam();
  const [exam, setExam] = useState<any | null>(null);
  const [audioUrls, setAudioUrls] = useState<{ [part: string]: string | null }>({});
  const [isPageLoading, setIsPageLoading] = useState(true);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const response = await getExamById(examId);
        if (response) {
          setExam(response);
          // Fetch audio for each part if available
          const audioFetches = ['part1', 'part2', 'part3', 'part4'].map(async (part) => {
            const audioId = response[part]?.audio_file_id;
            if (audioId) {
              const url = await getAudio(audioId);
              return [part, url] as const;
            }
            return [part, null] as const;
          });
          const results = await Promise.all(audioFetches);
          setAudioUrls(Object.fromEntries(results));
        }
      } catch (error) {
        toast.error('Failed to fetch listening exam');
      } finally {
        setIsPageLoading(false);
      }
    };
    fetchExam();
    // Cleanup audio URLs on unmount
    return () => {
      Object.values(audioUrls).forEach((url) => url && URL.revokeObjectURL(url));
    };
    // eslint-disable-next-line
  }, [examId]);

  if (isPageLoading) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <LoadingSpinner color='black' />
      </div>
    );
  }

  if (!exam) {
    return (
      <div className='container mx-auto p-6'>
        <Card>
          <CardContent className='py-10'>
            <div className='text-center'>
              <h2 className='text-xl font-semibold'>Listening Exam Not Found</h2>
              <p className='text-muted-foreground mt-2'>
                The requested listening exam could not be found.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='container mx-auto p-6'>
      <Card className='mb-6'>
        <CardHeader>
          <CardTitle>Preview Listening Exam</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-2'>
            <div>
              <span className='font-medium'>Exam Name:</span> {exam.exam_name}
            </div>
            <div>
              <span className='font-medium'>Description:</span> {exam.exam_description}
            </div>
            <div>
              <span className='font-medium'>URL Slug:</span> {exam.url_slug}
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Listening Parts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-8'>
            {[1, 2, 3, 4].map((num) => {
              const partKey = `part${num}`;
              const part = exam[partKey];
              if (!part) return null;
              return (
                <div key={partKey} className='border rounded-lg p-4'>
                  <h3 className='font-semibold text-lg mb-2'>
                    Part {num}: {part.title}
                  </h3>
                  <Separator className='my-2' />
                  <div className='mb-2'>
                    <b>Instruction:</b> {part.instruction}
                  </div>
                  <div className='mb-2'>
                    <b>Transcription:</b> {part.transcription}
                  </div>
                  {audioUrls[partKey] && (
                    <div className='mb-2'>
                      <b>Audio:</b>
                      <audio controls src={audioUrls[partKey] || undefined} className='mt-2' />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
