import React, { useState } from "react";
import { Plus, Search, Edit, Trash2, FolderOpen, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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

const CATEGORIES_DATA = [
  {
    id: "CAT-001",
    name: "Lập trình Web",
    slug: "lap-trinh-web",
    icon: "🌐",
    courses: 18,
    status: "active",
    subcategories: ["HTML & CSS", "JavaScript", "React", "Next.js", "Vue.js"],
  },
  {
    id: "CAT-002",
    name: "Lập trình Mobile",
    slug: "lap-trinh-mobile",
    icon: "📱",
    courses: 9,
    status: "active",
    subcategories: ["React Native", "Flutter", "iOS Swift", "Android"],
  },
  {
    id: "CAT-003",
    name: "UI/UX Design",
    slug: "ui-ux-design",
    icon: "🎨",
    courses: 7,
    status: "active",
    subcategories: ["Figma", "Adobe XD", "Design System"],
  },
  {
    id: "CAT-004",
    name: "Data Science & AI",
    slug: "data-science-ai",
    icon: "🤖",
    courses: 5,
    status: "active",
    subcategories: ["Python", "Machine Learning", "Deep Learning"],
  },
  {
    id: "CAT-005",
    name: "DevOps & Cloud",
    slug: "devops-cloud",
    icon: "☁️",
    courses: 3,
    status: "inactive",
    subcategories: ["Docker", "Kubernetes", "AWS", "CI/CD"],
  },
];

export default function AdminCategories() {
  const [expanded, setExpanded] = useState(null);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quản Lý Danh Mục</h1>
          <p className="text-sm text-slate-500 mt-1">
            Thêm mới, chỉnh sửa và sắp xếp danh mục khóa học.
          </p>
        </div>
        <Button className="font-bold flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Thêm Danh Mục
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Tổng danh mục", value: "5", color: "bg-blue-50 border-blue-100 text-blue-700" },
          { label: "Đang hoạt động", value: "4", color: "bg-green-50 border-green-100 text-green-700" },
          { label: "Tạm ẩn", value: "1", color: "bg-slate-50 border-slate-200 text-slate-600" },
          { label: "Tổng khóa học", value: "42", color: "bg-orange-50 border-orange-100 text-orange-700" },
        ].map((item, i) => (
          <Card key={i} className={`border shadow-sm ${item.color}`}>
            <CardContent className="p-4">
              <p className="text-xs font-medium opacity-70">{item.label}</p>
              <p className="text-2xl font-black mt-1">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Tìm danh mục..."
              className="pl-9 h-10 border-slate-200 focus:bg-white"
            />
          </div>
          <div className="flex text-sm font-medium text-slate-500 bg-slate-100 p-1 rounded-lg">
            <button className="px-3 py-1.5 rounded-md bg-white text-slate-900 shadow-sm">Tất cả (5)</button>
            <button className="px-3 py-1.5 rounded-md hover:text-slate-900">Đang hoạt động (4)</button>
            <button className="px-3 py-1.5 rounded-md hover:text-slate-900">Tạm ẩn (1)</button>
          </div>
        </CardContent>
      </Card>

      {/* Categories Table */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="py-4 font-semibold text-slate-700 w-8" />
                <TableHead className="py-4 font-semibold text-slate-700">Danh mục</TableHead>
                <TableHead className="py-4 font-semibold text-slate-700">Slug</TableHead>
                <TableHead className="py-4 font-semibold text-slate-700">Danh mục con</TableHead>
                <TableHead className="py-4 font-semibold text-slate-700 text-center">Khóa học</TableHead>
                <TableHead className="py-4 font-semibold text-slate-700">Trạng thái</TableHead>
                <TableHead className="py-4 font-semibold text-slate-700 text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {CATEGORIES_DATA.map((cat) => (
                <>
                  <TableRow
                    key={cat.id}
                    className="hover:bg-slate-50/50 cursor-pointer"
                    onClick={() => setExpanded(expanded === cat.id ? null : cat.id)}
                  >
                    <TableCell className="w-8 pl-4">
                      <ChevronRight
                        className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${expanded === cat.id ? "rotate-90" : ""}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{cat.icon}</span>
                        <div>
                          <p className="font-bold text-slate-900">{cat.name}</p>
                          <p className="text-xs text-slate-500">{cat.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 font-mono">
                        {cat.slug}
                      </code>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-600">{cat.subcategories.length} danh mục con</span>
                    </TableCell>
                    <TableCell className="text-center font-bold text-slate-900">{cat.courses}</TableCell>
                    <TableCell>
                      {cat.status === "active"
                        ? <span className="inline-flex items-center gap-1.5 text-sm text-green-600 font-medium"><span className="w-2 h-2 rounded-full bg-green-500" /> Hoạt động</span>
                        : <span className="inline-flex items-center gap-1.5 text-sm text-slate-500 font-medium"><span className="w-2 h-2 rounded-full bg-slate-400" /> Tạm ẩn</span>
                      }
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* Subcategories expanded row */}
                  {expanded === cat.id && (
                    <TableRow key={`${cat.id}-sub`} className="bg-slate-50/70">
                      <TableCell />
                      <TableCell colSpan={6} className="py-3 pl-12">
                        <div className="flex flex-wrap gap-2">
                          {cat.subcategories.map((sub, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="text-slate-600 border-slate-200 font-medium bg-white gap-1.5 cursor-pointer hover:border-primary hover:text-primary transition-colors"
                            >
                              <FolderOpen className="w-3 h-3" />
                              {sub}
                            </Badge>
                          ))}
                          <Button variant="ghost" size="sm" className="h-7 text-xs text-primary gap-1 px-2">
                            <Plus className="w-3 h-3" /> Thêm
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
