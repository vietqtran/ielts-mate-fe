'use client';

const ReminderLoadingState = () => {
  return (
    <div className='min-h-screen bg-white p-6'>
      <div className='max-w-4xl mx-auto'>
        <div className='backdrop-blur-lg border rounded-2xl p-8'>
          <div className='animate-pulse space-y-6'>
            <div className='h-8 bg-tekhelet-800 rounded w-1/3'></div>
            <div className='h-4 bg-tekhelet-800 rounded w-2/3'></div>
            <div className='space-y-4'>
              <div className='h-10 bg-tekhelet-800 rounded'></div>
              <div className='h-10 bg-tekhelet-800 rounded'></div>
              <div className='h-20 bg-tekhelet-800 rounded'></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReminderLoadingState;
