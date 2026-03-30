import React from 'react';

export default function StatItem({ icon: Icon, value, label, color = "text-primary" }) {
  return (
    <div className="flex flex-col items-center gap-1 py-3 px-4">
      <Icon className={`w-5 h-5 ${color} mb-0.5`} />
      <span className="text-xl font-bold text-slate-800">{value}</span>
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
    </div>
  );
}
