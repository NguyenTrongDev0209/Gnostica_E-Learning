import React from "react";
import {
    Users,
    BookOpen,
    ShoppingCart,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function StatsGrid({ stats }) {
    const dynamicStats = [
        {
            title: "Tổng Doanh Thu",
            value: `${(stats?.totalRevenue || 0).toLocaleString()}đ`,
            trend: stats?.revenueTrend ? `+${stats.revenueTrend}%` : "+0%",
            isPositive: true,
            icon: TrendingUp,
            color: "text-blue-600 bg-blue-50 border-blue-100"
        },
        {
            title: "Học Viên Mới",
            value: (stats?.newStudents || 0).toLocaleString(),
            trend: stats?.studentTrend ? `+${stats.studentTrend}%` : "+0%",
            isPositive: true,
            icon: Users,
            color: "text-green-600 bg-green-50 border-green-100"
        },
        {
            title: "Khóa Học Đang Bán",
            value: (stats?.activeCourses || 0).toLocaleString(),
            trend: stats?.courseTrend ? `+${stats.courseTrend}%` : "0%",
            isPositive: true,
            icon: BookOpen,
            color: "text-orange-600 bg-orange-50 border-orange-100"
        },
        {
            title: "Đơn Hàng Hôm Nay",
            value: (stats?.todayOrders || 0).toLocaleString(),
            trend: stats?.orderTrend ? `${stats.orderTrend}%` : "0%",
            isPositive: stats?.orderTrend >= 0,
            icon: ShoppingCart,
            color: "text-purple-600 bg-purple-50 border-purple-100"
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {dynamicStats.map((stat, i) => {
                const Icon = stat.icon;
                return (
                    <Card key={i} className="border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
                        <CardContent className="p-5 flex flex-col gap-4">
                            <div className="flex justify-between items-start">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${stat.color}`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${stat.isPositive ? 'text-green-700 bg-green-50/80 border border-green-100' : 'text-red-700 bg-red-50/80 border border-red-100'}`}>
                                    {stat.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                    {stat.trend}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-slate-500 mb-1.5">{stat.title}</h3>
                                <div className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
