'use client';

import { ListeningTaskForm } from '@/components/features/admin/listening/ListeningTaskForm';
import { Card, CardContent } from '@/components/ui/card';
import { ToastProvider } from '@/components/ui/toast';
import { useListeningTask } from '@/hooks';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function EditListeningTaskPage() {
  const params = useParams();
  const taskId = params.id as string;
  const { getListeningTaskById, isLoading } = useListeningTask();
  const [taskData, setTaskData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await getListeningTaskById(taskId);
        if (response && response.data) {
          setTaskData(response.data);
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

  return (
    <ToastProvider>
      <div className='container mx-auto p-4 space-y-6'>
        <h1 className='text-2xl font-bold mb-6'>Edit Listening Task</h1>
        {taskData?.transcript && (
          <div>
            <h3 className='text-lg font-medium mb-2'>Transcript</h3>
            <div className='p-4 bg-gray-50 rounded-md whitespace-pre-wrap'>
              {taskData.transcript}
            </div>
          </div>
        )}
        {taskData && <ListeningTaskForm taskId={taskId} initialData={taskData} mode='edit' />}
      </div>
    </ToastProvider>
  );
}
