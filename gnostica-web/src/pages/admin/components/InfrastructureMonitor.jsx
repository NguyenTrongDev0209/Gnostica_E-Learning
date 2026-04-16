import React from "react";
import { Server, Activity } from "lucide-react";
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
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
} from "recharts";

const SYSTEM_RESOURCE_DATA = [
    { time: "00:00", cpu: 15, ram: 40 },
    { time: "04:00", cpu: 10, ram: 35 },
    { time: "08:00", cpu: 45, ram: 55 },
    { time: "12:00", cpu: 65, ram: 70 },
    { time: "16:00", cpu: 55, ram: 65 },
    { time: "20:00", cpu: 85, ram: 85 },
    { time: "23:59", cpu: 70, ram: 75 },
];

const resourceConfig = {
    cpu: { label: "CPU Usage (%)", color: "hsl(221, 83%, 53%)" },
    ram: { label: "RAM Usage (%)", color: "hsl(38, 92%, 50%)" },
};

const CCU_DATA = [
    { time: "00:00", active: 240 },
    { time: "04:00", active: 120 },
    { time: "08:00", active: 850 },
    { time: "12:00", active: 1100 },
    { time: "16:00", active: 950 },
    { time: "20:00", active: 2150 },
    { time: "23:59", active: 1540 },
];

const ccuConfig = {
    active: { label: "Concurrent Users (CCU)", color: "hsl(271, 81%, 56%)" },
};

export default function InfrastructureMonitor() {
    return (
        <div className="space-y-4 pt-10">
            <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-slate-800 rounded-full"></span>
                    Giám Sát Cơ Sở Hạ Tầng (Live)
                </h2>
                <p className="text-sm text-slate-500 mt-1 pl-3.5">Quản lý sức khỏe máy chủ và lượng truy cập thực tế</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-2">
                <Card className="lg:col-span-2 border-slate-200 shadow-sm flex flex-col">
                    <CardHeader className="pb-2 border-b border-slate-100 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg font-bold text-slate-900">Tài Nguyên Máy Chủ</CardTitle>
                            <CardDescription>Tiêu thụ CPU và RAM 24h qua</CardDescription>
                        </div>
                        <Server className="w-5 h-5 text-slate-400" />
                    </CardHeader>
                    <CardContent className="pt-4 flex-1">
                        <ChartContainer config={resourceConfig} className="h-[240px] w-full">
                            <AreaChart data={SYSTEM_RESOURCE_DATA} margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="ramGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <ChartLegend content={<ChartLegendContent />} />
                                <Area type="monotone" dataKey="ram" stroke="hsl(38, 92%, 50%)" strokeWidth={2} fill="url(#ramGradient)" />
                                <Area type="monotone" dataKey="cpu" stroke="hsl(221, 83%, 53%)" strokeWidth={2} fill="url(#cpuGradient)" />
                            </AreaChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-1 border-slate-200 shadow-sm flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-100">
                        <CardTitle className="text-lg font-bold text-slate-900">Chi Tiết Hạ Tầng</CardTitle>
                        <Activity className="w-5 h-5 text-slate-400" />
                    </CardHeader>
                    <CardContent className="pt-6 flex-1 flex flex-col gap-6">
                        <div className="space-y-5">
                            {[
                                { label: "CPU Usage Hiện Tại", value: 42, color: "bg-blue-500" },
                                { label: "RAM Usage Hiện Tại", value: 68, color: "bg-amber-500" },
                                { label: "Băng Thông Dùng", value: 55, color: "bg-indigo-500" },
                            ].map((item) => (
                                <div key={item.label} className="space-y-1.5">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium text-slate-600">{item.label}</span>
                                        <span className="font-bold text-slate-900">{item.value}%</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.value}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-auto p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                                <div>
                                    <p className="text-sm font-bold text-slate-900">System Status: OK</p>
                                    <p className="text-xs text-slate-500 mt-0.5">Uptime: 45d 12h 30m</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-slate-200 shadow-sm flex flex-col">
                <CardHeader className="pb-2 border-b border-slate-100">
                    <CardTitle className="text-lg font-bold text-slate-900">Người Dùng Trực Tuyến (CCU)</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 flex-1">
                    <ChartContainer config={ccuConfig} className="h-[240px] w-full">
                        <LineChart data={CCU_DATA} margin={{ left: 8, right: 8, top: 4, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Line type="monotone" dataKey="active" stroke="hsl(271, 81%, 56%)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    );
}
