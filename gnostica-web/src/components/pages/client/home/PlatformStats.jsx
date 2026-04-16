import React from 'react';
import * as LucideIcons from 'lucide-react';
import { mockPlatformStats } from '@/mocks/home';

const PlatformStats = () => {
  return (
    <div className="app-container mb-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {mockPlatformStats.map((stat, idx) => {
          const Icon = LucideIcons[stat.iconName] || LucideIcons.Users;
          return (
            <div key={idx} className="flex flex-col items-center justify-center p-6 rounded-2xl bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors">
              <Icon className="w-8 h-8 text-primary mb-3" />
              <h4 className="text-3xl font-bold text-foreground mb-1">{stat.value}</h4>
              <p className="text-muted-foreground font-medium">{stat.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlatformStats;
