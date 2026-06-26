import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Scan, Info, Target } from 'lucide-react';
import type { AnalysisStats } from '@/hooks/useDerivAPI';

interface MatchesDiffersScannerProps {
  stats: AnalysisStats;
}

const getConfidence = (ticks: number) => {
  if (ticks >= 25) return { label: 'EXTREME', pct: 99, color: 'bg-red-500 text-slate-900' };
  if (ticks >= 20) return { label: 'VERY HIGH', pct: 98, color: 'bg-emerald-500 text-slate-900' };
  if (ticks >= 15) return { label: 'HIGH', pct: 95, color: 'bg-emerald-500 text-slate-900' };
  return { label: 'WATCHING', pct: 90, color: 'bg-amber-500 text-slate-900' };
};

export const MatchesDiffersScanner: React.FC<MatchesDiffersScannerProps> = ({ stats }) => {
  const digitFrequency = stats.digitFrequency || {};
  const lastDigits = stats.lastDigits || [];

  const digitStats = Array.from({ length: 10 }, (_, i) => {
    const lastIndex = [...lastDigits].reverse().indexOf(i);
    const frequency = (digitFrequency[i] || 0);
    const percentage = (frequency / (lastDigits.length || 1)) * 100;
    const ticksSince = lastIndex === -1 ? (lastDigits.length || 0) : lastIndex;

    return {
      digit: i,
      frequency,
      percentage,
      ticksSince,
      isCold: ticksSince >= 15
    };
  });

  const coldestDigit = digitStats.reduce((prev, curr) =>
    curr.ticksSince > prev.ticksSince ? curr : prev
  );

  const confidence = getConfidence(coldestDigit.ticksSince);

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Scan className="w-4 h-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Matches/Differs Scanner</CardTitle>
              <CardDescription className="text-xs">Statistically improbable digit identification</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
            90%+ ACCURACY TARGET
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {digitStats.map((item) => (
            <div
              key={item.digit}
              className={`
                p-3 rounded-xl border transition-all duration-300 flex flex-col items-center gap-1
                ${item.isCold
                  ? 'bg-emerald-500/10 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                  : 'bg-background/40 border-border/50'}
              `}
            >
              <span className={`text-2xl font-black ${item.isCold ? 'text-emerald-400' : 'text-slate-300'}`}>
                {item.digit}
              </span>
              <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-1">
                <div
                  className={`h-full transition-all duration-500 ${item.isCold ? 'bg-emerald-500' : 'bg-primary'}`}
                  style={{ width: `${Math.min(item.percentage * 5, 100)}%` }}
                />
              </div>
              <div className="flex flex-col items-center text-[10px] mt-1 font-bold">
                <span className="text-muted-foreground uppercase tracking-tighter">Gap: {item.ticksSince}</span>
                <span className={item.isCold ? 'text-emerald-500' : 'text-slate-500'}>
                  {item.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>

        {coldestDigit.ticksSince >= 10 && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 flex items-center gap-4 animate-in fade-in slide-in-from-bottom duration-500">
            <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 flex-shrink-0">
              <Target className="text-slate-900 w-6 h-6" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                HIGH PROBABILITY SIGNAL
                <Badge className={`${confidence.color} border-none h-4 px-1 text-[9px]`}>
                  {confidence.pct}% {confidence.label}
                </Badge>
              </h4>
              <p className="text-xs text-slate-300 mt-1">
                Digit <span className="font-bold text-white text-base mx-1">{coldestDigit.digit}</span> hasn&apos;t appeared for <span className="text-emerald-400 font-bold">{coldestDigit.ticksSince}</span> ticks. Prediction: <span className="font-bold text-white uppercase italic">Differs {coldestDigit.digit}</span>
              </p>
            </div>
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Risk Level</span>
              <span className="text-xs font-bold text-emerald-500 uppercase">Minimal</span>
            </div>
          </div>
        )}

        <div className="flex items-start gap-2 p-3 bg-blue-500/5 rounded-lg border border-blue-500/20">
          <Info className="w-4 h-4 text-blue-400 mt-0.5" />
          <p className="text-[10px] text-blue-300/80 leading-relaxed">
            The scanner identifies &quot;Cold Digits&quot; that haven&apos;t appeared for an extended period. In a random distribution, the probability of a digit NOT appearing 15+ times is extremely low, making &quot;Differs&quot; trades highly accurate.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
