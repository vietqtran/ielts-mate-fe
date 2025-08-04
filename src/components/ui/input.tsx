import * as React from 'react';

import { Eye, EyeOff } from 'lucide-react';

import { cn } from '@/lib/utils';

interface InputProps {
  isError?: boolean;
}

function Input({
  isError = false,
  className,
  type,
  ...props
}: React.ComponentProps<'input'> & InputProps) {
  const [showPassword, setShowPassword] = React.useState(false);

  const inputType = type === 'password' && showPassword ? 'text' : type;

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className='relative'>
      <input
        type={inputType}
        data-slot='input'
        className={cn(
          'file:text-[#003b73] placeholder:text-[#60a3d9] selection:bg-[#0074b7] selection:text-white flex h-11 w-full min-w-0 rounded-xl border border-[#60a3d9]/40 bg-white/90 px-4 py-3 text-base shadow-sm transition-all duration-200 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          'focus:border-[#0074b7] focus:ring-2 focus:ring-[#60a3d9]/20 focus:shadow-lg',
          'hover:border-[#60a3d9] hover:shadow-md',
          'text-[#003b73] font-medium',
          type === 'password' && '!pr-10',
          !!props.value && 'bg-[#bfd7ed]/20 border-[#0074b7]/60',
          isError && '!bg-red-50 !border-red-300 focus:!border-red-500 focus:!ring-red-200',

          className
        )}
        {...props}
      />

      {type === 'password' && (
        <button
          type='button'
          className='cursor-pointer absolute right-4 top-1/2 -translate-y-1/2 text-[#60a3d9] hover:text-[#0074b7] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#60a3d9]/30 focus-visible:ring-offset-2 rounded-lg p-1 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50'
          onClick={togglePasswordVisibility}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      )}
    </div>
  );
}

export { Input };
