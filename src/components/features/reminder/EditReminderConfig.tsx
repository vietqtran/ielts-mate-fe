'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ReminderConfigFormData, reminderConfigSchema } from '@/schemas/reminder.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { format, parseISO } from 'date-fns';
import { CalendarIcon, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

const RECURRENCE_OPTIONS = [
  { value: 0, label: 'No Recurrence' },
  { value: 1, label: 'Daily' },
  { value: 2, label: 'Weekly' },
  { value: 3, label: 'Monthly' },
  { value: 4, label: 'Yearly' },
  { value: 5, label: 'Custom Dates' },
];

interface EditReminderConfigProps {
  initialData?: ReminderConfigFormData;
  isEditing: boolean;
  onSubmit: (data: ReminderConfigFormData) => Promise<void>;
  onCancel?: () => void;
  isSubmitting: boolean;
}

const EditReminderConfig = ({
  initialData,
  isEditing,
  onSubmit,
  onCancel,
  isSubmitting,
}: EditReminderConfigProps) => {
  const form = useForm<ReminderConfigFormData>({
    resolver: zodResolver(reminderConfigSchema),
    defaultValues: initialData || {
      email: '',
      reminder_date: [],
      reminder_time: '00:00',
      recurrence: 0,
      time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      enable: true,
      message: 'Time for your IELTS practice session!',
    },
  });

  const timeZones = Intl.supportedValuesOf('timeZone');

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = form;
  const watchedRecurrence = watch('recurrence');

  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [showCalendar, setShowCalendar] = useState(false);

  // Initialize form with initial data when it changes
  useEffect(() => {
    if (initialData) {
      reset(initialData);
      if (initialData.reminder_date) {
        setSelectedDates(initialData.reminder_date.map((date: string) => parseISO(date)));
      }
    }
  }, [initialData, reset]);

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    if (watchedRecurrence === 5) {
      // Custom dates
      const dateExists = selectedDates.some(
        (d) => format(d, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      );

      if (dateExists) {
        const newDates = selectedDates.filter(
          (d) => format(d, 'yyyy-MM-dd') !== format(date, 'yyyy-MM-dd')
        );
        setSelectedDates(newDates);
        setValue(
          'reminder_date',
          newDates.map((d) => format(d, 'yyyy-MM-dd'))
        );
      } else {
        const newDates = [...selectedDates, date];
        setSelectedDates(newDates);
        setValue(
          'reminder_date',
          newDates.map((d) => format(d, 'yyyy-MM-dd'))
        );
      }
    } else if (watchedRecurrence === 0) {
      // No recurrence
      setSelectedDates([date]);
      setValue('reminder_date', [format(date, 'yyyy-MM-dd')]);
    } else {
      // For other recurrence types, use today as default
      const today = new Date();
      setSelectedDates([today]);
      setValue('reminder_date', [format(today, 'yyyy-MM-dd')]);
    }
  };

  const handleTimezoneChange = (value: string) => {
    setValue('time_zone', value);
  };

  const handleRecurrenceChange = (value: string) => {
    const recurrence = parseInt(value);
    setValue('recurrence', recurrence);

    // Reset dates based on recurrence type
    if (recurrence === 5) {
      // Custom
      setSelectedDates([]);
      setValue('reminder_date', []);
    } else if (recurrence === 0) {
      // None
      setSelectedDates([]);
      setValue('reminder_date', []);
    } else {
      // Daily, Weekly, Monthly, Yearly - use today
      const today = new Date();
      setSelectedDates([today]);
      setValue('reminder_date', [format(today, 'yyyy-MM-dd')]);
    }
  };

  const removeDate = (dateToRemove: Date) => {
    const newDates = selectedDates.filter(
      (d) => format(d, 'yyyy-MM-dd') !== format(dateToRemove, 'yyyy-MM-dd')
    );
    setSelectedDates(newDates);
    setValue(
      'reminder_date',
      newDates.map((d) => format(d, 'yyyy-MM-dd'))
    );
  };

  return (
    <div className='backdrop-blur-lg border rounded-2xl shadow-lg  p-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-tekhelet-400 mb-2'>
          {isEditing ? 'Edit Reminder Configuration' : 'Create New Reminder'}
        </h1>
        {!isEditing && (
          <p className='text-tekhelet-500'>Configure your personalized IELTS practice reminders</p>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
        <Card className='bg-white/80 backdrop-blur-md border'>
          <CardContent className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-2'>
                <Label htmlFor='email' className='text-sm font-medium text-tekhelet-400'>
                  Email Address
                </Label>
                <Controller
                  name='email'
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id='email'
                      type='email'
                      placeholder='your@email.com'
                      className=' focus:border-medium-slate-blue-300'
                    />
                  )}
                />
                {errors.email && (
                  <p className='text-sm text-persimmon-300'>{errors.email.message}</p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='time' className='text-sm font-medium text-tekhelet-400'>
                  Reminder Time
                </Label>
                <Controller
                  name='reminder_time'
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id='time'
                      type='time'
                      className=' focus:border-medium-slate-blue-300'
                    />
                  )}
                />
                {errors.reminder_time && (
                  <p className='text-sm text-persimmon-300'>{errors.reminder_time.message}</p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='recurrence' className='text-sm font-medium text-tekhelet-400'>
                  Recurrence Pattern
                </Label>
                <Controller
                  name='recurrence'
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value.toString()}
                      onValueChange={(value) => {
                        field.onChange(parseInt(value));
                        handleRecurrenceChange(value);
                      }}
                    >
                      <SelectTrigger className=' focus:border-medium-slate-blue-300 w-full'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {RECURRENCE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value.toString()}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.recurrence && (
                  <p className='text-sm text-persimmon-300'>{errors.recurrence.message}</p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='timezone' className='text-sm font-medium text-tekhelet-400'>
                  Timezone
                </Label>
                <Controller
                  name='time_zone'
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value.toString()}
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleTimezoneChange(value);
                      }}
                    >
                      <SelectTrigger className=' focus:border-medium-slate-blue-300 w-full'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timeZones.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.time_zone && (
                  <p className='text-sm text-persimmon-300'>{errors.time_zone.message}</p>
                )}
              </div>
            </div>

            {(watchedRecurrence === 0 || watchedRecurrence === 5) && (
              <div className='space-y-4'>
                <Label className='text-sm font-medium text-tekhelet-400'>
                  {watchedRecurrence === 0 ? 'Select Date' : 'Select Custom Dates'}
                </Label>

                <div className='space-y-4'>
                  <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                    <PopoverTrigger asChild>
                      <Button
                        variant='outline'
                        className='w-full justify-start text-left font-normal '
                      >
                        <CalendarIcon className='mr-2 h-4 w-4' />
                        {watchedRecurrence === 0
                          ? selectedDates.length > 0
                            ? format(selectedDates[0], 'PPP')
                            : 'Select a date'
                          : 'Add custom dates'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className='w-auto p-0 bg-white/95 backdrop-blur-sm'
                      align='start'
                    >
                      <Calendar
                        mode='single'
                        selected={undefined}
                        onSelect={handleDateSelect}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  {selectedDates.length > 0 && (
                    <div className='space-y-2'>
                      <Label className='text-xs font-medium text-tekhelet-500'>
                        Selected Dates:
                      </Label>
                      <div className='flex flex-wrap gap-2'>
                        {selectedDates.map((date, index) => (
                          <Badge key={index} variant='outline' className='flex items-center gap-1'>
                            {format(date, 'MMM dd, yyyy')}
                            {watchedRecurrence === 5 && (
                              <button
                                type='button'
                                onClick={() => removeDate(date)}
                                className='ml-1 hover:text-persimmon-300'
                              >
                                <X className='w-3 h-3' />
                              </button>
                            )}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {watchedRecurrence === 0 && selectedDates.length !== 1 && (
                  <Alert>
                    <AlertDescription>
                      Please select exactly one date for no recurrence.
                    </AlertDescription>
                  </Alert>
                )}

                {watchedRecurrence === 5 && selectedDates.length === 0 && (
                  <Alert>
                    <AlertDescription>Please select at least one custom date.</AlertDescription>
                  </Alert>
                )}

                {errors.reminder_date && (
                  <Alert>
                    <AlertDescription className='text-persimmon-300'>
                      {errors.reminder_date.message}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            <div className='space-y-2'>
              <Label htmlFor='message' className='text-sm font-medium text-tekhelet-400'>
                Reminder Message
              </Label>
              <Controller
                name='message'
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    id='message'
                    placeholder='Enter your custom reminder message...'
                    rows={3}
                    className=' focus:border-medium-slate-blue-300'
                  />
                )}
              />
              {errors.message && (
                <p className='text-sm text-persimmon-300'>{errors.message.message}</p>
              )}
            </div>

            <div className='flex items-center space-x-3'>
              <Controller
                name='enable'
                control={control}
                render={({ field }) => (
                  <Switch id='enable' checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
              <Label htmlFor='enable' className='text-sm font-medium text-tekhelet-400'>
                Enable Reminder
              </Label>
            </div>
          </CardContent>
        </Card>

        <div className='flex gap-4 justify-end'>
          {isEditing && onCancel && (
            <Button
              type='button'
              variant='outline'
              onClick={onCancel}
              className=' text-tekhelet-500 hover:bg-tekhelet-900'
            >
              Cancel
            </Button>
          )}
          <Button
            type='submit'
            disabled={isSubmitting}
            className='bg-selective-yellow-300 hover:bg-selective-yellow-400 text-white transition-all duration-200'
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Reminder' : 'Create Reminder'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditReminderConfig;
