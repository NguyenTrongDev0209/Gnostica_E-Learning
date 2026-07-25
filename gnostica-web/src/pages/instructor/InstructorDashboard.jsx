import React from "react";
import { Link } from "react-router-dom";
import { AppButton } from "@/components/common/micro/AppButton";
import { Loader2, ArrowUpRight, ArrowDownRight, ChevronRight, CheckCircle2, Star, LayoutDashboard, Download, RefreshCw, Book, UserSquare2, CheckCircle, RotateCcw } from "lucide-react";
import useInstructorDashboard from "@/hooks/dashboard/useInstructorDashboard";
import AppCard, { AppCardContent, AppCardHeader, AppCardTitle, AppCardDescription } from "@/components/common/micro/AppCard";
import AppProgress from "@/components/common/micro/AppProgress";
import LineChart from "@/components/common/composite/LineChart";
import { ChartDateFilters } from "@/components/common/composite/DataFilter";
import AppPageHeader from "@/components/common/composite/AppPageHeader";
import AppTable from "@/components/common/micro/AppTable";
import AppBadge from "@/components/common/micro/AppBadge";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import AppSelect from "@/components/common/micro/AppSelect";

function StatsGrid({ stats }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => {
                const Icon = stat.icon;
                const trendValue = stat.trend ? parseFloat(stat.trend.replace(/[^0-9.-]+/g,"")) : 0;
                const progressValue = isNaN(trendValue) ? 0 : Math.min(100, Math.max(5, Math.abs(trendValue) * 4));

                return (
                    <AppCard appVariant="default" key={i} className="bg-card text-card-foreground border-none p-0">
                        <AppCardContent className="p-5 flex flex-col gap-3">
                            <div className="flex justify-between items-start">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${stat.color}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <AppSelect 
                                    value="this-month" 
                                    onValueChange={() => {}}
                                    options={[
                                        { label: "Hôm nay", value: "today" },
                                        { label: "Hôm qua", value: "yesterday" },
                                        { label: "Tháng trước", value: "last-month" },
                                        { label: "Tháng này", value: "this-month" },
                                    ]}
                                    className="!h-8 !py-1 !px-2 bg-transparent border-none shadow-none text-xs font-medium text-muted-foreground hover:bg-muted/50 rounded-md focus:ring-0 w-auto min-w-[100px]"
                                />
                            </div>
                            <div>
                                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{stat.title}</h3>
                                <div className="text-2xl font-semibold text-foreground">{stat.value}</div>
                            </div>
                            
                            <div className="mt-1">
                                <div className="flex justify-end mb-1">
                                    <span className="text-xs font-semibold text-foreground">
                                        {Math.round(progressValue)}%
                                    </span>
                                </div>
                                <AppProgress 
                                    value={progressValue} 
                                    heightClass="h-1.5" 
                                    indicatorClassName={stat.isPositive ? "bg-success" : "bg-error"} 
                                    className="bg-muted"
                                />
                                <div className="flex justify-between items-center mt-1.5">
                                    <span className="text-xs font-medium text-muted-foreground">So với tháng trước</span>
                                    <span className={`text-xs font-bold flex items-center gap-0.5 ${stat.isPositive ? 'text-success' : 'text-error'}`}>
                                        {stat.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                        {stat.trend}
                                    </span>
                                </div>
                            </div>
                        </AppCardContent>
                    </AppCard>
                );
            })}
        </div>
    );
}

function InstructorOverview({ stats }) {
    // Thống kê mẫu vì trong hook chưa có dữ liệu thật
    const data = [
        { title: "Khóa học", value: stats?.totalCourses || 15, icon: Book, subtitle: "Tổng khóa học của bạn", color: "bg-info" },
        { title: "Học viên", value: stats?.uniqueStudents || 1250, icon: UserSquare2, subtitle: "Tổng học viên duy nhất", color: "bg-success" },
        { title: "Hoàn thành", value: `${stats?.completionRate || 68}%`, icon: CheckCircle, subtitle: "Tỷ lệ hoàn thành khóa học", color: "bg-primary" },
        { title: "Hoàn tiền", value: `${stats?.refundRate || 1.2}%`, icon: RotateCcw, subtitle: "Tỷ lệ yêu cầu hoàn tiền", color: "bg-error" },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {data.map((item, index) => {
                const Icon = item.icon;
                return (
                    <AppCard key={index} className="border-none shadow-sm bg-card hover:shadow-md transition-shadow">
                        <AppCardContent className="p-4 flex flex-col gap-2">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 text-white rounded-md flex items-center justify-center ${item.color}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground uppercase">{item.title}</p>
                                    <h4 className="text-xl font-bold text-foreground">{item.toLocaleString ? item.value.toLocaleString() : item.value}</h4>
                                </div>
                            </div>
                            <p className="text-[11px] text-muted-foreground">{item.subtitle}</p>
                        </AppCardContent>
                    </AppCard>
                )
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
      {/* Banner Section */}
      <div className="bg-success text-success-foreground rounded-3xl p-6 md:p-8 mb-8 relative overflow-hidden shadow-lg">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 bg-noise opacity-20 mix-blend-overlay pointer-events-none"></div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col gap-8">
          {/* Top Section */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                  Tổng quan <span className="text-gradient-button drop-shadow-sm opacity-90">Giảng viên</span>
                </h1>
                <AppBadge variant="secondary" className="bg-success-foreground/20 text-success-foreground hover:bg-success-foreground/30 border-none font-medium backdrop-blur-sm shadow-none">
                  {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </AppBadge>
              </div>
              <p className="text-success-foreground/90 text-sm md:text-base max-w-xl">
                Theo dõi hiệu suất và tăng trưởng của các khóa học bạn đang giảng dạy.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <AppButton appVariant="default" className="bg-success-foreground text-success hover:bg-success-foreground/90 font-bold shadow-sm" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Đồng bộ
              </AppButton>
              <AppButton appVariant="default" className="bg-success-foreground text-success hover:bg-success-foreground/90 font-bold shadow-sm" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Xuất báo cáo
              </AppButton>
            </div>
          </div>

          {/* Stats Grid inside Banner */}
          <StatsGrid stats={STATS} />
        </div>
      </div>

      <InstructorOverview stats={data} />

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
