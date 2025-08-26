import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AudioProvider } from '@/contexts/AudioContext';
import { BookOpen, CheckCircle, Clock, Users } from 'lucide-react';
import { useRef } from 'react';

// You may need to adjust these imports/types to match your listening types
import { IeltsListeningType, ListeningTaskStatus } from '@/types/listening/listening.types';
import { QuestionType } from '@/types/reading/reading.types';

export interface ListeningTaskPreviewProps {
  taskData: any;
  questionGroups: any[];
  onFinish: () => void;
}

const getIeltsTypeLabel = (type: number): string => {
  switch (type) {
    case IeltsListeningType.ACADEMIC:
      return 'Academic';
    case IeltsListeningType.GENERAL_TRAINING:
      return 'General Training';
    default:
      return 'Unknown';
  }
};

const getStatusLabel = (status: number): string => {
  switch (status) {
    case ListeningTaskStatus.DRAFT:
      return 'Draft';
    case ListeningTaskStatus.PUBLISHED:
      return 'Published';
    case ListeningTaskStatus.DEACTIVATED:
      return 'Deactivated';
    default:
      return 'Unknown';
  }
};

const getQuestionTypeLabel = (type: QuestionType): string => {
  switch (type) {
    case QuestionType.MULTIPLE_CHOICE:
      return 'Multiple Choice';
    case QuestionType.FILL_IN_THE_BLANKS:
      return 'Fill in the Blanks';
    case QuestionType.MATCHING:
      return 'Matching';
    case QuestionType.DRAG_AND_DROP:
      return 'Drag & Drop';
    default:
      return 'Unknown';
  }
};

export function ListeningTaskPreview({
  taskData,
  questionGroups,
  onFinish,
}: ListeningTaskPreviewProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const totalQuestions = questionGroups.reduce((total, group) => total + group.questions.length, 0);
  const estimatedTime = Math.max(10, Math.ceil(totalQuestions * 1.5)); // 1.5 min/question, min 10 min

  return (
    <AudioProvider audioRef={audioRef}>
      <div className='space-y-6'>
        {/* Header & Stats */}
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle className='text-2xl'>{taskData.title}</CardTitle>
                <div className='flex gap-2 mt-2'>
                  <Badge variant='outline'>{getIeltsTypeLabel(taskData.ielts_type)}</Badge>
                  <Badge variant='outline'>Part {taskData.part_number}</Badge>
                  <Badge variant='outline'>{getStatusLabel(taskData.status)}</Badge>
                </div>
              </div>
              <Button onClick={onFinish} className='gap-2'>
                <CheckCircle className='h-4 w-4' />
                Publish Listening Task
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-4 gap-4 text-center'>
              <div className='flex flex-col items-center gap-2'>
                <BookOpen className='h-8 w-8 text-blue-600' />
                <div>
                  <p className='text-2xl font-bold'>{questionGroups.length}</p>
                  <p className='text-sm text-muted-foreground'>Question Groups</p>
                </div>
              </div>
              <div className='flex flex-col items-center gap-2'>
                <Users className='h-8 w-8 text-green-600' />
                <div>
                  <p className='text-2xl font-bold'>{totalQuestions}</p>
                  <p className='text-sm text-muted-foreground'>Total Questions</p>
                </div>
              </div>
              <div className='flex flex-col items-center gap-2'>
                <Clock className='h-8 w-8 text-orange-600' />
                <div>
                  <p className='text-2xl font-bold'>{estimatedTime}</p>
                  <p className='text-sm text-muted-foreground'>Est. Minutes</p>
                </div>
              </div>
              <div className='flex flex-col items-center gap-2'>
                <CheckCircle className='h-8 w-8 text-purple-600' />
                <div>
                  <p className='text-2xl font-bold'>Ready</p>
                  <p className='text-sm text-muted-foreground'>Status</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Task Preview */}
        <Card>
          <CardHeader>
            <CardTitle>🎧 Listening Task Preview</CardTitle>
            <p className='text-sm text-muted-foreground'>
              This is how students will see your listening task and questions
            </p>
          </CardHeader>
          <CardContent className='space-y-6'>
            {/* Listening Instruction */}
            <div className='bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500'>
              <h3 className='font-semibold text-blue-900 mb-2'>Listening Instructions</h3>
              <p className='text-blue-800'>{taskData.instruction}</p>
            </div>

            {/* Audio Player */}
            {taskData.audio_file && (
              <div className='my-4'>
                <audio
                  ref={audioRef}
                  controls
                  src={typeof taskData.audio_file === 'string' ? taskData.audio_file : undefined}
                >
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}

            {/* Transcript (if any) */}
            {taskData.transcript && (
              <div>
                <h4 className='font-semibold mb-2'>Transcript</h4>
                <div className='p-4 bg-gray-50 rounded-md whitespace-pre-wrap'>
                  {taskData.transcript}
                </div>
              </div>
            )}

            <Separator />

            {/* Questions Preview */}
            <div className='space-y-6'>
              <h3 className='font-semibold text-lg'>Questions</h3>

              {questionGroups.map((group, groupIndex) => (
                <Card key={groupIndex} className='border-l-4 border-l-green-500'>
                  <CardHeader className='pb-3'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <h4 className='font-semibold'>{group.section_label}</h4>
                        <Badge variant='secondary' className='mt-1'>
                          {getQuestionTypeLabel(group.question_type)}
                        </Badge>
                      </div>
                      <span className='text-sm text-muted-foreground'>
                        {group.questions.length} question{group.questions.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div
                      className='text-sm text-gray-600 mt-2 prose prose-sm max-w-none'
                      dangerouslySetInnerHTML={{ __html: group.instruction }}
                    />
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    {/* Render questions by type, similar to PassagePreview */}
                    {/* ... (copy logic from PassagePreview for each type) ... */}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AudioProvider>
  );
}
