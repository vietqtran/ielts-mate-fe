'use client';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import type { DateRange } from 'react-day-picker';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DatePickerWithRangeProps {
  className?: string;
  dateRange?: DateRange;
  onDateRangeChange?: (dateRange: DateRange | undefined) => void;
  placeholder?: string;
}

export function DatePickerWithRange({
  className,
  dateRange,
  onDateRangeChange,
  placeholder = 'Pick a date range',
}: DatePickerWithRangeProps) {
  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id='date'
            variant='outline'
            className={cn(
              'w-full justify-start text-left font-normal bg-white/60 backdrop-blur-lg border border-tekhelet-900/10 rounded-xl shadow-xl',
              !dateRange && 'text-tekhelet-500'
            )}
          >
            <CalendarIcon className='mr-2 h-4 w-4 text-tekhelet-400' />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, 'LLL dd, y')} - {format(dateRange.to, 'LLL dd, y')}
                </>
              ) : (
                format(dateRange.from, 'LLL dd, y')
              )
            ) : (
              <span className='text-tekhelet-500'>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className='w-auto p-0 bg-white/90 backdrop-blur-lg border border-tekhelet-900/10 rounded-2xl shadow-xl'
          align='start'
        >
          <Calendar
            initialFocus
            mode='range'
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={onDateRangeChange}
            numberOfMonths={2}
            className='bg-transparent'
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
