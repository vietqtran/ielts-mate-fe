'use client';

import { Check, ChevronsUpDown } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

/**
 * Option interface for the Combobox component
 */
export interface ComboboxOption {
  /** Unique value for the option */
  value: string;
  /** Display label for the option */
  label: string;
  /** Optional disabled state for the option */
  disabled?: boolean;
}

/**
 * Props interface for the Combobox component
 */
export interface ComboboxProps {
  /** Array of options to display in the combobox */
  options: ComboboxOption[];
  /** Currently selected value */
  value?: string;
  /** Callback function called when selection changes */
  onValueChange?: (value: string) => void;
  /** Placeholder text for the trigger button */
  placeholder?: string;
  /** Placeholder text for the search input */
  searchPlaceholder?: string;
  /** Message to display when no options are found */
  emptyMessage?: string;
  /** Custom className for the trigger button */
  className?: string;
  /** Custom className for the popover content */
  contentClassName?: string;
  /** Width of the combobox (both trigger and content) */
  width?: string;
  /** Whether the combobox is disabled */
  disabled?: boolean;
  /** Whether the combobox allows clearing the selection */
  clearable?: boolean;
  /** Button variant */
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

/**
 * A reusable combobox component with search functionality
 *
 * @example
 * ```tsx
 * const options = [
 *   { value: "option1", label: "Option 1" },
 *   { value: "option2", label: "Option 2" }
 * ];
 *
 * <Combobox
 *   options={options}
 *   value={selectedValue}
 *   onValueChange={setSelectedValue}
 *   placeholder="Select an option..."
 *   className="w-[300px]"
 * />
 * ```
 */
export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = 'Select option...',
  searchPlaceholder = 'Search...',
  emptyMessage = 'No option found.',
  className,
  contentClassName,
  width = 'w-full',
  disabled = false,
  clearable = false,
  variant = 'outline',
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);

  /**
   * Handles the selection of an option
   */
  const handleSelect = React.useCallback(
    (currentValue: string) => {
      const newValue = currentValue === value ? (clearable ? '' : value) : currentValue;
      onValueChange?.(newValue);
      setOpen(false);
    },
    [value, onValueChange, clearable]
  );

  /**
   * Gets the display label for the currently selected value
   */
  const selectedLabel = React.useMemo(() => {
    return options.find((option) => option.value === value)?.label;
  }, [options, value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={variant}
          role='combobox'
          aria-expanded={open}
          disabled={disabled}
          className={cn(width, 'justify-between', className)}
        >
          {selectedLabel || placeholder}
          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn('p-0', contentClassName)}
        style={{ width: 'var(--radix-popover-trigger-width)' }}
      >
        <Command>
          <CommandInput placeholder={searchPlaceholder} className='h-9' />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  onSelect={handleSelect}
                >
                  {option.label}
                  <Check
                    className={cn(
                      'ml-auto h-4 w-4',
                      value === option.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
