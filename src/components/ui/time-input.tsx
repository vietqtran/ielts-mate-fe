'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TimeInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export function TimeInput({
  value,
  onChange,
  label,
  placeholder = '00:00:00',
  className,
}: TimeInputProps) {
  return (
    <div className={className}>
      {label && <Label className='text-sm font-medium'>{label}</Label>}
      <Input
        type='text'
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className='font-mono'
      />
    </div>
  );
}
