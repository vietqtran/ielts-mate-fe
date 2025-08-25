'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ListeningExplanationDisplay } from '@/components/ui/listening-explanation-display';
import { AudioProvider } from '@/contexts/AudioContext';
import { useListeningTask } from '@/hooks';
import { ListeningTaskDetailResponse } from '@/types/listening/listening.types';
import { QuestionTypeEnumIndex } from '@/types/reading/reading.types';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function PreviewListeningTaskPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as string;
  const { getListeningTaskById, isLoading } = useListeningTask();
  const [task, setTask] = useState<ListeningTaskDetailResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await getListeningTaskById(taskId);
        if (response && response.data) {
          setTask(response.data);

          // Nếu có audio_file_id, gọi API lấy link thực tế
          if (response.data.audio_file_id) {
            try {
              // Gọi API download file, nếu trả về file trực tiếp thì dùng url này
              const audioRes = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL || ''}/resource/files/download/${response.data.audio_file_id}`,
                {
                  credentials: 'include',
                }
              );
              if (audioRes.ok) {
                // Nếu trả về file trực tiếp, tạo object url
                const blob = await audioRes.blob();
                setAudioUrl(URL.createObjectURL(blob));
              } else {
                setAudioUrl(null);
              }
            } catch (error) {
              console.log(error);
              setAudioUrl(null);
            }
          } else {
            setAudioUrl(null);
          }
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
    router.push('/creator/listenings');
  };

  const handleEdit = () => {
    router.push(`/creator/listenings/${taskId}/edit`);
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

  return (
    <AudioProvider audioRef={audioRef}>
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
                <audio ref={audioRef} controls className='w-full'>
                  <source src={audioUrl} type='audio/mpeg' />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}

            {task.transcript && (
              <div>
                <h3 className='text-lg font-medium mb-2'>Transcript</h3>
                <div
                  className='p-4 bg-gray-50 rounded-md prose prose-sm max-w-none'
                  dangerouslySetInnerHTML={{ __html: task.transcript }}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Render question groups and questions */}
        {Array.isArray((task as any).question_groups) &&
          (task as any).question_groups.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Question Groups</CardTitle>
              </CardHeader>
              <CardContent>
                {(task as any).question_groups.map((group: any) => {
                  // Determine question type label
                  let questionTypeLabel = '';
                  switch (group.question_type) {
                    case QuestionTypeEnumIndex.MULTIPLE_CHOICE:
                      questionTypeLabel = 'Multiple Choice';
                      break;
                    case QuestionTypeEnumIndex.FILL_IN_THE_BLANKS:
                      questionTypeLabel = 'Fill in the Blanks';
                      break;
                    case QuestionTypeEnumIndex.MATCHING:
                      questionTypeLabel = 'Matching';
                      break;
                    case QuestionTypeEnumIndex.DRAG_AND_DROP:
                      questionTypeLabel = 'Drag & Drop';
                      break;
                    default:
                      questionTypeLabel = '';
                  }
                  return (
                    <div key={group.group_id} className='mb-8'>
                      <div className='flex items-center gap-2 mb-2'>
                        <h4 className='font-semibold'>{group.section_label}</h4>
                        {questionTypeLabel && (
                          <span className='px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs'>
                            {questionTypeLabel}
                          </span>
                        )}
                      </div>
                      <div
                        className='mb-2'
                        dangerouslySetInnerHTML={{ __html: group.instruction }}
                      />
                      {Array.isArray(group.questions) && group.questions.length > 0 ? (
                        <div className='space-y-4'>
                          {group.questions.map((q: any) => {
                            switch (q.question_type) {
                              case QuestionTypeEnumIndex.MULTIPLE_CHOICE: // Multiple Choice
                                return (
                                  <div key={q.question_id} className='p-4 border rounded'>
                                    <div
                                      dangerouslySetInnerHTML={{ __html: q.instruction_for_choice }}
                                    />
                                    <ul className='list-disc ml-6'>
                                      {Array.isArray(q.choices) &&
                                        q.choices.map((c: any) => (
                                          <li key={c.choice_id}>
                                            <span className='font-semibold'>{c.label}:</span>{' '}
                                            {c.content}
                                            {c.is_correct && (
                                              <span className='ml-2 text-green-600 font-bold'>
                                                (Correct)
                                              </span>
                                            )}
                                          </li>
                                        ))}
                                    </ul>
                                    <div className='mt-2 text-sm text-gray-500'>
                                      <span className='font-medium'>Explanation:</span>
                                      <ListeningExplanationDisplay
                                        explanation={q.explanation || ''}
                                        className='mt-1'
                                      />
                                    </div>
                                  </div>
                                );
                              case QuestionTypeEnumIndex.FILL_IN_THE_BLANKS: // Fill in the Blanks
                                return (
                                  <div key={q.question_id} className='p-4 border rounded'>
                                    <div>
                                      <span className='font-semibold'>Blank {q.blank_index}:</span>{' '}
                                      {q.correct_answer}
                                    </div>
                                    <div className='mt-2 text-sm text-gray-500'>
                                      <span className='font-medium'>Explanation:</span>
                                      <ListeningExplanationDisplay
                                        explanation={q.explanation || ''}
                                        className='mt-1'
                                      />
                                    </div>
                                  </div>
                                );
                              case QuestionTypeEnumIndex.MATCHING: // Matching
                                return (
                                  <div key={q.question_id} className='p-4 border rounded'>
                                    <div
                                      dangerouslySetInnerHTML={{
                                        __html: q.instruction_for_matching,
                                      }}
                                    />
                                    <div>
                                      <span className='font-semibold'>Answer:</span>{' '}
                                      {q.correct_answer_for_matching}
                                    </div>
                                    <div className='mt-2 text-sm text-gray-500'>
                                      <span className='font-medium'>Explanation:</span>
                                      <ListeningExplanationDisplay
                                        explanation={q.explanation || ''}
                                        className='mt-1'
                                      />
                                    </div>
                                  </div>
                                );
                              case QuestionTypeEnumIndex.DRAG_AND_DROP: // Drag & Drop
                                return (
                                  <div key={q.question_id} className='p-4 border rounded'>
                                    <div>
                                      <span className='font-semibold'>Zone {q.zone_index}:</span>{' '}
                                      {q.drag_item_id}
                                    </div>
                                    <div className='mt-2 text-sm text-gray-500'>
                                      <span className='font-medium'>Explanation:</span>
                                      <ListeningExplanationDisplay
                                        explanation={q.explanation || ''}
                                        className='mt-1'
                                      />
                                    </div>
                                  </div>
                                );
                              default:
                                return null;
                            }
                          })}
                        </div>
                      ) : (
                        <div className='text-muted-foreground italic'>
                          No questions in this group.
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
      </div>
    </AudioProvider>
  );
}
