'use client';

import { useState, useMemo } from 'react';
import { createBudget, updateBudget, deleteBudget, updateMonthlyGoal } from '@/services/api';

interface BudgetItem {
  id: number;
  name: string;
  planned: number;
  actual: number;
}

interface BudgetCategory {
  id: string;
  title: string;
  items: BudgetItem[];
}

export default function PlannerView({ 
    items, 
    setItems, 
    selectedDate, 
    setSelectedDate, 
    monthlyGoal, 
    setMonthlyGoal,
    fetchData,
    setErrorMessage
}: any) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const monthKey = `${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}`;

  const categories = useMemo(() => {
    const grouped: Record<string, BudgetCategory> = {
        'income': { id: 'income', title: 'Income', items: [] },
        'fixed': { id: 'fixed', title: 'Fixed Expenses', items: [] }
    };

    items.forEach((item: any) => {
        if (!grouped[item.category_name]) {
            grouped[item.category_name] = { id: item.category_name, title: item.category_name, items: [] };
        }
        grouped[item.category_name].items.push({
            id: item.id,
            name: item.item_name,
            planned: item.item_amount_planned,
            actual: item.item_amount_actual
        });
    });

    return Object.values(grouped);
  }, [items]);

  const changeMonth = (offset: number) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setSelectedDate(newDate);
  };

  const handleUpdateMonthlyGoal = async (val: number) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setMonthlyGoal(val);
    try {
        await updateMonthlyGoal({ month: monthKey, goal_amount: val }, token);
    } catch (error: any) {
        setErrorMessage(error.message || "Failed to update monthly goal.");
    }
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setItems((prev: any) => [...prev, { 
        id: Date.now(), 
        category_name: newCategoryName, 
        item_name: 'New Item', 
        item_amount_planned: 0, 
        item_amount_actual: 0,
        isNew: true 
    }]);
    setNewCategoryName('');
    setIsModalOpen(false);
  };

  const updateItemValue = async (itemId: number, field: string, value: any) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const item = items.find((i: any) => i.id === itemId);
    if (!item) return;

    setItems((prev: any) => prev.map((i: any) => i.id === itemId ? { ...i, [field]: value } : i));

    try {
        if (item.isNew) {
            const newItem = await createBudget({
                category_name: item.category_name,
                item_name: field === 'item_name' ? value : item.item_name,
                item_amount_planned: field === 'item_amount_planned' ? value : item.item_amount_planned,
                item_amount_actual: field === 'item_amount_actual' ? value : item.item_amount_actual,
                month: monthKey
            }, token);
            setItems((prev: any) => prev.map((i: any) => i.id === itemId ? newItem : i));
        } else {
            await updateBudget(itemId, { [field]: value }, token);
        }
    } catch (error: any) {
        setErrorMessage(error.message || "Failed to update item.");
        setTimeout(() => setErrorMessage(''), 5000);
        fetchData(); 
    }
  };

  const addItem = async (categoryName: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const newItem = await createBudget({
            category_name: categoryName,
            item_name: 'New Item',
            item_amount_planned: 0,
            item_amount_actual: 0,
            month: monthKey
        }, token);
        setItems((prev: any) => [...prev, newItem]);
    } catch (error: any) {
        setErrorMessage(error.message || "Failed to add item.");
        setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        await deleteBudget(itemId, token);
        setItems((prev: any) => prev.filter((i: any) => i.id !== itemId));
    } catch (error: any) {
        setErrorMessage(error.message || "Failed to delete item.");
        setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  const summary = useMemo(() => {
    let totalActualIncome = 0;
    let totalActualExpenses = 0;
    items.forEach((item: any) => {
        if (item.category_name === 'income') totalActualIncome += item.item_amount_actual;
        else totalActualExpenses += item.item_amount_actual;
    });
    const net = totalActualIncome - totalActualExpenses;
    const progress = monthlyGoal > 0 ? Math.min((net / monthlyGoal) * 100, 100) : 0;
    return { actualNet: net, totalActualExpenses, totalActualIncome, progress };
  }, [items, monthlyGoal]);

  return (
    <>
        <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center space-x-6">
            <button onClick={() => changeMonth(-1)} className="p-3 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-2xl transition-all active:scale-90">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div className="text-center min-w-[200px]">
              <h1 className="text-4xl font-black tracking-tighter">
                {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h1>
            </div>
            <button onClick={() => changeMonth(1)} className="p-3 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-2xl transition-all active:scale-90">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 px-6 py-4 rounded-2xl text-sm font-bold shadow-lg hover:shadow-xl hover:opacity-90 transition-all active:scale-95"
          >
            + New Category
          </button>
        </header>

        <div className="mb-12 bg-white dark:bg-zinc-900 p-10 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row items-center gap-10">
            <div className="relative w-32 h-32 flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-zinc-100 dark:text-zinc-800" />
                    <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="283" strokeDashoffset={283 - (283 * summary.progress / 100)} className="text-zinc-900 dark:text-zinc-50 transition-all duration-1000 ease-out" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-black">{Math.round(summary.progress)}%</span>
                </div>
            </div>
            <div className="flex-grow space-y-4 text-center md:text-left">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-1">Monthly Savings Goal</p>
                    <div className="flex items-center justify-center md:justify-start gap-2">
                        <span className="text-4xl font-black tracking-tighter">$</span>
                        <input 
                            type="number"
                            value={monthlyGoal || ''}
                            onChange={(e) => handleUpdateMonthlyGoal(parseFloat(e.target.value) || 0)}
                            className="bg-transparent border-none focus:ring-0 text-4xl font-black tracking-tighter p-0 w-40 outline-none"
                            placeholder="Set Goal"
                        />
                    </div>
                </div>
                <p className="text-sm text-zinc-500 font-medium">You have saved <span className="text-zinc-900 dark:text-zinc-50 font-bold">${summary.actualNet.toLocaleString()}</span> this month. {summary.actualNet >= monthlyGoal ? "Goal reached! 🎉" : `Keep going to reach your $${monthlyGoal.toLocaleString()} goal.`}</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <SummaryCard title="Monthly Income" amount={summary.totalActualIncome} />
            <SummaryCard title="Monthly Expenses" amount={summary.totalActualExpenses} />
            <SummaryCard title="Net Balance" amount={summary.actualNet} highlight positive={summary.actualNet >= 0} />
        </div>

        <div className="space-y-12">
        {categories.map((category) => (
            <section key={category.id} className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
            <div className="px-10 py-7 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/30 dark:bg-zinc-900/30">
                <h2 className="font-black text-2xl tracking-tighter">{category.title}</h2>
                <button onClick={() => addItem(category.id)} className="text-[10px] font-black uppercase tracking-[0.2em] bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 px-6 py-3 rounded-xl hover:opacity-90 transition-all active:scale-95 shadow-md">+ Add Item</button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-black border-b border-zinc-100 dark:border-zinc-800">
                    <th className="px-10 py-5">Description</th>
                    <th className="px-10 py-5 text-right w-32">Planned</th>
                    <th className="px-10 py-5 text-right w-32">Actual</th>
                    <th className="px-10 py-5 text-right w-32">Remaining</th>
                    <th className="px-10 py-5 text-center w-24">Recurring</th>
                    <th className="px-6 text-center w-12"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                    {category.items.map((item) => {
                        const diff = category.id === 'income' ? item.actual - item.planned : item.planned - item.actual;
                        const originalItem = items.find((i: any) => i.id === item.id);
                        return (
                        <tr key={item.id} className="group transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20">
                            <td className="px-10 py-6">
                            <input 
                                type="text"
                                value={item.name}
                                onChange={(e) => updateItemValue(item.id, 'item_name', e.target.value)}
                                className="bg-transparent border-none focus:ring-0 w-full p-0 font-bold outline-none text-zinc-500 dark:text-zinc-400 focus:text-zinc-900 dark:focus:text-zinc-100 transition-colors"
                                placeholder="Description..."
                            />
                            </td>
                            <td className="px-10 py-6 text-right">
                            <div className="flex items-center justify-end font-mono text-sm">
                                <span className="text-zinc-300 dark:text-zinc-600 mr-2">$</span>
                                <input 
                                type="number"
                                value={item.planned || ''}
                                onChange={(e) => updateItemValue(item.id, 'item_amount_planned', parseFloat(e.target.value) || 0)}
                                className="bg-transparent border-none focus:ring-0 w-28 text-right p-0 outline-none font-bold"
                                />
                            </div>
                            </td>
                            <td className="px-10 py-6 text-right">
                            <div className="flex items-center justify-end font-mono text-sm">
                                <span className="text-zinc-300 dark:text-zinc-600 mr-2">$</span>
                                <input 
                                type="number"
                                value={item.actual || ''}
                                onChange={(e) => updateItemValue(item.id, 'item_amount_actual', parseFloat(e.target.value) || 0)}
                                className="bg-transparent border-none focus:ring-0 w-28 text-right p-0 outline-none font-black text-zinc-900 dark:text-zinc-100"
                                />
                            </div>
                            </td>
                            <td className={`px-10 py-6 text-right font-mono text-sm font-black ${diff < 0 ? 'text-red-500' : 'text-green-500'}`}>
                            {diff >= 0 ? '+' : ''}{diff.toFixed(0)}
                            </td>
                            <td className="px-10 py-6 text-center">
                                <button 
                                    onClick={() => updateItemValue(item.id, 'is_recurring', !originalItem?.is_recurring)}
                                    className={`mx-auto w-10 h-5 rounded-full transition-all relative ${originalItem?.is_recurring ? 'bg-zinc-900 dark:bg-zinc-50' : 'bg-zinc-200 dark:bg-zinc-800'}`}
                                >
                                    <div className={`absolute top-1 w-3 h-3 rounded-full transition-all ${originalItem?.is_recurring ? 'right-1 bg-white dark:bg-zinc-900' : 'left-1 bg-white dark:bg-zinc-400'}`}></div>
                                </button>
                            </td>
                            <td className="px-6 py-6 text-center">
                            <button onClick={() => handleDeleteItem(item.id)} className="opacity-0 group-hover:opacity-100 text-zinc-300 hover:text-red-500 transition-all active:scale-75">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
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

        {/* Modal Overlay */}
        {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-zinc-950/40 dark:bg-zinc-950/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <form onSubmit={handleAddCategory} className="p-10 space-y-8">
                <div>
                    <h3 className="text-3xl font-black tracking-tighter mb-2">New Category</h3>
                    <p className="text-sm text-zinc-500 font-medium">Group your expenses together.</p>
                </div>
                
                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3 ml-1">Category Name</label>
                    <input 
                    autoFocus
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="e.g. Transportation"
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50 transition-all font-bold"
                    />
                </div>

                <div className="flex gap-4 pt-2">
                    <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-4 rounded-2xl text-sm font-bold text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                    >
                    Cancel
                    </button>
                    <button 
                    type="submit"
                    className="flex-1 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 px-4 py-4 rounded-2xl text-sm font-bold hover:opacity-90 transition-all active:scale-95 shadow-lg"
                    >
                    Create
                    </button>
                </div>
                </form>
            </div>
            </div>
        )}
    </>
  );
}

function SummaryCard({ title, amount, highlight, positive }: { title: string, amount: number, highlight?: boolean, positive?: boolean }) {
  return (
    <div className={`p-10 rounded-[2.5rem] border transition-all duration-500 ${highlight ? (positive ? 'bg-green-50/50 border-green-200 dark:bg-green-950/10 dark:border-green-900/30' : 'bg-red-50/50 border-red-200 dark:bg-red-950/10 dark:border-red-900/30') : 'bg-white border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 shadow-sm hover:shadow-lg'}`}>
      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-4">{title}</p>
      <p className={`text-5xl font-black tracking-tighter font-mono ${highlight ? (positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400') : ''}`}>
        ${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
      </p>
    </div>
  );
}
