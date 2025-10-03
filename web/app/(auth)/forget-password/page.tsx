'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { requestPasswordReset } from '@/lib/auth-client';

export default function Page(): React.ReactElement {
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const [emailSent, setEmailSent] = useState<boolean>(false);

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> {
    e.preventDefault();

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError(undefined);
    setMessage(undefined);

    try {
      const res = await requestPasswordReset(email, '/reset-password');
      if (!res.ok) {
        setError(res.error ?? 'Unable to send reset link. Please try again.');
      } else {
        setMessage(
          'If an account exists with this email, a password reset link has been sent.'
        );
        setEmailSent(true);
      }
    } catch (err) {
      console.error('Password reset error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (emailSent) {
    return (
      <div className='flex flex-col gap-6'>
        <div className='text-center'>
          <div className='mx-auto mb-4 w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center'>
            <svg
              className='w-8 h-8 text-green-600 dark:text-green-400'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M5 13l4 4L19 7'
              />
            </svg>
          </div>
          <h1 className='text-2xl font-bold text-green-600 dark:text-green-400'>
            Check your email
          </h1>
          <p className='text-sm text-muted-foreground mt-2'>
            We&apos;ve sent a password reset link to <strong>{email}</strong>
          </p>
        </div>

        <div className='bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4'>
          <div className='flex items-start gap-3'>
            <svg
              className='w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
            <div className='text-sm'>
              <p className='font-medium text-blue-900 dark:text-blue-100 mb-1'>
                What&apos;s next?
              </p>
              <ul className='text-blue-700 dark:text-blue-300 space-y-1'>
                <li>• Check your email inbox (and spam folder)</li>
                <li>• Click the reset link in the email</li>
                <li>• Create your new password</li>
              </ul>
            </div>
          </div>
        </div>

        <div className='text-center text-sm space-y-2'>
          <p className='text-muted-foreground'>
            Didn&apos;t receive the email? Check your spam folder or{' '}
            <button
              onClick={() => {
                setEmailSent(false);
                setMessage(undefined);
                setError(undefined);
              }}
              className='text-blue-600 dark:text-blue-400 hover:underline'
            >
              try again
            </button>
          </p>
          <a className='underline underline-offset-4' href='/log-in'>
            Back to log in
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-6'>
      <div className='text-center'>
        <h1 className='text-2xl font-bold'>Forgot password</h1>
        <p className='text-sm text-muted-foreground'>
          Enter your email address and we&apos;ll send you a reset link
        </p>
      </div>

      <form className='grid gap-4' onSubmit={handleSubmit}>
        <div className='grid gap-2'>
          <Label htmlFor='email'>Email address</Label>
          <Input
            id='email'
            type='email'
            placeholder='Enter your email'
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={loading}
            required
            autoComplete='email'
          />
        </div>

        {error && (
          <div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3'>
            <p className='text-sm text-red-700 dark:text-red-300'>{error}</p>
          </div>
        )}

        {message && (
          <div className='bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3'>
            <p className='text-sm text-green-700 dark:text-green-300'>
              {message}
            </p>
          </div>
        )}

        <Button
          type='submit'
          disabled={loading || !email.trim()}
          className='w-full'
        >
          {loading ? (
            <div className='flex items-center gap-2'>
              <svg
                className='w-4 h-4 animate-spin'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
                />
              </svg>
              Sending reset link...
            </div>
          ) : (
            'Send reset link'
          )}
        </Button>
      </form>

      <div className='text-center text-sm'>
        <a
          className='underline underline-offset-4 hover:text-blue-600 dark:hover:text-blue-400'
          href='/log-in'
        >
          Back to log in
        </a>
      </div>
    </div>
  );
}
