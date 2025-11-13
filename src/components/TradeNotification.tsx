import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface TradeNotificationProps {
  symbol: string;
  type: 'LONG' | 'SHORT';
  price: number;
  timestamp: string;
  isNew?: boolean;
}

export const TradeNotification = ({ symbol, type, price, timestamp, isNew }: TradeNotificationProps) => {
  const isLong = type === 'LONG';

  return (
    <Card
      className={`p-4 border-l-4 transition-all duration-300 ${
        isLong ? 'border-l-long bg-gradient-long' : 'border-l-short bg-gradient-short'
      }`}
    >
      {/* ${isNew ? 'animate-pulse' : ''} */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          {isLong ? <TrendingUp className='w-5 h-5 text-long' /> : <TrendingDown className='w-5 h-5 text-short' />}
          <div>
            <div className='flex items-center gap-2'>
              <h4 className='font-bold text-foreground'>{symbol}</h4>
              <Badge variant={isLong ? 'default' : 'destructive'} className='text-xs'>
                {type}
              </Badge>
            </div>
            <p className='text-sm text-muted-foreground'>{timestamp}</p>
          </div>
        </div>
        <div className='text-right'>
          <p className='text-sm text-muted-foreground'>Entry Price</p>
          <p className='text-lg font-bold font-mono-numbers text-foreground'>${price.toFixed(2)}</p>
        </div>
      </div>
    </Card>
  );
};
