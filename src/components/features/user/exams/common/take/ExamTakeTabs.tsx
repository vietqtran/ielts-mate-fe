'use client';

import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import React from 'react';

export interface PartLike<TData = any> {
  key: string;
  title: string;
  data: TData;
}

export interface ExamTakeTabsProps<TData = any> {
  parts: PartLike<TData>[];
  activeKey: string;
  onChange: (key: string) => void;
  renderLeftColumn: (part: PartLike<TData>) => React.ReactNode;
  renderCenterColumn: (part: PartLike<TData>) => React.ReactNode;
  renderRightColumn?: (part: PartLike<TData>) => React.ReactNode;
  glass?: boolean;
  // layout overrides
  gridClassName?: string; // default grid grid-cols-12 gap-4 p-4
  leftColClassName?: string; // default col-span-5
  centerColClassName?: string; // default col-span-5
  rightColClassName?: string; // default col-span-2
}

export const ExamTakeTabs = <TData,>({
  parts,
  activeKey,
  onChange,
  renderLeftColumn,
  renderCenterColumn,
  renderRightColumn,
  glass = false,
  gridClassName,
  leftColClassName,
  centerColClassName,
  rightColClassName,
}: ExamTakeTabsProps<TData>) => {
  return (
    <div className='flex overflow-hidden h-full min-h-0 w-full'>
      <Tabs
        value={activeKey}
        onValueChange={onChange}
        className='h-full min-h-0 flex flex-col w-full'
      >
        <div
          className={cn(
            'px-4 py-2 flex-shrink-0 border-b',
            glass ? 'bg-white/80 backdrop-blur-lg' : 'bg-white'
          )}
        >
          <TabsList className='flex w-full flex-wrap gap-2'>
            {parts.map((part) => (
              <TabsTrigger
                key={part.key}
                value={part.key}
                className='data-[state=active]:bg-tekhelet-500 data-[state=active]:text-tangerine-600'
              >
                {part.title}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {parts.map((part) => (
          <TabsContent key={part.key} value={part.key} className='flex-1 overflow-hidden min-h-0'>
            <div className={cn('h-full min-h-0 grid grid-cols-12 gap-4 p-4', gridClassName)}>
              <Card
                className={cn(
                  'bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden flex flex-col min-h-0 border border-tekhelet-200 h-full col-span-5',
                  leftColClassName
                )}
              >
                {renderLeftColumn(part)}
              </Card>

              <Card
                className={cn(
                  'bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden flex flex-col min-h-0 border border-medium-slate-blue-200 h-full col-span-5',
                  centerColClassName
                )}
              >
                {renderCenterColumn(part)}
              </Card>

              <Card
                className={cn(
                  'flex flex-col bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-selective-yellow-300 h-full min-h-0 overflow-hidden col-span-2',
                  rightColClassName
                )}
              >
                {renderRightColumn?.(part)}
              </Card>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ExamTakeTabs;
