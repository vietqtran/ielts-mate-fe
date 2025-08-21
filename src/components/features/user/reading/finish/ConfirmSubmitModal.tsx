import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Dispatch, SetStateAction } from 'react';

interface ConfirmSubmitModalProps {
  onConfirm: () => void;
  onCancel: () => void;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmSubmitModal = ({
  onConfirm,
  onCancel,
  isOpen,
  setIsOpen,
  title,
  description,
  confirmText,
  cancelText,
}: ConfirmSubmitModalProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className='text-tekhelet-500'>
            {title || 'Are you absolutely sure?'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {description || 'This action cannot be undone.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={onCancel}
            className='text-tekhelet-600 hover:text-tekhelet-700'
          >
            {cancelText || 'Cancel'}
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} asChild>
            <Button className='bg-selective-yellow-300 hover:bg-selective-yellow-400 text-white'>
              {confirmText || 'Continue'}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmSubmitModal;
