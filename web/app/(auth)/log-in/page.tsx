'use client';

import React, { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  signInWithGithub,
  signInWithEmail,
  resendVerificationEmail,
} from '@/lib/auth-client';
import { Github } from 'lucide-react';

function Login(): React.ReactElement {
  const params = useSearchParams();
  const callbackURL = params.get('callbackURL') ?? '/stage';
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [showEmailVerification, setShowEmailVerification] =
    useState<boolean>(false);
  const [otpCode, setOtpCode] = useState<string>('');
  const [verificationLoading, setVerificationLoading] =
    useState<boolean>(false);

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    if (value.length <= 6) {
      setOtpCode(value);
    }
  };

  async function handleEmailLogin(
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> {
    e.preventDefault();
    setLoading(true);
    setError(undefined);
    setShowEmailVerification(false);

    const res = await signInWithEmail({ email, password }, { callbackURL });

    if (!res.ok) {
      // Check if the error is due to unverified email
      if (res.error?.includes('email') && res.error?.includes('verify')) {
        setShowEmailVerification(true);
        setError(
          'Please verify your email address. A verification code has been sent to your email.'
        );
      } else {
        setError(res.error ?? 'Failed to sign in');
      }
    }
    setLoading(false);
  }

  async function handleVerifyEmail(): Promise<void> {
    if (otpCode.length !== 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    setVerificationLoading(true);
    setError(undefined);

    try {
      // Send OTP verification request with email
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ otpCode, email }),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(
          result.error ||
            'Email verification failed. Please check your code and try again.'
        );
      } else {
        setError(undefined);
        setShowEmailVerification(false);
        // Now try to login again
        const loginRes = await signInWithEmail(
          { email, password },
          { callbackURL }
        );
        if (!loginRes.ok) {
          setError('Email verified but login failed. Please try again.');
        }
      }
    } catch (err) {
      console.error('Email verification error:', err);
      setError(
        'An unexpected error occurred during verification. Please try again.'
      );
    } finally {
      setVerificationLoading(false);
    }
  }

  async function handleResendVerification(): Promise<void> {
    setVerificationLoading(true);
    setError(undefined);

    try {
      const res = await resendVerificationEmail(email);
      if (!res.ok) {
        setError(
          res.error ?? 'Failed to resend verification email. Please try again.'
        );
      } else {
        setError(undefined);
        // Show success message briefly
        const originalError = error;
        setError('A new verification code has been sent to your email.');
        setTimeout(() => setError(originalError), 3000);
      }
    } catch (err) {
      console.error('Resend verification error:', err);
      setError(
        'An unexpected error occurred while resending. Please try again.'
      );
    } finally {
      setVerificationLoading(false);
    }
  }

  if (showEmailVerification) {
    return (
      <div className='flex flex-col gap-6'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold'>Verify your email</h1>
          <p className='text-sm text-muted-foreground'>
            A 6-digit verification code has been sent to{' '}
            <strong>{email}</strong>
          </p>
        </div>

        <div className='grid gap-4'>
          <div className='grid gap-2'>
            <Label htmlFor='otp'>Verification Code</Label>
            <Input
              id='otp'
              type='text'
              inputMode='numeric'
              pattern='[0-9]*'
              maxLength={6}
              placeholder='Enter 6-digit code'
              value={otpCode}
              onChange={handleOtpChange}
              disabled={verificationLoading}
              required
              className='text-center text-2xl tracking-widest'
            />
          </div>

          {error && (
            <div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3'>
              <p className='text-sm text-red-700 dark:text-red-300'>{error}</p>
            </div>
          )}

          <Button
            onClick={handleVerifyEmail}
            disabled={verificationLoading || otpCode.length !== 6}
            className='w-full'
          >
            {verificationLoading ? (
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

          <div className='text-center text-sm space-y-2'>
            <p className='text-muted-foreground'>
              Didn&apos;t receive the code?{' '}
              <button
                onClick={handleResendVerification}
                disabled={verificationLoading}
                className='text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50 disabled:cursor-not-allowed'
              >
                Resend code
              </button>
            </p>
            <button
              onClick={() => {
                setShowEmailVerification(false);
                setOtpCode('');
                setError(undefined);
              }}
              className='text-blue-600 dark:text-blue-400 hover:underline'
            >
              Back to login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-6'>
      <div className='text-center'>
        <h1 className='text-2xl font-bold'>Log in</h1>
        <p className='text-sm text-muted-foreground'>Welcome back</p>
      </div>

      <form className='grid gap-4' onSubmit={handleEmailLogin}>
        <div className='grid gap-2'>
          <Label htmlFor='email'>Email</Label>
          <Input
            id='email'
            type='email'
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div className='grid gap-2'>
          <Label htmlFor='password'>Password</Label>
          <Input
            id='password'
            type='password'
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        {error && (
          <div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3'>
            <p className='text-sm text-red-700 dark:text-red-300'>{error}</p>
          </div>
        )}
        <Button type='submit' disabled={loading} className='w-full'>
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
              Logging in...
            </div>
          ) : (
            'Log in'
          )}
        </Button>
      </form>

      <div className='relative'>
        <div className='absolute inset-0 flex items-center'>
          <span className='w-full border-t' />
        </div>
        <div className='relative flex justify-center text-xs uppercase'>
          <span className='bg-background px-2 text-muted-foreground'>
            Or continue with
          </span>
        </div>
      </div>

      <Button
        variant='outline'
        className='w-full'
        onClick={() => signInWithGithub({ callbackURL })}
      >
        Continue with GitHub <Github className='h-4 w-4' />
      </Button>

      <div className='text-center text-sm'>
        <a className='underline underline-offset-4' href='/forget-password'>
          Forgot password?
        </a>
        <span className='px-1'>·</span>
        <a className='underline underline-offset-4' href='/sign-up'>
          Create account
        </a>
      </div>
    </div>
  );
}

export default function Page(): React.ReactElement {
  return (
    <Suspense fallback={<div />}>
      <Login />
    </Suspense>
  );
}
