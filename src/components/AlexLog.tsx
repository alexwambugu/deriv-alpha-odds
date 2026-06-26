import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Terminal, TrendingUp, AlertTriangle, Info, Clock } from 'lucide-react';
import type { Signal } from '@/hooks/useDerivAPI';
import { format } from 'date-fns';

interface AlexLogProps {
  signals: Signal[];
}

export const AlexLog: React.FC<AlexLogProps> = ({ signals }) => {
  return (
    <Card className="h-full bg-card/50 backdrop-blur-sm border-primary/20 flex flex-col">
      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Terminal className="w-4 h-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Alex Strategy Log</CardTitle>
              <CardDescription className="text-xs">Real-time market signals</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="animate-pulse bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
            LIVE ANALYSIS
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-[400px] p-4">
          <div className="space-y-4">
            {signals.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground space-y-2 opacity-50">
                <Info className="w-8 h-8" />
                <p className="text-sm font-medium">Scanning market data for patterns...</p>
                <p className="text-[10px] uppercase tracking-wider">Alex Strategy v1.0.4</p>
              </div>
            ) : (
              signals.map((signal) => (
                <div 
                  key={signal.id} 
                  className="p-3 rounded-lg bg-background/50 border border-border/50 space-y-2 animate-in slide-in-from-top duration-500"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className={`w-4 h-4 ${signal.type === 'EVEN' || signal.type === 'OVER' ? 'text-emerald-500' : 'text-purple-500'}`} />
                      <span className="font-bold text-sm">Signal: {signal.type}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {format(signal.timestamp, 'HH:mm:ss')}
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {signal.message}
                  </p>
                  
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-amber-500" />
                      <span className="text-[10px] font-semibold text-amber-500">PROBABILITY: {signal.probability}%</span>
                    </div>
                    <Badge className="text-[9px] h-4 bg-primary/20 text-primary border-primary/20 hover:bg-primary/30">
                      TRADE READY
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
