'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { LoadListeningAttemptResultResponse } from '@/types/listening/listening-attempt.types';
import { CheckCircle, ChevronDown, ChevronRight, Volume2, XCircle } from 'lucide-react';

interface ListeningQuestionAnalysisProps {
  attemptDetails: LoadListeningAttemptResultResponse;
  openQuestions: Set<string>;
  onToggleQuestion: (questionId: string) => void;
}

export const ListeningQuestionAnalysis = ({
  attemptDetails,
  openQuestions,
  onToggleQuestion,
}: ListeningQuestionAnalysisProps) => {
  // Create a map of user answers for quick lookup
  const userAnswersMap = new Map<string, string[]>();
  attemptDetails.answers.forEach((answer) => {
    const answerValues: string[] = [];

    if (answer.choice_ids && answer.choice_ids.length > 0) {
      answerValues.push(...answer.choice_ids);
    }
    if (answer.filled_text_answer) {
      answerValues.push(answer.filled_text_answer);
    }
    if (answer.matched_text_answer) {
      answerValues.push(answer.matched_text_answer);
    }
    if (answer.drag_item_id) {
      answerValues.push(answer.drag_item_id);
    }

    userAnswersMap.set(answer.question_id, answerValues);
  });

  return (
    <Card className='bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-tekhelet-400'>
          <Volume2 className='w-5 h-5' />
          Question Analysis
        </CardTitle>
        <p className='text-tekhelet-500'>
          Detailed breakdown of your answers for each question group
        </p>
      </CardHeader>
      <CardContent className='space-y-4'>
        {attemptDetails.task_data.question_groups.map((group, groupIndex) => (
          <Card key={group.group_id} className='backdrop-blur-sm'>
            <CardHeader className='pb-3'>
              <CardTitle className='text-lg text-tekhelet-400'>
                Part {groupIndex + 1}: {group.section_label}
              </CardTitle>
              {group.instruction && (
                <div
                  className='text-sm text-tekhelet-500'
                  dangerouslySetInnerHTML={{ __html: group.instruction }}
                />
              )}
            </CardHeader>
            <CardContent>
              {/* Show answered questions for this group */}
              <div className='space-y-3'>
                {group.questions.map((question, questionIndex) => {
                  // Find the answer for this specific question
                  const answer = attemptDetails.answers.find(
                    (a) => a.question_id === question.question_id
                  );

                  if (!answer) return null; // Skip if no answer found

                  const userAnswers = userAnswersMap.get(answer.question_id) || [];
                  const isOpen = openQuestions.has(answer.question_id);

                  // Check if the answer is correct by comparing with the correct_answer
                  const isCorrect =
                    answer.filled_text_answer === question.correct_answer ||
                    (answer.choice_ids && answer.choice_ids.includes(question.correct_answer));

                  return (
                    <Collapsible
                      key={answer.question_id}
                      open={isOpen}
                      onOpenChange={() => onToggleQuestion(answer.question_id)}
                      className='border rounded-lg bg-white/80 hover:bg-white/90 transition-colors'
                    >
                      <CollapsibleTrigger className='w-full'>
                        <div className='flex items-center justify-between w-full p-3 rounded-lg bg-white/80 hover:bg-white/90 transition-colors'>
                          <div className='flex items-center gap-3'>
                            {isCorrect ? (
                              <CheckCircle className='w-5 h-5 text-green-600' />
                            ) : (
                              <XCircle className='w-5 h-5 text-red-600' />
                            )}
                            <span className='text-sm font-medium text-tekhelet-400'>
                              Question {questionIndex + 1}
                            </span>
                            <Badge
                              variant={isCorrect ? 'default' : 'destructive'}
                              className='text-xs'
                            >
                              {isCorrect ? 'Correct' : 'Incorrect'}
                            </Badge>
                          </div>
                          {isOpen ? (
                            <ChevronDown className='w-4 h-4 text-tekhelet-400' />
                          ) : (
                            <ChevronRight className='w-4 h-4 text-tekhelet-400' />
                          )}
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent className='mt-2'>
                        <div className='p-4 bg-white/60 rounded-lg space-y-4'>
                          {/* User's Answer Section */}
                          <div>
                            <h4 className='text-sm font-medium text-tekhelet-400 mb-2'>
                              Your Answer:
                            </h4>
                            <div className='space-y-1'>
                              {answer.choice_ids && answer.choice_ids.length > 0 && (
                                <p className='text-sm text-tekhelet-500'>
                                  <strong>Choices:</strong> {answer.choice_ids.join(', ')}
                                </p>
                              )}
                              {answer.filled_text_answer && (
                                <p className='text-sm text-tekhelet-500'>
                                  <strong>Text Answer:</strong> {answer.filled_text_answer}
                                </p>
                              )}
                              {answer.matched_text_answer && (
                                <p className='text-sm text-tekhelet-500'>
                                  <strong>Matched Answer:</strong> {answer.matched_text_answer}
                                </p>
                              )}
                              {answer.drag_item_id && (
                                <p className='text-sm text-tekhelet-500'>
                                  <strong>Drag Item:</strong> {answer.drag_item_id}
                                </p>
                              )}
                              {userAnswers.length === 0 && (
                                <p className='text-sm text-red-600 italic'>No answer provided</p>
                              )}
                            </div>
                          </div>

                          {/* Correct Answer Section */}
                          <div className='border-t border-tekhelet-200 pt-3'>
                            <h4 className='text-sm font-medium text-tekhelet-400 mb-2'>
                              Correct Answer:
                            </h4>
                            <div
                              className={`p-2 rounded ${
                                isCorrect
                                  ? 'bg-green-50 border border-green-200'
                                  : 'bg-red-50 border border-red-200'
                              }`}
                            >
                              <p
                                className={`text-sm font-medium ${
                                  isCorrect ? 'text-green-700' : 'text-red-700'
                                }`}
                              >
                                {question.correct_answer}
                              </p>
                            </div>
                          </div>

                          {/* Question Details
                          <div className="border-t border-tekhelet-200 pt-3">
                            <h4 className="text-sm font-medium text-tekhelet-400 mb-2">
                              Question Details:
                            </h4>
                            <div className="space-y-1 text-xs text-tekhelet-500">
                              <p><strong>Points:</strong> {question.point}</p>
                              <p><strong>Question Type:</strong> {question.question_type}</p>
                              <p><strong>Expected Answers:</strong> {question.number_of_correct_answers}</p>
                            </div>
                          </div> */}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })}
              </div>

              {/* Show drag items if available */}
              {group.drag_items && group.drag_items.length > 0 && (
                <div className='mt-4 pt-4 border-t border-tekhelet-200'>
                  <h4 className='text-sm font-medium text-tekhelet-400 mb-2'>
                    Available Drag Items for this section:
                  </h4>
                  <div className='flex flex-wrap gap-2'>
                    {group.drag_items.map((item) => (
                      <Badge
                        key={item.drag_item_id}
                        variant='outline'
                        className='text-xs bg-white/80'
                      >
                        {item.content}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {/* Audio Transcript Section */}
        {attemptDetails.task_data.transcript && (
          <Card className='bg-tekhelet-100/50 backdrop-blur-sm'>
            <CardHeader>
              <CardTitle className='text-lg text-tekhelet-400'>Audio Transcript</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='p-4 bg-white/60 rounded-lg'>
                <p className='text-sm text-tekhelet-500 whitespace-pre-line'>
                  {attemptDetails.task_data.transcript}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};
