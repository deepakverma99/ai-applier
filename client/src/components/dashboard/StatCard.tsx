import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  description, 
  trend,
  className 
}: StatCardProps) {
  return (
    <div className={cn(
      "rounded-xl border bg-card p-6 shadow-sm",
      className
    )}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{title}</p>
        <div className="rounded-lg bg-muted p-2">
          <Icon className="h-4 w-4 text-foreground" />
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">{value}</h3>
        {description && (
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {description}
          </p>
        )}
        {trend && (
          <div className="mt-2 flex items-center gap-1">
            <span className={cn(
              "text-xs font-medium",
              trend.isPositive ? "text-emerald-600" : "text-rose-600"
            )}>
              {trend.isPositive ? '+' : '-'}{trend.value}%
            </span>
            <span className="text-xs text-zinc-500">from last month</span>
          </div>
        )}
      </div>
    </div>
  );
}
