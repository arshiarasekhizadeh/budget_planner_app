'use client';

import Link from 'next/link';
import { useState } from 'react';
import { forgotPassword } from '@/services/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    
    try {
      const data = await forgotPassword(email);
      setStatus('success');
      setMessage(data.message);
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans transition-colors duration-300">
      <nav className="flex items-center justify-between px-6 py-6 md:px-12 max-w-7xl mx-auto w-full">
        <Link href="/" className="text-xl font-bold tracking-tighter">Budgetly</Link>
        <Link href="/login" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
          Back to login
        </Link>
      </nav>

      <main className="flex-grow flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-black tracking-tighter mb-4">Reset password</h1>
            <p className="text-zinc-500 dark:text-zinc-400">
              Enter your email and we&apos;ll send you a link to reset your password.
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
              <div>
                <label htmlFor="email" className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2 ml-1">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50 transition-all font-medium"
                  placeholder="name@example.com"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 py-4 rounded-2xl font-bold hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 dark:border-zinc-900/30 border-t-white dark:border-t-zinc-900 rounded-full animate-spin"></div>
                    <span>Sending link...</span>
                  </>
                ) : 'Send Reset Link'}
              </button>
            </form>
          )}

          <div className="text-center pt-4">
            <Link href="/login" className="text-sm font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              Return to login
            </Link>
          </div>
        </div>
      </main>

      <footer className="px-6 py-8 text-center text-[10px] text-zinc-400 uppercase tracking-[0.2em] font-bold">
        © 2026 Budgetly. Secure & Private.
      </footer>
    </div>
  );
}
