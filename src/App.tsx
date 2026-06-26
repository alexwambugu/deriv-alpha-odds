import React from 'react';
import { useDerivAPI } from '@/hooks/useDerivAPI';
import { AccountSwitcher } from '@/components/AccountSwitcher';
import { StatsDashboard } from '@/components/StatsDashboard';
import { AlexLog } from '@/components/AlexLog';
import { RobotPanel } from '@/components/RobotPanel';
import { MatchesDiffersScanner } from '@/components/MatchesDiffersScanner';
import { Toaster } from '@/components/ui/sonner';
import { TrendingUp, LayoutDashboard, Settings, Info, Activity } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function App() {
  const { 
    stats, 
    signals, 
    status, 
    account, 
    trades,
    isRobotActive,
    setIsRobotActive,
    symbols,
    selectedSymbol,
    changeSymbol,
    login, 
    logout 
  } = useDerivAPI();

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200 font-sans selection:bg-primary/30">
      <Toaster position="top-right" richColors />
      
      {/* Navigation / Header */}
      <nav className="border-b border-white/5 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-amber-400 flex items-center justify-center shadow-lg shadow-primary/20">
              <TrendingUp className="text-slate-900 w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter text-white">DERIV<span className="text-primary">ANALYTICS</span></h1>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Alex Strategy Engine</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg px-2 border border-white/5">
              <Activity className="w-4 h-4 text-primary" />
              <Select value={selectedSymbol} onValueChange={changeSymbol}>
                <SelectTrigger className="w-[180px] border-none bg-transparent focus:ring-0 text-xs font-bold uppercase">
                  <SelectValue placeholder="Select Index" />
                </SelectTrigger>
                <SelectContent>
                  {symbols.length > 0 ? (
                    symbols.map((s) => (
                      <SelectItem key={s.symbol} value={s.symbol} className="text-xs">
                        {s.display_name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="R_100">Volatility 100 Index</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${status === 'authorized' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500 animate-pulse'}`} />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {status === 'authorized' ? 'Market Connected' : 'Connecting...'}
              </span>
            </div>
          </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Top Section: Account and Welcome */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/5 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -mr-32 -mt-32" />
              <div className="relative z-10">
                <h2 className="text-3xl font-bold text-white mb-2">Advanced Digit Analysis</h2>
                <p className="text-slate-400 max-w-md leading-relaxed">
                  The Alex strategy monitors real-time market data for <span className="text-primary font-bold">{symbols.find(s => s.symbol === selectedSymbol)?.display_name || 'Volatility 100 Index'}</span> to identify high-probability (90%+) entry points.
                </p>
                <div className="flex items-center gap-4 mt-6">
                  <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold uppercase">Real-time Stats</span>
                  </div>
                  <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 flex items-center gap-2">
                    <Info className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold uppercase">90% Win Probability</span>
                  </div>
                </div>
              </div>
            </div>

            <StatsDashboard stats={stats} />
            <MatchesDiffersScanner stats={stats} />
          </div>

          <div className="space-y-6">
            <AccountSwitcher 
              account={account} 
              status={status} 
              onLogin={login} 
              onLogout={logout} 
            />
            
            <RobotPanel 
              isActive={isRobotActive} 
              onToggle={setIsRobotActive} 
              trades={trades} 
            />
            
            <AlexLog signals={signals} />
          </div>
        </div>

        {/* Footer Info */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-500 text-xs">
          <p>© 2024 Alex Trading Tools. For educational purposes only.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-primary transition-colors">Risk Warning</a>
            <a href="#" className="hover:text-primary transition-colors">Strategy Guide</a>
            <a href="#" className="hover:text-primary transition-colors">API Docs</a>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
