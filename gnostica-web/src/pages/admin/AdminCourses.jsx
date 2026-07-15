import React from "react";
import { 
  Plus, 
  Search, 
  Trash2, 
  Star,
  Users
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import DataTable from "@/components/common/composite/DataTable";
import { AppButton } from "@/components/common/micro/AppButton";
import { Input } from "@/components/ui/input";

const COURSES_DATA = [
  { 
    id: "CRS-001", 
    title: "Fullstack Next.js Masterclass", 
    instructor: "Sonny Sangha", 
    price: "899.000đ", 
    status: "published", 
    students: 1245, 
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=200&auto=format&fit=crop"
  },
  { 
    id: "CRS-002", 
    title: "Ultimate React Query Course", 
    instructor: "Maximilian S.", 
    price: "499.000đ", 
    status: "published", 
    students: 832, 
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=200&auto=format&fit=crop"
  },
  { 
    id: "CRS-003", 
    title: "Docker & Kubernetes cho Backend", 
    instructor: "Hồ Việt Đức", 
    price: "749.000đ", 
    status: "draft", 
    students: 0, 
    rating: 0,
    image: "https://images.unsplash.com/photo-1605745341112-85968b19335b?q=80&w=200&auto=format&fit=crop"
  },
  { 
    id: "CRS-004", 
    title: "Figma UI/UX Design Basics", 
    instructor: "Nguyễn Lê Quỳnh", 
    price: "1.299.000đ", 
    status: "archived", 
    students: 45, 
    rating: 4.2,
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=200&auto=format&fit=crop"
  },
];

export default function AdminCourses() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Quản Lý Khóa Học</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Thêm mới, chỉnh sửa nội dung và quản lý doanh thu khóa học.
          </p>
        </div>
        <AppButton appVariant="gradient" className="font-bold flex items-center gap-2 border-none">
          <Plus className="w-4 h-4" />
          Tạo Khóa Học Mới
        </AppButton>
      </div>

      {/* Filters & Actions */}
      <Card className="border-border shadow-sm">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex w-full md:w-auto items-center gap-3">
            <div className="relative w-full md:w-80 border-border">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Tìm khóa học theo tên..." 
                className="pl-9 h-10 border-border focus:bg-white"
              />
            </div>
            <select className="h-10 px-3 bg-white border border-border rounded-lg text-sm text-muted-foreground focus:outline-none focus:border-primary">
              <option>Tất cả danh mục</option>
              <option>Web Development</option>
              <option>Mobile App</option>
              <option>UI/UX Design</option>
            </select>
          </div>
          
          <div className="flex text-sm font-medium text-muted-foreground bg-secondary p-1 rounded-lg">
            <button className="px-3 py-1.5 rounded-md bg-white text-foreground shadow-sm">Tất cả (42)</button>
            <button className="px-3 py-1.5 rounded-md hover:text-foreground">Đã xuất bản (35)</button>
            <button className="px-3 py-1.5 rounded-md hover:text-foreground">Bản nháp (5)</button>
          </div>
        </CardContent>
      </Card>

      {/* Courses Table */}
      <Card className="border-border shadow-sm overflow-hidden">
        <DataTable
          columns={[
            {
              header: "Thông tin khóa học",
              width: "400px",
              render: (course) => (
                <div className="flex gap-4 items-center">
                  <div className="w-20 h-14 rounded-md overflow-hidden shrink-0 border border-border">
                    <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-foreground line-clamp-1 truncate" title={course.title}>{course.title}</span>
                    <span className="text-xs text-muted-foreground mt-1">Gv: {course.instructor}</span>
                  </div>
                </div>
              ),
            },
            {
              header: "Giá bán",
              render: (course) => <span className="font-bold text-foreground">{course.price}</span>,
            },
            {
              header: "Trạng thái",
              render: (course) => (
                <>
                  {course.status === "published" && <span className="inline-flex items-center gap-1.5 text-xs text-success font-bold bg-green-50 px-2.5 py-1 rounded-full border border-success/20"><div className="w-1.5 h-1.5 rounded-full bg-success/10 text-success"></div> Đang bán</span>}
                  {course.status === "draft" && <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground font-bold bg-secondary px-2.5 py-1 rounded-full border border-border"><div className="w-1.5 h-1.5 rounded-full bg-muted"></div> Bản nháp</span>}
                  {course.status === "archived" && <span className="inline-flex items-center gap-1.5 text-xs text-amber-600 font-bold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200"><div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div> Tạm ẩn</span>}
                </>
              ),
            },
            {
              header: "Học viên",
              className: "text-center",
              render: (course) => (
                <span className="inline-flex items-center gap-1 font-bold text-foreground">
                  <Users className="w-3.5 h-3.5 text-muted-foreground" />
                  {course.students.toLocaleString()}
                </span>
              ),
            },
            {
              header: "Đánh giá",
              className: "text-center",
              render: (course) => (
                <span className="inline-flex items-center gap-1 font-bold text-foreground">
                  <Star className={`w-3.5 h-3.5 ${course.rating > 0 ? 'text-warning fill-yellow-500' : 'text-slate-300'}`} />
                  {course.rating > 0 ? course.rating : "--"}
                </span>
              ),
            },
            {
              header: "Thao tác",
              className: "text-right",
              // eslint-disable-next-line no-unused-vars
              render: (course) => (
                <div className="flex justify-end items-center gap-2">
                  <AppButton appVariant="ghostMuted" variant="ghost" size="sm" className="h-8 font-medium border border-border bg-white hover:bg-muted">Chi tiết</AppButton>
                  <AppButton appVariant="ghostMuted" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-red-50 hover:text-error border-none">
                    <Trash2 className="w-4 h-4" />
                  </AppButton>
                </div>
              ),
            },
          ]}
          data={COURSES_DATA}
          pagination={{
            currentPage: 1, // Dummy pagination for static data
            totalPages: 3,
            totalElements: 42,
            onPageChange: () => {},
            zeroIndexed: false,
          }}
        />
      </Card>
    </div>
  );
}
