'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useModules } from '@/hooks/apis/modules/useModules';
import { ShareModuleRequest } from '@/lib/api/modules';
import { Mail, Plus, Share2, X } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

interface ShareModuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  moduleId: string;
  moduleName: string;
  onSuccess?: () => void;
}

export default function ShareModuleModal({
  isOpen,
  onClose,
  moduleId,
  moduleName,
  onSuccess,
}: ShareModuleModalProps) {
  const [emails, setEmails] = useState<string[]>([]);
  const [currentEmail, setCurrentEmail] = useState('');
  const { shareModule, getUserInfoByEmail, isLoading } = useModules();

  const isValidEmail = (value: string) => {
    const emailRegex =
      /^(?:[a-zA-Z0-9_'^&\/+-])+(?:\.(?:[a-zA-Z0-9_'^&\/+-])+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
    return emailRegex.test(value);
  };

  const handleAddEmail = async () => {
    const trimmed = currentEmail.trim().toLowerCase();
    if (!trimmed) return;
    if (!isValidEmail(trimmed)) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (emails.includes(trimmed)) {
      setCurrentEmail('');
      return;
    }

    const user = await getUserInfoByEmail(trimmed);
    if (!user) {
      // error toast already shown in hook
      return;
    }

    setEmails([...emails, trimmed]);
    setCurrentEmail('');
  };

  const handleRemoveEmail = (email: string) => {
    setEmails(emails.filter((e) => e !== email));
  };

  const handleShare = async () => {
    if (emails.length === 0) {
      toast.error('Please add at least one email');
      return;
    }

    const shareData: ShareModuleRequest = {
      users: emails,
    };

    const result = await shareModule(moduleId, shareData);
    if (result) {
      setEmails([]);
      setCurrentEmail('');
      onSuccess?.();
      onClose();
    }
  };

  const handleClose = () => {
    setEmails([]);
    setCurrentEmail('');
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddEmail();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-[500px] bg-white/95 backdrop-blur-lg border border-tekhelet-200'>
        <DialogHeader>
          <DialogTitle className='flex items-center space-x-2 text-tekhelet-400'>
            <Share2 className='h-5 w-5' />
            <span>Share Module</span>
          </DialogTitle>
          <DialogDescription className='text-medium-slate-blue-500'>
            Share "{moduleName}" with other users. Enter their emails to grant access.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          {/* Add User ID Input */}
          <div className='space-y-2'>
            <Label htmlFor='email' className='text-medium-slate-blue-600 font-medium'>
              Email
            </Label>
            <div className='flex space-x-2'>
              <Input
                id='email'
                placeholder='Enter email...'
                value={currentEmail}
                onChange={(e) => setCurrentEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                className='flex-1 bg-white/80 border-tekhelet-200 focus:border-tekhelet-400'
              />
              <Button
                type='button'
                onClick={handleAddEmail}
                variant='outline'
                size='icon'
                className='border-tekhelet-200 text-tekhelet-400 hover:bg-tekhelet-50'
                disabled={!currentEmail.trim() || !!isLoading.getUserInfoByEmail}
              >
                {isLoading.getUserInfoByEmail ? (
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-current' />
                ) : (
                  <Plus className='h-4 w-4' />
                )}
              </Button>
            </div>
          </div>

          {/* User IDs List */}
          {emails.length > 0 && (
            <div className='space-y-2'>
              <Label className='text-medium-slate-blue-600 font-medium'>
                Emails to share with ({emails.length})
              </Label>
              <div className='flex flex-wrap gap-2 p-3 bg-tekhelet-50 rounded-lg border border-tekhelet-200'>
                {emails.map((email) => (
                  <Badge
                    key={email}
                    variant='secondary'
                    className='flex items-center space-x-1 bg-white border border-tekhelet-200 text-tekhelet-600'
                  >
                    <Mail className='h-3 w-3' />
                    <span>{email}</span>
                    <button
                      onClick={() => handleRemoveEmail(email)}
                      className='ml-1 hover:text-red-600 transition-colors'
                    >
                      <X className='h-3 w-3' />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Info */}
          <div className='text-xs text-medium-slate-blue-500 bg-blue-50 border border-blue-200 p-3 rounded-lg'>
            <p className='font-medium mb-1'>Sharing Information:</p>
            <ul className='space-y-1'>
              <li>• Users will receive a sharing request notification</li>
              <li>• They can accept or deny the request</li>
              <li>• Shared modules are read-only for recipients</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant='outline'
            onClick={handleClose}
            className='border-medium-slate-blue-200 text-medium-slate-blue-600'
          >
            Cancel
          </Button>
          <Button
            onClick={handleShare}
            disabled={emails.length === 0 || isLoading.shareModule}
            className='bg-tekhelet-400 hover:bg-tekhelet-500 text-white'
          >
            {isLoading.shareModule ? (
              <div className='flex items-center space-x-2'>
                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                <span>Sharing...</span>
              </div>
            ) : (
              <div className='flex items-center space-x-2'>
                <Share2 className='h-4 w-4' />
                <span>Share Module</span>
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
