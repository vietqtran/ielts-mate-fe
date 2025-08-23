'use client';

import { Button } from '@/components/ui/button';
import { useGetTargetConfig } from '@/hooks/apis/config/useTargetConfig';
import { TargetConfigResponseData } from '@/types/config/target/target.types';
import { BaseResponse } from '@/types/reading/reading.types';
import { EditIcon, PlusIcon } from 'lucide-react';
import { useState } from 'react';
import TargetConfigDisplay from './TargetConfigDisplay';
import TargetForm from './TargetForm';

const TargetPage = () => {
  const [showForm, setShowForm] = useState(false);
  const { data } = useGetTargetConfig();

  const typedData = data as BaseResponse<TargetConfigResponseData> | undefined;
  const hasExistingConfig = !!typedData?.data;

  const handleFormSuccess = () => {
    setShowForm(false);
  };

  return (
    <div className='container mx-auto p-6 max-w-4xl space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-tekhelet-400'>Your IELTS Target</h1>
          <p className='text-tekhelet-500 mt-2'>
            Set and track your IELTS score targets for Reading and Listening sections.
          </p>
        </div>

        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            className='bg-selective-yellow-300 hover:bg-selective-yellow-300/90 text-white'
          >
            {hasExistingConfig ? (
              <>
                <EditIcon className='h-4 w-4 mr-2' />
                Edit Targets
              </>
            ) : (
              <>
                <PlusIcon className='h-4 w-4 mr-2' />
                Set Targets
              </>
            )}
          </Button>
        )}
      </div>

      {/* Content */}
      {showForm ? (
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h2 className='text-xl font-semibold text-tekhelet-400'>
              {hasExistingConfig ? 'Update Your Targets' : 'Set Your Targets'}
            </h2>
            <Button
              variant='outline'
              onClick={() => setShowForm(false)}
              className='border-tekhelet-200 text-tekhelet-500 hover:bg-tekhelet-50'
            >
              Cancel
            </Button>
          </div>
          <TargetForm onSuccess={handleFormSuccess} />
        </div>
      ) : (
        <TargetConfigDisplay />
      )}
    </div>
  );
};

export default TargetPage;
