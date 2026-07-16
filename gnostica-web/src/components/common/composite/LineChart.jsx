import React from "react";
import AppCard, { AppCardContent, AppCardHeader, AppCardTitle } from "@/components/common/micro/AppCard";
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
    strokeColor = "var(--color-primary)",
    fillColor = "var(--color-primary)",
    gradientId = "colorDefault",
    yAxisFormatter = (val) => val,
    tooltipFormatter = (val) => [val, ""],
    height = 300,
    className = ""
}) {
    return (
        <AppCard appVariant="default" className={`lg:col-span-2 border-border shadow-sm ${className}`}>
            <AppCardHeader className="pb-2">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <AppCardTitle className="text-lg font-semibold">{title}</AppCardTitle>
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
            </AppCardHeader>
            <AppCardContent className="w-full pt-0" style={{ height: `${height}px` }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={fillColor} stopOpacity={0.12} />
                                <stop offset="95%" stopColor={fillColor} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                        <XAxis
                            dataKey={xAxisKey}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fontWeight: 500, fill: 'var(--color-muted-foreground)' }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fontWeight: 500, fill: 'var(--color-muted-foreground)' }}
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
            </AppCardContent>
        </AppCard>
    );
}
