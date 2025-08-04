'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ReminderConfigData } from '@/types/config/reminder/reminder.types';
import { BaseResponse } from '@/types/reading/reading.types';
import { getLocalTime } from '@/utils/time';
import { format, parseISO } from 'date-fns';

const RECURRENCE_OPTIONS = [
  { value: 0, label: 'No Recurrence' },
  { value: 1, label: 'Daily' },
  { value: 2, label: 'Weekly' },
  { value: 3, label: 'Monthly' },
  { value: 4, label: 'Yearly' },
  { value: 5, label: 'Custom Dates' },
];

interface CurrentReminderConfigProps {
  reminderData: BaseResponse<ReminderConfigData>;
  onEdit: () => void;
}

const CurrentReminderConfig = ({ reminderData, onEdit }: CurrentReminderConfigProps) => {
  const config = reminderData?.data;
  const localTime = getLocalTime(config.reminder_date[0], config.reminder_time, config.zone);

  if (!config) return null;

  return (
    <Card className='border rounded-2xl p-8 w-3/5 mt-5 mx-auto'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-tekhelet-400 mb-2'>Your Reminder Configuration</h1>
        </div>
        <Button
          onClick={onEdit}
          variant='outline'
          className='bg-selective-yellow-300 text-white hover:bg-selective-yellow-400'
        >
          Edit
        </Button>
      </div>

      <div className='space-y-6'>
        <Card className='backdrop-blur-md border'>
          <CardHeader>
            <CardTitle className='text-tekhelet-400'>Current Settings</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <Label className='text-sm font-medium text-tekhelet-400'>Email</Label>
                <p className='text-tekhelet-300 mt-1'>{config.email}</p>
              </div>
              <div>
                <Label className='text-sm font-medium text-tekhelet-400'>Status</Label>
                <div className='mt-1'>
                  <Badge
                    variant={'outline'}
                    className={`${config.enabled ? 'bg-green-500' : 'bg-red-500'} text-white`}
                  >
                    {config.enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className='text-sm font-medium text-tekhelet-400'>Time</Label>
                <p className='text-tekhelet-300 mt-1'>{localTime}</p>
              </div>
              <div>
                <Label className='text-sm font-medium text-tekhelet-400'>Recurrence</Label>
                <p className='text-tekhelet-300 mt-1'>
                  {RECURRENCE_OPTIONS.find((opt) => opt.value === config.recurrence)?.label}
                </p>
              </div>
              <div>
                <Label className='text-sm font-medium text-tekhelet-400'>Timezone</Label>
                <p className='text-tekhelet-300 mt-1'>{config.zone}</p>
              </div>
              {config.reminder_date && config.reminder_date.length > 0 && (
                <div>
                  <Label className='text-sm font-medium text-tekhelet-400'>Reminder Dates</Label>
                  <div className='flex flex-wrap gap-2 mt-2'>
                    {config.reminder_date.map((date: string, index: number) => (
                      <Badge key={index} variant='outline' className='bg-tangerine-600'>
                        {format(parseISO(date), 'MMM dd, yyyy')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div>
              <Label className='text-sm font-medium text-tekhelet-400'>Message</Label>
              <p className='text-tekhelet-300 mt-3 p-3 bg-selective-yellow-900 rounded-lg border'>
                {config.message}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Card>
  );
};

export default CurrentReminderConfig;
