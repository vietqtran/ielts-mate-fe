'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  useGetTargetConfig,
  useRegisterNewTargetConfig,
  useUpdateTargetConfig,
} from '@/hooks/apis/config/useTargetConfig';
import { type TargetConfigFormData, targetConfigSchema } from '@/schemas/target.schema';
import { TargetConfigResponseData } from '@/types/config/target/target.types';
import { BaseResponse } from '@/types/reading/reading.types';
import { zodResolver } from '@hookform/resolvers/zod';
import { BookOpenIcon, HeadphonesIcon, SaveIcon } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface TargetFormProps {
  onSuccess?: () => void;
}

const TargetForm = ({ onSuccess }: TargetFormProps) => {
  const { data, mutate } = useGetTargetConfig();
  const { updateTargetConfig, isLoading: isUpdating } = useUpdateTargetConfig();
  const { registerNewTargetConfig, isLoading: isRegistering } = useRegisterNewTargetConfig();

  const typedData = data as BaseResponse<TargetConfigResponseData> | undefined;
  const existingConfig = typedData?.data;
  const isEdit = !!existingConfig;

  const form = useForm<TargetConfigFormData>({
    resolver: zodResolver(targetConfigSchema),
    defaultValues: {
      listening_target: 0,
      listening_target_date: '',
      reading_target: 0,
      reading_target_date: '',
    },
  });

  // Update form with existing data when it loads
  useEffect(() => {
    if (existingConfig) {
      form.reset({
        listening_target: existingConfig.listening_target,
        listening_target_date: existingConfig.listening_target_date,
        reading_target: existingConfig.reading_target,
        reading_target_date: existingConfig.reading_target_date,
      });
    }
  }, [existingConfig, form]);

  const onSubmit = async (data: TargetConfigFormData) => {
    try {
      if (isEdit) {
        await updateTargetConfig(data);
        toast.success('Target configuration updated successfully!');
      } else {
        await registerNewTargetConfig(data);
        toast.success('Target configuration created successfully!');
      }

      // Refresh the data
      mutate();
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to save target configuration. Please try again.');
      console.error('Error saving target config:', error);
    }
  };

  const isLoading = isUpdating || isRegistering;
  // Compute today's local date in YYYY-MM-DD for date input min attributes
  const todayYMD = (() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  })();

  return (
    <Card className='backdrop-blur-lg border rounded-2xl'>
      <CardHeader>
        <CardTitle className='text-tekhelet-400 flex items-center gap-2'>
          <BookOpenIcon className='h-5 w-5' />
          {isEdit ? 'Update' : 'Set'} Your IELTS Targets
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            {/* Listening Target Section */}
            <div className='space-y-4'>
              <div className='flex items-center gap-2 border-b  pb-2'>
                <HeadphonesIcon className='h-4 w-4 text-tekhelet-400' />
                <h3 className='font-medium text-tekhelet-400'>Listening Target</h3>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='listening_target'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-tekhelet-500'>Target Score (0-9)</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          min='0'
                          max='9'
                          step='0.5'
                          placeholder='e.g., 7.5'
                          className=' focus:border-medium-slate-blue-300'
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='listening_target_date'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-tekhelet-500'>Target Date</FormLabel>
                      <FormControl>
                        <Input
                          type='date'
                          min={todayYMD}
                          className=' focus:border-medium-slate-blue-300'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Reading Target Section */}
            <div className='space-y-4'>
              <div className='flex items-center gap-2 border-b  pb-2'>
                <BookOpenIcon className='h-4 w-4 text-tekhelet-400' />
                <h3 className='font-medium text-tekhelet-400'>Reading Target</h3>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='reading_target'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-tekhelet-500'>Target Score (0-9)</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          min='0'
                          max='9'
                          step='0.5'
                          placeholder='e.g., 8.0'
                          className=' focus:border-medium-slate-blue-300'
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='reading_target_date'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-tekhelet-500'>Target Date</FormLabel>
                      <FormControl>
                        <Input
                          type='date'
                          min={todayYMD}
                          className=' focus:border-medium-slate-blue-300'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className='flex justify-end'>
              <Button
                type='submit'
                disabled={isLoading}
                className='bg-selective-yellow-300 hover:bg-selective-yellow-300/90 text-white px-8'
              >
                {isLoading ? (
                  <>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2' />
                    {isEdit ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <SaveIcon className='h-4 w-4 mr-2' />
                    {isEdit ? 'Update Targets' : 'Set Targets'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default TargetForm;
