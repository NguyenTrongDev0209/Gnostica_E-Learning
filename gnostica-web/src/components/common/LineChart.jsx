import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";

export default function LineChart({
    title,
    subtitle,
    headerExtra,
    data,
    dataKey,
    xAxisKey = "month",
    strokeColor = "#3b82f6",
    fillColor = "#3b82f6",
    gradientId = "colorDefault",
    yAxisFormatter = (val) => val,
    tooltipFormatter = (val) => [val, ""],
    height = 300,
    className = ""
}) {
    return (
        <Card className={`lg:col-span-2 border-border shadow-sm ${className}`}>
            <CardHeader className="pb-2">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <CardTitle className="text-lg font-bold">{title}</CardTitle>
                        {subtitle && (
                            <div className="flex items-baseline gap-2">
                                {subtitle}
                            </div>
                        )}
                    </div>
                    {headerExtra && (
                        <div className="flex flex-wrap items-center gap-3">
                            {headerExtra}
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="w-full pt-0" style={{ height: `${height}px` }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={fillColor} stopOpacity={0.12} />
                                <stop offset="95%" stopColor={fillColor} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey={xAxisKey}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fontWeight: 600, fill: '#94a3b8' }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fontWeight: 600, fill: '#94a3b8' }}
                            tickFormatter={yAxisFormatter}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            formatter={tooltipFormatter}
                        />
                        <Area
                            type="monotone"
                            dataKey={dataKey}
                            stroke={strokeColor}
                            strokeWidth={3}
                            fillOpacity={1}
                            fill={`url(#${gradientId})`}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
