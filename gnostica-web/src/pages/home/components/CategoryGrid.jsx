import React from 'react';
import * as LucideIcons from 'lucide-react';
import useCategories from '@/hooks/course/useCategories';
import { Card } from '@/components/ui/card';

const defaultColors = [
  "bg-info/10 text-info",
  "bg-pink-500/10 text-pink-500",
  "bg-warning/10 text-warning",
  "bg-success/10 text-success",
  "bg-purple-500/10 text-purple-500"
];

const CategoryGrid = () => {
  const { categories, loading } = useCategories();

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-40 w-full bg-muted animate-pulse rounded-2xl border" />
        ))}
      </div>
    );
  }

  // Lấy 4 danh mục đầu tiên
  const displayCategories = categories.slice(0, 4);

  if (displayCategories.length === 0) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {displayCategories.map((cat, idx) => {
        // Fallback icon 'Code'
        const Icon = LucideIcons[cat.iconName || 'Code'] || LucideIcons.Code;
        const colorClass = cat.colorClass || defaultColors[idx % defaultColors.length];
        
        return (
          <Card key={cat.id || idx} className="group relative overflow-hidden p-6 w-full hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${colorClass}`}>
              <Icon className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">{cat.name || cat.title}</h3>
            <p className="text-sm text-muted-foreground">{cat.coursesCount || Math.floor(Math.random() * 50) + 10} khóa học</p>
          </Card>
        );
      })}
    </div>
  );
};

export default CategoryGrid;

