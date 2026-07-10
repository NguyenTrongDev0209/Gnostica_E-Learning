import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Award, Clock } from "lucide-react";

export default function AccountStatsCards({ stats, loading }) {
  const statItems = [
    { 
      label: "Khóa học đang học", 
      value: stats?.enrolledCourses || "0", 
      icon: BookOpen, 
      color: "text-info bg-blue-50" 
    },
    { 
      label: "Chứng chỉ đạt được", 
      value: stats?.completedCourses || "0", 
      icon: Award, 
      color: "text-emerald-500 bg-emerald-50" 
    },
    { 
      label: "Số giờ đã học", 
      value: stats?.hoursStudied?.toFixed(1) || "0", 
      icon: Clock, 
      color: "text-purple-500 bg-purple-50" 
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {Array(3).fill(0).map((_, i) => (
          <Card key={i} className="border-border shadow-sm">
            <CardContent className="p-5 flex items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-12" />
                <Skeleton className="h-3 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      {statItems.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${stat.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-black text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
