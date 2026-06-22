import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import {
    BarChart,
    Bar,
    CartesianGrid,
    XAxis,
    YAxis,
} from "recharts";

const topCoursesConfig = {
    students: { label: "Học viên", color: "hsl(221, 83%, 53%)" },
};

export default function TopCourses({ data }) {
    return (
        <Card className="lg:col-span-2 border-border shadow-sm flex flex-col">
            <CardHeader className="pb-2 border-b border-border">
                <CardTitle className="text-lg font-bold text-foreground">Top Khóa Học Ghi Danh</CardTitle>
                <CardDescription>Các khóa học có lượng học viên cao nhất</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 flex-1">
                <ChartContainer config={topCoursesConfig} className="h-[260px] w-full">
                    <BarChart
                        data={data}
                        layout="vertical"
                        margin={{ left: 0, right: 24, top: 4, bottom: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                        <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                        <YAxis
                            type="category"
                            dataKey="name"
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 11 }}
                            width={130}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="students" fill="hsl(221, 83%, 53%)" radius={[0, 4, 4, 0]} maxBarSize={28} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
