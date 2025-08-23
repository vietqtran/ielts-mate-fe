'use client';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

export interface PartLike<TData = any> {
  key: string;
  title: string;
  data: TData;
}

export interface PracticeContentRendererProps<TData = any> {
  renderLeftColumn: ReactNode;
  renderCenterColumn: ReactNode;
  renderRightColumn?: ReactNode;
  glass?: boolean;
  // layout overrides
  gridClassName?: string; // default grid grid-cols-12 gap-4 p-4
  leftColClassName?: string; // default col-span-5
  centerColClassName?: string; // default col-span-5
  rightColClassName?: string; // default col-span-2
}

export const PracticeContentRenderer = <TData,>({
  renderLeftColumn,
  renderCenterColumn,
  renderRightColumn,
  gridClassName,
  leftColClassName,
  centerColClassName,
  rightColClassName,
}: PracticeContentRendererProps<TData>) => {
  return (
    <div className='flex overflow-hidden h-full min-h-0 w-full'>
      <div className='flex-1 overflow-hidden min-h-0'>
        <div className={cn('h-full min-h-0 grid grid-cols-12 gap-4 p-4', gridClassName)}>
          <Card
            className={cn(
              'backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden flex flex-col min-h-0 border h-full col-span-5',
              leftColClassName
            )}
          >
            {renderLeftColumn}
          </Card>

          <Card
            className={cn(
              'backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden flex flex-col min-h-0 border h-full col-span-5',
              centerColClassName
            )}
          >
            {renderCenterColumn}
          </Card>

          <Card
            className={cn(
              'flex flex-col backdrop-blur-lg rounded-2xl shadow-xl border border-selective-yellow-300 h-full min-h-0 overflow-hidden col-span-2',
              rightColClassName
            )}
          >
            {renderRightColumn}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PracticeContentRenderer;
