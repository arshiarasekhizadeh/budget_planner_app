'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { resetPassword } from '@/services/api';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setStatus('error');
      setMessage('Passwords do not match.');
      return;
    }

    const passwordRequirements = [
      { regex: /.{8,}/ },
      { regex: /[A-Z]/ },
      { regex: /[a-z]/ },
      { regex: /[0-9]/ },
      { regex: /[!@#$%^&*(),.?":{}|<>]/ },
    ];

    if (!passwordRequirements.every(req => req.regex.test(password))) {
      setStatus('error');
      setMessage('Password does not meet the security requirements.');
      return;
    }

    if (!token) {
      setStatus('error');
      setMessage('Invalid or missing reset token.');
      return;
    }

    setIsLoading(true);
    setMessage('');
    
    try {
      await resetPassword({ token, new_password: password });
      setStatus('success');
      setMessage('Your password has been reset successfully!');
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message || 'Failed to reset password. The link may be expired.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">Invalid Link</h1>
        <p className="text-zinc-500">This password reset link is invalid or has expired.</p>
        <Link href="/forgot-password" title="Request new link" className="inline-block bg-zinc-900 text-white px-6 py-2 rounded-xl">
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-black tracking-tighter mb-4">New Password</h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Enter your new password below.
        </p>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl text-sm font-medium animate-in fade-in slide-in-from-top-1 duration-200 ${
          status === 'success' 
            ? 'bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 text-green-600 dark:text-green-400' 
            : 'bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400'
        }`}>
          <div className="flex items-center gap-3">
            {status === 'success' ? (
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            ) : (
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            )}
            {message}
          </div>
        </div>
      )}

      {status !== 'success' && (
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2 ml-1">
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50 transition-all font-medium"
                placeholder="••••••••"
              />
              {/* Password Strength Checklist */}
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 px-1">
                {[
                  { label: '8+ Characters', regex: /.{8,}/ },
                  { label: 'Uppercase', regex: /[A-Z]/ },
                  { label: 'Lowercase', regex: /[a-z]/ },
                  { label: 'Number', regex: /[0-9]/ },
                  { label: 'Special Character', regex: /[!@#$%^&*(),.?":{}|<>]/ },
                ].map((req, i) => {
                  const isMet = req.regex.test(password);
                  return (
                    <div key={i} className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${isMet ? 'text-green-500' : 'text-zinc-400'}`}>
                      <div className={`w-3 h-3 rounded-full flex items-center justify-center border ${isMet ? 'bg-green-500 border-green-500 text-white' : 'border-zinc-300 dark:border-zinc-700'}`}>
                        {isMet && <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      {req.label}
                    </div>
                  );
                })}
              </div>
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2 ml-1">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50 transition-all font-medium"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 py-4 rounded-2xl font-bold hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 dark:border-zinc-900/30 border-t-white dark:border-t-zinc-900 rounded-full animate-spin"></div>
                <span>Resetting...</span>
              </>
            ) : 'Reset Password'}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans transition-colors duration-300">
      <nav className="flex items-center justify-between px-6 py-6 md:px-12 max-w-7xl mx-auto w-full">
        <Link href="/" className="text-xl font-bold tracking-tighter">Budgetly</Link>
      </nav>

      <main className="flex-grow flex items-center justify-center px-6 py-12">
        <Suspense fallback={<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900 dark:border-zinc-50 mx-auto"></div>}>
          <ResetPasswordContent />
        </Suspense>
      </main>

      <footer className="px-6 py-8 text-center text-[10px] text-zinc-400 uppercase tracking-[0.2em] font-bold">
        © 2026 Budgetly. Secure & Private.
      </footer>
    </div>
  );
}
