'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    getBudgets, 
    getMonthlyGoal, 
    getMe,
} from '@/services/api';

// Components
import PlannerView from './PlannerView';
import AnalyticsView from './AnalyticsView';
import SettingsView from './SettingsView';

export default function DashboardPage() {
  const [view, setView] = useState<'planner' | 'analytics' | 'settings'>('planner');
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 2, 1));
  const [items, setItems] = useState<any[]>([]);
  const [monthlyGoal, setMonthlyGoal] = useState<number>(0);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const monthKey = `${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}`;

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login';
        return;
    }
    setIsLoading(true);
    setErrorMessage('');
    try {
        const [budgetData, goalData, userData] = await Promise.all([
            getBudgets(monthKey, token),
            getMonthlyGoal(monthKey, token),
            getMe(token)
        ]);
        setItems(budgetData);
        setMonthlyGoal(goalData?.goal_amount || 0);
        setUser(userData);
    } catch (error: any) {
        setErrorMessage(error.message || "Failed to load dashboard data.");
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [monthKey]);

  const handleSignOut = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans transition-colors duration-300">
      <nav className="sticky top-0 z-10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-black tracking-tighter">Budgetly</Link>
            <div className="hidden md:flex space-x-1 text-sm font-bold">
              <button 
                onClick={() => setView('planner')}
                className={`px-4 py-2 rounded-full transition-colors ${view === 'planner' ? 'bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'}`}
              >
                Planner
              </button>
              <button 
                onClick={() => setView('analytics')}
                className={`px-4 py-2 rounded-full transition-colors ${view === 'analytics' ? 'bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'}`}
              >
                Analytics
              </button>
              <button 
                onClick={() => setView('settings')}
                className={`px-4 py-2 rounded-full transition-colors ${view === 'settings' ? 'bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'}`}
              >
                Settings
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
                <p className="text-xs font-black tracking-tight">{user?.full_name}</p>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Premium Account</p>
            </div>
            <button 
                onClick={() => setView('settings')}
                className="w-10 h-10 rounded-full border-2 border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-100 dark:bg-zinc-900 transition-transform active:scale-90"
            >
                {user?.profile_image ? (
                    <img src={`http://localhost:8000${user.profile_image}`} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-black">
                        {user?.full_name?.charAt(0) || 'U'}
                    </div>
                )}
            </button>
            <button onClick={handleSignOut} className="text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-red-500 transition-colors">Sign Out</button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10 overflow-x-hidden">
        {errorMessage && (
            <div className="mb-8 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 p-4 rounded-2xl text-red-600 dark:text-red-400 text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {errorMessage}
            </div>
        )}

        {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <div className="w-12 h-12 border-4 border-zinc-200 dark:border-zinc-800 border-t-zinc-900 dark:border-t-zinc-50 rounded-full animate-spin"></div>
                <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">Syncing Data...</p>
            </div>
        ) : (
            <AnimatePresence mode="wait">
                <motion.div
                    key={view}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {view === 'planner' && (
                        <PlannerView 
                            items={items} 
                            setItems={setItems} 
                            selectedDate={selectedDate} 
                            setSelectedDate={setSelectedDate}
                            monthlyGoal={monthlyGoal}
                            setMonthlyGoal={setMonthlyGoal}
                            fetchData={fetchData}
                            setErrorMessage={setErrorMessage}
                        />
                    )}
                    {view === 'analytics' && (
                        <AnalyticsView 
                            items={items} 
                            monthlyGoal={monthlyGoal} 
                            selectedDate={monthKey}
                        />
                    )}
                    {view === 'settings' && (
                        <SettingsView user={user} setUser={setUser} setErrorMessage={setErrorMessage} />
                    )}
                </motion.div>
            </AnimatePresence>
        )}
      </main>
    </div>
  );
}
