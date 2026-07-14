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
    <div className="app-container mb-12 -mt-4 relative z-20">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, idx) => {
          const Icon = LucideIcons[stat.iconName] || LucideIcons.Users;
          return (
            <div 
              key={idx} 
              className="group relative flex flex-col items-center justify-center rounded-3xl bg-card/80 backdrop-blur-sm border border-border/50 p-6 shadow-sm hover:shadow-xl hover:-translate-y-2 hover:border-primary/40 transition-all duration-500 overflow-hidden"
            >
              {/* Subtle background gradient that appears on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10 flex flex-col items-center gap-4">
                <div className="p-4 rounded-2xl bg-primary/10 text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-md transition-all duration-500">
                  <Icon className="w-7 h-7 stroke-[1.5]" />
                </div>
                <div className="flex flex-col items-center gap-1 text-center">
                  <span className="text-3xl md:text-4xl font-black text-foreground tracking-tight drop-shadow-sm">
                    {stat.value}
                  </span>
                  <span className="text-xs md:text-sm font-bold text-muted-foreground uppercase tracking-widest">
                    {stat.label}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlatformStats;
