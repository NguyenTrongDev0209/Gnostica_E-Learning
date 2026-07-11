import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Award, ChevronRight, Trophy } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function RecentCertificatesList({ loading, recentCertificates }) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array(2).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (recentCertificates.length === 0) {
    return (
      <div className="space-y-4">
        <Card className="border-dashed border-2 bg-transparent shadow-none border-border">
          <CardContent className="p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mx-auto text-muted-foreground">
              <Trophy className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              Hoàn thành thêm khóa học để nhận chứng chỉ
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {recentCertificates.map((cert) => (
        <div 
          key={cert.id} 
          className={`p-5 rounded-2xl bg-gradient-to-br ${cert.color} text-white shadow-lg relative overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform`}
        >
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors"></div>
          <Award className="w-8 h-8 text-white/80 mb-3" />
          <h3 className="font-bold text-lg leading-tight mb-4">{cert.title}</h3>
          <div className="flex items-center justify-between mt-auto">
            <span className="text-xs font-medium text-white/80">Cấp ngày: {cert.date}</span>
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
