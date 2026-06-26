import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LogIn, LogOut, ExternalLink, ShieldCheck, User } from 'lucide-react';
import type { AccountInfo } from '@/hooks/useDerivAPI';

interface AccountSwitcherProps {
  account: AccountInfo | null;
  status: string;
  onLogin: (token: string) => void;
  onLogout: () => void;
}

export const AccountSwitcher: React.FC<AccountSwitcherProps> = ({
  account,
  status,
  onLogin,
  onLogout
}) => {
  const [token, setToken] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (token.trim()) {
      onLogin(token.trim());
      setToken('');
    }
  };

  return (
    <Card className="w-full bg-card/50 backdrop-blur-sm border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              Deriv Account
            </CardTitle>
            <CardDescription>
              Connect your account using an API token
            </CardDescription>
          </div>
          {account && (
            <Badge variant={account.isVirtual ? "secondary" : "destructive"} className="px-3 py-1">
              {account.isVirtual ? "DEMO ACCOUNT" : "REAL ACCOUNT"}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {account ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{account.loginid}</p>
                  <p className="text-lg font-bold text-primary">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: account.currency
                    }).format(account.balance)}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={onLogout} className="gap-2">
                <LogOut className="w-4 h-4" />
                Disconnect
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter API Token (Admin or Read scope)"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="bg-background/50"
                type="password"
              />
              <Button type="submit" disabled={!token || status === 'connecting'} className="gap-2">
                <LogIn className="w-4 h-4" />
                Connect
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-3 pt-2">
              <a 
                href="https://app.deriv.com/account/api-token" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 p-2 text-xs rounded-md bg-secondary/50 hover:bg-secondary transition-colors text-secondary-foreground"
              >
                Get API Token <ExternalLink className="w-3 h-3" />
              </a>
              <a 
                href="https://deriv.com/signup/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 p-2 text-xs rounded-md bg-secondary/50 hover:bg-secondary transition-colors text-secondary-foreground"
              >
                Create Account <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
};
