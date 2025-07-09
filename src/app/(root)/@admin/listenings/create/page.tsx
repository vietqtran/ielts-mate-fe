'use client';
import { ListeningTaskForm } from '@/components/listening/ListeningTaskForm';
import { ToastProvider } from '@/components/ui/toast';

export default function CreateListeningTaskPage() {
  return (
    <ToastProvider>
      <div className='container mx-auto p-4 space-y-6'>
        <h1 className='text-2xl font-bold mb-6'>Create New Listening Task</h1>
        <ListeningTaskForm mode='create' />
      </div>
    </ToastProvider>
  );
}
