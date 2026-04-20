import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from "@/components/ui/chart";
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    CartesianGrid,
    XAxis,
    YAxis,
} from "recharts";

const revenueConfig = {
    revenue: { label: "Doanh thu (đ)", color: "hsl(221, 83%, 53%)" },
    orders: { label: "Đơn hàng", color: "hsl(142, 71%, 45%)" },
};

export default function RevenueCharts({ revenueData }) {
    return (
        <div className="grid grid-cols-1 xl:grid-cols-1 gap-6 pb-2">
            <Card className="border-slate-200 shadow-sm flex flex-col">
                <CardHeader className="pb-2 border-b border-slate-100">
                    <CardTitle className="text-lg font-bold text-slate-900">Doanh Thu & Đơn Hàng</CardTitle>
                    <CardDescription>Biến động doanh thu theo từng tháng trong năm</CardDescription>
                </CardHeader>
                <CardContent className="pt-4 flex-1">
                    <ChartContainer config={revenueConfig} className="h-[300px] w-full">
                        <AreaChart data={revenueData} margin={{ left: 8, right: 8, top: 4, bottom: 0 }}>
                            <defs>
                                <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0.25} />
                                    <stop offset="95%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="orderGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                            <YAxis yAxisId="left" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                            <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <ChartLegend content={<ChartLegendContent />} />
                            <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="hsl(221, 83%, 53%)" strokeWidth={2} fill="url(#revGradient)" dot={false} />
                            <Area yAxisId="right" type="monotone" dataKey="orders" stroke="hsl(142, 71%, 45%)" strokeWidth={2} fill="url(#orderGradient)" dot={false} />
                        </AreaChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    );
}
