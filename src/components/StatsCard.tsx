import { Card } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: number;
  prefix?: string;
}

export const StatsCard = ({ title, value, icon: Icon, trend, prefix }: StatsCardProps) => {
  return (
    <Card className="p-6 bg-gradient-card border-border shadow-card hover:shadow-glow transition-shadow duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-3xl font-bold font-mono-numbers text-foreground">
            {prefix}{value}
          </p>
          {trend !== undefined && (
            <p className={`text-sm mt-1 ${trend >= 0 ? 'text-success' : 'text-destructive'}`}>
              {trend >= 0 ? '+' : ''}{trend.toFixed(2)}%
            </p>
          )}
        </div>
        <div className="p-3 bg-secondary rounded-lg">
          <Icon className="w-6 h-6 text-primary" />
        </div>
      </div>
    </Card>
  );
};
