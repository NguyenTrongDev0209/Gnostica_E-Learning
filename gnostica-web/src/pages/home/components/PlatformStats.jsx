import React from 'react';
import * as LucideIcons from 'lucide-react';

import useHomeData from '@/hooks/home/useHomeData';
import { Skeleton } from '@/components/ui/skeleton';

const PlatformStats = () => {
  const { stats, loadingStats } = useHomeData();

  if (loadingStats) {
    return (
      <div className="app-container mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats || stats.length === 0) return null;

  return (
    <div className="app-container mb-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = LucideIcons[stat.iconName] || LucideIcons.Users;
          return (
            <div key={idx} className="flex flex-col items-center justify-center rounded-2xl bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors">
              <div className="flex flex-col items-center gap-1 py-3 px-4">
                <Icon className="w-5 h-5 text-primary mb-0.5" />
                <span className="text-xl font-bold text-foreground">{stat.value}</span>
                <span className="text-xs text-muted-foreground font-medium">{stat.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlatformStats;
