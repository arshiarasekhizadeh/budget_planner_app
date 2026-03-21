'use client';

import { useMemo, useState } from 'react';
import { getAiAdvice, exportBudget } from '@/services/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function AnalyticsView({ items, monthlyGoal, selectedDate }: any) {
  const [aiAdvice, setAiAdvice] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const stats = useMemo(() => {
    let income = 0;
    let expenses = 0;
    const categories: Record<string, number> = {};

    items.forEach((item: any) => {
      if (item.category_name === 'income') {
        income += item.item_amount_actual;
      } else {
        expenses += item.item_amount_actual;
        categories[item.category_name] = (categories[item.category_name] || 0) + item.item_amount_actual;
      }
    });

    const categoryData = Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const net = income - expenses;
    const savingsRate = income > 0 ? (net / income) * 100 : 0;

    return { income, expenses, net, savingsRate, categoryData };
  }, [items]);

  const handleGetAiAdvice = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setIsAiLoading(true);
    try {
        const data = await getAiAdvice(selectedDate, token);
        setAiAdvice(data.advice);
    } catch (error) {
        console.error(error);
    } finally {
        setIsAiLoading(false);
    }
  };

  const handleExport = async (format: 'pdf' | 'csv') => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
        await exportBudget(selectedDate, format, token);
    } catch (error) {
        alert("Export failed");
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
            <h1 className="text-4xl font-black tracking-tighter mb-2">Financial Insights</h1>
            <p className="text-zinc-500 font-medium">A visual breakdown of your monthly performance.</p>
        </div>
        <div className="flex items-center gap-3">
            <button 
                onClick={() => handleExport('csv')}
                className="px-5 py-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-black uppercase tracking-widest hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
                CSV
            </button>
            <button 
                onClick={() => handleExport('pdf')}
                className="px-5 py-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-black uppercase tracking-widest hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
                PDF Report
            </button>
        </div>
      </header>

      {/* AI Advisor Card */}
      <section className="relative overflow-hidden bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 p-10 rounded-[2.5rem] shadow-2xl">
        <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 dark:bg-zinc-900/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <div>
                    <h3 className="text-xl font-black tracking-tight">AI Financial Advisor</h3>
                    <p className="text-white/60 dark:text-zinc-500 text-xs font-bold uppercase tracking-widest">Powered by Gemini</p>
                </div>
            </div>
            
            <AnimatePresence mode="wait">
                {aiAdvice ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-lg font-medium leading-relaxed max-w-3xl whitespace-pre-line"
                    >
                        {aiAdvice}
                    </motion.div>
                ) : (
                    <p className="text-white/60 dark:text-zinc-500 font-medium">Click the button below to analyze your spending and get personalized tips.</p>
                )}
            </AnimatePresence>

            <button 
                onClick={handleGetAiAdvice}
                disabled={isAiLoading}
                className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white px-8 py-4 rounded-2xl text-sm font-black hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3"
            >
                {isAiLoading ? (
                    <>
                        <div className="w-4 h-4 border-2 border-zinc-900 dark:border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Analyzing...</span>
                    </>
                ) : (
                    aiAdvice ? "Refresh Advice" : "Ask AI Advisor"
                )}
            </button>
        </div>
        {/* Background Sparkle */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 dark:bg-zinc-900/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Spending Breakdown */}
        <section className="bg-white dark:bg-zinc-900 p-10 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <h3 className="text-xl font-black tracking-tight mb-8">Spending by Category</h3>
          <div className="space-y-6">
            {stats.categoryData.length > 0 ? (
              stats.categoryData.map((cat, i) => {
                const percentage = stats.expenses > 0 ? (cat.value / stats.expenses) * 100 : 0;
                return (
                  <div key={cat.name} className="space-y-2">
                    <div className="flex justify-between text-sm font-bold">
                      <span className="capitalize">{cat.name}</span>
                      <span className="text-zinc-400">${cat.value.toLocaleString()} ({Math.round(percentage)}%)</span>
                    </div>
                    <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-zinc-900 dark:bg-zinc-50 rounded-full transition-all duration-1000" 
                        style={{ width: `${percentage}%`, transitionDelay: `${i * 100}ms` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-10 text-center text-zinc-400 font-medium italic">No expense data available.</div>
            )}
          </div>
        </section>

        {/* Income vs Expenses */}
        <section className="bg-white dark:bg-zinc-900 p-10 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col">
          <h3 className="text-xl font-black tracking-tight mb-8">Efficiency</h3>
          <div className="flex-grow flex flex-col justify-center items-center space-y-10">
             <div className="relative w-48 h-48">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-zinc-100 dark:text-zinc-800" />
                    <circle 
                        cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="12" fill="transparent" 
                        strokeDasharray="251" 
                        strokeDashoffset={251 - (251 * Math.max(0, Math.min(stats.savingsRate, 100)) / 100)} 
                        className="text-green-500 transition-all duration-1000 ease-out" 
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black">{Math.round(stats.savingsRate)}%</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Savings Rate</span>
                </div>
             </div>
             
             <div className="w-full grid grid-cols-2 gap-4">
                <div className="p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl">
                    <p className="text-[10px] font-black uppercase text-zinc-400 mb-1">Total In</p>
                    <p className="text-xl font-black text-green-600">${stats.income.toLocaleString()}</p>
                </div>
                <div className="p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl">
                    <p className="text-[10px] font-black uppercase text-zinc-400 mb-1">Total Out</p>
                    <p className="text-xl font-black text-red-600">${stats.expenses.toLocaleString()}</p>
                </div>
             </div>
          </div>
        </section>
      </div>
    </div>
  );
}
