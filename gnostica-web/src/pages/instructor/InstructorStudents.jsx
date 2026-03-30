import React from "react";
import { 
  Plus, 
  Search, 
  Users, 
  Mail, 
  MoreHorizontal, 
  Download,
  Filter,
  CheckCircle2,
  Clock,
  ArrowUpDown,
  Activity
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

const MOCK_STUDENTS = [
  {
    id: "STU-001",
    name: "Lê Văn Minh",
    email: "minhle.dev@gmail.com",
    course: "Fullstack Next.js Masterclass",
    progress: 85,
    joinedDate: "12/03/2026",
    lastActive: "2 giờ trước",
    status: "active",
    avatar: "https://i.pravatar.cc/150?u=stu1"
  },
  {
    id: "STU-002",
    name: "Trần Thế Quang",
    email: "quangtran99@yahoo.com",
    course: "React Native cho người mới",
    progress: 42,
    joinedDate: "15/03/2026",
    lastActive: "5 giờ trước",
    status: "active",
    avatar: "https://i.pravatar.cc/150?u=stu2"
  },
  {
    id: "STU-003",
    name: "Nguyễn Thu Huyền",
    email: "huyenkute@hotmail.com",
    course: "Tailwind CSS Thực chiến",
    progress: 100,
    joinedDate: "05/02/2026",
    lastActive: "1 ngày trước",
    status: "completed",
    avatar: "https://i.pravatar.cc/150?u=stu3"
  },
  {
    id: "STU-004",
    name: "Phạm Anh Khoa",
    email: "khoapham@gmail.com",
    course: "Fullstack Next.js Masterclass",
    progress: 12,
    joinedDate: "20/03/2026",
    lastActive: "30 phút trước",
    status: "active",
    avatar: "https://i.pravatar.cc/150?u=stu4"
  },
  {
    id: "STU-005",
    name: "Hoàng Minh Chế",
    email: "chehm@outlook.com",
    course: "Figma UI/UX Design",
    progress: 0,
    joinedDate: "24/03/2026",
    lastActive: "Mới đăng ký",
    status: "inactive",
    avatar: "https://i.pravatar.cc/150?u=stu5"
  }
];

export default function InstructorStudents() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Học Viên Của Tôi</h1>
          <p className="text-sm text-slate-500 mt-1">
            Quản lý và theo dõi tiến độ của học viên trong các khóa học bạn đang giảng dạy.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-slate-200">
            <Download className="w-4 h-4 mr-2" /> Xuất danh sách
          </Button>
          <Button className="bg-green-600 hover:bg-green-700 text-white shadow-none font-bold">
            <Mail className="w-4 h-4 mr-2" /> Gửi thông báo
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Tổng học viên</p>
              <p className="text-xl font-black text-slate-900">8,942</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-600 border border-green-100">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Hoàn thành</p>
              <p className="text-xl font-black text-slate-900">1,245</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Đang tiến hành</p>
              <p className="text-xl font-black text-slate-900">7,180</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-600 border border-slate-200">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Hoạt động mới</p>
              <p className="text-xl font-black text-slate-900">245</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex w-full md:w-auto items-center gap-3">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Tìm kiếm theo tên hoặc email..." 
                className="pl-9 h-10 border-slate-200 focus:bg-white focus:border-green-500"
              />
            </div>
            <select className="h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 font-medium focus:outline-none focus:border-green-500">
              <option>Tất cả khóa học</option>
              {Array.from(new Set(MOCK_STUDENTS.map(s => s.course))).map(course => (
                <option key={course}>{course}</option>
              ))}
            </select>
          </div>
          
          <div className="flex text-sm font-bold text-slate-500 bg-slate-100 p-1 rounded-lg">
            <button className="px-3 py-1.5 rounded-md bg-white text-slate-900 shadow-sm">Tất cả</button>
            <button className="px-3 py-1.5 rounded-md hover:text-slate-900 transition-colors">Đang học</button>
            <button className="px-3 py-1.5 rounded-md hover:text-slate-900 transition-colors">Hoàn thành</button>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="py-4 font-bold text-slate-700">Học viên</TableHead>
                <TableHead className="py-4 font-bold text-slate-700">Khóa học</TableHead>
                <TableHead className="py-4 font-bold text-slate-700">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-slate-900">
                    Tiến độ <ArrowUpDown className="w-3 h-3" />
                  </div>
                </TableHead>
                <TableHead className="py-4 font-bold text-slate-700">Ngày tham gia</TableHead>
                <TableHead className="py-4 font-bold text-slate-700">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_STUDENTS.map((student) => (
                <TableRow key={student.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-200 shrink-0">
                        <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 leading-tight">{student.name}</span>
                        <span className="text-xs text-slate-500">{student.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium text-slate-700">{student.course}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1.5 w-32">
                      <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                        <span>Hoàn thành</span>
                        <span>{student.progress}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${
                            student.progress === 100 ? 'bg-green-500' : 'bg-primary/80'
                          }`}
                          style={{ width: `${student.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-700">{student.joinedDate}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{student.lastActive}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
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

