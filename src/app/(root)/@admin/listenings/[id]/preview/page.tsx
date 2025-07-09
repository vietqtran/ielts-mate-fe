'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useListeningTask } from '@/hooks';
import { ListeningTaskDetailResponse, ListeningTaskStatus } from '@/types/listening.types';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PreviewListeningTaskPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as string;
  const { getListeningTaskById, isLoading } = useListeningTask();
  const [task, setTask] = useState<ListeningTaskDetailResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await getListeningTaskById(taskId);
        if (response && response.data) {
          setTask(response.data);

          // In a real application, you would construct the audio URL based on how
          // your backend serves audio files
          // For example: setAudioUrl(`${process.env.NEXT_PUBLIC_API_BASE_URL}/listens/audio/${response.data.audio_file_id}`);
          setAudioUrl(`/api/listening/audio/${response.data.audio_file_id}`);
        } else {
          setError('Failed to load listening task');
        }
      } catch (err) {
        console.error('Error fetching listening task:', err);
        setError('Failed to load listening task');
      }
    };

    if (taskId) {
      fetchTask();
    }
  }, [taskId]);

  const handleBackToList = () => {
    router.push('/listenings');
  };

  const handleEdit = () => {
    router.push(`/listenings/${taskId}/edit`);
  };

  if (isLoading['getListeningTaskById']) {
    return (
      <div className='container mx-auto p-4 flex justify-center items-center h-screen'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto'></div>
          <p className='mt-4'>Loading listening task...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='container mx-auto p-4'>
        <Card>
          <CardContent className='pt-6'>
            <div className='text-center text-red-500'>
              <p className='text-lg'>{error}</p>
              <p className='mt-2'>Please try again later or contact support.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!task) {
    return null;
  }

  const getStatusBadge = (status: number) => {
    switch (status) {
      case ListeningTaskStatus.DRAFT:
        return <span className='px-2 py-1 rounded-full bg-gray-200 text-gray-700'>Draft</span>;
      case ListeningTaskStatus.PUBLISHED:
        return (
          <span className='px-2 py-1 rounded-full bg-green-200 text-green-700'>Published</span>
        );
      case ListeningTaskStatus.DEACTIVATED:
        return <span className='px-2 py-1 rounded-full bg-red-200 text-red-700'>Deactivated</span>;
      default:
        return <span className='px-2 py-1 rounded-full bg-gray-200 text-gray-700'>Unknown</span>;
    }
  };

  return (
    <div className='container mx-auto p-4 space-y-6'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold'>Preview Listening Task</h1>
        <div className='flex gap-2'>
          <Button variant='outline' onClick={handleBackToList}>
            Back to List
          </Button>
          <Button onClick={handleEdit}>Edit</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='flex justify-between'>
            <span>{task.title}</span>
            {task.ielts_type && (
              <div className='flex items-center gap-2'>
                <span className='px-2 py-1 rounded-full bg-blue-200 text-blue-700'>
                  {task.ielts_type === 1 ? 'Academic' : 'General Training'}
                </span>
                <span className='px-2 py-1 rounded-full bg-purple-200 text-purple-700'>
                  Part {task.part_number}
                </span>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div>
            <h3 className='text-lg font-medium mb-2'>Instruction</h3>
            <div className='p-4 bg-gray-50 rounded-md'>{task.instruction}</div>
          </div>

          {audioUrl && (
            <div>
              <h3 className='text-lg font-medium mb-2'>Audio</h3>
              <audio controls className='w-full'>
                <source src={audioUrl} type='audio/mpeg' />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}

          {task.transcription && (
            <div>
              <h3 className='text-lg font-medium mb-2'>Transcription</h3>
              <div className='p-4 bg-gray-50 rounded-md whitespace-pre-wrap'>
                {task.transcription}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
