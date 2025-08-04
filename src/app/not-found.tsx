import { Button } from '@/components/ui/button';
import Link from 'next/link';

const NotFound = () => {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-[#bfd7ed] via-[#60a3d9] to-[#0074b7]'>
      <div className='text-center px-6 py-12 max-w-lg mx-auto bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-[#60a3d9]/30 ring-1 ring-[#60a3d9]/20'>
        {/* 404 Number with gradient */}
        <div className='mb-8'>
          <h1 className='text-8xl md:text-9xl font-bold mb-4 bg-gradient-to-r from-[#0074b7] to-[#60a3d9] bg-clip-text text-transparent'>
            404
          </h1>
        </div>

        {/* Main heading */}
        <h2 className='text-2xl md:text-3xl font-bold mb-4 text-[#003b73]'>Oops! Page Not Found</h2>

        {/* Description */}
        <p className='text-lg mb-8 leading-relaxed text-[#0074b7]'>
          The page you're looking for seems to have wandered off. Don't worry, even the best IELTS
          students sometimes take a wrong turn!
        </p>

        {/* Action buttons */}
        <div className='space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center'>
          <Link href='/'>
            <Button
              size='lg'
              className='w-full sm:w-auto font-semibold text-white bg-gradient-to-r from-[#0074b7] to-[#60a3d9] hover:from-[#003b73] hover:to-[#0074b7] transition-all duration-300 hover:scale-105 hover:shadow-xl rounded-xl px-6 py-3'
            >
              Back to Home
            </Button>
          </Link>

          <Link href='/reading'>
            <Button
              variant='outline'
              size='lg'
              className='w-full sm:w-auto font-semibold border-[#60a3d9] text-[#0074b7] bg-transparent transition-all duration-300 hover:scale-105 hover:shadow-xl hover:bg-[#60a3d9] hover:text-white rounded-xl px-6 py-3'
            >
              Start Practicing
            </Button>
          </Link>
        </div>

        {/* Decorative elements */}
        <div className='mt-12 flex justify-center space-x-4'>
          <div className='w-3 h-3 rounded-full bg-[#0074b7] animate-bounce [animation-delay:0ms]'></div>
          <div className='w-3 h-3 rounded-full bg-[#60a3d9] animate-bounce [animation-delay:150ms]'></div>
          <div className='w-3 h-3 rounded-full bg-[#bfd7ed] animate-bounce [animation-delay:300ms]'></div>
        </div>

        {/* IELTS tip */}
        <div className='mt-8 p-4 rounded-xl border-l-4 border-l-[#0074b7] bg-gradient-to-r from-[#bfd7ed]/50 to-[#60a3d9]/20 text-left backdrop-blur-md'>
          <div className='flex items-start space-x-3'>
            <div className='flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-[#0074b7] text-white'>
              💡
            </div>
            <div>
              <h3 className='font-semibold mb-1 text-[#003b73]'>IELTS Tip:</h3>
              <p className='text-sm text-[#0074b7]'>
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
