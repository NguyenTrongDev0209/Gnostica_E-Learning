import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function MessageThreadSkeleton() {
  return (
    <div className="p-4 space-y-4 flex-1">
      <div className="flex items-start gap-3">
        <Skeleton className="w-8 h-8 rounded-full shrink-0" />
        <Skeleton className="h-14 w-64 rounded-2xl rounded-tl-none" />
      </div>
      <div className="flex items-start justify-end gap-3">
        <Skeleton className="h-10 w-48 rounded-2xl rounded-tr-none bg-primary/20" />
      </div>
      <div className="flex items-start gap-3">
        <Skeleton className="w-8 h-8 rounded-full shrink-0" />
        <Skeleton className="h-20 w-72 rounded-2xl rounded-tl-none" />
      </div>
      <div className="flex items-start justify-end gap-3">
        <Skeleton className="h-16 w-56 rounded-2xl rounded-tr-none bg-primary/20" />
      </div>
    </div>
  );
}
