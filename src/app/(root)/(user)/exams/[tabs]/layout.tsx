'use client';
import NotFound from '@/app/not-found';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useParams, useRouter } from 'next/navigation';
import { ReactNode } from 'react';

export default function ExamsLayout({ children }: { children: ReactNode }) {
  const params = useParams();
  const router = useRouter();
  const tab = params.tabs as string;

  const handleTabChange = (value: string) => {
    if (value !== tab) {
      router.push(`/exams/${value}`);
    }
  };

  if (tab !== 'reading' && tab !== 'listening') {
    return <NotFound />;
  }

  return (
    <div className='container mx-auto p-6'>
      <div className='flex justify-between items-end mb-6'>
        <h1 className='text-3xl font-bold text-tekhelet-300'>
          IELTS {tab === 'reading' ? 'Reading' : 'Listening'} Exams
        </h1>
        <div>
          <Tabs value={tab} onValueChange={handleTabChange}>
            <TabsList>
              {/* <TabsTrigger value='all'>All Exams</TabsTrigger> */}
              <TabsTrigger value='reading' className='data-[state=active]:text-tekhelet-400'>
                Reading
              </TabsTrigger>
              <TabsTrigger value='listening' className='data-[state=active]:text-tekhelet-400'>
                Listening
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <Card className='border'>
        <CardHeader className='bg-tekhelet-50 flex justify-between items-ends'>
          <CardTitle className='text-tekhelet-400'>Available Exams</CardTitle>
          <CardDescription className='text-medium-slate-blue-400'>
            Practice with a variety of IELTS exams to improve your skills
          </CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  );
}
