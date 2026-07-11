import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import AppPageHeader from "@/components/common/AppPageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import useCertificates from "@/hooks/account/useCertificates";
import {
  Award,
  Download,
  Share2,
  Trophy,
  ExternalLink,
} from "lucide-react";
import { SimpleButton, GhostButton } from "@/components/common/AppButton";

export default function Certificates() {
  const { certificates, loading } = useCertificates();

  return (
    <div>
      <AppBreadcrumb paths={[{ label: "Tài khoản", href: "/account" }, { label: "Chứng chỉ" }]} />

      <AppPageHeader
        icon={Award}
        title="Chứng chỉ của tôi"
        description={`Bạn đã nỗ lực hoàn thành ${certificates.length} khóa học. Tuyệt vời!`}
      />

      {/* Certificates Grid */}
      {loading ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i} className="border-border shadow-sm overflow-hidden h-64 flex">
              <div className="w-full sm:w-48 bg-muted shrink-0 flex items-center justify-center p-6">
                 <Skeleton className="w-20 h-20 rounded-full" />
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                 <Skeleton className="h-6 w-3/4 mb-4" />
                 <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                 </div>
                 <div className="flex gap-3 mt-4">
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 w-12" />
                 </div>
              </div>
            </Card>
          ))}
        </div>
      ) : certificates.length > 0 ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {certificates.map((cert) => (
            <Card key={cert.id} className="border-border shadow-sm overflow-hidden hover:shadow-lg transition-all group">
              <CardContent className="p-0 flex flex-col sm:flex-row">
                {/* Left Side: Thumbnail/Design */}
                <div className={`relative w-full sm:w-48 h-48 sm:h-auto bg-gradient-to-br ${cert.color} overflow-hidden shrink-0 flex flex-col items-center justify-center text-white p-6`}>
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <Award className="w-16 h-16 opacity-90 mb-3" />
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Cấp bởi Gnostica</p>
                  <p className="font-extrabold text-center leading-tight line-clamp-3">{cert.title}</p>
                </div>
                
                {/* Right Side: Info & Actions */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <h3 className="font-bold text-lg text-foreground line-clamp-2">{cert.title}</h3>
                      <Link to={`/courses/${cert.courseId}`} title="Xem khóa học">
                        <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
                      </Link>
                    </div>
                    
                    <div className="space-y-1.5 text-sm text-muted-foreground">
                      <p className="flex justify-between">
                        <span className="text-muted-foreground">Giảng viên:</span>
                        <span className="font-semibold text-foreground">{cert.instructor}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-muted-foreground">Thời lượng:</span>
                        <strong className="text-foreground">{cert.hours}</strong>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-muted-foreground">Xếp loại:</span>
                        <strong className="text-primary">{cert.grade}</strong>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-muted-foreground">Cấp ngày:</span>
                        <span className="font-medium text-foreground">{cert.issueDate}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-muted-foreground">Mã CC:</span>
                        <span className="text-xs font-mono font-medium bg-secondary px-1.5 py-0.5 rounded text-foreground">{cert.id}</span>
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 mt-6 pt-4 border-t border-border">
                    <SimpleButton className="flex-1 font-bold text-sm gap-2">
                      <Download className="w-4 h-4" />
                      Tải PDF
                    </SimpleButton>
                    <GhostButton className="px-4 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors border border-border">
                      <Share2 className="w-4 h-4" />
                    </GhostButton>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed border-2 bg-muted shadow-none border-border">
          <CardContent className="p-16 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center text-primary/40 mb-6">
              <Trophy className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-extrabold text-foreground mb-2">Bạn chưa có chứng chỉ nào</h3>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed mb-6">
              Hãy cố gắng hoàn thành 100% bài giảng và bài tập trong khóa học để mở khóa chứng chỉ của bạn nhé!
            </p>
            <Link to="/account/my-courses">
              <SimpleButton className="font-bold">Quay lại học ngay</SimpleButton>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
