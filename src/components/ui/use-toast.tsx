import { useContext } from 'react';
import { ToastContext, ToastContextType, ToastProps } from './toast';

export function useToast() {
  const context = useContext(ToastContext) as ToastContextType;

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return {
    toast: (props: ToastProps) => {
      context.showToast({
        title: props.title,
        description: props.description,
        variant: props.variant || 'default',
        duration: props.duration || 5000,
      });
    },
    dismiss: context.dismissToast,
  };
}
