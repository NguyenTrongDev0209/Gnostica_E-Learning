import React, { useState } from 'react';
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-40 w-full bg-muted animate-pulse rounded-2xl border" />
        ))}
      </div>
    );
  }

  const totalPages = Math.ceil(categories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayCategories = categories.slice(startIndex, startIndex + itemsPerPage);

  if (displayCategories.length === 0) return null;

  return (
    <div className="w-full flex flex-col items-center gap-8">
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
              <p className="text-sm text-muted-foreground">
                {cat.courses !== undefined ? cat.courses : 0} khóa học
              </p>
            </Card>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="w-10 h-10 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <LucideIcons.ChevronLeft className="w-5 h-5" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-10 h-10 rounded-xl border flex items-center justify-center font-medium transition-all ${currentPage === page
                  ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25"
                  : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="w-10 h-10 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <LucideIcons.ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default CategoryGrid;

