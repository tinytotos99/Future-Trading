import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Trade {
  id: string;
  symbol: string;
  type: 'LONG' | 'SHORT';
  entryPrice: number;
  exitPrice?: number;
  quantity: number;
  pnl?: number;
  status: 'OPEN' | 'CLOSED';
  timestamp: string;
}

interface TradesTableProps {
  trades: Trade[];
}

export const TradesTable = ({ trades }: TradesTableProps) => {
  return (
    <Card className="p-6 bg-gradient-card border-border shadow-card">
      <h3 className="text-xl font-bold text-foreground mb-4">Recent Trades</h3>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Symbol</TableHead>
              <TableHead className="text-muted-foreground">Type</TableHead>
              <TableHead className="text-muted-foreground">Entry</TableHead>
              <TableHead className="text-muted-foreground">Exit</TableHead>
              <TableHead className="text-muted-foreground">Qty</TableHead>
              <TableHead className="text-muted-foreground">P&L</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground">Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trades.map((trade) => (
              <TableRow key={trade.id} className="border-border hover:bg-secondary/50">
                <TableCell className="font-bold text-foreground">{trade.symbol}</TableCell>
                <TableCell>
                  <Badge variant={trade.type === 'LONG' ? 'default' : 'destructive'}>
                    {trade.type}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono-numbers text-foreground">
                  ${trade.entryPrice.toFixed(2)}
                </TableCell>
                <TableCell className="font-mono-numbers text-foreground">
                  {trade.exitPrice ? `$${trade.exitPrice.toFixed(2)}` : '-'}
                </TableCell>
                <TableCell className="font-mono-numbers text-foreground">{trade.quantity}</TableCell>
                <TableCell className={`font-mono-numbers font-bold ${
                  trade.pnl && trade.pnl >= 0 ? 'text-success' : 'text-destructive'
                }`}>
                  {trade.pnl ? `${trade.pnl >= 0 ? '+' : ''}$${trade.pnl.toFixed(2)}` : '-'}
                </TableCell>
                <TableCell>
                  <Badge variant={trade.status === 'OPEN' ? 'outline' : 'secondary'}>
                    {trade.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{trade.timestamp}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};
