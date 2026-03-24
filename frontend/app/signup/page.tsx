'use client';

import Link from 'next/link';
import { useState } from 'react';
import { signup } from '@/services/api';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const passwordRequirements = [
      { label: 'At least 8 characters', regex: /.{8,}/ },
      { label: 'At least one uppercase letter', regex: /[A-Z]/ },
      { label: 'At least one lowercase letter', regex: /[a-z]/ },
      { label: 'At least one number', regex: /[0-9]/ },
      { label: 'At least one special character', regex: /[!@#$%^&*(),.?":{}|<>]/ },
    ];

    const isPasswordValid = passwordRequirements.every(req => req.regex.test(password));
    
    if (!isPasswordValid) {
      setErrorMessage('Please ensure your password meets all requirements.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    
    try {
      await signup({ email, password, full_name: fullName });
      setIsSuccess(true);
    } catch (error: any) {
      setErrorMessage(error.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans items-center justify-center px-6">
        <div className="w-full max-w-md text-center space-y-6 p-12 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-950/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h1 className="text-3xl font-black tracking-tighter">Check your email</h1>
            <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
              We&apos;ve sent a verification link to <span className="font-bold text-zinc-900 dark:text-zinc-50">{email}</span>. Please click the link to activate your account.
            </p>
            <div className="pt-6">
                <Link href="/login" className="text-sm font-bold text-zinc-900 dark:text-zinc-50 hover:underline">
                    Back to login
                </Link>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans transition-colors duration-300">
      <nav className="flex items-center justify-between px-6 py-6 md:px-12 max-w-7xl mx-auto w-full">
        <Link href="/" className="text-xl font-bold tracking-tighter">Budgetly</Link>
        <Link href="/login" className="text-sm font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
          Already have an account?
        </Link>
      </nav>

      <main className="flex-grow flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-black tracking-tighter mb-4">Create Account</h1>
            <p className="text-zinc-500 dark:text-zinc-400">
              Start your journey to financial freedom
            </p>
          </div>

          {errorMessage && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 p-4 rounded-2xl text-red-600 dark:text-red-400 text-sm font-medium animate-in fade-in slide-in-from-top-1 duration-200">
               <div className="flex items-center gap-3">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {errorMessage}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2 ml-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50 transition-all font-medium"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2 ml-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50 transition-all font-medium"
                  placeholder="name@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2 ml-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50 transition-all font-medium"
                  placeholder="••••••••"
                />
                
                {/* Real-time Password Requirements Checklist */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 px-2">
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
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 py-4 rounded-2xl font-bold hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3"
            >
               {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 dark:border-zinc-900/30 border-t-white dark:border-t-zinc-900 rounded-full animate-spin"></div>
                  <span>Creating account...</span>
                </>
              ) : 'Sign up'}
            </button>
          </form>
        </div>
      </main>

      <footer className="px-6 py-8 text-center text-[10px] text-zinc-400 uppercase tracking-[0.2em] font-bold">
        © 2026 Budgetly. Secure & Private.
      </footer>
    </div>
  );
}
