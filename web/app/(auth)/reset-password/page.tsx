'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { resetPassword } from '@/lib/auth-client';

function ResetPassword(): React.ReactElement {
  const params = useSearchParams();
  const router = useRouter();
  const [token, setToken] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [message, setMessage] = useState<string | undefined>(undefined);
  const [success, setSuccess] = useState<boolean>(false);

  useEffect(() => {
    const t = params.get('token') ?? undefined;
    const err = params.get('error') ?? undefined;
    if (t) setToken(t);
    if (err) setError('Invalid or expired reset link. Please request a new one.');
  }, [params]);

  function validatePassword(password: string): string[] {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    return errors;
  }

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> {
    e.preventDefault();
    
    if (!token) {
      setError('Missing reset token. Please use the link from your email.');
      return;
    }

    if (!password.trim()) {
      setError('Please enter a new password');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      setError(passwordErrors.join('. ') + '.');
      return;
    }

    setLoading(true);
    setError(undefined);
    setMessage(undefined);

    try {
      const res = await resetPassword(password, token);
      if (!res.ok) {
        setError(res.error ?? 'Unable to reset password. The link may have expired.');
      } else {
        setSuccess(true);
        setMessage('Password updated successfully! Redirecting to login...');
        setTimeout(() => router.push('/log-in'), 2000);
      }
    } catch (err) {
      console.error('Password reset error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className='flex flex-col gap-6'>
        <div className='text-center'>
          <div className='mx-auto mb-4 w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center'>
            <svg className='w-8 h-8 text-green-600 dark:text-green-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
            </svg>
          </div>
          <h1 className='text-2xl font-bold text-green-600 dark:text-green-400'>Password Updated!</h1>
          <p className='text-sm text-muted-foreground mt-2'>
            Your password has been successfully updated
          </p>
        </div>

        <div className='bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4'>
          <div className='flex items-start gap-3'>
            <svg className='w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
            </svg>
            <div className='text-sm'>
              <p className='font-medium text-green-900 dark:text-green-100 mb-1'>Success!</p>
              <p className='text-green-700 dark:text-green-300'>
                You can now log in with your new password. You&apos;ll be redirected automatically.
              </p>
            </div>
          </div>
        </div>

        <div className='text-center'>
          <Button 
            onClick={() => router.push('/log-in')}
            className='w-full'
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-6'>
      <div className='text-center'>
        <h1 className='text-2xl font-bold'>Reset password</h1>
        <p className='text-sm text-muted-foreground'>
          Enter your new password below
        </p>
      </div>

      <form className='grid gap-4' onSubmit={handleSubmit}>
        <div className='grid gap-2'>
          <Label htmlFor='password'>New password</Label>
          <Input
            id='password'
            type='password'
            placeholder='Enter your new password'
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={loading}
            required
            autoComplete='new-password'
          />
          <p className='text-xs text-muted-foreground'>
            Password must be at least 8 characters with uppercase, lowercase, and number
          </p>
        </div>

        <div className='grid gap-2'>
          <Label htmlFor='confirmPassword'>Confirm password</Label>
          <Input
            id='confirmPassword'
            type='password'
            placeholder='Confirm your new password'
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            disabled={loading}
            required
            autoComplete='new-password'
          />
        </div>
        
        {error && (
          <div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3'>
            <p className='text-sm text-red-700 dark:text-red-300'>{error}</p>
          </div>
        )}
        
        {message && (
          <div className='bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3'>
            <p className='text-sm text-green-700 dark:text-green-300'>{message}</p>
          </div>
        )}
        
        <Button 
          type='submit' 
          disabled={loading || !password.trim() || !confirmPassword.trim()} 
          className='w-full'
        >
          {loading ? (
            <div className='flex items-center gap-2'>
              <svg className='w-4 h-4 animate-spin' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' />
              </svg>
              Updating password...
            </div>
          ) : (
            'Reset password'
          )}
        </Button>
      </form>

      <div className='text-center text-sm'>
        <a className='underline underline-offset-4 hover:text-blue-600 dark:hover:text-blue-400' href='/log-in'>
          Back to log in
        </a>
      </div>
    </div>
  );
}

export default function Page(): React.ReactElement {
  return (
    <Suspense fallback={<div />}>
      <ResetPassword />
    </Suspense>
  );
}
