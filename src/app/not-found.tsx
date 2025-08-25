import { Button } from '@/components/ui/button';
import Link from 'next/link';

const NotFound = () => {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-tekhelet-500 via-persimmon-400 to-tekhelet-500'>
      <div className='text-center px-6 py-12 max-w-lg max-h-1/2 mx-auto border bg-white rounded-4xl'>
        {/* 404 Number with gradient */}
        <div className='mb-8'>
          <h1 className='text-8xl md:text-9xl font-bold mb-4 bg-gradient-to-r from-tekhelet-500 to-persimmon-500 bg-clip-text text-transparent'>
            404
          </h1>
        </div>

        {/* Main heading */}
        <h2 className='text-2xl md:text-3xl font-bold mb-4 text-tekhelet-500'>
          Where are you going?
        </h2>

        {/* Description */}
        <p className='text-lg mb-8 leading-relaxed text-tekhelet-600'>
          The page you're looking for seems to have wandered off. Don't worry, even the best IELTS
          students sometimes take a wrong turn!
        </p>

        {/* Action buttons */}
        <div className='space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center'>
          <Link href='/'>
            <Button
              size='lg'
              className='w-full sm:w-auto font-semibold text-white bg-selective-yellow-200 hover:bg-selective-yellow-300'
            >
              Back to Home
            </Button>
          </Link>

          <Link href='/reading'>
            <Button
              size='lg'
              className='w-full sm:w-auto font-semibold text-white bg-tekhelet-500 hover:bg-tekhelet-600'
            >
              Start Practicing
            </Button>
          </Link>
        </div>

        {/* Decorative elements */}
        <div className='mt-12 flex justify-center space-x-4'>
          <div className='w-3 h-3 rounded-full bg-tekhelet-500 animate-bounce [animation-delay:0ms]'></div>
          <div className='w-3 h-3 rounded-full bg-selective-yellow-200 animate-bounce [animation-delay:150ms]'></div>
          <div className='w-3 h-3 rounded-full bg-persimmon-400 animate-bounce [animation-delay:300ms]'></div>
        </div>

        {/* IELTS tip */}
        <div className='mt-8 p-4 rounded-xl text-left border'>
          <div className='flex items-start space-x-3'>
            <div className='flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-selective-yellow-200 text-white'>
              💡
            </div>
            <div>
              <h3 className='font-semibold mb-1 text-selective-yellow-200'>IELTS Tip:</h3>
              <p className='text-sm text-tekhelet-400'>
                When you encounter unfamiliar content in IELTS, don't panic. Use context clues and
                your existing knowledge to navigate through!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
