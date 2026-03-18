'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

interface BudgetItem {
  id: string;
  name: string;
  planned: number;
  actual: number;
}

interface BudgetCategory {
  id: string;
  title: string;
  items: BudgetItem[];
}

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 2, 1));
  const [allBudgets, setAllBudgets] = useState<Record<string, BudgetCategory[]>>({});
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const monthKey = `${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}`;

  const categories = useMemo(() => {
    if (allBudgets[monthKey]) return allBudgets[monthKey];
    return [
      { id: 'income', title: 'Income', items: [] },
      { id: 'fixed', title: 'Fixed Expenses', items: [] }
    ];
  }, [allBudgets, monthKey]);

  const saveCategories = (newCategories: BudgetCategory[]) => {
    setAllBudgets(prev => ({ ...prev, [monthKey]: newCategories }));
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setSelectedDate(newDate);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    
    saveCategories([...categories, { 
      id: Math.random().toString(36).substr(2, 9), 
      title: newCategoryName, 
      items: [] 
    }]);
    
    setNewCategoryName('');
    setIsModalOpen(false);
  };

  const deleteCategory = (id: string) => {
    if (id === 'income') return;
    if (confirm('Delete this entire category?')) {
      saveCategories(categories.filter(c => c.id !== id));
    }
  };

  const updateItem = (catId: string, itemId: string, field: keyof BudgetItem, value: string | number) => {
    saveCategories(categories.map(cat => {
      if (cat.id !== catId) return cat;
      return {
        ...cat,
        items: cat.items.map(item => {
          if (item.id !== itemId) return item;
          return { ...item, [field]: value };
        })
      };
    }));
  };

  const addItem = (catId: string) => {
    saveCategories(categories.map(cat => {
      if (cat.id !== catId) return cat;
      return {
        ...cat,
        items: [...cat.items, { id: Math.random().toString(36).substr(2, 9), name: 'New Item', planned: 0, actual: 0 }]
      };
    }));
  };

  const deleteItem = (catId: string, itemId: string) => {
    saveCategories(categories.map(cat => {
      if (cat.id !== catId) return cat;
      return {
        ...cat,
        items: cat.items.filter(item => item.id !== itemId)
      };
    }));
  };

  const summary = useMemo(() => {
    let totalActualIncome = 0;
    let totalActualExpenses = 0;
    categories.forEach((cat) => {
      cat.items.forEach((item) => {
        if (cat.id === 'income') totalActualIncome += item.actual;
        else totalActualExpenses += item.actual;
      });
    });
    return { actualNet: totalActualIncome - totalActualExpenses, totalActualExpenses, totalActualIncome };
  }, [categories]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans">
      <nav className="sticky top-0 z-10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold tracking-tighter">Budget.</Link>
            <div className="hidden md:flex space-x-6 text-sm font-medium">
              <span className="text-zinc-900 dark:text-zinc-100 border-b-2 border-zinc-900 dark:border-zinc-100 pb-1">Planner</span>
              <Link href="#" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Analytics</Link>
            </div>
          </div>
          <button onClick={() => window.location.href = '/login'} className="text-sm font-medium text-zinc-500 hover:text-red-500 transition-colors">Sign Out</button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center space-x-4">
            <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div className="text-center min-w-[160px]">
              <h1 className="text-3xl font-bold tracking-tight">
                {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h1>
            </div>
            <button onClick={() => changeMonth(1)} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:opacity-90 transition-opacity"
          >
            + New Category
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <SummaryCard title="Monthly Income" amount={summary.totalActualIncome} />
            <SummaryCard title="Monthly Expenses" amount={summary.totalActualExpenses} />
            <SummaryCard title="Balance" amount={summary.actualNet} highlight positive={summary.actualNet >= 0} />
        </div>

        <div className="space-y-10">
          {categories.map((category) => (
            <section key={category.id} className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="px-8 py-5 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/30 dark:bg-zinc-900/30">
                <h2 className="font-bold text-xl tracking-tight">{category.title}</h2>
                <div className="flex items-center space-x-2">
                    <button onClick={() => addItem(category.id)} className="text-xs font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 px-4 py-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">+ Add Item</button>
                    {category.id !== 'income' && (
                      <button onClick={() => deleteCategory(category.id)} className="p-2 text-zinc-400 hover:text-red-500 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    )}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-bold border-b border-zinc-100 dark:border-zinc-800">
                      <th className="px-8 py-4">Description</th>
                      <th className="px-8 py-4 text-right w-40">Planned</th>
                      <th className="px-8 py-4 text-right w-40">Actual</th>
                      <th className="px-8 py-4 text-right w-40">Remaining</th>
                      <th className="px-4 text-center w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                    {category.items.map((item) => {
                        const diff = category.id === 'income' ? item.actual - item.planned : item.planned - item.actual;
                        return (
                          <tr key={item.id} className="group transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20">
                            <td className="px-8 py-4">
                              <input 
                                type="text"
                                value={item.name}
                                onChange={(e) => updateItem(category.id, item.id, 'name', e.target.value)}
                                className="bg-transparent border-none focus:ring-0 w-full p-0 font-medium outline-none text-zinc-600 dark:text-zinc-300 focus:text-zinc-900 dark:focus:text-zinc-100"
                                placeholder="e.g. Rent, Groceries..."
                              />
                            </td>
                            <td className="px-8 py-4 text-right">
                              <div className="flex items-center justify-end font-mono text-sm">
                                <span className="text-zinc-400 mr-1">$</span>
                                <input 
                                  type="number"
                                  value={item.planned || ''}
                                  onChange={(e) => updateItem(category.id, item.id, 'planned', parseFloat(e.target.value) || 0)}
                                  className="bg-transparent border-none focus:ring-0 w-24 text-right p-0 outline-none"
                                />
                              </div>
                            </td>
                            <td className="px-8 py-4 text-right">
                              <div className="flex items-center justify-end font-mono text-sm">
                                <span className="text-zinc-400 mr-1">$</span>
                                <input 
                                  type="number"
                                  value={item.actual || ''}
                                  onChange={(e) => updateItem(category.id, item.id, 'actual', parseFloat(e.target.value) || 0)}
                                  className="bg-transparent border-none focus:ring-0 w-24 text-right p-0 outline-none font-bold text-zinc-900 dark:text-zinc-100"
                                />
                              </div>
                            </td>
                            <td className={`px-8 py-4 text-right font-mono text-sm font-bold ${diff < 0 ? 'text-red-500' : 'text-green-500'}`}>
                              {diff >= 0 ? '+' : ''}{diff.toFixed(0)}
                            </td>
                            <td className="px-4 py-4 text-center">
                              <button onClick={() => deleteItem(category.id, item.id)} className="opacity-0 group-hover:opacity-100 text-zinc-300 hover:text-red-500 transition-all">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                            </td>
                          </tr>
                        );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      </main>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-zinc-950/20 dark:bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <form onSubmit={handleAddCategory} className="p-8 space-y-6">
              <div>
                <h3 className="text-xl font-bold tracking-tight mb-1">New Category</h3>
                <p className="text-sm text-zinc-500">Group your related expenses together.</p>
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Category Name</label>
                <input 
                  autoFocus
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g. Transportation, Hobbies"
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50 transition-all font-medium"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 px-4 py-3 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ title, amount, highlight, positive }: { title: string, amount: number, highlight?: boolean, positive?: boolean }) {
  return (
    <div className={`p-8 rounded-[2rem] border transition-all ${highlight ? (positive ? 'bg-green-50/50 border-green-200 dark:bg-green-950/20 dark:border-green-900/30' : 'bg-red-50/50 border-red-200 dark:bg-red-950/20 dark:border-red-900/30') : 'bg-white border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 shadow-sm'}`}>
      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-3">{title}</p>
      <p className={`text-4xl font-bold tracking-tighter font-mono ${highlight ? (positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400') : ''}`}>
        ${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
      </p>
    </div>
  );
}
