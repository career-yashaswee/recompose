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
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [message, setMessage] = useState<string | undefined>(undefined);

  useEffect(() => {
    const t = params.get('token') ?? undefined;
    const err = params.get('error') ?? undefined;
    if (t) setToken(t);
    if (err) setError('Invalid or expired link. Request a new one.');
  }, [params]);

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> {
    e.preventDefault();
    setLoading(true);
    setError(undefined);
    setMessage(undefined);
    if (!token) {
      setError('Missing token');
      setLoading(false);
      return;
    }
    const res = await resetPassword(password, token);
    if (!res.ok) setError(res.error ?? 'Unable to reset password');
    else {
      setMessage('Password updated. Redirecting to log in...');
      setTimeout(() => router.push('/log-in'), 1200);
    }
    setLoading(false);
  }

  return (
    <div className='flex flex-col gap-6'>
      <div className='text-center'>
        <h1 className='text-2xl font-bold'>Reset password</h1>
        <p className='text-sm text-muted-foreground'>Enter your new password</p>
      </div>

      <form className='grid gap-4' onSubmit={handleSubmit}>
        <div className='grid gap-2'>
          <Label htmlFor='password'>New password</Label>
          <Input
            id='password'
            type='password'
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className='text-sm text-destructive'>{error}</p>}
        {message && (
          <p className='text-sm text-green-600 dark:text-green-500'>
            {message}
          </p>
        )}
        <Button type='submit' disabled={loading} className='w-full'>
          {loading ? 'Updating...' : 'Reset password'}
        </Button>
      </form>

      <div className='text-center text-sm'>
        <a className='underline underline-offset-4' href='/log-in'>
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
