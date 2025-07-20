'use client';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useParams, useRouter } from 'next/navigation';
import { ReactNode } from 'react';

export default function PracticeLayout({ children }: { children: ReactNode }) {
  const params = useParams();
  const router = useRouter();
  const tab = params.tabs as string;

  const handleTabChange = (value: string) => {
    if (value !== tab) {
      router.push(`/history/practices/${value}`);
    }
  };

  return (
    <div className='p-4'>
      <div className='flex items-center justify-center'>
        <Tabs value={tab} onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value='reading'>Reading</TabsTrigger>
            <TabsTrigger value='listening'>Listening</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className='mt-4'>{children}</div>
    </div>
  );
}
