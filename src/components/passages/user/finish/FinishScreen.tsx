import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ResultSet } from '@/types/attempt.types';
import { CheckCircle2 } from 'lucide-react';

const FinishScreen = ({
  score,
  total,
  resultSets,
  duration,
  onReview,
  onHome,
}: {
  score?: number;
  total?: number;
  resultSets?: ResultSet[];
  duration?: number;
  onReview?: () => void;
  onHome?: () => void;
}) => {
  function formatTime(sec?: number) {
    if (typeof sec !== 'number') return '';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  console.log('data', {
    score,
    total,
    resultSets,
    duration,
  });

  return (
    <div className='flex flex-col items-center justify-center min-h-[60vh] px-4'>
      <Card className='w-full max-w-2xl shadow-lg'>
        <CardHeader className='flex flex-col items-center gap-2'>
          <CheckCircle2 className='text-green-500 mb-2' size={48} />
          <CardTitle className='text-center text-2xl font-bold'>
            You've completed your attempt!
          </CardTitle>
          <CardDescription className='text-center text-base text-muted-foreground'>
            Thank you for submitting your answers.
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className='flex flex-col items-center gap-4 py-6 w-full'>
          <div className='flex flex-col items-center gap-2 w-full'>
            {typeof score === 'number' && typeof total === 'number' && (
              <div className='text-center'>
                <div className='text-4xl font-semibold text-primary'>
                  {score} / {total}
                </div>
                <div className='text-muted-foreground mt-1'>Your score</div>
              </div>
            )}
            {typeof duration === 'number' && (
              <div className='text-sm text-muted-foreground'>
                Time taken: {formatTime(duration)}
              </div>
            )}
          </div>
          {resultSets && resultSets.length > 0 && (
            <div className='w-full mt-4'>
              <div className='font-semibold mb-2'>Your Answers vs Correct Answers:</div>
              <div className='overflow-x-auto'>
                <table className='min-w-full border text-sm rounded-lg overflow-hidden'>
                  <thead className='bg-muted'>
                    <tr>
                      <th className='px-2 py-1 border'>#</th>
                      <th className='px-2 py-1 border'>Your Answer</th>
                      <th className='px-2 py-1 border'>Correct Answer</th>
                      <th className='px-2 py-1 border'>Result</th>
                      <th className='px-2 py-1 border'>Explanation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultSets
                      .sort((a, b) => a.question_index - b.question_index)
                      .map((r, idx) => (
                        <tr key={idx} className={r.is_correct ? 'bg-green-50' : 'bg-red-50'}>
                          <td className='px-2 py-1 border text-center'>{r.question_index}</td>
                          <td className='px-2 py-1 border text-center'>
                            {r.user_answer?.join(', ') || '-'}
                          </td>
                          <td className='px-2 py-1 border text-center'>
                            {r.correct_answer?.join(', ') || '-'}
                          </td>
                          <td className='px-2 py-1 border text-center font-semibold'>
                            {r.is_correct ? (
                              <span className='text-green-600'>Correct</span>
                            ) : (
                              <span className='text-red-600'>Incorrect</span>
                            )}
                          </td>
                          <td className='px-2 py-1 border text-center text-xs'>
                            {r.explanation || '-'}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
        <Separator />
        <CardFooter className='flex flex-col gap-2 sm:flex-row sm:justify-center'>
          {onReview && (
            <Button variant='outline' onClick={onReview} className='w-full sm:w-auto'>
              Review Answers
            </Button>
          )}
          {onHome && (
            <Button onClick={onHome} className='w-full sm:w-auto'>
              Back to Home
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default FinishScreen;
