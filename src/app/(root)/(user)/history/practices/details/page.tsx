import ListeningAttemptResult from '@/components/features/user/history/practice/listening/ListeningAttemptResult';

interface PracticeDetailsProps {
  searchParams: Promise<{
    mode?: string;
    attemptId?: string;
  }>;
}
const PracticeDetails = async ({ searchParams }: PracticeDetailsProps) => {
  const { mode = 'reading', attemptId } = await searchParams;
  // If no attemptId is provided, redirect or show error
  if (!attemptId) {
    return (
      <div className='min-h-screen bg-medium-slate-blue-900 flex items-center justify-center'>
        <div className='bg-white/70 backdrop-blur-lg border border-tekhelet-200 rounded-2xl shadow-xl p-6 text-center'>
          <h1 className='text-2xl font-bold text-tekhelet-400 mb-2'>Missing Attempt ID</h1>
          <p className='text-tekhelet-500'>Please provide a valid attempt ID to view details.</p>
        </div>
      </div>
    );
  }

  switch (mode.toLowerCase()) {
    case 'reading':
      return <div>hj</div>;
    case 'listening':
      return <ListeningAttemptResult attemptId={attemptId} />;
    default:
      return (
        <div className='min-h-screen bg-medium-slate-blue-900 flex items-center justify-center'>
          <div className='bg-white/70 backdrop-blur-lg border border-tekhelet-200 rounded-2xl shadow-xl p-6 text-center'>
            <h1 className='text-2xl font-bold text-tekhelet-400 mb-2'>Invalid Mode</h1>
            <p className='text-tekhelet-500'>Supported modes are: reading, listening</p>
          </div>
        </div>
      );
  }
};

export default PracticeDetails;
