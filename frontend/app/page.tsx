import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 transition-colors duration-300">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-6 md:px-12 max-w-7xl mx-auto w-full">
        <div className="text-xl font-bold tracking-tighter font-sans">Budget.</div>
        <div className="hidden md:flex space-x-8 text-sm font-medium text-zinc-500 dark:text-zinc-400 font-sans">
          <Link href="#features" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Features</Link>
          <Link href="#about" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">About</Link>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/login" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors font-sans">Login</Link>
          <Link href="/transactions" className="bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 px-5 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-opacity font-sans">
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-grow">
        <section className="flex flex-col items-center justify-center px-6 py-20 md:py-32 text-center max-w-5xl mx-auto w-full">
          <h1 className="text-5xl md:text-8xl font-bold tracking-tight mb-8 font-sans">
            Manage money with <span className="text-zinc-400 dark:text-zinc-600 italic font-sans">clarity.</span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 mb-12 max-w-2xl leading-relaxed font-sans">
            A minimalist budget planner designed for focus. Track every transaction, visualize your goals, and master your financial life.
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-20 font-sans">
            <Link href="/transactions" className="bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 px-10 py-4 rounded-full text-lg font-medium hover:opacity-90 transition-opacity shadow-xl shadow-zinc-200 dark:shadow-none">
              Start Planning
            </Link>
            <Link href="#features" className="border border-zinc-200 dark:border-zinc-800 px-10 py-4 rounded-full text-lg font-medium hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
              Learn More
            </Link>
          </div>
          
          {/* App Preview Mockup */}
          <div className="w-full aspect-video max-w-5xl bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-4 md:p-8 overflow-hidden relative group">
             <div className="absolute inset-0 bg-gradient-to-tr from-white/40 to-transparent dark:from-zinc-950/20 pointer-events-none"></div>
             <div className="relative w-full h-full border border-zinc-200 dark:border-zinc-700 rounded-2xl bg-white dark:bg-zinc-950 shadow-sm p-6 flex flex-col items-start space-y-6 overflow-hidden">
                <div className="flex items-center space-x-2 w-full justify-between">
                  <div className="flex space-x-4">
                    <div className="h-3 w-20 bg-zinc-100 dark:bg-zinc-800 rounded-full"></div>
                    <div className="h-3 w-12 bg-zinc-50 dark:bg-zinc-900 rounded-full"></div>
                  </div>
                  <div className="h-8 w-8 bg-zinc-100 dark:bg-zinc-800 rounded-full"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-800 p-4 flex flex-col justify-between">
                      <div className="h-2 w-1/2 bg-zinc-200 dark:bg-zinc-800 rounded-full"></div>
                      <div className="h-4 w-3/4 bg-zinc-300 dark:bg-zinc-700 rounded-full"></div>
                    </div>
                  ))}
                </div>
                <div className="space-y-3 w-full pt-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-14 w-full bg-zinc-50 dark:bg-zinc-900/30 rounded-xl border border-zinc-100/50 dark:border-zinc-800/50 flex items-center px-6 justify-between opacity-50">
                      <div className="flex items-center space-x-4">
                        <div className="h-8 w-8 bg-zinc-200 dark:bg-zinc-800 rounded-lg"></div>
                        <div className="h-2 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-full"></div>
                      </div>
                      <div className={`h-2 w-12 rounded-full ${i % 2 === 0 ? 'bg-red-400/20' : 'bg-green-400/20'}`}></div>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="px-6 py-32 border-t border-zinc-100 dark:border-zinc-900">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-3 gap-16 font-sans">
              <div className="space-y-6 text-left">
                <div className="inline-flex items-center justify-center p-3 bg-zinc-100 dark:bg-zinc-900 rounded-2xl">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-12 0 9 9 0 0112 0z" /></svg>
                </div>
                <h3 className="text-xl font-bold">Fast Tracking</h3>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed font-light">
                  Add transactions in milliseconds. Minimal friction so you actually keep up with your goals.
                </p>
              </div>
              <div className="space-y-6 text-left">
                <div className="inline-flex items-center justify-center p-3 bg-zinc-100 dark:bg-zinc-900 rounded-2xl">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2m0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                </div>
                <h3 className="text-xl font-bold">Visual Budgets</h3>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed font-light">
                  Beautifully simple charts that tell you exactly where your money is going at a glance.
                </p>
              </div>
              <div className="space-y-6 text-left">
                <div className="inline-flex items-center justify-center p-3 bg-zinc-100 dark:bg-zinc-900 rounded-2xl">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <h3 className="text-xl font-bold">Private & Secure</h3>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed font-light">
                  Your financial data is yours. We prioritize privacy and security above all else.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="px-6 py-16 border-t border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-950 font-sans">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0">
          <div className="flex flex-col items-center md:items-start space-y-4">
            <div className="text-xl font-bold tracking-tighter">Budget.</div>
            <p className="text-sm text-zinc-500">The minimalist way to plan your future.</p>
          </div>
          <div className="flex space-x-12 text-sm font-medium text-zinc-500">
            <Link href="#" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Terms</Link>
            <Link href="https://github.com" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">GitHub</Link>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-900 text-center text-xs text-zinc-400 uppercase tracking-widest">
          © 2026 Budget Planner app. Designed for simplicity.
        </div>
      </footer>
    </div>
  );
}
