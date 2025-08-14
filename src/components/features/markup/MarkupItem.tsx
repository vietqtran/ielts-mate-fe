'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MarkupType, PracticeType, TaskType } from '@/types/markup/markup.enum';
import { GetTaskMarkupResponse } from '@/types/markup/markup.types';
import { Book, Bookmark, Headphones, Heart, Trash2 } from 'lucide-react';
import { memo } from 'react';

interface MarkupItemProps {
  item: GetTaskMarkupResponse;
  onDelete: (task_id: string) => void;
  isDeleting?: boolean;
}

const getMarkupTypeIcon = (type: MarkupType) => {
  switch (type) {
    case MarkupType.BOOKMARK:
      return <Bookmark className='h-4 w-4' />;
    case MarkupType.FAVORITE:
      return <Heart className='h-4 w-4 fill-current' />;
    default:
      return <Bookmark className='h-4 w-4' />;
  }
};

const getMarkupTypeLabel = (type: MarkupType) => {
  switch (type) {
    case MarkupType.BOOKMARK:
      return 'Bookmark';
    case MarkupType.FAVORITE:
      return 'Favorite';
    default:
      return 'Unknown';
  }
};

const getTaskTypeIcon = (type: TaskType) => {
  switch (type) {
    case TaskType.LISTENING:
      return <Headphones className='h-4 w-4' />;
    case TaskType.READING:
      return <Book className='h-4 w-4' />;
    default:
      return <Book className='h-4 w-4' />;
  }
};

const getTaskTypeLabel = (type: TaskType) => {
  switch (type) {
    case TaskType.LISTENING:
      return 'Listening';
    case TaskType.READING:
      return 'Reading';
    default:
      return 'Unknown';
  }
};

const getPracticeTypeLabel = (type: PracticeType) => {
  switch (type) {
    case PracticeType.EXAM:
      return 'Exam';
    case PracticeType.TASK:
      return 'Task';
    default:
      return 'Unknown';
  }
};

const getMarkupTypeBadgeColor = (type: MarkupType) => {
  switch (type) {
    case MarkupType.BOOKMARK:
      return 'bg-tekhelet-900 text-tekhelet-100';
    case MarkupType.FAVORITE:
      return 'bg-persimmon-500 text-white';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

export const MarkupItem = memo(function MarkupItem({
  item,
  onDelete,
  isDeleting = false,
}: Readonly<MarkupItemProps>) {
  const handleDelete = () => {
    onDelete(item.task_id);
  };

  return (
    <Card className='backdrop-blur-md border rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 p-6'>
      <div className='flex items-start justify-between gap-4'>
        <div className='flex-1 min-w-0'>
          {/* Title */}
          <h3 className='font-semibold text-tekhelet-400 text-lg mb-3 line-clamp-2'>
            {item.task_title ?? 'Untitled Task'}
          </h3>

          {/* Badges */}
          <div className='flex flex-wrap gap-2 mb-4'>
            <Badge
              variant='outline'
              className={`${getMarkupTypeBadgeColor(item.markup_type)} flex items-center gap-1`}
            >
              {getMarkupTypeIcon(item.markup_type)}
              {getMarkupTypeLabel(item.markup_type)}
            </Badge>

            <Badge
              variant='outline'
              className='bg-medium-slate-blue-100 text-medium-slate-blue-700 border-medium-slate-blue-200 flex items-center gap-1'
            >
              {getTaskTypeIcon(item.task_type)}
              {getTaskTypeLabel(item.task_type)}
            </Badge>

            <Badge
              variant='outline'
              className='bg-selective-yellow-100 text-selective-yellow-800 border-selective-yellow-200'
            >
              {getPracticeTypeLabel(item.practice_type)}
            </Badge>
          </div>
        </div>

        {/* Actions */}
        <div className='flex items-center gap-2 shrink-0'>
          <Button
            variant='ghost'
            size='sm'
            onClick={handleDelete}
            disabled={isDeleting}
            className='text-persimmon-400 hover:text-persimmon-500 hover:bg-persimmon-50 disabled:opacity-50'
          >
            {isDeleting ? (
              <div className='h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
            ) : (
              <Trash2 className='h-4 w-4' />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
});

export default MarkupItem;
