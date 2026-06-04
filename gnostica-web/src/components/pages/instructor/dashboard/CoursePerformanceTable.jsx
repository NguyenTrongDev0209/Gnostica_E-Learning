import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Star } from "lucide-react";

export default function CoursePerformanceTable({ courses }) {
    return (
        <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-4 border-b border-slate-100">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg font-bold">Hiệu Suất Học Viên</CardTitle>
                        <CardDescription>Tỷ lệ hoàn thành và tiến độ trung bình theo từng khóa học</CardDescription>
                    </div>
                    <Link to="/instructor/courses" className="text-xs text-green-600 font-bold hover:underline px-3 py-1.5 bg-green-50 rounded-lg">
                        Quản lý khóa học
                    </Link>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50/70">
                                <th className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest px-5 py-3">Khóa học</th>
                                <th className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 py-3">Học viên</th>
                                <th className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 py-3">Hoàn thành</th>
                                <th className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 py-3 hidden md:table-cell">Tiến độ TB</th>
                                <th className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 py-3 hidden lg:table-cell">Đánh giá</th>
                                <th className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 py-3">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {courses.map((course, i) => (
                                <tr key={course.id} className="border-t border-slate-100 hover:bg-slate-50/50 transition-colors">
                                    <td className="px-5 py-4">
                                        <p className="text-sm font-bold text-slate-800 line-clamp-1">{course.title}</p>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <span className="text-sm font-bold text-slate-700">{course.students.toLocaleString()}</span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex flex-col items-center gap-1.5">
                                            <span className="text-sm font-black text-slate-800">{course.completed}%</span>
                                            <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-500"
                                                    style={{ width: `${course.completed}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-center hidden md:table-cell">
                                        <div className="flex flex-col items-center gap-1.5">
                                            <span className="text-sm font-black text-slate-800">{course.avgProgress}%</span>
                                            <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full bg-gradient-to-r from-blue-400 to-indigo-500"
                                                    style={{ width: `${course.avgProgress}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-center hidden lg:table-cell">
                                        <div className="flex items-center justify-center gap-1">
                                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                            <span className="text-sm font-black text-slate-700">{course.rating}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide ${course.status === 'active'
                                            ? 'text-green-700 bg-green-50 border border-green-200'
                                            : 'text-amber-700 bg-amber-50 border border-amber-200'
                                            }`}>
                                            {course.status === 'active' ? 'Đang hoạt động' : 'Nháp'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}
