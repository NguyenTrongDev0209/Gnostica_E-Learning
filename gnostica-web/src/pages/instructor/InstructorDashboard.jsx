import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { AppButton } from "@/components/common/micro/AppButton";
import {
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  CheckCircle2,
  Star,
  Download,
  RefreshCw,
  Book,
  UserSquare2,
  CheckCircle,
  RotateCcw,
  AlertCircle
} from "lucide-react";
import useInstructorDashboard from "@/hooks/dashboard/useInstructorDashboard";
import AppCard, { AppCardContent, AppCardHeader, AppCardTitle, AppCardDescription } from "@/components/common/micro/AppCard";
import AppProgress from "@/components/common/micro/AppProgress";
import LineChart from "@/components/common/composite/LineChart";
import { ChartDateFilters } from "@/components/common/composite/DataFilter";
import DataTable from "@/components/common/composite/DataTable";
import AppBadge from "@/components/common/micro/AppBadge";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

function StatsGrid({ stats }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => {
                const Icon = stat.icon;

                return (
                    <AppCard appVariant="default" key={i} className="bg-card text-card-foreground border-none p-0">
                        <AppCardContent className="p-5 flex flex-col gap-3">
                            <div className="flex justify-between items-start">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${stat.color}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                {stat.trend && (
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
                                        stat.isPositive ? 'bg-success/15 text-success' : 'bg-error/15 text-error'
                                    }`}>
                                        {stat.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                        {stat.trend}
                                    </span>
                                )}
                            </div>
                            <div>
                                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{stat.title}</h3>
                                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                                {stat.subtitle && (
                                    <p className="text-xs font-medium text-muted-foreground mt-1.5 line-clamp-1">{stat.subtitle}</p>
                                )}
                            </div>
                        </AppCardContent>
                    </AppCard>
                );
            })}
        </div>
    );
}

function InstructorOverview({ stats }) {
    const data = [
        { title: "Khóa học", value: stats?.totalCourses || 0, icon: Book, subtitle: "Tổng khóa học của bạn", color: "bg-info" },
        { title: "Học viên", value: (stats?.totalStudents || 0).toLocaleString('vi-VN'), icon: UserSquare2, subtitle: "Tổng học viên duy nhất", color: "bg-success" },
        { title: "Hoàn thành", value: `${(stats?.completionRate || 0).toFixed(1)}%`, icon: CheckCircle, subtitle: "Tỷ lệ hoàn thành khóa học", color: "bg-primary" },
        { title: "Hoàn tiền", value: `${(stats?.refundRate || 0).toFixed(1)}%`, icon: RotateCcw, subtitle: "Tỷ lệ đơn hoàn đã duyệt", color: "bg-error" }
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
                );
            })}
        </div>
    );
}

function RevenueChart({ data, totalRevenue, totalNetRevenue, onFilterChange }) {
    const subtitle = (
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <div>
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">Tổng doanh thu</span>
                <span className="text-xl font-bold text-foreground">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalRevenue || 0)}
                </span>
            </div>
            {totalNetRevenue != null && (
                <div className="border-l border-border pl-4">
                    <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">Thu nhập ròng</span>
                    <span className="text-xl font-bold text-primary">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalNetRevenue || 0)}
                    </span>
                </div>
            )}
        </div>
    );

    const handlePresetChange = (value) => {
        const monthsMap = {
            "this-quarter": 3,
            "6-months": 6,
            "this-year": 12
        };
        onFilterChange?.(monthsMap[value] || 6);
    };

    const headerExtra = (
        <ChartDateFilters
            onPresetChange={handlePresetChange}
            defaultPreset="6-months"
        />
    );

    return (
        <LineChart
            title="Thống kê Doanh thu & Thu nhập"
            subtitle={subtitle}
            headerExtra={headerExtra}
            data={data}
            dataKey="revenue"
            secondaryDataKey="netRevenue"
            xAxisKey="month"
            strokeColor="#16a34a"
            fillColor="#16a34a"
            gradientId="colorRevenue"
            secondaryStrokeColor="#3b82f6"
            secondaryFillColor="#3b82f6"
            secondaryGradientId="colorNetRevenue"
            yAxisFormatter={(value) => `${value / 1000000}Tr`}
            tooltipFormatter={(value, name) => [`${Number(value || 0).toLocaleString('vi-VN')}đ`, name]}
        />
    );
}

function RatingDistribution({ data, totalRatings }) {
    return (
        <AppCard className="border-border shadow-sm">
            <AppCardHeader>
                <AppCardTitle className="text-lg font-semibold">Phân Bổ Đánh Giá</AppCardTitle>
                <AppCardDescription>
                    Dựa trên {(totalRatings || 0).toLocaleString('vi-VN')} đánh giá hợp lệ
                </AppCardDescription>
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

function StudentGrowthChart({ data, onFilterChange, totalStudents }) {
    const subtitle = (
        <>
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Tổng học viên:</span>
            <span className="text-2xl font-semibold text-foreground">
                {(totalStudents || 0).toLocaleString('vi-VN')}
            </span>
        </>
    );

    const handlePresetChange = (preset) => {
        const monthsMap = {
            "this-quarter": 3,
            "6-months": 6,
            "this-year": 12
        };
        onFilterChange?.(monthsMap[preset] || 6);
    };

    const headerExtra = (
        <ChartDateFilters
            onPresetChange={handlePresetChange}
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
            xAxisKey="month"
            strokeColor="#3b82f6"
            fillColor="#3b82f6"
            gradientId="colorStudents"
            tooltipFormatter={(value) => [`${value.toLocaleString('vi-VN')} HV`, "Học viên"]}
            height={280}
        />
    );
}

function CoursePerformanceSection({ courses }) {
    const columns = [
        {
            header: "STT",
            className: "w-[60px] text-center",
            cellClassName: "text-center font-sans",
            render: (_, index) => (
                <span className="text-sm font-bold text-muted-foreground">
                    {(index + 1).toString().padStart(2, '0')}
                </span>
            )
        },
        {
            header: "Khóa học",
            className: "min-w-[240px]",
            render: (c) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-foreground line-clamp-1">{c.title}</span>
                    <span className="text-xs text-muted-foreground font-mono">ID: {c.id}</span>
                </div>
            )
        },
        {
            header: "Học viên",
            className: "text-center",
            cellClassName: "text-center font-semibold",
            render: (c) => (c.students || 0).toLocaleString('vi-VN')
        },
        {
            header: "Tiến độ TB",
            className: "w-[180px]",
            render: (c) => (
                <div className="flex items-center gap-2">
                    <AppProgress value={Math.round(c.avgProgress || 0)} className="h-2 flex-1" />
                    <span className="text-xs font-semibold text-muted-foreground w-9 text-right">
                        {Math.round(c.avgProgress || 0)}%
                    </span>
                </div>
            )
        },
        {
            header: "Hoàn thành",
            className: "text-center",
            cellClassName: "text-center font-semibold text-foreground",
            render: (c) => `${(c.completed || 0).toFixed(1)}%`
        },
        {
            header: "Đánh giá",
            className: "text-center",
            cellClassName: "text-center",
            render: (c) => (
                <div className="inline-flex items-center gap-1 font-semibold text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{(c.rating || 0).toFixed(1)}</span>
                </div>
            )
        },
        {
            header: "Trạng thái",
            className: "text-center",
            cellClassName: "text-center",
            render: (c) => {
                const map = {
                    active: { label: "Đang mở", variant: "success" },
                    pending: { label: "Chờ duyệt", variant: "warning" },
                    rejected: { label: "Từ chối", variant: "error" },
                    draft: { label: "Bản nháp", variant: "secondary" }
                };
                const conf = map[c.status] || map.draft;
                return <AppBadge variant={conf.variant} soft className="text-xs">{conf.label}</AppBadge>;
            }
        }
    ];

    return (
        <AppCard className="border-border shadow-sm">
            <AppCardHeader className="pb-3 border-b border-border flex flex-row items-center justify-between">
                <div>
                    <AppCardTitle className="text-lg font-bold">Hiệu Suất Khóa Học</AppCardTitle>
                    <AppCardDescription>Tổng quan tiến độ và đánh giá theo từng khóa học của bạn</AppCardDescription>
                </div>
                <Link to="/instructor/courses" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                    Quản lý khóa học <ChevronRight className="w-3.5 h-3.5" />
                </Link>
            </AppCardHeader>
            <AppCardContent className="p-0">
                <DataTable
                    columns={columns}
                    data={courses}
                    emptyState="Chưa có dữ liệu hiệu suất khóa học."
                />
            </AppCardContent>
        </AppCard>
    );
}

export default function InstructorDashboard() {
  const {
    data,
    loading,
    error,
    refetch,
    setRevenueMonths,
    setGrowthMonths
  } = useInstructorDashboard();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleSync = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast.success("Đã đồng bộ dữ liệu thống kê mới nhất!");
    } catch {
      toast.error("Không thể đồng bộ dữ liệu. Vui lòng thử lại!");
    } finally {
      setIsRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <AppCard className="max-w-md p-6 text-center border-error/20 bg-card shadow-sm">
          <AlertCircle className="w-10 h-10 text-error mx-auto mb-2" />
          <h3 className="text-lg font-bold text-foreground">Không thể tải dữ liệu Dashboard</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Đã xảy ra sự cố khi kết nối máy chủ. Vui lòng thử lại.
          </p>
          <AppButton onClick={() => refetch()} className="btn-md bg-primary text-white">
            <RefreshCw className="w-4 h-4 mr-2" />
            Thử lại
          </AppButton>
        </AppCard>
      </div>
    );
  }

  if (!data) return null;

  const {
    REVENUE_DATA,
    STUDENT_GROWTH_DATA,
    RATING_DISTRIBUTION,
    COURSE_PERFORMANCE,
    STATS,
    RAW_STATS
  } = data;

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
              <AppButton
                onClick={handleSync}
                disabled={isRefreshing}
                appVariant="default"
                className="bg-success-foreground text-success hover:bg-success-foreground/90 font-bold shadow-sm"
                size="sm"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Đang đồng bộ...' : 'Đồng bộ'}
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

      <InstructorOverview stats={RAW_STATS} />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Area Chart */}
        <RevenueChart
          data={REVENUE_DATA}
          totalRevenue={RAW_STATS?.totalRevenue ?? RAW_STATS?.monthRevenue}
          totalNetRevenue={RAW_STATS?.totalNetRevenue ?? RAW_STATS?.monthNetRevenue}
          onFilterChange={(m) => setRevenueMonths(m)}
        />

        {/* Rating Distribution */}
        <RatingDistribution
          data={RATING_DISTRIBUTION}
          totalRatings={RAW_STATS?.ratingCount}
        />
      </div>

      {/* Student Growth Chart */}
      <div className="grid grid-cols-1 gap-6">
        <StudentGrowthChart
          data={STUDENT_GROWTH_DATA}
          totalStudents={RAW_STATS?.totalStudents}
          onFilterChange={(m) => setGrowthMonths(m)}
        />
      </div>

      {/* Course Performance Table */}
      <div className="grid grid-cols-1 gap-6">
        <CoursePerformanceSection courses={COURSE_PERFORMANCE} />
      </div>

    </div>
  );
}
