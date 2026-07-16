import React from "react";
import { Link } from "react-router-dom";
import { AppButton } from "@/components/common/micro/AppButton";
import { Loader2, ArrowUpRight, ArrowDownRight, ChevronRight, CheckCircle2, Star } from "lucide-react";
import useInstructorDashboard from "@/hooks/dashboard/useInstructorDashboard";
import AppCard, { AppCardContent, AppCardHeader, AppCardTitle, AppCardDescription } from "@/components/common/micro/AppCard";
import LineChart from "@/components/common/composite/LineChart";
import { ChartDateFilters } from "@/components/common/composite/DataFilter";
import AppPageHeader from "@/components/common/composite/AppPageHeader";
import AppTable from "@/components/common/micro/AppTable";
import AppBadge from "@/components/common/micro/AppBadge";
import AppProgress from "@/components/common/micro/AppProgress";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

function StatsGrid({ stats }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => {
                const Icon = stat.icon;
                return (
                    <AppCard key={i} className="border-border shadow-sm border-b-4 border-b-success/10 hover:border-b-success/50 transition-all hover-lift">
                        <AppCardContent className="p-5 flex flex-col gap-4">
                            <div className="flex justify-between items-start">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${stat.color}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <AppBadge variant={stat.isPositive ? "success" : "error"} soft className="h-6 flex items-center gap-1">
                                    {stat.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                    {stat.trend}
                                </AppBadge>
                            </div>
                            <div>
                                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{stat.title}</h3>
                                <div className="text-2xl font-semibold text-foreground">{stat.value}</div>
                            </div>
                        </AppCardContent>
                    </AppCard>
                );
            })}
        </div>
    );
}

function RevenueChart({ data }) {
    const subtitle = (
        <>
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Tổng doanh thu:</span>
            <span className="text-2xl font-semibold text-foreground">112.800.000đ</span>
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
            xAxisKey="name"
            strokeColor="#16a34a"
            fillColor="#16a34a"
            gradientId="colorRevenue"
            yAxisFormatter={(value) => `${value / 1000000}Tr`}
            tooltipFormatter={(value) => [`${value.toLocaleString()}đ`, "Doanh thu"]}
        />
    );
}

function RatingDistribution({ data }) {
    return (
        <AppCard className="border-border shadow-sm">
            <AppCardHeader>
                <AppCardTitle className="text-lg font-semibold">Phân Bổ Đánh Giá</AppCardTitle>
                <AppCardDescription>Dựa trên 1,000+ đánh giá mới nhất</AppCardDescription>
            </AppCardHeader>
            <AppCardContent className="h-[300px] w-full pt-0 flex flex-col">
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
            </AppCardContent>
        </AppCard>
    );
}

function StudentGrowthChart({ data, onFilterChange }) {
    const subtitle = (
        <>
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Tổng học viên:</span>
            <span className="text-2xl font-semibold text-foreground">4.330</span>
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
            xAxisKey="name"
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
        <AppCard className="border-border shadow-sm flex flex-col">
            <AppCardHeader className="pb-3 border-b border-border">
                <div className="flex items-center justify-between">
                    <AppCardTitle className="text-lg font-bold">Việc Cần Làm</AppCardTitle>
                    <AppBadge variant="error" soft>
                        {tasks.reduce((s, t) => s + t.count, 0)} chờ xử lý
                    </AppBadge>
                </div>
            </AppCardHeader>
            <AppCardContent className="p-0 flex-1">
                <div className="flex flex-col divide-y divide-border">
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
                                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </AppCardContent>
            <div className="p-4 border-t border-border mt-auto">
                <Link to="/instructor/courses" className="flex items-center justify-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Xem tất cả nhiệm vụ
                </Link>
            </div>
        </AppCard>
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
      <AppPageHeader 
        title="Tổng Quan Giảng Viên"
        description="Theo dõi hiệu suất và tăng trưởng của các khóa học bạn đang giảng dạy."
        actions={
          <div className="flex gap-2">
            <AppButton appVariant="ghostMuted" variant="ghost" className="border border-border">Xuất báo cáo</AppButton>
            <Link to="/instructor/courses/courses-form">
              <AppButton appVariant="gradient" className="bg-success/10 text-success hover:bg-success/20 font-bold">
                Tạo Khóa Học Mới
              </AppButton>
            </Link>
          </div>
        }
      />

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

    </div>
  );
}
