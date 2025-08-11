'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, BookOpen, Bookmark, Headphones, Heart } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import AddMarkupFilter from '@/components/features/markup/components/AddMarkupFilter';
import { PaginationCommon } from '@/components/features/user/common';
import { useGetListListeningExamCached } from '@/hooks/apis/listening/useListeningExam';
import { useGetListeningTaskCached } from '@/hooks/apis/listening/useListeningTask';
import { useCreateMarkupTask } from '@/hooks/apis/markup/useMarkup';
import {
  useGetReadingExamCached,
  useGetReadingPassageCached,
} from '@/hooks/apis/reading/usePassage';
import {
  AddMarkupFilters,
  clearFilters,
  setFilters,
  setPagination,
} from '@/store/slices/add-markup-slice';
import { RootState } from '@/types';
import { MarkupType, PracticeType, TaskType } from '@/types/markup/markup.enum';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';

const DEFAULT_PAGE = 1;
const DEFAULT_SIZE = 10;

// Schema for controls (coerce Select string values -> enum numbers)
const controlsSchema = z.object({
  markupType: z.coerce.number().refine((v) => (MarkupType as any)[v] !== undefined, {
    message: 'Invalid markup type',
  }),
  taskType: z.coerce.number().refine((v) => (TaskType as any)[v] !== undefined, {
    message: 'Invalid task type',
  }),
  practiceType: z.coerce.number().refine((v) => (PracticeType as any)[v] !== undefined, {
    message: 'Invalid practice type',
  }),
});

type ControlsValues = z.infer<typeof controlsSchema>;

// Normalize SWR data shapes to a simple array
function extractArray(res: any): any[] {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (res.data && Array.isArray(res.data)) return res.data;
  if (res.data && res.data.data && Array.isArray(res.data.data)) return res.data.data;
  return [];
}

const AddMarkupPage = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const form = useForm<ControlsValues>({
    resolver: zodResolver(controlsSchema),
    defaultValues: {
      markupType: MarkupType.BOOKMARK,
      taskType: TaskType.LISTENING,
      practiceType: PracticeType.TASK,
    },
  });

  const filters = useSelector((state: RootState) => state.addMarkup.filters);
  const pagination = useSelector((state: RootState) => state.addMarkup.pagination);

  const { markupType, taskType, practiceType } = form.watch();
  const [addingId, setAddingId] = useState<string | null>(null);

  // Data sources for all cases
  const { data: listeningTasksRes, isLoading: loadingListeningTasks } = useGetListeningTaskCached({
    page: pagination.currentPage,
    size: pagination.pageSize,
    title: filters.searchText,
    sortBy: filters.sortBy,
    sortDirection: filters.sortDirection,
  } as any);

  const { data: listeningExamsRes, isLoading: loadingListeningExams } =
    useGetListListeningExamCached({
      page: pagination.currentPage,
      size: pagination.pageSize,
      keywords: filters.searchText,
      sort_by: filters.sortBy,
      sort_direction: filters.sortDirection,
    });

  const { data: readingPassagesRes, isLoading: loadingReadingPassages } =
    useGetReadingPassageCached({
      page: pagination.currentPage,
      size: pagination.pageSize,
      title: filters.searchText,
      sortBy: filters.sortBy,
      sortDirection: filters.sortDirection,
    });

  const { data: readingExamsRes, isLoading: loadingReadingExams } = useGetReadingExamCached({
    page: pagination.currentPage,
    size: pagination.pageSize,
    title: filters.searchText,
    sortBy: filters.sortBy,
    sortDirection: filters.sortDirection,
  });

  const handleFiltersChange = (newFilters: AddMarkupFilters) => {
    dispatch(setFilters(newFilters));
    dispatch(setPagination({ ...pagination, currentPage: 1 }));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
  };

  const handlePageChange = (page: number) => {
    dispatch(setPagination({ ...pagination, currentPage: page }));
  };

  const handlePageSizeChange = (size: string) => {
    dispatch(setPagination({ ...pagination, pageSize: Number(size), currentPage: 1 }));
  };

  const { createMarkupTask, isLoading: isSubmitting } = useCreateMarkupTask();

  const isCurrentLoading = useMemo(() => {
    if (taskType == TaskType.LISTENING && practiceType == PracticeType.TASK)
      return loadingListeningTasks;
    if (taskType == TaskType.LISTENING && practiceType == PracticeType.EXAM)
      return loadingListeningExams;
    if (taskType == TaskType.READING && practiceType == PracticeType.TASK)
      return loadingReadingPassages;
    if (taskType == TaskType.READING && practiceType == PracticeType.EXAM)
      return loadingReadingExams;
    return false;
  }, [
    taskType,
    practiceType,
    loadingListeningTasks,
    loadingListeningExams,
    loadingReadingPassages,
    loadingReadingExams,
  ]);

  const items = useMemo(() => {
    if (taskType == TaskType.LISTENING && practiceType == PracticeType.TASK) {
      const list = extractArray(listeningTasksRes?.data);
      return list.map((t: any) => ({
        id: t.task_id as string,
        title: t.title as string,
        meta: `Part ${t.part_number}`,
      }));
    }
    if (taskType == TaskType.LISTENING && practiceType == PracticeType.EXAM) {
      const list = extractArray(listeningExamsRes?.data);
      return list.map((e: any) => ({
        id: e.listening_exam_id as string,
        title: e.exam_name as string,
        meta: `Slug: ${e.url_slug}`,
      }));
    }
    if (taskType == TaskType.READING && practiceType == PracticeType.TASK) {
      const list = extractArray(readingPassagesRes?.data);
      return list.map((p: any) => ({
        id: p.passage_id as string,
        title: p.title as string,
        meta: `Part ${p.part_number}`,
      }));
    }
    if (taskType == TaskType.READING && practiceType == PracticeType.EXAM) {
      const list = extractArray(readingExamsRes?.data);
      return list.map((e: any) => ({
        id: e.reading_exam_id as string,
        title: e.reading_exam_name as string,
        meta: `Slug: ${e.url_slug}`,
      }));
    }
    return [];
  }, [
    taskType,
    practiceType,
    listeningTasksRes?.data,
    listeningExamsRes?.data,
    readingPassagesRes?.data,
    readingExamsRes?.data,
    listeningTasksRes?.pagination,
    listeningExamsRes?.pagination,
    readingPassagesRes?.pagination,
    readingExamsRes?.pagination,
  ]);

  // Always reset to page 1 when switching the data source (taskType/practiceType)
  // This prevents carrying over a page number from a previous source (e.g., page=2)
  useEffect(() => {
    dispatch(
      setPagination({
        ...pagination,
        currentPage: DEFAULT_PAGE,
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskType, practiceType]);

  useEffect(() => {
    let pg: any | undefined;

    if (taskType == TaskType.LISTENING && practiceType == PracticeType.TASK) {
      pg = listeningTasksRes?.pagination;
    } else if (taskType == TaskType.LISTENING && practiceType == PracticeType.EXAM) {
      pg = listeningExamsRes?.pagination;
    } else if (taskType == TaskType.READING && practiceType == PracticeType.TASK) {
      pg = readingPassagesRes?.pagination;
    } else if (taskType == TaskType.READING && practiceType == PracticeType.EXAM) {
      pg = readingExamsRes?.pagination;
    }

    if (!pg) return;

    // If API pagination doesn't match current state (likely stale data from a previous page),
    // skip applying it. We'll update once fresh data for the current page arrives.
    if (typeof pg.currentPage === 'number' && pg.currentPage !== pagination.currentPage) {
      return;
    }

    const next = {
      totalPages: pg.totalPages ?? 1,
      pageSize: pg.pageSize ?? DEFAULT_SIZE,
      totalItems: pg.totalItems ?? 0,
      hasNextPage: pg.hasNextPage ?? false,
      hasPreviousPage: pg.hasPreviousPage ?? false,
      currentPage: pg.currentPage ?? DEFAULT_PAGE,
    };

    const same =
      pagination.totalPages === next.totalPages &&
      pagination.pageSize === next.pageSize &&
      pagination.totalItems === next.totalItems &&
      pagination.hasNextPage === next.hasNextPage &&
      pagination.hasPreviousPage === next.hasPreviousPage &&
      pagination.currentPage === next.currentPage;

    if (!same) {
      dispatch(setPagination(next));
    }
    // Keep this effect in sync with API pagination changes so we don't lock
    // onto a stale page value from a previous cache.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    taskType,
    practiceType,
    listeningTasksRes?.pagination,
    listeningExamsRes?.pagination,
    readingPassagesRes?.pagination,
    readingExamsRes?.pagination,
  ]);

  const handleAdd = async (taskId: string) => {
    try {
      setAddingId(taskId);
      const payload = {
        markUpType: markupType,
        taskType: taskType,
        practiceType: practiceType,
        taskId,
      } as const;

      const res = await createMarkupTask(payload as any);
      if (res) {
        toast.success('Added to your markup successfully');
      }
    } catch (error) {
      toast.error('Failed to add to markup');
      // eslint-disable-next-line no-console
      console.error(error);
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className='container mx-auto px-4 py-8 space-y-6'>
      {/* Header */}
      <div className='flex justify-between items-center mb-8'>
        <div>
          <h1 className='text-3xl font-bold text-tekhelet-400'>Add to Markup</h1>
          <p className='text-medium-slate-blue-500'>
            Bookmark or favorite a task/exam to access it quickly later.
          </p>
        </div>
        <Button
          className='bg-tekhelet-500 hover:bg-tekhelet-600 text-white'
          onClick={() => router.push('/markup')}
        >
          <ArrowLeft />
          Back to Markup List
        </Button>
      </div>

      {/* Two-column layout */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
        {/* Left: Controls */}
        <div className='lg:col-span-4'>
          <Card className=' backdrop-blur-lg rounded-2xl shadow-xl p-4 md:p-6'>
            <Form {...form}>
              <form className='space-y-4'>
                <FormField
                  control={form.control}
                  name='markupType'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Markup Type</FormLabel>
                      <FormControl>
                        <Select value={String(field.value ?? '')} onValueChange={field.onChange}>
                          <SelectTrigger className='w-full backdrop-blur-md'>
                            <SelectValue placeholder='Select type' />
                          </SelectTrigger>
                          <SelectContent className='bg-white/80 backdrop-blur-lg'>
                            <SelectItem value={String(MarkupType.BOOKMARK)}>
                              <div className='flex items-center gap-2'>
                                <Bookmark className='w-4 h-4' /> Bookmark
                              </div>
                            </SelectItem>
                            <SelectItem value={String(MarkupType.FAVORITE)}>
                              <div className='flex items-center gap-2'>
                                <Heart className='w-4 h-4' /> Favorite
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='taskType'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Task Type</FormLabel>
                      <FormControl>
                        <Select value={String(field.value ?? '')} onValueChange={field.onChange}>
                          <SelectTrigger className='w-full backdrop-blur-md'>
                            <SelectValue placeholder='Select task type' />
                          </SelectTrigger>
                          <SelectContent className='bg-white/80 backdrop-blur-lg'>
                            <SelectItem value={String(TaskType.LISTENING)}>
                              <div className='flex items-center gap-2'>
                                <Headphones className='w-4 h-4' /> Listening
                              </div>
                            </SelectItem>
                            <SelectItem value={String(TaskType.READING)}>
                              <div className='flex items-center gap-2'>
                                <BookOpen className='w-4 h-4' /> Reading
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='practiceType'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Practice Type</FormLabel>
                      <FormControl>
                        <Select value={String(field.value ?? '')} onValueChange={field.onChange}>
                          <SelectTrigger className='w-full backdrop-blur-md'>
                            <SelectValue placeholder='Select practice type' />
                          </SelectTrigger>
                          <SelectContent className='backdrop-blur-lg'>
                            <SelectItem value={String(PracticeType.TASK)}>Task</SelectItem>
                            <SelectItem value={String(PracticeType.EXAM)}>Exam</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </Card>
        </div>

        {/* Right: Content */}
        <div className='lg:col-span-8'>
          <Card className='backdrop-blur-lg rounded-2xl shadow-xl'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-tekhelet-400'>
                {taskType == TaskType.LISTENING ? (
                  <Headphones className='w-5 h-5' />
                ) : (
                  <BookOpen className='w-5 h-5' />
                )}
                {taskType == TaskType.LISTENING ? 'Listening' : 'Reading'}{' '}
                {practiceType == PracticeType.TASK ? 'Tasks' : 'Exams'}
              </CardTitle>
            </CardHeader>
            <CardContent className='p-4 md:p-6'>
              <div className='mb-4'>
                <AddMarkupFilter
                  filters={filters}
                  onFiltersChange={(newFilters) =>
                    handleFiltersChange({
                      searchText: newFilters.searchText ?? '',
                      sortBy: newFilters.sortBy ?? '',
                      sortDirection: newFilters.sortDirection ?? '',
                    })
                  }
                  onClearFilters={handleClearFilters}
                  isLoading={isCurrentLoading}
                  inputPlaceholder='Search by title...'
                />
              </div>
              {isCurrentLoading ? (
                <div className='text-center py-12 text-tekhelet-500'>Loading...</div>
              ) : items?.length === 0 ? (
                <div className='text-center py-12 text-medium-slate-blue-500'>No items found.</div>
              ) : (
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4'>
                  {items?.map((item: any) => (
                    <Card
                      key={item.id}
                      className='backdrop-blur-md rounded-2xl shadow-md border p-4 flex flex-col justify-between'
                    >
                      <div>
                        <h3 className='text-lg font-semibold text-tekhelet-600'>{item.title}</h3>
                        {item.meta && (
                          <p className='text-sm text-medium-slate-blue-500 mt-1'>{item.meta}</p>
                        )}
                      </div>
                      <Button
                        size='sm'
                        className='bg-selective-yellow-300 text-white hover:bg-selective-yellow-300/90 grow'
                        disabled={isSubmitting || addingId === item.id}
                        onClick={() => handleAdd(item.id)}
                      >
                        {addingId === item.id
                          ? 'Adding...'
                          : `Add to ${
                              markupType == MarkupType.BOOKMARK ? 'Bookmarks' : 'Favorites'
                            }`}
                      </Button>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <div className='grow'>
                <PaginationCommon
                  pagination={pagination}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                />
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AddMarkupPage;
