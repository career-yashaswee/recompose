'use client';
import React from 'react';
import MarkCompleteButton from '@/components/common/stage/mark-complete-button';
import ReactionControl from '@/components/common/stage/reaction-control';
import {
  ShareDialog,
  ReportDialog,
} from '@/components/common/stage/share-report-dialog';
import { CheckCircle2, Star } from 'lucide-react';
import { toast } from 'sonner';
import {
  useCompositionProgress,
  useCompositionFavorite,
  useToggleCompositionFavorite,
} from '@/hooks/api';
import { Button } from '@/components/ui/button';

interface CompositionStatusControlProps {
  compositionId: string;
  compositionTitle: string;
}

export default function CompositionStatusControl(
  props: CompositionStatusControlProps
): React.ReactElement {
  const { data, isLoading } = useCompositionProgress(props.compositionId);
  const { data: favoriteData, isLoading: favoriteLoading } =
    useCompositionFavorite(props.compositionId);
  const toggleFavorite = useToggleCompositionFavorite();

  if (isLoading || favoriteLoading) {
    return <div className='text-sm text-slate-500'>Loading status...</div>;
  }

  const isFavorite = favoriteData?.isFavorite ?? false;

  const handleFavoriteToggle = () => {
    const newFavoriteState = !isFavorite;
    toggleFavorite.mutate(
      {
        compositionId: props.compositionId,
        favorite: newFavoriteState,
      },
      {
        onSuccess: () => {
          if (newFavoriteState) {
            toast.success('Added to favorites', {
              description: `"${props.compositionTitle}" has been added to your favorites`,
              duration: 3000,
            });
          } else {
            toast.info('Removed from favorites', {
              description: `"${props.compositionTitle}" has been removed from your favorites`,
              duration: 3000,
            });
          }
        },
        onError: () => {
          toast.error('Failed to update favorite', {
            description: 'Please try again later.',
            duration: 3000,
          });
        },
      }
    );
  };

  return (
    <div className='flex items-center gap-3'>
      {data?.status === 'SOLVED' ? (
        <div className='inline-flex items-center gap-2 text-emerald-600'>
          <CheckCircle2 className='size-5' />
          <span className='font-medium'>Solved</span>
        </div>
      ) : (
        <MarkCompleteButton
          compositionId={props.compositionId}
          compositionTitle={props.compositionTitle}
        />
      )}
      <ReactionControl
        compositionId={props.compositionId}
        compositionTitle={props.compositionTitle}
      />
      <Button
        variant='outline'
        size='sm'
        onClick={handleFavoriteToggle}
        className={`flex items-center gap-2 ${
          isFavorite
            ? 'border-amber-500 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950'
            : 'hover:bg-slate-50 dark:hover:bg-slate-900'
        }`}
      >
        <Star
          className={`size-4 ${
            isFavorite ? 'fill-amber-500 text-amber-500' : 'text-slate-400'
          }`}
        />
        {isFavorite ? 'Favorited' : 'Favorite'}
      </Button>
      <ShareDialog
        compositionId={props.compositionId}
        compositionTitle={props.compositionTitle}
      />
      <ReportDialog />
    </div>
  );
}
