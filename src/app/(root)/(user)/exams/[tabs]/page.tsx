'use client';

import {
  AllExamsTable,
  ListeningExamsTable,
  ReadingExamsTable,
} from '@/components/features/user/exams';
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
      default:
        return <AllExamsTable />;
    }
  };

  return (
    <div className='container mx-auto p-6'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-3xl font-bold'>IELTS Exams</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Exams</CardTitle>
          <CardDescription>
            Practice with a variety of IELTS exams to improve your skills
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} className='w-full' onValueChange={handleTabChange}>
            <TabsList className='mb-4'>
              <TabsTrigger value='all'>All Exams</TabsTrigger>
              <TabsTrigger value='reading'>Reading</TabsTrigger>
              <TabsTrigger value='listening'>Listening</TabsTrigger>
            </TabsList>

            {renderTabContent()}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExamHomepage;
