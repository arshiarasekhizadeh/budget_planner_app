'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { verifyEmail } from '@/services/api';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid or missing verification token.');
      return;
    }

    const verify = async () => {
      try {
        await verifyEmail(token);
        setStatus('success');
        setMessage('Your email has been successfully verified!');
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } catch (error: any) {
        setStatus('error');
        setMessage(error.message || 'Verification failed. The token may be expired.');
      }
    };

    verify();
  }, [token, router]);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans items-center justify-center px-6">
      <div className="w-full max-w-md text-center space-y-8 p-12 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm">
        <Link href="/" className="text-2xl font-bold tracking-tighter block mb-8">Budget.</Link>
        
        {status === 'loading' && (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900 dark:border-zinc-50 mx-auto"></div>
            <p className="text-zinc-500">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-950/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Verified!</h1>
            <p className="text-zinc-500">{message}</p>
            <p className="text-xs text-zinc-400">Redirecting to login...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Verification Failed</h1>
            <p className="text-zinc-500">{message}</p>
            <Link href="/signup" className="inline-block mt-4 text-sm font-bold bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 px-6 py-3 rounded-xl hover:opacity-90 transition-opacity">
              Back to Sign Up
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900 dark:border-zinc-50 mx-auto"></div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
