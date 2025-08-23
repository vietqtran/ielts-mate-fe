'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import React from 'react';

export interface ExamStatusPartProgress {
  key: string;
  title: string;
  answered: number;
  total: number;
}

export interface ExamStatusPanelProps {
  parts: ExamStatusPartProgress[];
  activeKey: string;
  onNavigate: (key: string) => void;
  className?: string;
  title?: string;
}

export const ExamStatusPanel: React.FC<ExamStatusPanelProps> = ({
  parts,
  activeKey,
  onNavigate,
  className,
  title = 'Exam Status',
}) => {
  return (
    <div className={cn('flex flex-col h-full', className)}>
      <div className='flex-1 space-y-4 overflow-y-auto px-4 min-h-0'>
        <div className='space-y-2'>
          <h4 className='font-semibold text-xl text-tekhelet-600'>Progress</h4>
          {parts.map((p) => (
            <div key={p.key} className='flex justify-between text-sm'>
              <span
                className={cn(
                  p.key === activeKey ? 'font-semibold' : '',
                  p.answered < p.total ? 'text-selective-yellow-300' : 'text-green-600'
                )}
              >
                {p.title}
              </span>
              <span
                className={cn(
                  p.key === activeKey ? 'font-semibold' : '',
                  p.answered < p.total ? 'text-selective-yellow-300' : 'text-green-600'
                )}
              >
                {p.answered}/{p.total}
              </span>
            </div>
          ))}
        </div>

        <div className='space-y-2'>
          {parts.map((p) => (
            <Button
              key={p.key}
              variant={p.key === activeKey ? 'default' : 'outline'}
              size='sm'
              onClick={() => onNavigate(p.key)}
              disabled={p.key === activeKey}
              className={cn(
                'w-full',
                p.key === activeKey
                  ? 'bg-tekhelet-600 hover:bg-tekhelet-700 text-white'
                  : 'text-tekhelet-600 hover:bg-tekhelet-50'
              )}
            >
              {p.key === activeKey ? `${p.title}` : `Go to ${p.title}`}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExamStatusPanel;
