'use client';

import {
  useGetReminderConfig,
  useRegisterNewReminderConfig,
  useUpdateReminderConfig,
} from '@/hooks/apis/config/useReminderConfig';
import { ReminderConfigFormData } from '@/schemas/reminder.schema';
import { getLocalTime } from '@/utils/time';
import { format, parse } from 'date-fns';
import { useState } from 'react';
import { toast } from 'sonner';
import CurrentReminderConfig from './CurrentReminderConfig';
import EditReminderConfig from './EditReminderConfig';
import RegisterReminder from './RegisterReminder';
import ReminderLoadingState from './ReminderLoadingState';

const ReminderPage = () => {
  const { data: reminderData, isLoading, mutate } = useGetReminderConfig();
  const { updateReminderConfig, isLoading: isUpdating } = useUpdateReminderConfig();
  const { registerNewReminderConfig, isLoading: isRegistering } = useRegisterNewReminderConfig();

  const [isEditing, setIsEditing] = useState(false);

  const hasExistingConfig = !!reminderData?.data;

  const prepareInitialData = (): ReminderConfigFormData | undefined => {
    if (!hasExistingConfig || !reminderData?.data) return undefined;

    const config = reminderData.data;
    return {
      email: config.email || '',
      reminder_date: config.reminder_date || [],
      reminder_time: getLocalTime(config.reminder_date[0], config.reminder_time, config.zone),
      recurrence: config.recurrence || 0,
      time_zone: config.zone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      enable: config.enabled ?? true,
      message: config.message || 'Time for your IELTS practice session!',
    };
  };

  const onSubmit = async (data: ReminderConfigFormData) => {
    try {
      const parsedTime = parse(data.reminder_time, 'HH:mm', new Date());
      const formattedTime = format(parsedTime, 'HH:mm');
      if (hasExistingConfig) {
        await updateReminderConfig({ ...data, reminder_time: formattedTime });
        toast.success('Reminder configuration updated successfully!');
      } else {
        await registerNewReminderConfig({
          ...data,
          reminder_time: formattedTime,
        });
        toast.success('Reminder configuration created successfully!');
      }
      await mutate();
      cancelEditing();
    } catch (e) {
      console.error(e);
    }
  };

  const startEditing = () => {
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  if (isLoading) {
    return <ReminderLoadingState />;
  }

  if (!hasExistingConfig && !isEditing) {
    return <RegisterReminder onCreateNew={startEditing} />;
  }

  if (hasExistingConfig && !isEditing) {
    return <CurrentReminderConfig reminderData={reminderData} onEdit={startEditing} />;
  }

  return (
    <div className='min-h-screen bg-white p-6'>
      <div className='max-w-4xl mx-auto'>
        <EditReminderConfig
          initialData={prepareInitialData()}
          isEditing={hasExistingConfig}
          onSubmit={onSubmit}
          onCancel={hasExistingConfig ? cancelEditing : undefined}
          isSubmitting={isUpdating || isRegistering}
        />
      </div>
    </div>
  );
};

export default ReminderPage;
