import { CheckCircle, PlayCircle, XCircle } from 'lucide-react';

export const getStatusLabel = (status: number | null): string => {
  if (status === null) return 'Unknown';
  switch (status) {
    case 0:
      return 'In Progress';
    case 3:
      return 'Completed';
    default:
      return 'Not Started';
  }
};

export const getStatusColor = (status: number | null): string => {
  if (status === null) return 'bg-gray-100 text-gray-800';
  switch (status) {
    case 0:
      return 'bg-selective-yellow-700 text-persimon-200';
    case 3:
      return 'bg-green-600 text-white';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getStatusIcon = (status: number | null) => {
  if (status === null) return <XCircle className='h-4 w-4' />;
  switch (status) {
    case 0:
      return <PlayCircle className='h-4 w-4' />;
    case 3:
      return <CheckCircle className='h-4 w-4' />;
    default:
      return <XCircle className='h-4 w-4' />;
  }
};
