import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * AppSkeleton - Micro component cho hiệu ứng Loading
 * Tích hợp sẵn các preset thường dùng để đỡ phải tự ghép nhiều thẻ Skeleton.
 *
 * @param {string} preset - "default" | "card" | "profile" | "table-row" (mặc định: "default")
 */
export default function AppSkeleton({ preset = "default", className, ...props }) {
  
  if (preset === "card") {
    return (
      <div className={cn("flex flex-col space-y-3", className)} {...props}>
        <Skeleton className="h-[125px] w-full rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
    );
  }

  if (preset === "profile") {
    return (
      <div className={cn("flex items-center space-x-4", className)} {...props}>
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    );
  }

  if (preset === "table-row") {
    return (
      <div className={cn("flex items-center justify-between py-2 border-b", className)} {...props}>
        <div className="flex items-center space-x-4 w-full">
          <Skeleton className="h-4 w-[20px]" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </div>
    );
  }

  // Mặc định (default) là 1 khối đơn lẻ
  return <Skeleton className={cn("h-4 w-full", className)} {...props} />;
}
