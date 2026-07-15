import React from "react";
import { Link } from "react-router-dom";
import { AppButton } from "@/components/common/micro/AppButton";
import { Loader2, ArrowUpRight, ArrowDownRight, ChevronRight, CheckCircle2, Star } from "lucide-react";
import useInstructorDashboard from "@/hooks/dashboard/useInstructorDashboard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import LineChart from "@/components/common/composite/LineChart";
import ChartDateFilters from "@/components/common/composite/ChartDateFilters";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

function StatsGrid({ stats }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => {
                const Icon = stat.icon;
                return (
                    <Card key={i} className="border-border shadow-sm border-b-4 border-b-green-500/10 hover:border-b-green-500/50 transition-all">
                        <CardContent className="p-5 flex flex-col gap-4">
                            <div className="flex justify-between items-start">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${stat.color}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className={`flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-full border ${stat.isPositive ? 'text-success bg-green-50 border-success/20' : 'text-error bg-red-50 border-error/20'}`}>
                                    {stat.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                    {stat.trend}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">{stat.title}</h3>
                                <div className="text-2xl font-black text-foreground">{stat.value}</div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}

function RevenueChart({ data }) {
    const subtitle = (
        <>
            <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Tổng doanh thu:</span>
            <span className="text-2xl font-bold text-foreground">112.800.000đ</span>
        </>
    );

    const handleDateChange = (type, value) => {
        console.log(`Date ${type} changed to:`, value);
    };

    const handlePresetChange = (value) => {
        console.log("Preset changed to:", value);
    };

    const headerExtra = (
        <ChartDateFilters
            onDateChange={handleDateChange}
            onPresetChange={handlePresetChange}
        />
    );

    return (
        <LineChart
            title="Thống kê Doanh thu"
            subtitle={subtitle}
            headerExtra={headerExtra}
            data={data}
            dataKey="revenue"
            strokeColor="#16a34a"
            fillColor="#166534"
            gradientId="colorRevenue"
            yAxisFormatter={(value) => `${value / 1000000}Tr`}
            tooltipFormatter={(value) => [`${value.toLocaleString()}đ`, "Doanh thu"]}
        />
    );
}

function RatingDistribution({ data }) {
    return (
        <Card className="border-border shadow-sm">
            <CardHeader>
                <CardTitle className="text-lg font-bold">Phân Bổ Đánh Giá</CardTitle>
                <CardDescription>Dựa trên 1,000+ đánh giá mới nhất</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] w-full pt-0 flex flex-col">
                <ResponsiveContainer width="100%" height="70%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
                    {data.map((item, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                            <span className="text-[11px] font-bold text-muted-foreground">{item.name}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

function StudentGrowthChart({ data, onFilterChange }) {
    const subtitle = (
        <>
            <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Tổng học viên:</span>
            <span className="text-2xl font-bold text-foreground">4.330</span>
        </>
    );

    const headerExtra = (
        <ChartDateFilters
            onDateChange={(type, value) => onFilterChange?.({ type: 'date', dateType: type, value })}
            onPresetChange={(preset) => onFilterChange?.({ type: 'preset', value: preset })}
            defaultPreset="6-months"
        />
    );

    return (
        <LineChart
            title="Tăng trưởng Học Viên"
            subtitle={subtitle}
            headerExtra={headerExtra}
            data={data}
            dataKey="students"
            strokeColor="#3b82f6"
            fillColor="#3b82f6"
            gradientId="colorStudents"
            tooltipFormatter={(value) => [`${value.toLocaleString()} HV`, "Học viên"]}
            height={280}
        />
    );
}

function PendingTasks({ tasks }) {
    return (
        <Card className="border-border shadow-sm flex flex-col">
            <CardHeader className="pb-3 border-b border-border">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold">Việc Cần Làm</CardTitle>
                    <span className="text-[10px] font-black text-white bg-error/10 text-error px-2 py-0.5 rounded-full">
                        {tasks.reduce((s, t) => s + t.count, 0)} chờ xử lý
                    </span>
                </div>
            </CardHeader>
            <CardContent className="p-0 flex-1">
                <div className="flex flex-col divide-y divide-slate-100">
                    {tasks.map((task) => {
                        const Icon = task.icon;
                        return (
                            <Link key={task.id} to={task.href} className="flex items-center gap-3 px-5 py-4 hover:bg-muted transition-colors group">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${task.color}`}>
                                    <Icon className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-foreground group-hover:text-foreground truncate">{task.label}</p>
                                    {task.urgent && (
                                        <p className="text-[10px] font-bold text-error uppercase tracking-wide">Cần xử lý ngay</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <span className={`text-sm font-black ${task.urgent ? 'text-error' : 'text-muted-foreground'}`}>{task.count}</span>
                                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-muted-foreground transition-colors" />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </CardContent>
            <div className="p-4 border-t border-border mt-auto">
                <Link to="/instructor/courses" className="flex items-center justify-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Xem tất cả nhiệm vụ
                </Link>
            </div>
        </Card>
    );
}

function CoursePerformanceTable({ courses }) {
    return (
        <Card className="border-border shadow-sm">
            <CardHeader className="pb-4 border-b border-border">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg font-bold">Hiệu Suất Học Viên</CardTitle>
                        <CardDescription>Tỷ lệ hoàn thành và tiến độ trung bình theo từng khóa học</CardDescription>
                    </div>
                    <Link to="/instructor/courses" className="text-xs text-success font-bold hover:underline px-3 py-1.5 bg-green-50 rounded-lg">
                        Quản lý khóa học
                    </Link>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-muted/70">
                                <th className="text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest px-5 py-3">Khóa học</th>
                                <th className="text-center text-[10px] font-black text-muted-foreground uppercase tracking-widest px-4 py-3">Học viên</th>
                                <th className="text-center text-[10px] font-black text-muted-foreground uppercase tracking-widest px-4 py-3">Hoàn thành</th>
                                <th className="text-center text-[10px] font-black text-muted-foreground uppercase tracking-widest px-4 py-3 hidden md:table-cell">Tiến độ TB</th>
                                <th className="text-center text-[10px] font-black text-muted-foreground uppercase tracking-widest px-4 py-3 hidden lg:table-cell">Đánh giá</th>
                                <th className="text-center text-[10px] font-black text-muted-foreground uppercase tracking-widest px-4 py-3">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {courses.map((course) => (
                                <tr key={course.id} className="border-t border-border hover:bg-muted transition-colors">
                                    <td className="px-5 py-4">
                                        <p className="text-sm font-bold text-foreground line-clamp-1">{course.title}</p>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <span className="text-sm font-bold text-foreground">{course.students.toLocaleString()}</span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex flex-col items-center gap-1.5">
                                            <span className="text-sm font-black text-foreground">{course.completed}%</span>
                                            <div className="w-24 h-1.5 bg-secondary rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-500"
                                                    style={{ width: `${course.completed}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-center hidden md:table-cell">
                                        <div className="flex flex-col items-center gap-1.5">
                                            <span className="text-sm font-black text-foreground">{course.avgProgress}%</span>
                                            <div className="w-24 h-1.5 bg-secondary rounded-full overflow-hidden">
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
                                            <span className="text-sm font-black text-foreground">{course.rating}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide ${course.status === 'active'
                                            ? 'text-success bg-green-50 border border-success/20'
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

export default function InstructorDashboard() {
  const { data, loading } = useInstructorDashboard();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) return null;

  const { REVENUE_DATA, STUDENT_GROWTH_DATA, RATING_DISTRIBUTION, COURSE_PERFORMANCE, PENDING_TASKS, STATS } = data;

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Tổng Quan Giảng Viên</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Theo dõi hiệu suất và tăng trưởng của các khóa học bạn đang giảng dạy.
          </p>
        </div>
        <div className="flex gap-2">
          <AppButton appVariant="ghostMuted" variant="ghost" className="border border-border">Xuất báo cáo</AppButton>
          <Link to="/instructor/courses/courses-form">
            <AppButton appVariant="gradient" className="bg-success/10 text-success hover:bg-success/20 font-bold">
              Tạo Khóa Học Mới
            </AppButton>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <StatsGrid stats={STATS} />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Area Chart */}
        <RevenueChart data={REVENUE_DATA} />

        {/* Rating Distribution */}
        <RatingDistribution data={RATING_DISTRIBUTION} />
      </div>

      {/* Student Growth Chart (Pending Tasks hidden for now) */}
      <div className="grid grid-cols-1 gap-6">
        <StudentGrowthChart data={STUDENT_GROWTH_DATA} />
      </div>

      {/* Student Performance Table */}
      <CoursePerformanceTable courses={COURSE_PERFORMANCE} />

    </div>
  );
}
