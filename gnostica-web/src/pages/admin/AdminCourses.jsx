import React from "react";
import { 
  Plus, 
  Search, 
  Trash2, 
  Star,
  Users
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quản Lý Khóa Học</h1>
          <p className="text-sm text-slate-500 mt-1">
            Thêm mới, chỉnh sửa nội dung và quản lý doanh thu khóa học.
          </p>
        </div>
        <Button className="font-bold flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Tạo Khóa Học Mới
        </Button>
      </div>

      {/* Filters & Actions */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex w-full md:w-auto items-center gap-3">
            <div className="relative w-full md:w-80 border-slate-200">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Tìm khóa học theo tên..." 
                className="pl-9 h-10 border-slate-200 focus:bg-white"
              />
            </div>
            <select className="h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:border-primary">
              <option>Tất cả danh mục</option>
              <option>Web Development</option>
              <option>Mobile App</option>
              <option>UI/UX Design</option>
            </select>
          </div>
          
          <div className="flex text-sm font-medium text-slate-500 bg-slate-100 p-1 rounded-lg">
            <button className="px-3 py-1.5 rounded-md bg-white text-slate-900 shadow-sm">Tất cả (42)</button>
            <button className="px-3 py-1.5 rounded-md hover:text-slate-900">Đã xuất bản (35)</button>
            <button className="px-3 py-1.5 rounded-md hover:text-slate-900">Bản nháp (5)</button>
          </div>
        </CardContent>
      </Card>

      {/* Courses Table */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="py-4 font-semibold text-slate-700 w-[400px]">Thông tin khóa học</TableHead>
                <TableHead className="py-4 font-semibold text-slate-700">Giá bán</TableHead>
                <TableHead className="py-4 font-semibold text-slate-700">Trạng thái</TableHead>
                <TableHead className="py-4 font-semibold text-slate-700 text-center">Học viên</TableHead>
                <TableHead className="py-4 font-semibold text-slate-700 text-center">Đánh giá</TableHead>
                <TableHead className="py-4 font-semibold text-slate-700 text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {COURSES_DATA.map((course) => (
                <TableRow key={course.id} className="hover:bg-slate-50/50">
                  <TableCell>
                    <div className="flex gap-4 items-center">
                      <div className="w-20 h-14 rounded-md overflow-hidden shrink-0 border border-slate-200">
                        <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 line-clamp-1 truncate" title={course.title}>{course.title}</span>
                        <span className="text-xs text-slate-500 mt-1">Gv: {course.instructor}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-slate-900">{course.price}</span>
                  </TableCell>
                  <TableCell>
                    {course.status === "published" && <span className="inline-flex items-center gap-1.5 text-xs text-green-600 font-bold bg-green-50 px-2.5 py-1 rounded-full border border-green-200"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Đang bán</span>}
                    {course.status === "draft" && <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-bold bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200"><div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div> Bản nháp</span>}
                    {course.status === "archived" && <span className="inline-flex items-center gap-1.5 text-xs text-amber-600 font-bold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200"><div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div> Tạm ẩn</span>}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center gap-1 font-bold text-slate-700">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      {course.students.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center gap-1 font-bold text-slate-700">
                      <Star className={`w-3.5 h-3.5 ${course.rating > 0 ? 'text-yellow-500 fill-yellow-500' : 'text-slate-300'}`} />
                      {course.rating > 0 ? course.rating : "--"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end items-center gap-2">
                      <Button variant="outline" size="sm" className="h-8 font-medium">Chi tiết</Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
          <div>Hiển thị <span className="font-bold text-slate-900">1-4</span> trong số <span className="font-bold text-slate-900">42</span> khóa học</div>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" className="h-8" disabled>Trước</Button>
            <Button variant="outline" size="sm" className="h-8 bg-primary text-white border-primary hover:bg-primary/90 hover:text-white">1</Button>
            <Button variant="outline" size="sm" className="h-8">2</Button>
            <Button variant="outline" size="sm" className="h-8">3</Button>
            <Button variant="outline" size="sm" className="h-8">Sau</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
