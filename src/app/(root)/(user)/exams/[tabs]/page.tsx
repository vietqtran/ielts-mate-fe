'use client';

import { ListeningExamsTable, ReadingExamsTable } from '@/components/features/user/exams';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useParams, useRouter } from 'next/navigation';

const ExamHomepage = () => {
  const param = useParams();
  const router = useRouter();
  const tab = param.tabs as string;

  const handleTabChange = (value: string) => {
    if (value !== tab) {
      router.push(`/exams/${value}`);
    }
  };

  const renderTabContent = () => {
    switch (tab) {
      case 'reading':
        return <ReadingExamsTable />;
      case 'listening':
        return <ListeningExamsTable />;
    }
  };

  return (
    <div className='container mx-auto p-6'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-3xl font-bold text-tekhelet-300'>IELTS Exams</h1>
      </div>

      <Card className='border'>
        <CardHeader className='bg-tekhelet-50'>
          <CardTitle className='text-tekhelet-400'>Available Exams</CardTitle>
          <CardDescription className='text-medium-slate-blue-400'>
            Practice with a variety of IELTS exams to improve your skills
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} className='w-full' onValueChange={handleTabChange}>
            <TabsList className='mb-4'>
              {/* <TabsTrigger value='all'>All Exams</TabsTrigger> */}
              <TabsTrigger value='reading' className='data-[state=active]:text-tekhelet-400'>
                Reading
              </TabsTrigger>
              <TabsTrigger value='listening' className='data-[state=active]:text-tekhelet-400'>
                Listening
              </TabsTrigger>
            </TabsList>

            {renderTabContent()}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExamHomepage;
