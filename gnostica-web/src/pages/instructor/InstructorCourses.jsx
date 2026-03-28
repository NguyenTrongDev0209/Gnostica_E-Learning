import React from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Star,
  Users,
  PlayCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const MY_COURSES = [
  { 
    id: "CRS-001", 
    title: "Fullstack Next.js Masterclass", 
    price: "899.000đ", 
    status: "published", 
    students: 1245, 
    rating: 4.9,
    lessons: 124,
    revenue: "15.000.000đ",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=200&auto=format&fit=crop"
  },
  { 
    id: "CRS-005", 
    title: "React Native cho người mới bắt đầu", 
    price: "499.000đ", 
    status: "published", 
    students: 512, 
    rating: 4.7,
    lessons: 86,
    revenue: "4.500.000đ",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=200&auto=format&fit=crop"
  },
  { 
    id: "CRS-008", 
    title: "Tailwind CSS Thực chiến", 
    price: "599.000đ", 
    status: "draft", 
    students: 0, 
    rating: 0,
    lessons: 45,
    revenue: "0đ",
    image: "https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?q=80&w=200&auto=format&fit=crop"
  },
  { 
    id: "CRS-012", 
    title: "Figma UI/UX Design Basics", 
    price: "1.299.000đ", 
    status: "reviewing", 
    students: 0, 
    rating: 0,
    lessons: 60,
    revenue: "0đ",
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=200&auto=format&fit=crop"
  },
];

export default function InstructorCourses() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Khóa Học Của Tôi</h1>
          <p className="text-sm text-slate-500 mt-1">
            Quản lý, chỉnh sửa và theo dõi hiệu suất các khóa học bạn đang giảng dạy.
          </p>
        </div>
        <Button className="font-bold flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white shadow-none">
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
                className="pl-9 h-10 border-slate-200 focus:bg-white focus:border-green-500 focus:ring-green-500/20"
              />
            </div>
            <select className="h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:border-green-500">
              <option>Tất cả danh mục</option>
              <option>Web Development</option>
              <option>Mobile App</option>
              <option>UI/UX Design</option>
            </select>
          </div>
          
          <div className="flex text-sm font-medium text-slate-500 bg-slate-100 p-1 rounded-lg">
            <button className="px-3 py-1.5 rounded-md bg-white text-slate-900 shadow-sm">Tất cả (4)</button>
            <button className="px-3 py-1.5 rounded-md hover:text-slate-900">Đã xuất bản (2)</button>
            <button className="px-3 py-1.5 rounded-md hover:text-slate-900">Chờ duyệt (1)</button>
            <button className="px-3 py-1.5 rounded-md hover:text-slate-900">Bản nháp (1)</button>
          </div>
        </CardContent>
      </Card>

      {/* Courses Table */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="py-4 font-semibold text-slate-700 w-[400px]">Khóa học</TableHead>
                <TableHead className="py-4 font-semibold text-slate-700">Giá & Trạng thái</TableHead>
                <TableHead className="py-4 font-semibold text-slate-700 text-center">Nội dung</TableHead>
                <TableHead className="py-4 font-semibold text-slate-700 text-center">Thống kê</TableHead>
                <TableHead className="py-4 font-semibold text-slate-700 text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MY_COURSES.map((course) => (
                <TableRow key={course.id} className="hover:bg-slate-50/50">
                  <TableCell>
                    <div className="flex gap-4 items-center">
                      <div className="w-24 h-16 rounded-md overflow-hidden shrink-0 border border-slate-200">
                        <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 line-clamp-2" title={course.title}>{course.title}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1.5">
                      <span className="font-black text-slate-900">{course.price}</span>
                      {course.status === "published" && <span className="inline-flex items-center gap-1.5 text-xs text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-md w-fit border border-green-200"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Đang bán</span>}
                      {course.status === "draft" && <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-bold bg-slate-100 px-2 py-0.5 rounded-md w-fit border border-slate-200"><div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div> Bản nháp</span>}
                      {course.status === "reviewing" && <span className="inline-flex items-center gap-1.5 text-xs text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-md w-fit border border-amber-200"><div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div> Chờ duyệt</span>}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center gap-1 font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md text-xs border border-slate-200">
                      <PlayCircle className="w-3.5 h-3.5 text-slate-500" />
                      {course.lessons} bài học
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-4 text-xs font-bold text-slate-700">
                      <div className="flex flex-col items-center gap-1 bg-slate-50 p-1.5 rounded-md border border-slate-100 min-w-[50px]">
                        <Users className="w-3.5 h-3.5 text-blue-500" />
                        {course.students}
                      </div>
                      <div className="flex flex-col items-center gap-1 bg-slate-50 p-1.5 rounded-md border border-slate-100 min-w-[50px]">
                        <Star className={`w-3.5 h-3.5 ${course.rating > 0 ? 'text-amber-500 mb-[1px]' : 'text-slate-300'}`} />
                        {course.rating > 0 ? course.rating : "--"}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end items-center gap-2">
                      <Button variant="outline" size="sm" className="h-8 font-medium border-slate-200">Chỉnh sửa</Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900 bg-slate-50 hover:bg-slate-200">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
