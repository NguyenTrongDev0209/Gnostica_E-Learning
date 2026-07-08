import React from 'react';
import { mockCategories } from '@/apiMocks/home';
import * as LucideIcons from 'lucide-react';

const CategoryGrid = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {mockCategories.map((cat, idx) => {
        const Icon = LucideIcons[cat.iconName] || LucideIcons.Code;
        return (
          <div key={idx} className="group relative overflow-hidden rounded-2xl border bg-card p-6 w-full hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${cat.colorClass}`}>
              <Icon className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">{cat.title}</h3>
            <p className="text-sm text-muted-foreground">{cat.coursesCount} khóa học</p>
          </div>
        );
      })}
    </div>
  );
};

export default CategoryGrid;
