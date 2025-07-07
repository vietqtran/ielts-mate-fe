import { cn } from '@/lib/utils';
import * as React from 'react';

export interface ToastProps {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
  duration?: number;
}

export interface ToastContextType {
  showToast: (props: ToastProps) => void;
  dismissToast: () => void;
}

export const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = React.useState<ToastProps | null>(null);
  const [visible, setVisible] = React.useState(false);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  const showToast = React.useCallback((props: ToastProps) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setToast(props);
    setVisible(true);

    timerRef.current = setTimeout(() => {
      setVisible(false);
      setTimeout(() => setToast(null), 300); // Allow time for exit animation
    }, props.duration || 5000);
  }, []);

  const dismissToast = React.useCallback(() => {
    setVisible(false);
    setTimeout(() => setToast(null), 300);
  }, []);

  React.useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      {toast && (
        <div
          className={cn(
            'fixed bottom-4 right-4 z-50 max-w-md transform transition-all duration-300',
            visible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
          )}
        >
          <div
            className={cn(
              'rounded-md shadow-lg p-4 flex items-start space-x-3',
              toast.variant === 'destructive'
                ? 'bg-red-100 text-red-900'
                : toast.variant === 'success'
                  ? 'bg-green-100 text-green-900'
                  : 'bg-white text-gray-900 border'
            )}
          >
            <div className='flex-1'>
              {toast.title && <div className='font-medium'>{toast.title}</div>}
              {toast.description && <div className='text-sm mt-1'>{toast.description}</div>}
            </div>
            <button
              type='button'
              className='text-gray-500 hover:text-gray-900'
              onClick={dismissToast}
            >
              <span className='sr-only'>Close</span>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-5 w-5'
                viewBox='0 0 20 20'
                fill='currentColor'
              >
                <path
                  fillRule='evenodd'
                  d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                  clipRule='evenodd'
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}
