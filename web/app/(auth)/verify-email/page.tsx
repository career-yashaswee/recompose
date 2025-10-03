'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function VerifyEmail(): React.ReactElement {
  const params = useSearchParams();
  const router = useRouter();
  const [token, setToken] = useState<string>('');
  const [otpCode, setOtpCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [message, setMessage] = useState<string | undefined>(undefined);
  const [success, setSuccess] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');

  useEffect(() => {
    const t = params.get('token') ?? undefined;
    const e = params.get('email') ?? undefined;
    const err = params.get('error') ?? undefined;

    if (t) setToken(t);
    if (e) setEmail(e);
    if (err)
      setError(
        'Invalid or expired verification link. Please try signing up again.'
      );

    // If token is present, auto-verify the email
    if (t && e) {
      const handleTokenVerification = async (token: string, email: string): Promise<void> => {
        setLoading(true);
        setError(undefined);
        setMessage(undefined);

        try {
          // Use Better Auth's built-in verifyEmail function
          const response = await fetch('/api/auth/verify-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token, email }),
          });

          const result = await response.json();

          if (!response.ok) {
            setError(result.error || 'Email verification failed. Please try again.');
          } else {
            setSuccess(true);
            setMessage('Email verified successfully! Redirecting to login...');
            setTimeout(() => router.push('/log-in'), 2000);
          }
        } catch (err) {
          console.error('Token verification error:', err);
          setError('An unexpected error occurred during verification. Please try again.');
        } finally {
          setLoading(false);
        }
      };

      handleTokenVerification(t, e);
    }
  }, [params, router]);

  function validateOTP(code: string): boolean {
    return /^\d{6}$/.test(code);
  }

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> {
    e.preventDefault();

    if (!token) {
      setError(
        'Missing verification token. Please use the link from your email.'
      );
      return;
    }

    if (!validateOTP(otpCode)) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    setError(undefined);
    setMessage(undefined);

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          otpCode,
          email,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Verification failed. Please try again.');
      } else {
        setSuccess(true);
        setMessage('Email verified successfully! Redirecting to login...');
        setTimeout(() => router.push('/log-in'), 2000);
      }
    } catch (err) {
      console.error('Email verification error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResendCode(): Promise<void> {
    if (!email) {
      setError('Email address not found. Please try signing up again.');
      return;
    }

    setLoading(true);
    setError(undefined);
    setMessage(undefined);

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Failed to resend verification code.');
      } else {
        setMessage('A new verification code has been sent to your email.');
      }
    } catch (err) {
      console.error('Resend verification error:', err);
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
            Email Verified!
          </h1>
          <p className='text-sm text-muted-foreground mt-2'>
            Your email has been successfully verified
          </p>
        </div>

        <div className='bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4'>
          <div className='flex items-start gap-3'>
            <svg
              className='w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0'
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
              <p className='font-medium text-green-900 dark:text-green-100 mb-1'>
                Success!
              </p>
              <p className='text-green-700 dark:text-green-300'>
                You can now log in to your account. You&apos;ll be redirected
                automatically.
              </p>
            </div>
          </div>
        </div>

        <div className='text-center'>
          <Button onClick={() => router.push('/log-in')} className='w-full'>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-6'>
      <div className='text-center'>
        <h1 className='text-2xl font-bold'>Verify your email</h1>
        <p className='text-sm text-muted-foreground'>
          Enter the 6-digit code sent to {email || 'your email'}
        </p>
      </div>

      <form className='grid gap-4' onSubmit={handleSubmit}>
        <div className='grid gap-2'>
          <Label htmlFor='otp'>Verification code</Label>
          <Input
            id='otp'
            type='text'
            placeholder='000000'
            value={otpCode}
            onChange={e => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 6);
              setOtpCode(value);
            }}
            disabled={loading}
            required
            autoComplete='one-time-code'
            className='text-center text-2xl font-mono tracking-widest'
          />
          <p className='text-xs text-muted-foreground'>
            Enter the 6-digit code from your email
          </p>
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
          disabled={loading || !validateOTP(otpCode)}
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
              Verifying...
            </div>
          ) : (
            'Verify Email'
          )}
        </Button>
      </form>

      <div className='text-center text-sm space-y-2'>
        <p className='text-muted-foreground'>
          Didn&apos;t receive the code?{' '}
          <button
            onClick={handleResendCode}
            disabled={loading || !email}
            className='text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50'
          >
            Resend code
          </button>
        </p>
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

export default function Page(): React.ReactElement {
  return (
    <Suspense fallback={<div />}>
      <VerifyEmail />
    </Suspense>
  );
}
