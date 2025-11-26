import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';

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

  return (
    <Card className="p-6 bg-gradient-card border-border shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-foreground">{symbol}</h3>
          <p className="text-sm text-muted-foreground">Last 3 Months Performance</p>
        </div>
        <div className="text-right">
          <p className={`text-lg font-bold font-mono-numbers ${isProfitable ? 'text-success' : 'text-destructive'}`}>
            {isProfitable ? '+' : ''}{returnPercent}%
          </p>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`gradient-${symbol}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
          <XAxis 
            dataKey="time" 
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
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
            name="Change"
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Additional Stats Section */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Win Rate</p>
            <p className="text-sm font-semibold text-foreground">{winRate}%</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Total P&L %</p>
            <p className={`text-sm font-semibold ${isTotalProfitable ? 'text-success' : 'text-destructive'}`}>
              {isTotalProfitable ? '+' : ''}{totalPnlPercent}%
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Total Trades</p>
            <p className="text-sm font-semibold text-foreground">{totalTrades.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Started</p>
            <p className="text-sm font-semibold text-foreground">{formatStartedDate(startedDate)}</p>
          </div>
        </div>
      </div>
    </Card>
  );
};
