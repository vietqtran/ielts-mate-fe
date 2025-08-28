'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { Textarea } from '@/components/ui/textarea';
import { useModules } from '@/hooks/apis/modules/useModules';
import { useVocabulary } from '@/hooks/apis/vocabulary/useVocabulary';
import { usePageTitle } from '@/hooks/usePageTitle';
import { VocabularyResponse } from '@/lib/api/vocabulary';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, BookOpen, Save, Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
  module_name: z
    .string()
    .min(1, 'Module name is required')
    .max(100, 'Module name must be less than 100 characters'),
  module_description: z
    .string()
    .min(1, 'Description is required')
    .max(500, 'Description must be less than 500 characters'),
  vocabulary_ids: z.array(z.string()).min(1, 'At least one vocabulary must be selected'),
  is_public: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

export default function UpdateModulePage() {
  usePageTitle('Update Module');

  const router = useRouter();
  const searchParams = useSearchParams();
  const moduleId = searchParams.get('id');
  const { getModuleById, updateModule, isLoading } = useModules();
  const { getMyVocabulary } = useVocabulary();
  const [vocabularies, setVocabularies] = useState<VocabularyResponse[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      module_name: '',
      module_description: '',
      vocabulary_ids: [],
      is_public: true,
    },
  });

  // Fetch vocabularies and module data on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [vocabRes, moduleRes] = await Promise.all([
        getMyVocabulary({
          page: 1,
          size: 100,
          sortBy: 'createdAt',
          sortDirection: 'desc',
        }),
        moduleId ? getModuleById(moduleId) : Promise.resolve(null),
      ]);
      if (vocabRes) setVocabularies(vocabRes.data);
      if (moduleRes && moduleRes.data) {
        const module = moduleRes.data;
        const vocabIds = module.flash_card_ids.map((f) => f.vocab.vocabulary_id);
        form.reset({
          module_name: module.module_name,
          module_description: module.description,
          is_public: module.is_public,
          vocabulary_ids: vocabIds,
        });
      }
      setLoading(false);
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleId]);

  const onSubmit = async (values: FormValues) => {
    if (!moduleId) return;
    try {
      const result = await updateModule(moduleId, values);
      if (result) {
        router.push('/personalized');
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleVocabToggle = (vocabId: string) => {
    const current = form.getValues('vocabulary_ids') || [];
    const newSelectedIds = current.includes(vocabId)
      ? current.filter((id: string) => id !== vocabId)
      : [...current, vocabId];
    form.setValue('vocabulary_ids', newSelectedIds);
  };

  const filteredVocabularies = vocabularies.filter(
    (vocab) =>
      vocab.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vocab.meaning.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className='container mx-auto p-6 space-y-6'>
      {/* Header */}
      <div className='flex items-start gap-2 flex-col space-x-3'>
        <Button variant='ghost' asChild>
          <Link href='/personalized'>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Back to Personalized Learning
          </Link>
        </Button>
        <div>
          <h1 className='text-3xl font-bold text-tekhelet-400'>Update Module</h1>
          <p className='text-medium-slate-blue-500'>Edit your learning module</p>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Module Form */}
        <Card className='bg-white/60 backdrop-blur-lg border border-tekhelet-200 rounded-2xl shadow-xl'>
          <CardHeader>
            <CardTitle className='text-tekhelet-400'>Module Information</CardTitle>
            <CardDescription>Edit the details for your learning module</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className='flex justify-center items-center h-40'>
                <LoadingSpinner />
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                  <FormField
                    control={form.control}
                    name='module_name'
                    render={({ field }: any) => (
                      <FormItem>
                        <FormLabel className='text-tekhelet-400 font-medium'>Module Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Enter module name'
                            {...field}
                            className='bg-white/80 border-tekhelet-200 focus:border-tekhelet-400'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='module_description'
                    render={({ field }: any) => (
                      <FormItem>
                        <FormLabel className='text-tekhelet-400 font-medium'>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder='Enter module description'
                            {...field}
                            rows={4}
                            className='bg-white/80 border-tekhelet-200 focus:border-tekhelet-400 resize-none'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='is_public'
                    render={({ field }: any) => (
                      <FormItem className='flex flex-row items-start space-x-3 space-y-0'>
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className='border-tekhelet-200'
                          />
                        </FormControl>
                        <div className='space-y-1 leading-none'>
                          <FormLabel className='text-tekhelet-400 font-medium'>
                            Make this module public
                          </FormLabel>
                          <p className='text-sm text-medium-slate-blue-500'>
                            Other users can view and use this module
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />

                  <div className='pt-4 space-y-2'>
                    <Button
                      type='submit'
                      disabled={isLoading.updateModule || form.watch('vocabulary_ids').length === 0}
                      className='w-full bg-tekhelet-400 hover:bg-tekhelet-500 text-white'
                    >
                      {isLoading.updateModule ? (
                        <>
                          <LoadingSpinner color='white' />
                          <span className='ml-2'>Updating Module...</span>
                        </>
                      ) : (
                        <>
                          <Save className='h-4 w-4 mr-2' />
                          Update Module ({form.watch('vocabulary_ids').length} vocab selected)
                        </>
                      )}
                    </Button>
                    <p className='text-xs text-medium-slate-blue-500 text-center'>
                      {form.watch('vocabulary_ids').length === 0
                        ? 'Please select at least one vocabulary'
                        : `${form.watch('vocabulary_ids').length} vocabulary selected`}
                    </p>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>

        {/* Vocabulary Selection */}
        <Card className='bg-white/60 backdrop-blur-lg border border-tekhelet-200 rounded-2xl shadow-xl'>
          <CardHeader>
            <CardTitle className='text-tekhelet-400'>Select Vocabulary</CardTitle>
            <CardDescription>
              Choose vocabulary to include in your module ({form.watch('vocabulary_ids').length}{' '}
              selected)
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            {/* Search */}
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-medium-slate-blue-400' />
              <Input
                placeholder='Search vocabulary...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-10 bg-white/80 border-tekhelet-200'
              />
            </div>

            {/* Vocabulary List */}
            <div className='max-h-96 overflow-y-auto space-y-2 border border-tekhelet-200 rounded-lg p-3 bg-white/80'>
              {loading ? (
                <div className='flex justify-center items-center h-32'>
                  <LoadingSpinner />
                </div>
              ) : filteredVocabularies.length === 0 ? (
                <div className='text-center py-8'>
                  <BookOpen className='h-12 w-12 text-medium-slate-blue-300 mx-auto mb-4' />
                  <p className='text-medium-slate-blue-500 mb-2'>
                    {vocabularies.length === 0
                      ? 'No vocabulary found'
                      : 'No vocabulary matches your search'}
                  </p>
                  {vocabularies.length === 0 && (
                    <Button
                      asChild
                      variant='outline'
                      className='border-tekhelet-200 text-tekhelet-400'
                    >
                      <Link href='/personalized'>Create Vocabulary First</Link>
                    </Button>
                  )}
                </div>
              ) : (
                filteredVocabularies.map((vocab) => (
                  <div
                    key={vocab.vocabulary_id}
                    className={`flex items-center space-x-3 p-3 rounded-md cursor-pointer transition-colors ${
                      form.watch('vocabulary_ids').includes(vocab.vocabulary_id)
                        ? 'bg-tekhelet-100 border border-tekhelet-300'
                        : 'hover:bg-tekhelet-50 border border-transparent'
                    }`}
                    onClick={() => handleVocabToggle(vocab.vocabulary_id)}
                  >
                    <Checkbox
                      checked={form.watch('vocabulary_ids').includes(vocab.vocabulary_id)}
                      className='border-tekhelet-200'
                    />
                    <div className='flex-1 min-w-0'>
                      <p className='font-medium text-tekhelet-400 truncate'>{vocab.word}</p>
                      <p className='text-sm text-medium-slate-blue-500 truncate'>{vocab.meaning}</p>
                      <p className='text-xs text-medium-slate-blue-400 truncate'>
                        "{vocab.context}"
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {form.watch('vocabulary_ids').length === 0 && !loading && (
              <p className='text-sm text-red-500 text-center'>
                Please select at least one vocabulary to update the module
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
