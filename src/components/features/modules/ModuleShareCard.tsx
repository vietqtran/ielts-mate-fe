'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useModules } from '@/hooks/apis/modules/useModules';
import { ModuleUserResponse } from '@/lib/api/modules';
import { BookOpen, Calendar, Check, Clock, Share2, Timer, TrendingUp, User, X } from 'lucide-react';

interface ModuleShareCardProps {
  moduleShare: ModuleUserResponse;
  onUpdate?: () => void;
  onStudy?: (module: ModuleUserResponse) => void;
  type?: 'received' | 'sent' | 'accepted';
}

export default function ModuleShareCard({
  moduleShare,
  onUpdate,
  onStudy,
  type = 'received',
}: ModuleShareCardProps) {
  const { updateSharedModuleRequest, isLoading } = useModules();

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0:
        return 'bg-yellow-100 text-yellow-800';
      case 1:
        return 'bg-green-100 text-green-800';
      case 2:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 0:
        return 'Pending';
      case 1:
        return 'Accepted';
      case 2:
        return 'Denied';
      default:
        return 'Unknown';
    }
  };

  const formatTimeSpent = (timeInMs: number) => {
    const timeInSeconds = Math.floor(timeInMs / 1000);
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const handleAccept = async () => {
    const result = await updateSharedModuleRequest(moduleShare.module_id, 1);
    if (result) {
      onUpdate?.();
    }
  };

  const handleDeny = async () => {
    const result = await updateSharedModuleRequest(moduleShare.module_id, 2);
    if (result) {
      onUpdate?.();
    }
  };

  const isActionable = type === 'received' && moduleShare.status === 0;

  return (
    <Card className='bg-white/60 backdrop-blur-lg border border-tekhelet-200 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300'>
      <CardHeader className='pb-4'>
        <div className='flex items-start justify-between'>
          <div className='flex items-center space-x-2'>
            <BookOpen className='h-4 w-4 text-tekhelet-400' />
            <Badge className={getStatusColor(moduleShare.status)}>
              {getStatusText(moduleShare.status)}
            </Badge>
            {moduleShare.is_public && <Badge className='bg-blue-100 text-blue-800'>Public</Badge>}
          </div>
          <span className='text-xs text-medium-slate-blue-500 flex items-center'>
            <Calendar className='h-3 w-3 mr-1' />
            {new Date(moduleShare.created_at).toLocaleDateString()}
          </span>
        </div>
        <CardTitle className='text-lg text-tekhelet-400'>{moduleShare.module_name}</CardTitle>
        <CardDescription className='text-medium-slate-blue-500'>
          {moduleShare.description || 'No description available'}
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Sharing Details */}
        <div className='space-y-2'>
          <div className='flex items-center justify-between text-sm'>
            <span className='text-medium-slate-blue-500 flex items-center'>
              <User className='h-3 w-3 mr-1' />
              Created by:
            </span>
            <span className='text-tekhelet-400 font-medium'>{moduleShare.created_by}</span>
          </div>
          <div className='flex items-center justify-between text-sm'>
            <span className='text-medium-slate-blue-500 flex items-center'>
              <TrendingUp className='h-3 w-3 mr-1' />
              Vocabulary Count:
            </span>
            <span className='text-tekhelet-400 font-medium'>
              {moduleShare.flash_card_ids.length}
            </span>
          </div>
          {moduleShare.progress !== undefined && (
            <div className='flex items-center justify-between text-sm'>
              <span className='text-medium-slate-blue-500 flex items-center'>
                <TrendingUp className='h-3 w-3 mr-1' />
                Progress:
              </span>
              <span className='text-tekhelet-400 font-medium'>{moduleShare.progress}%</span>
            </div>
          )}
          {moduleShare.time_spent !== undefined && (
            <div className='flex items-center justify-between text-sm'>
              <span className='text-medium-slate-blue-500 flex items-center'>
                <Timer className='h-3 w-3 mr-1' />
                Time Spent:
              </span>
              <span className='text-tekhelet-400 font-medium'>
                {formatTimeSpent(moduleShare.time_spent)}
              </span>
            </div>
          )}
          {moduleShare.updated_at && (
            <div className='flex items-center justify-between text-sm'>
              <span className='text-medium-slate-blue-500 flex items-center'>
                <Clock className='h-3 w-3 mr-1' />
                Last Updated:
              </span>
              <span className='text-medium-slate-blue-500'>
                {new Date(moduleShare.updated_at).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className='flex gap-2'>
          {type === 'accepted' && (
            <Button
              className='flex-1 bg-tekhelet-400 hover:bg-tekhelet-500 text-white'
              onClick={() => onStudy?.(moduleShare)}
            >
              <BookOpen className='h-4 w-4 mr-2' />
              Study
            </Button>
          )}

          {isActionable && (
            <>
              <Button
                onClick={handleAccept}
                disabled={isLoading.updateSharedModuleRequest}
                className='flex-1 bg-green-500 hover:bg-green-600 text-white'
              >
                {isLoading.updateSharedModuleRequest ? (
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                ) : (
                  <>
                    <Check className='h-4 w-4 mr-2' />
                    Accept
                  </>
                )}
              </Button>
              <Button
                onClick={handleDeny}
                disabled={isLoading.updateSharedModuleRequest}
                variant='destructive'
                className='flex-1'
              >
                {isLoading.updateSharedModuleRequest ? (
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                ) : (
                  <>
                    <X className='h-4 w-4 mr-2' />
                    Deny
                  </>
                )}
              </Button>
            </>
          )}

          {!isActionable && type !== 'accepted' && (
            <Button
              variant='outline'
              className='flex-1 border-tekhelet-200 text-tekhelet-400'
              disabled
            >
              <Share2 className='h-4 w-4 mr-2' />
              {type === 'sent' ? 'Waiting for Response' : 'No Action Required'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
