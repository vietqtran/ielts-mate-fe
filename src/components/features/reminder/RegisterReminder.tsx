'use client';

import { Button } from '@/components/ui/button';
import { Bell, Plus } from 'lucide-react';

interface RegisterReminderProps {
  onCreateNew: () => void;
}

const RegisterReminder = ({ onCreateNew }: RegisterReminderProps) => {
  return (
    <div className='min-h-screen bg-white p-6'>
      <div className='max-w-4xl mx-auto'>
        <div className='bg-white/70 border rounded-xl shadow-sm p-8 text-center'>
          <div className='mb-8'>
            <div className='mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-6'>
              <Bell className='w-12 h-12' />
            </div>
            <h1 className='text-3xl font-bold text-tekhelet-400 mb-4'>
              No Reminder Configuration Found
            </h1>
            <p className='text-lg text-tekhelet-500 mb-8 max-w-2xl mx-auto'>
              Set up personalized reminders to stay on track with your IELTS preparation. Never miss
              a practice session again!
            </p>
          </div>

          <Button
            onClick={onCreateNew}
            size='lg'
            variant='outline'
            className='bg-selective-yellow-300 hover:bg-selective-yellow-400 text-white transition-all duration-200'
          >
            <Plus className='w-5 h-5' />
            Create Reminder
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RegisterReminder;
