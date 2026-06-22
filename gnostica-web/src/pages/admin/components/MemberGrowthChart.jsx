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
    BarChart,
    Bar,
    CartesianGrid,
    XAxis,
    YAxis,
} from "recharts";

const userGrowthConfig = {
    students: { label: "Học viên", color: "hsl(221, 83%, 53%)" },
    instructors: { label: "Giảng viên", color: "hsl(38, 92%, 50%)" },
};

export default function MemberGrowthChart({ data }) {
    return (
        <Card className="lg:col-span-2 border-border shadow-sm flex flex-col">
            <CardHeader className="pb-2 border-b border-border">
                <CardTitle className="text-lg font-bold text-foreground">Tăng Trưởng Thành Viên</CardTitle>
                <CardDescription>Lượng đăng ký mới của Học viên và Giảng viên theo tháng</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 flex-1">
                <ChartContainer config={userGrowthConfig} className="h-[240px] w-full">
                    <BarChart data={data} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Bar dataKey="students" fill="hsl(221, 83%, 53%)" radius={[4, 4, 0, 0]} maxBarSize={32} />
                        <Bar dataKey="instructors" fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} maxBarSize={32} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
