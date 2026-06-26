import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Activity, Layers, Target } from 'lucide-react';
import type { AnalysisStats } from '@/hooks/useDerivAPI';

interface StatsDashboardProps {
  stats: AnalysisStats;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ stats }) => {
  const last10 = stats.lastDigits.slice(-10);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Even vs Odd */}
      <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
            <BarChart3 className="w-4 h-4" />
            Digit Parity (Last 100)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-blue-400">EVEN {stats.even.toFixed(1)}%</span>
              <span className="text-purple-400">ODD {stats.odd.toFixed(1)}%</span>
            </div>
            <div className="h-3 w-full bg-secondary/50 rounded-full overflow-hidden flex">
              <div 
                className="h-full bg-blue-500 transition-all duration-500" 
                style={{ width: `${stats.even}%` }}
              />
              <div 
                className="h-full bg-purple-500 transition-all duration-500" 
                style={{ width: `${stats.odd}%` }}
              />
            </div>
          </div>
          <div className="flex justify-center gap-2">
            <Badge variant={stats.even > 55 ? "default" : "outline"} className={stats.even > 55 ? "bg-blue-500 hover:bg-blue-600" : ""}>
              {stats.even > 55 ? "Skewed Even" : "Balanced"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Over vs Under */}
      <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
            <Target className="w-4 h-4" />
            Over 4 vs Under 5
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-emerald-400">OVER {stats.over.toFixed(1)}%</span>
              <span className="text-rose-400">UNDER {stats.under.toFixed(1)}%</span>
            </div>
            <div className="h-3 w-full bg-secondary/50 rounded-full overflow-hidden flex">
              <div 
                className="h-full bg-emerald-500 transition-all duration-500" 
                style={{ width: `${stats.over}%` }}
              />
              <div 
                className="h-full bg-rose-500 transition-all duration-500" 
                style={{ width: `${stats.under}%` }}
              />
            </div>
          </div>
          <div className="flex justify-center gap-2">
            <Badge variant={stats.over > 55 ? "default" : "outline"} className={stats.over > 55 ? "bg-emerald-500 hover:bg-emerald-600" : ""}>
              {stats.over > 55 ? "Skewed High" : "Balanced"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Recent Digits */}
      <Card className="bg-card/50 backdrop-blur-sm border-primary/20 md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
            <Activity className="w-4 h-4" />
            Recent Digit Sequence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-2 overflow-x-auto py-2">
            {last10.map((digit, i) => (
              <div 
                key={i}
                className={`
                  flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg
                  ${digit % 2 === 0 ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'}
                  animate-in fade-in zoom-in duration-300
                `}
              >
                {digit}
              </div>
            ))}
          </div>
          <p className="text-[10px] text-center text-muted-foreground mt-2 uppercase tracking-widest">
            Last 10 market ticks
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
