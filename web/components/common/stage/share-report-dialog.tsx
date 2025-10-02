'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Flag, Copy, Check } from 'lucide-react';

interface ShareDialogProps {
  compositionId: string;
  compositionTitle: string;
}

export function ShareDialog(props: ShareDialogProps): React.ReactElement {
  const [isOpen, setIsOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const compositionUrl = `${window.location.origin}/stage/compositions/${props.compositionId}`;
  const shareText = `Check out this composition: ${props.compositionTitle}`;

  const handleCopyUrl = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(compositionUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const handleWhatsAppShare = (): void => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${compositionUrl}`)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleLinkedInShare = (): void => {
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(compositionUrl)}`;
    window.open(linkedinUrl, '_blank', 'noopener,noreferrer');
  };

  if (!isOpen) {
    return (
      <Button
        variant='outline'
        size='sm'
        onClick={() => setIsOpen(true)}
        className='flex items-center gap-2'
      >
        <Share2 className='size-4' />
        Share
      </Button>
    );
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
      <div className='bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-md w-full mx-4'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700'>
          <h2 className='text-lg font-semibold text-slate-900 dark:text-slate-100'>
            Share
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className='text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className='p-6'>
          <div className='space-y-4'>
            {/* URL Input */}
            <div className='space-y-2'>
              <label className='text-sm font-medium text-slate-700 dark:text-slate-300'>
                Share URL
              </label>
              <div className='flex gap-2'>
                <input
                  type='text'
                  value={compositionUrl}
                  readOnly
                  className='flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-800 text-sm text-slate-600 dark:text-slate-400'
                />
                <Button
                  size='sm'
                  onClick={handleCopyUrl}
                  className='flex items-center gap-1'
                >
                  {copied ? (
                    <Check className='size-4' />
                  ) : (
                    <Copy className='size-4' />
                  )}
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>
            </div>

            {/* Share Options */}
            <div className='space-y-2'>
              <label className='text-sm font-medium text-slate-700 dark:text-slate-300'>
                Share on
              </label>
              <div className='grid grid-cols-2 gap-3'>
                <button
                  onClick={handleWhatsAppShare}
                  className='flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors'
                >
                  <div className='w-10 h-10 bg-green-500 rounded-full flex items-center justify-center'>
                    <svg
                      className='w-6 h-6 text-white'
                      viewBox='0 0 24 24'
                      fill='currentColor'
                    >
                      <path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488' />
                    </svg>
                  </div>
                  <span className='text-sm font-medium text-slate-700 dark:text-slate-300'>
                    WhatsApp
                  </span>
                </button>

                <button
                  onClick={handleLinkedInShare}
                  className='flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors'
                >
                  <div className='w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center'>
                    <svg
                      className='w-6 h-6 text-white'
                      viewBox='0 0 24 24'
                      fill='currentColor'
                    >
                      <path d='M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' />
                    </svg>
                  </div>
                  <span className='text-sm font-medium text-slate-700 dark:text-slate-300'>
                    LinkedIn
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ReportDialog(): React.ReactElement {
  const [isOpen, setIsOpen] = React.useState(false);

  if (!isOpen) {
    return (
      <Button
        variant='outline'
        size='sm'
        onClick={() => setIsOpen(true)}
        className='flex items-center gap-2'
      >
        <Flag className='size-4' />
        Report
      </Button>
    );
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
      <div className='bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-md w-full mx-4'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700'>
          <h2 className='text-lg font-semibold text-slate-900 dark:text-slate-100'>
            Report
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className='text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className='p-6'>
          <div className='space-y-4'>
            <div className='text-center'>
              <Flag className='size-12 text-red-500 mx-auto mb-4' />
              <h3 className='text-lg font-medium text-slate-900 dark:text-slate-100 mb-2'>
                Report this composition
              </h3>
              <p className='text-sm text-slate-600 dark:text-slate-400 mb-4'>
                Help us keep the community safe by reporting inappropriate
                content.
              </p>
            </div>
            <Button
              variant='destructive'
              className='w-full'
              onClick={() => {
                // TODO: Implement report functionality
                alert('Report functionality coming soon!');
                setIsOpen(false);
              }}
            >
              Report Content
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
