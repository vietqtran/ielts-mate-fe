'use client';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { TimeInput } from '@/components/ui/time-input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const explanationSchema = z
  .object({
    start_time: z.string(),
    end_time: z.string(),
  })
  .refine(
    (data) => {
      // Validate format and time comparison only on submit
      const timeFormatRegex = /^\d{2}:\d{2}:\d{2}$/;

      if (!timeFormatRegex.test(data.start_time)) {
        return false;
      }

      if (!timeFormatRegex.test(data.end_time)) {
        return false;
      }

      // Convert times to seconds for comparison
      const startSeconds = data.start_time
        .split(':')
        .reduce((acc, time) => 60 * acc + parseInt(time), 0);
      const endSeconds = data.end_time
        .split(':')
        .reduce((acc, time) => 60 * acc + parseInt(time), 0);
      return endSeconds > startSeconds;
    },
    {
      message:
        'Please enter valid times in hh:mm:ss format and ensure end time is after start time',
      path: ['end_time'],
    }
  );

type ExplanationFormData = z.infer<typeof explanationSchema>;

interface ListeningExplanationFormProps {
  value: string;
  onChange: (value: string) => void;
  onCancel?: () => void;
  isEditing?: boolean;
}

export function ListeningExplanationForm({
  value,
  onChange,
  onCancel,
  isEditing = false,
}: ListeningExplanationFormProps) {
  // Parse existing value if it's a JSON string with time data
  const parseExistingValue = (): { start_time: string; end_time: string } => {
    if (!value) return { start_time: '00:00:00', end_time: '00:00:00' };

    try {
      const parsed = JSON.parse(value);
      if (parsed.start_time && parsed.end_time) {
        return {
          start_time: parsed.start_time,
          end_time: parsed.end_time,
        };
      }
    } catch (e) {
      // If not JSON, return default values
    }

    return { start_time: '00:00:00', end_time: '00:00:00' };
  };

  const form = useForm<ExplanationFormData>({
    resolver: zodResolver(explanationSchema),
    defaultValues: parseExistingValue(),
  });

  const handleSubmit = (data: ExplanationFormData) => {
    // Convert to JSON string and submit
    const jsonString = JSON.stringify({
      start_time: data.start_time,
      end_time: data.end_time,
    });
    onChange(jsonString);
    if (onCancel) {
      onCancel();
    }
  };

  const handleTimeChange = (fieldName: 'start_time' | 'end_time', value: string) => {
    form.setValue(fieldName, value);

    // Get current values
    const currentValues = form.getValues();

    // Only update if both values are present and valid
    if (currentValues.start_time && currentValues.end_time) {
      const timeFormatRegex = /^\d{2}:\d{2}:\d{2}$/;
      if (
        timeFormatRegex.test(currentValues.start_time) &&
        timeFormatRegex.test(currentValues.end_time)
      ) {
        const startSeconds = currentValues.start_time
          .split(':')
          .reduce((acc, time) => 60 * acc + parseInt(time), 0);
        const endSeconds = currentValues.end_time
          .split(':')
          .reduce((acc, time) => 60 * acc + parseInt(time), 0);
        if (endSeconds > startSeconds) {
          handleSubmit(currentValues);
        }
      }
    }
  };

  return (
    <div className='space-y-3'>
      <h4 className='text-sm font-medium text-muted-foreground'>Audio Time Range</h4>
      <Form {...form}>
        <div className='grid grid-cols-2 gap-3'>
          <FormField
            control={form.control}
            name='start_time'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-xs'>Start Time</FormLabel>
                <FormControl>
                  <TimeInput
                    value={field.value}
                    onChange={(value) => handleTimeChange('start_time', value)}
                    placeholder='00:00:00'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='end_time'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-xs'>End Time</FormLabel>
                <FormControl>
                  <TimeInput
                    value={field.value}
                    onChange={(value) => handleTimeChange('end_time', value)}
                    placeholder='00:00:00'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </Form>
    </div>
  );
}
