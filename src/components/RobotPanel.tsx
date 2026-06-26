import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bot, History, ArrowUpRight, ArrowDownRight, CircleSlash } from 'lucide-react';
import type { Trade } from '@/hooks/useDerivAPI';
import { format } from 'date-fns';

interface RobotPanelProps {
  isActive: boolean;
  onToggle: (active: boolean) => void;
  trades: Trade[];
}

export const RobotPanel: React.FC<RobotPanelProps> = ({ isActive, onToggle, trades }) => {
  const stats = {
    total: trades.length,
    wins: trades.filter(t => t.status === 'WON').length,
    losses: trades.filter(t => t.status === 'LOST').length,
  };

  const winRate = stats.total > 0 ? (stats.wins / (stats.wins + stats.losses)) * 100 : 0;

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
            <div>
              <CardTitle className="text-lg">AI Trading Robot</CardTitle>
              <CardDescription className="text-[10px] uppercase tracking-wider">Over 7 & Under 5 Only</CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch 
              id="robot-mode" 
              checked={isActive} 
              onCheckedChange={onToggle}
              className="data-[state=checked]:bg-primary"
            />
            <Label htmlFor="robot-mode" className="text-xs font-bold">
              {isActive ? 'ON' : 'OFF'}
            </Label>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2 rounded-lg bg-background/50 border border-border/50 text-center">
            <p className="text-[10px] text-muted-foreground uppercase">Win Rate</p>
            <p className="text-sm font-bold text-primary">{winRate.toFixed(1)}%</p>
          </div>
          <div className="p-2 rounded-lg bg-background/50 border border-border/50 text-center">
            <p className="text-[10px] text-muted-foreground uppercase">Wins</p>
            <p className="text-sm font-bold text-emerald-500">{stats.wins}</p>
          </div>
          <div className="p-2 rounded-lg bg-background/50 border border-border/50 text-center">
            <p className="text-[10px] text-muted-foreground uppercase">Losses</p>
            <p className="text-sm font-bold text-rose-500">{stats.losses}</p>
          </div>
        </div>

        {/* History Log */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <History className="w-3 h-3" />
            Trade History
          </div>
          <ScrollArea className="h-[200px] rounded-md border border-border/50 bg-background/30 p-2">
            <div className="space-y-2">
              {trades.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[180px] text-muted-foreground opacity-50">
                  <CircleSlash className="w-6 h-6 mb-2" />
                  <p className="text-[10px]">No trades executed yet</p>
                </div>
              ) : (
                trades.map((trade) => (
                  <div 
                    key={trade.id} 
                    className="flex items-center justify-between p-2 rounded bg-background/50 border border-white/5 text-[11px]"
                  >
                    <div className="flex items-center gap-2">
                      {trade.type === 'OVER' ? (
                        <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3 text-rose-500" />
                      )}
                      <span className="font-bold">{trade.type} {trade.barrier}</span>
                      <span className="text-muted-foreground">Digit: {trade.exitDigit ?? '?'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-muted-foreground">{format(trade.timestamp, 'HH:mm:ss')}</span>
                      <Badge 
                        variant="outline" 
                        className={`
                          text-[9px] px-1.5 h-4 border-none
                          ${trade.status === 'WON' ? 'bg-emerald-500/10 text-emerald-500' : 
                            trade.status === 'LOST' ? 'bg-rose-500/10 text-rose-500' : 
                            'bg-amber-500/10 text-amber-500 animate-pulse'}
                        `}
                      >
                        {trade.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};
