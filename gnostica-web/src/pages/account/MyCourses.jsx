import React from "react";
import { Search, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AppBreadcrumb from "@/components/common/micro/AppBreadcrumb";
import AppPageHeader from "@/components/common/composite/AppPageHeader";
import useMyCourses from "@/hooks/course/useMyCourses";
import MyCourseGrid from "@/pages/account/components/MyCourseGrid";

export default function MyCourses() {
  const {
    courses,
    loading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
  } = useMyCourses();

  return (
    <div>
      <AppBreadcrumb paths={[{ label: "Tài khoản", href: "/account" }, { label: "Khóa học của tôi" }]} />

      <AppPageHeader
        icon={BookOpen}
        title="Khóa học của tôi"
        description={`Bạn đang có tổng cộng ${courses.length} khóa học trong thư viện.`}
      />

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8 bg-white p-4 rounded-lg border border-border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Tìm kiếm khóa học của bạn..." 
            className="pl-9 h-11 border-border focus-visible:ring-primary bg-muted focus-visible:bg-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[200px] h-11 border-border bg-muted min-w-40 font-semibold focus:ring-primary focus:bg-white">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="not_started">Chưa bắt đầu</SelectItem>
            <SelectItem value="in_progress">Đang học</SelectItem>
            <SelectItem value="completed">Đã hoàn thành</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Course Grid */}
      <MyCourseGrid loading={loading} courses={courses} />
    </div>
  );
}
