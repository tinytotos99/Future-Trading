import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Github, ExternalLink, Zap } from 'lucide-react';

interface TradingChartProps {
  symbol: string;
  data: { time: string; balance: number; change: number; pnl: number }[];
  winRate?: string;
  totalPnlPercent?: string;
  totalTrades?: number;
  startedDate?: string;
}

export const TradingChart = ({ 
  symbol, 
  data, 
  winRate = '0.0',
  totalPnlPercent = '0.0',
  totalTrades = 0,
  startedDate = ''
}: TradingChartProps) => {
  const latestBalance = data[data.length - 1]?.balance || 1000;
  const initialBalance = data[0]?.balance || 1000;
  const totalReturn = latestBalance - initialBalance;
  const isProfitable = totalReturn >= 0;
  const returnPercent = ((totalReturn / initialBalance) * 100).toFixed(2);
  
  // Format started date for display
  const formatStartedDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Custom tooltip formatter
  const customTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-semibold mb-2">{data.time}</p>
          <p className="text-sm">
            <span className="text-muted-foreground">Balance: </span>
            <span className="font-semibold">${data.balance.toFixed(2)}</span>
          </p>
          <p className="text-sm">
            <span className="text-muted-foreground">P&L: </span>
            <span className={data.pnl >= 0 ? 'text-success' : 'text-destructive'}>
              {data.pnl >= 0 ? '+' : ''}{data.pnl.toFixed(2)}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  const isTotalProfitable = parseFloat(totalPnlPercent) >= 0;
  
  // Get bot description based on symbol
  const getBotDescription = (symbol: string) => {
    const descriptions: { [key: string]: string } = {
      'M2K': 'AI-powered signal generator for Micro E-mini Russell 2000 Index futures. Analyzes historical data using advanced AI algorithms to generate accurate long and short trading signals.',
      'MES': 'AI-driven signal generator for Micro E-mini S&P 500 Index futures. Uses machine learning to analyze past market data and produce precise long and short trading signals.',
      'MNQ': 'AI-based signal generator for Micro E-mini Nasdaq-100 Index futures. Leverages artificial intelligence to analyze historical patterns and generate reliable long and short signals.'
    };
    return descriptions[symbol] || 'AI-powered trading signal generator that analyzes historical data to produce long and short trading signals.';
  };

  return (
    <Card className="overflow-hidden border shadow-lg">
      {/* Top Section - Chart Display (Laptop Screen Style) */}
      <div className="bg-background">
        <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-destructive"></div>
              <div className="w-2 h-2 rounded-full bg-muted-foreground/50"></div>
              <div className="w-2 h-2 rounded-full bg-muted-foreground/50"></div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground font-medium">PERFORMANCE: LAST 3 MONTHS</span>
              {data.length > 0 && (
                <span className={`text-sm font-bold font-mono-numbers ${isProfitable ? 'text-success' : 'text-destructive'}`}>
                  {isProfitable ? '+' : ''}{returnPercent}%
                </span>
              )}
            </div>
          </div>
          
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={data}>
                <defs>
                  <linearGradient id={`gradient-${symbol}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
                <XAxis 
                  dataKey="time" 
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: '10px' }}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: '10px' }}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(value) => {
                    if (value === 0) return '$0';
                    return value > 0 ? `+$${value.toFixed(0)}` : `-$${Math.abs(value).toFixed(0)}`;
                  }}
                />
                <Tooltip content={customTooltip} />
                <Area 
                  type="monotone" 
                  dataKey="change" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  fill={`url(#gradient-${symbol})`}
                  fillOpacity={1}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[180px] flex items-center justify-center text-muted-foreground">
              <p className="text-sm">No data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section - Bot Details (Dark Purple/Primary Background) */}
      <div className="p-6">
        {/* Title with Tag */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-2xl font-bold text-foreground">{symbol}</h3>
          <span className="px-3 py-1 bg-primary/20 dark:bg-primary/30 text-primary text-xs font-semibold rounded-full border border-primary/30">
            Trading Bot
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          {getBotDescription(symbol)}
        </p>

        {/* Technology Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="px-3 py-1 bg-muted/50 text-foreground text-xs rounded-md border border-border/50">
            Telegram
          </span>
          <span className="px-3 py-1 bg-muted/50 text-foreground text-xs rounded-md border border-border/50">
            TradeStation
          </span>
          <span className="px-3 py-1 bg-muted/50 text-foreground text-xs rounded-md border border-border/50">
            Signals
          </span>
        </div>

        {/* Performance Metrics Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-background/50 dark:bg-background/30 p-3 rounded-lg border border-border/50">
            <p className="text-xs text-muted-foreground mb-1">Started</p>
            <p className="text-sm font-bold text-foreground">{formatStartedDate(startedDate)}</p>
          </div>
          <div className="bg-background/50 dark:bg-background/30 p-3 rounded-lg border border-border/50">
            <p className="text-xs text-muted-foreground mb-1">Win Rate</p>
            <p className="text-sm font-bold text-success">{winRate}%</p>
          </div>
          <div className="bg-background/50 dark:bg-background/30 p-3 rounded-lg border border-border/50">
            <p className="text-xs text-muted-foreground mb-1">Profit</p>
            <p className={`text-sm font-bold ${isTotalProfitable ? 'text-success' : 'text-destructive'}`}>
              {isTotalProfitable ? '+' : ''}{totalPnlPercent}%
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 bg-background/50 hover:bg-background/80 hover:text-foreground/80"
            onClick={() => window.open('https://github.com/tinytotos99/M2K-MES-MNQ-Future-Trading', '_blank', 'noopener,noreferrer')}
          >
            <Github className="h-4 w-4 mr-2" />
            GitHub
          </Button>
          <Button 
            size="sm" 
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Demo
          </Button>
        </div>
      </div>
    </Card>
  );
};
