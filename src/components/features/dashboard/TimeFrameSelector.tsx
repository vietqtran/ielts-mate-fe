'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TimeFrame } from '@/types/dashboard.types';
import { Calendar } from 'lucide-react';

interface TimeFrameSelectorProps {
  value: TimeFrame;
  onChange: (value: TimeFrame) => void;
  isLoading?: boolean;
}

export const TimeFrameSelector = ({ value, onChange, isLoading }: TimeFrameSelectorProps) => {
  const timeFrameOptions: { value: TimeFrame; label: string }[] = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
  ];

  return (
    <div className='flex items-center gap-3'>
      <div className='flex items-center gap-2 text-tekhelet-500'>
        <Calendar className='h-4 w-4' />
        <span className='text-sm font-medium'>Time Period:</span>
      </div>

      <Select value={value} onValueChange={onChange} disabled={isLoading}>
        <SelectTrigger className='w-32 bg-white/70 backdrop-blur-sm border-tekhelet-900/20 text-tekhelet-400 focus:ring-tekhelet-300 focus:border-tekhelet-300'>
          <SelectValue placeholder='Select period' />
        </SelectTrigger>
        <SelectContent className='bg-white/90 backdrop-blur-lg border-tekhelet-900/20'>
          {timeFrameOptions.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className='text-tekhelet-400 focus:bg-tekhelet-900/10 focus:text-tekhelet-300'
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
