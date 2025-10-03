'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signUpWithEmail, signInWithGithub } from '@/lib/auth-client';
import { Github } from 'lucide-react';

export default function Page(): React.ReactElement {
  const router = useRouter();
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [message, setMessage] = useState<string | undefined>(undefined);

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

  async function handleSignUp(
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!password.trim()) {
      setError('Please enter a password');
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
      const res = await signUpWithEmail({ name, email, password });
      if (!res.ok) {
        setError(res.error ?? 'Failed to create account');
      } else {
        setMessage('Account created! A verification code has been sent to your email.');
        // Redirect to verification page immediately
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
      }
    } catch (err) {
      console.error('Sign up error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='flex flex-col gap-6'>
      <div className='text-center'>
        <h1 className='text-2xl font-bold'>Create account</h1>
        <p className='text-sm text-muted-foreground'>Start composing</p>
      </div>

      <form className='grid gap-4' onSubmit={handleSignUp}>
        <div className='grid gap-2'>
          <Label htmlFor='name'>Full name</Label>
          <Input
            id='name'
            placeholder='Enter your full name'
            value={name}
            onChange={e => setName(e.target.value)}
            disabled={loading}
            required
            autoComplete='name'
          />
        </div>
        
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
        
        <div className='grid gap-2'>
          <Label htmlFor='password'>Password</Label>
          <Input
            id='password'
            type='password'
            placeholder='Create a strong password'
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
            placeholder='Confirm your password'
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
          disabled={loading || !name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()} 
          className='w-full'
        >
          {loading ? (
            <div className='flex items-center gap-2'>
              <svg className='w-4 h-4 animate-spin' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' />
              </svg>
              Creating account...
            </div>
          ) : (
            'Create account'
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
        onClick={() => signInWithGithub({ callbackURL: '/stage' })}
      >
        Continue with GitHub <Github className='h-4 w-4' />
      </Button>

      <div className='text-center text-sm'>
        <a className='underline underline-offset-4' href='/log-in'>
          Already have an account? Log in
        </a>
      </div>
    </div>
  );
}
