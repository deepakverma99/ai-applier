'use client';

import { useStats } from '@/hooks/useStats';
import { StatCard } from './StatCard';
import { 
  Send, 
  CheckCircle2, 
  Clock,
  TrendingUp
} from 'lucide-react';

export function StatsGrid() {
  const { stats, loading } = useStats();

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Applications"
        value={stats.total}
        icon={Send}
        description="All job applications"
      />
      <StatCard
        title="Submitted"
        value={stats.submitted}
        icon={CheckCircle2}
        description="Successfully sent"
        className="border-emerald-100/50 dark:border-emerald-900/20"
      />
      <StatCard
        title="Success Rate"
        value={`${stats.successRate.toFixed(1)}%`}
        icon={TrendingUp}
        description="Overall conversion"
      />
      <StatCard
        title="Pending"
        value={stats.pending}
        icon={Clock}
        description="In progress or queued"
      />
    </div>
  );
}
