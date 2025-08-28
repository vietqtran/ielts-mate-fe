'use client';

import FlashcardStudySession from '@/components/features/modules/FlashcardStudySession';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useModules } from '@/hooks/apis/modules/useModules';
import { ModuleResponse } from '@/lib/api/modules';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { usePageTitle } from '@/hooks/usePageTitle';

export default function StudyPage() {
  usePageTitle('Study Module');

  const params = useParams();
  const router = useRouter();
  const moduleId = params.moduleId as string;

  const [module, setModule] = useState<ModuleResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { getModuleProgress } = useModules();

  useEffect(() => {
    const fetchModule = async () => {
      if (!moduleId) {
        setError('Module ID is required');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await getModuleProgress(moduleId);

        if (response?.data) {
          // Transform the progress data back to module format
          const moduleData: ModuleResponse = {
            module_id: response.data.module_id,
            module_name: response.data.module_name,
            description: 'Study module', // Default description
            is_public: false, // Default to private
            is_deleted: false,
            flash_card_ids: response.data.flashcard_progresses.map((fp) => ({
              flashcard_id: fp.flashcard_detail.flashcard_id,
              vocab: fp.flashcard_detail.vocab,
              is_highlighted: fp.is_highlighted || false,
            })),
            created_by: response.data.user_id,
            created_at: response.data.created_at,
            updated_by: null,
            updated_at: response.data.updated_at,
            time_spent: response.data.time_spent,
            progress: response.data.progress_percentage,
          };

          setModule(moduleData);
        } else {
          setError('Module not found');
        }
      } catch (err) {
        setError('Failed to load module');
        console.error('Error fetching module:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchModule();
  }, [moduleId]);

  const handleComplete = () => {
    router.push('/personalized');
  };

  const handleExit = () => {
    router.push('/personalized');
  };

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-tekhelet-50 to-medium-slate-blue-50'>
        <Card className='w-96 p-8 text-center'>
          <CardContent className='space-y-4'>
            <Loader2 className='h-8 w-8 animate-spin mx-auto text-tekhelet-400' />
            <h2 className='text-xl font-semibold text-tekhelet-400'>Loading Study Session...</h2>
            <p className='text-medium-slate-blue-500'>Preparing your flashcards</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !module) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-tekhelet-50 to-medium-slate-blue-50'>
        <Card className='w-96 p-8 text-center'>
          <CardContent className='space-y-4'>
            <h2 className='text-xl font-semibold text-tekhelet-400'>Error</h2>
            <p className='text-medium-slate-blue-500'>{error || 'Module not found'}</p>
            <Button
              onClick={() => router.push('/personalized')}
              className='bg-tekhelet-400 hover:bg-tekhelet-500 text-white'
            >
              <ArrowLeft className='h-4 w-4 mr-2' />
              Back to Modules
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-tekhelet-50 to-medium-slate-blue-50'>
      <FlashcardStudySession module={module} onComplete={handleComplete} onExit={handleExit} />
    </div>
  );
}
