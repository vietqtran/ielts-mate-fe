'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit, Play } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useState } from 'react';

// Mock data - in real app, this would come from your API
const mockPassage = {
  id: '1',
  title: 'Climate Change and Global Warming',
  topic: 'Environment',
  difficulty: 'Hard',
  wordCount: 850,
  questionCount: 13,
  createdAt: '2024-01-15',
  status: 'Published',
  content: `Climate change refers to long-term shifts in global temperatures and weather patterns. While climate variations are natural, scientific evidence shows that human activities have been the main driver of climate change since the 1800s.

The primary cause of recent climate change is the increased concentration of greenhouse gases in the atmosphere. [DROP_ZONE:1] such as carbon dioxide, methane, and nitrous oxide trap heat from the sun, creating what scientists call the greenhouse effect.

The burning of fossil fuels for energy and transportation is the largest source of greenhouse gas emissions. [DROP_ZONE:2] also contribute significantly to these emissions through deforestation and industrial processes.

The effects of climate change are already visible worldwide. Rising sea levels threaten coastal communities, while extreme weather events become more frequent and severe. [DROP_ZONE:3] are experiencing unprecedented changes in precipitation patterns, affecting agriculture and water resources.`,
  questions: [
    {
      id: 'q1',
      type: 'drag-drop',
      question: 'Complete the passage by dragging the correct words into the drop zones.',
      dragOptions: ['These gases', 'Human activities', 'Many regions', 'Ocean currents'],
      dropZoneAnswers: {
        '1': 'These gases',
        '2': 'Human activities',
        '3': 'Many regions',
      },
    },
  ],
};

export default function ViewPassagePage({ params }: { params: { id: string } }) {
  const [showAnswers, setShowAnswers] = useState(false);

  const renderPassageWithDropZones = () => {
    const parts = mockPassage.content.split(/(\[DROP_ZONE:[^\]]+\])/g);

    return (
      <div className='prose max-w-none'>
        {parts.map((part, index) => {
          if (part.match(/\[DROP_ZONE:[^\]]+\]/)) {
            const dropZoneId = part.match(/\[DROP_ZONE:([^\]]+)\]/)?.[1] ?? '';
            const answer =
              mockPassage.questions[0]?.dropZoneAnswers?.[
                dropZoneId as keyof (typeof mockPassage.questions)[0]['dropZoneAnswers']
              ];

            return (
              <span
                key={index}
                className={`inline-flex items-center gap-1 px-3 py-1 mx-1 rounded border-2 border-dashed ${
                  showAnswers
                    ? 'bg-green-100 text-green-800 border-green-300'
                    : 'bg-blue-100 text-blue-800 border-blue-300'
                }`}
              >
                {showAnswers ? answer : `[${dropZoneId}]`}
              </span>
            );
          }
          return <span key={index}>{part}</span>;
        })}
      </div>
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-100 text-green-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='container mx-auto px-4 py-8'>
        {/* Header */}
        <div className='flex items-center justify-between mb-8'>
          <div className='flex items-center gap-4'>
            <Link href='/reading-passages'>
              <Button variant='ghost' size='sm'>
                <ArrowLeft className='h-4 w-4 mr-2' />
                Back to Passages
              </Button>
            </Link>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>{mockPassage.title}</h1>
              <p className='text-gray-600'>Topic: {mockPassage.topic}</p>
            </div>
          </div>
          <div className='flex gap-2'>
            <Button variant='outline'>
              <Play className='h-4 w-4 mr-2' />
              Preview Test
            </Button>
            <Link href={`/reading-passages/${params.id}/edit`}>
              <Button>
                <Edit className='h-4 w-4 mr-2' />
                Edit
              </Button>
            </Link>
          </div>
        </div>

        {/* Passage Info */}
        <Card className='mb-6'>
          <CardHeader>
            <CardTitle>Passage Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
              <div>
                <span className='text-sm text-gray-500'>Difficulty</span>
                <div className='mt-1'>
                  <Badge className={getDifficultyColor(mockPassage.difficulty)}>
                    {mockPassage.difficulty}
                  </Badge>
                </div>
              </div>
              <div>
                <span className='text-sm text-gray-500'>Word Count</span>
                <div className='mt-1 font-medium'>{mockPassage.wordCount}</div>
              </div>
              <div>
                <span className='text-sm text-gray-500'>Questions</span>
                <div className='mt-1 font-medium'>{mockPassage.questionCount}</div>
              </div>
              <div>
                <span className='text-sm text-gray-500'>Status</span>
                <div className='mt-1'>
                  <Badge variant='outline'>{mockPassage.status}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Passage Content */}
        <Card className='mb-6'>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <CardTitle>Passage Content</CardTitle>
              <Button variant='outline' size='sm' onClick={() => setShowAnswers(!showAnswers)}>
                {showAnswers ? 'Hide Answers' : 'Show Answers'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className='bg-white p-6 rounded border'>{renderPassageWithDropZones()}</div>
          </CardContent>
        </Card>

        {/* Questions */}
        <Card>
          <CardHeader>
            <CardTitle>Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-6'>
              {mockPassage.questions.map((question, index) => (
                <div key={question.id} className='border-l-4 border-blue-500 pl-4'>
                  <div className='flex items-center gap-2 mb-2'>
                    <Badge variant='outline'>Question {index + 1}</Badge>
                    <Badge>{question.type.replace('-', ' ')}</Badge>
                  </div>
                  <p className='font-medium mb-3'>{question.question}</p>

                  {question.type === 'drag-drop' && (
                    <div className='space-y-3'>
                      <div>
                        <span className='text-sm font-medium text-gray-600'>
                          Available Options:
                        </span>
                        <div className='flex flex-wrap gap-2 mt-1'>
                          {question.dragOptions?.map((option, optIndex) => (
                            <Badge key={optIndex} variant='secondary'>
                              {option}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {showAnswers && (
                        <div>
                          <span className='text-sm font-medium text-gray-600'>
                            Correct Answers:
                          </span>
                          <div className='mt-1 space-y-1'>
                            {Object.entries(question.dropZoneAnswers || {}).map(
                              ([zoneId, answer]) => (
                                <div key={zoneId} className='text-sm'>
                                  <span className='font-mono bg-gray-100 px-2 py-1 rounded'>
                                    Zone {zoneId}:
                                  </span>
                                  <span className='ml-2 text-green-600 font-medium'>{answer}</span>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
