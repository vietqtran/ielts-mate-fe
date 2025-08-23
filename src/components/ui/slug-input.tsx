'use client';

import { Button } from '@/components/ui/button';
import { FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { CheckCircle, Loader2, Wand2, XCircle } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface SlugInputProps {
  value: string;
  onChange: (value: string) => void;
  onGenerateSlug: () => Promise<string>;
  onCheckSlug: (slug: string) => Promise<boolean>;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
  examName?: string; // For auto-generation from exam name
  skipValidation?: boolean; // Skip validation (useful for edit mode)
}

export function SlugInput({
  value,
  onChange,
  onGenerateSlug,
  onCheckSlug,
  placeholder = 'example-exam-title',
  label = 'URL Slug',
  disabled = false,
  className,
  examName,
  skipValidation = false,
}: SlugInputProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [debouncedValue, setDebouncedValue] = useState(value);

  // Debounce the slug value for validation
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, 500);

    return () => clearTimeout(timer);
  }, [value]);

  // Check slug validity when debounced value changes
  useEffect(() => {
    if (skipValidation || !debouncedValue || debouncedValue.length < 3) {
      setIsValid(null);
      return;
    }

    const checkSlug = async () => {
      setIsChecking(true);
      try {
        const valid = await onCheckSlug(debouncedValue);
        setIsValid(valid);
      } catch (error) {
        console.error('Error checking slug:', error);
        setIsValid(null);
      } finally {
        setIsChecking(false);
      }
    };

    checkSlug();
  }, [debouncedValue, skipValidation]);

  const handleGenerateSlug = useCallback(async () => {
    if (!examName || examName.trim().length === 0) {
      toast.error('Please enter an exam name first');
      return;
    }

    setIsGenerating(true);
    try {
      const generatedSlug = await onGenerateSlug();
      onChange(generatedSlug);
      toast.success('Slug generated successfully');
    } catch (error) {
      console.error('Error generating slug:', error);
      toast.error('Failed to generate slug');
    } finally {
      setIsGenerating(false);
    }
  }, [examName, onGenerateSlug, onChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    // Convert to lowercase and replace spaces with hyphens
    const formattedValue = inputValue
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    onChange(formattedValue);
  };

  const getValidationIcon = () => {
    if (isChecking) {
      return <Loader2 className='h-4 w-4 animate-spin text-medium-slate-blue-400' />;
    }
    if (isValid === true) {
      return <CheckCircle className='h-4 w-4 text-green-500' />;
    }
    if (isValid === false) {
      return <XCircle className='h-4 w-4 text-red-500' />;
    }
    return null;
  };

  const getValidationMessage = () => {
    if (isChecking) return 'Checking availability...';
    if (isValid === true) return 'Slug available';
    if (isValid === false) return 'Slug is already taken';
    return null;
  };

  return (
    <FormItem className={className}>
      <FormLabel>{label}</FormLabel>
      <div className='flex gap-2'>
        <div className='relative flex-1'>
          <FormControl>
            <Input
              placeholder={placeholder}
              value={value}
              onChange={handleInputChange}
              disabled={disabled}
              className={cn(
                'pr-10',
                isValid === true && 'border-green-500 focus:border-green-500',
                isValid === false && 'border-red-500 focus:border-red-500'
              )}
            />
          </FormControl>
          {getValidationIcon() && (
            <div className='absolute right-3 top-1/2 -translate-y-1/2'>{getValidationIcon()}</div>
          )}
        </div>
        <Button
          type='button'
          variant='outline'
          size='icon'
          onClick={handleGenerateSlug}
          disabled={disabled || isGenerating || !examName?.trim()}
          className='shrink-0'
          title='Auto-generate slug from exam name'
        >
          {isGenerating ? (
            <Loader2 className='h-4 w-4 animate-spin' />
          ) : (
            <Wand2 className='h-4 w-4' />
          )}
        </Button>
      </div>
      {getValidationMessage() && (
        <p
          className={cn(
            'text-sm mt-1',
            isValid === true && 'text-green-600',
            isValid === false && 'text-red-600',
            isChecking && 'text-medium-slate-blue-600'
          )}
        >
          {getValidationMessage()}
        </p>
      )}
      <FormMessage />
    </FormItem>
  );
}
