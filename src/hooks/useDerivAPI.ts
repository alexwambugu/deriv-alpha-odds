import { useState, useEffect, useRef, useCallback } from 'react';
import * as Sonner from 'sonner';

export type DigitData = {
  digit: number;
  timestamp: number;
};

export type AnalysisStats = {
  even: number;
  odd: number;
  over: number;
  under: number;
  lastDigits: number[];
  digitFrequency: Record<number, number>;
};

export type Signal = {
  id: string;
  type: 'EVEN' | 'ODD' | 'OVER' | 'UNDER' | 'DIFFERS';
  probability: number;
  timestamp: number;
  message: string;
};

export type AccountInfo = {
  balance: number;
  currency: string;
  loginid: string;
  isVirtual: boolean;
};

export type MarketSymbol = {
  symbol: string;
  display_name: string;
};

export type Trade = {
  id: string;
  type: 'OVER' | 'UNDER';
  barrier: number;
  amount: number;
  status: 'OPEN' | 'WON' | 'LOST' | 'PENDING';
  entryDigit?: number;
  exitDigit?: number;
  timestamp: number;
};

const DERIV_WS_URL = 'wss://ws.binaryws.com/websockets/v3?app_id=1089';

export function useDerivAPI() {
  const [digits, setDigits] = useState<DigitData[]>([]);
  const [stats, setStats] = useState<AnalysisStats>({ 
    even: 0, 
    odd: 0, 
    over: 0, 
    under: 0, 
    lastDigits: [],
    digitFrequency: {}
  });
  const [signals, setSignals] = useState<Signal[]>([]);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error' | 'authorized'>('idle');
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isRobotActive, setIsRobotActive] = useState(false);
  const [symbols, setSymbols] = useState<MarketSymbol[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('R_100');
  
  const ws = useRef<WebSocket | null>(null);
  const tokenRef = useRef<string | null>(localStorage.getItem('deriv_token'));

  const addSignal = useCallback((type: Signal['type'], probability: number, message: string) => {
    const id = Date.now().toString();
    const newSignal: Signal = {
      id,
      type,
      probability,
      timestamp: Date.now(),
      message
    };
    
    setSignals(prev => {
      if (prev.length > 0 && prev[0].message === message) return prev;
      return [newSignal, ...prev].slice(0, 50);
    });
  }, []);

  const calculateStats = useCallback((currentDigits: DigitData[]) => {
    if (currentDigits.length === 0) return;

    const last100 = currentDigits.slice(-100);
    const digitValues = last100.map(d => d.digit);
    
    const evenCount = digitValues.filter(d => d % 2 === 0).length;
    const oddCount = digitValues.length - evenCount;
    const overCount = digitValues.filter(d => d > 4).length;
    const underCount = digitValues.filter(d => d <= 4).length;

    const newStats: AnalysisStats = {
      even: (evenCount / digitValues.length) * 100,
      odd: (oddCount / digitValues.length) * 100,
      over: (overCount / digitValues.length) * 100,
      under: (underCount / digitValues.length) * 100,
      lastDigits: digitValues,
      digitFrequency: digitValues.reduce((acc, d) => {
        acc[d] = (acc[d] || 0) + 1;
        return acc;
      }, {} as Record<number, number>)
    };

    setStats(newStats);

    const last5 = digitValues.slice(-5);
    if (last5.length === 5) {
      const allOdd = last5.every(d => d % 2 !== 0);
      const allEven = last5.every(d => d % 2 === 0);
      
      if (allOdd) {
        addSignal('EVEN', 92, 'Detected 5 consecutive ODD digits. Probability of EVEN is high.');
      } else if (allEven) {
        addSignal('ODD', 92, 'Detected 5 consecutive EVEN digits. Probability of ODD is high.');
      }
    }

    const last7 = digitValues.slice(-7);
    if (last7.length === 7) {
      const allUnder = last7.every(d => d <= 4);
      const allOver = last7.every(d => d > 4);

      if (allUnder) {
        addSignal('OVER', 94, 'Detected 7 consecutive UNDER digits. Market skewing high.');
      } else if (allOver) {
        addSignal('UNDER', 94, 'Detected 7 consecutive OVER digits. Market skewing low.');
      }
    }

    // Differs Signal Logic
    const digitAppearance = new Array(10).fill(0).map((_, i) => {
      const lastIndex = [...digitValues].reverse().indexOf(i);
      return { digit: i, ticksSinceLast: lastIndex === -1 ? 100 : lastIndex };
    });

    const coldDigit = digitAppearance.reduce((prev, curr) => 
      curr.ticksSinceLast > prev.ticksSinceLast ? curr : prev
    );

    if (coldDigit.ticksSinceLast >= 15) {
      addSignal('DIFFERS', 98, `Digit ${coldDigit.digit} hasn't appeared for ${coldDigit.ticksSinceLast} ticks. High probability for DIFFERS ${coldDigit.digit}.`);
    }
  }, [addSignal]);

  const executeTrade = useCallback((type: 'OVER' | 'UNDER', barrier: number) => {
    const id = Math.random().toString(36).substring(7);
    const newTrade: Trade = {
      id,
      type,
      barrier,
      amount: 1.0,
      status: 'PENDING',
      timestamp: Date.now()
    };

    setTrades(prev => [newTrade, ...prev].slice(0, 50));
    return id;
  }, []);

  const processRobotLogic = useCallback((lastDigit: number, currentStats: AnalysisStats, currentTrades: Trade[]) => {
    if (!isRobotActive) return;

    setTrades(prev => prev.map(trade => {
      if (trade.status === 'PENDING') {
        const win = trade.type === 'OVER' ? lastDigit > trade.barrier : lastDigit < trade.barrier;
        return {
          ...trade,
          status: win ? 'WON' : 'LOST',
          exitDigit: lastDigit
        };
      }
      return trade;
    }));

    const last10 = currentStats.lastDigits.slice(-10);
    
    const noOver7 = last10.length === 10 && last10.every(d => d <= 7);
    if (noOver7 && !currentTrades.some(t => t.status === 'PENDING' && t.type === 'OVER')) {
      executeTrade('OVER', 7);
    }

    const noUnder5 = last10.length === 10 && last10.slice(-8).every(d => d >= 5);
    if (noUnder5 && !currentTrades.some(t => t.status === 'PENDING' && t.type === 'UNDER')) {
      executeTrade('UNDER', 5);
    }
  }, [isRobotActive, executeTrade]);

  const connect = useCallback((token?: string) => {
    if (ws.current?.readyState === WebSocket.OPEN || ws.current?.readyState === WebSocket.CONNECTING) return;

    setStatus('connecting');
    ws.current = new WebSocket(DERIV_WS_URL);

    ws.current.onopen = () => {
      setStatus('connected');
      const activeToken = token || tokenRef.current;
      if (activeToken) {
        ws.current?.send(JSON.stringify({ authorize: activeToken }));
      }
      
      ws.current?.send(JSON.stringify({
        active_symbols: 'brief',
        product_type: 'basic'
      }));
      
      ws.current?.send(JSON.stringify({
        ticks: selectedSymbol,
        subscribe: 1
      }));

      ws.current?.send(JSON.stringify({
        ticks_history: selectedSymbol,
        adjust_start_time: 1,
        count: 100,
        end: 'latest',
        start: 1,
        style: 'ticks'
      }));
    };

    ws.current.onmessage = (msg) => {
      const data = JSON.parse(msg.data);

      if (data.error) {
        Sonner.toast.error(data.error.message);
        if (data.error.code === 'InvalidToken') {
          logout();
        }
        return;
      }

      if (data.msg_type === 'authorize') {
        setStatus('authorized');
        setAccount({
          balance: data.authorize.balance,
          currency: data.authorize.currency,
          loginid: data.authorize.loginid,
          isVirtual: data.authorize.is_virtual === 1
        });
      }

      if (data.msg_type === 'active_symbols') {
        const volIndices = data.active_symbols
          .filter((s: any) => s.market === 'synthetic_index' && s.submarket === 'random_index')
          .map((s: any) => ({
            symbol: s.symbol,
            display_name: s.display_name
          }));
        setSymbols(volIndices);
      }

      if (data.msg_type === 'tick') {
        const tick = data.tick;
        const lastDigit = parseInt(tick.quote.toString().split('').pop() || '0');
        
        setDigits(prev => {
          const newData = [...prev, { digit: lastDigit, timestamp: tick.epoch * 1000 }].slice(-100);
          
          const digitValues = newData.map(d => d.digit);
          const evenCount = digitValues.filter(d => d % 2 === 0).length;
          const oddCount = digitValues.length - evenCount;
          const overCount = digitValues.filter(d => d > 4).length;
          const underCount = digitValues.length - overCount;

          const newStats: AnalysisStats = {
            even: (evenCount / digitValues.length) * 100,
            odd: (oddCount / digitValues.length) * 100,
            over: (overCount / digitValues.length) * 100,
            under: (underCount / digitValues.length) * 100,
            lastDigits: digitValues,
            digitFrequency: digitValues.reduce((acc, d) => {
              acc[d] = (acc[d] || 0) + 1;
              return acc;
            }, {} as Record<number, number>)
          };
          
          setStats(newStats);
          processRobotLogic(lastDigit, newStats, trades);
          return newData;
        });
      }

      if (data.msg_type === 'history') {
        const historyDigits = data.history.prices.map((p: number, i: number) => ({
          digit: parseInt(p.toString().split('').pop() || '0'),
          timestamp: data.history.times[i] * 1000
        }));
        setDigits(historyDigits);
        calculateStats(historyDigits);
      }
    };

    ws.current.onclose = () => {
      setStatus('idle');
    };

    ws.current.onerror = () => {
      setStatus('error');
      Sonner.toast.error('WebSocket connection error');
    };
  }, [selectedSymbol, processRobotLogic, trades, addSignal, calculateStats]);

  const login = (token: string) => {
    tokenRef.current = token;
    localStorage.setItem('deriv_token', token);
    if (ws.current) ws.current.close();
    connect(token);
  };

  const logout = () => {
    tokenRef.current = null;
    localStorage.removeItem('deriv_token');
    setAccount(null);
    setStatus('connected');
    if (ws.current) ws.current.close();
    connect();
  };

  const changeSymbol = (symbol: string) => {
    setSelectedSymbol(symbol);
    setDigits([]);
    setStats({ 
      even: 0, 
      odd: 0, 
      over: 0, 
      under: 0, 
      lastDigits: [], 
      digitFrequency: {} 
    });
    if (ws.current) ws.current.close();
  };

  useEffect(() => {
    connect();
    return () => {
      ws.current?.close();
    };
  }, [connect]);

  return {
    digits,
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
  };
}
