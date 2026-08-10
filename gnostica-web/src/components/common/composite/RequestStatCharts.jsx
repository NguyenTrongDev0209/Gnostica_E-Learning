import React from "react";
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, BarChart, Bar, ComposedChart, Line, PieChart, Pie, Cell } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/common/micro/AppChart";
import { ChartDateFilters } from "@/components/common/composite/DataFilter";
import AppCard, { AppCardContent, AppCardHeader, AppCardTitle, AppCardDescription } from "@/components/common/micro/AppCard";

export function RequestTrendChart({ data, title, hasAmount = false, onMonthsChange }) {
    // Generate config based on available status in data
    const generateConfig = () => {
        const config = {};
        const colors = ["var(--info)", "var(--warning)", "var(--success)", "var(--error)", "var(--primary)"];
        let colorIdx = 0;
        
        if (data && data.length > 0) {
            const sample = data[0];
            if (sample.statusCounts) {
                Object.keys(sample.statusCounts).forEach(status => {
                    config[status] = { label: status, color: colors[colorIdx % colors.length] };
                    colorIdx++;
                });
            }
        }
        if (hasAmount) {
            config["amount"] = { label: "Giá trị", color: "var(--foreground)" };
        } else {
            config["total"] = { label: "Tổng số", color: "var(--foreground)" };
        }
        return config;
    };

    const config = generateConfig();
    const statusKeys = Object.keys(config).filter(k => k !== "amount" && k !== "total");

    const formatYAxis = (value) => {
        if (hasAmount) {
            if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M`;
            if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
            return value;
        }
        return value;
    };

    const handlePresetChange = (preset) => {
        if (!onMonthsChange) return;
        switch(preset) {
            case 'this-month': onMonthsChange(1); break;
            case '3-months': onMonthsChange(3); break;
            case '6-months': onMonthsChange(6); break;
            case '12-months': onMonthsChange(12); break;
            default: onMonthsChange(12);
        }
    };

    const transformedData = data?.map(d => {
        const res = { ...d, ...d.statusCounts };
        return res;
    }) || [];

    const mainDataKey = hasAmount ? "amount" : "total";

    return (
        <AppCard appVariant="default" className="border-border shadow-sm flex flex-col h-[400px]">
            <AppCardHeader className="pb-2">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <AppCardTitle className="text-lg font-semibold">{title}</AppCardTitle>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <ChartDateFilters
                            onPresetChange={handlePresetChange}
                            defaultPreset="12-months"
                        />
                    </div>
                </div>
            </AppCardHeader>
            <AppCardContent className="w-full pt-0 flex-1 flex flex-col min-h-0">
                <ChartContainer config={config} className="flex-1 w-full min-h-0 !aspect-auto">
                    <ComposedChart data={transformedData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                        <XAxis 
                            dataKey="month" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 12, fontWeight: 500, fill: 'var(--muted-foreground)' }} 
                            dy={10} 
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 12, fontWeight: 500, fill: 'var(--muted-foreground)' }} 
                            tickFormatter={formatYAxis}
                            dx={-10}
                        />
                        <ChartTooltip content={<ChartTooltipContent formatter={(val, name) => hasAmount && name === "amount" ? `${val.toLocaleString()}đ` : val} />} />
                        <ChartLegend content={<ChartLegendContent />} />
                        
                        {statusKeys.map((status, idx) => (
                            <Bar key={status} dataKey={status} name={status} stackId="a" fill={config[status].color} maxBarSize={40} />
                        ))}
                        <Line type="monotone" dataKey={mainDataKey} name={config[mainDataKey].label} stroke="var(--primary)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                    </ComposedChart>
                </ChartContainer>
            </AppCardContent>
        </AppCard>
    );
}

export function RequestStatusDonut({ data, title }) {
    const config = {};
    const colors = ["var(--info)", "var(--warning)", "var(--success)", "var(--error)", "var(--primary)"];
    
    const chartData = data?.map((item, idx) => {
        const fill = colors[idx % colors.length];
        config[item.label] = { label: item.label, color: fill };
        return { name: item.label, value: item.count, fill };
    }) || [];

    return (
        <AppCard appVariant="default" className="border-border shadow-sm flex flex-col h-[400px]">
            <AppCardHeader className="pb-2">
                <AppCardTitle className="text-lg font-semibold">{title}</AppCardTitle>
            </AppCardHeader>
            <AppCardContent className="flex-1 pb-6 flex items-center justify-center min-h-0">
                <ChartContainer config={config} className="w-full h-[280px] !aspect-auto">
                    <PieChart>
                        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                        <Pie
                            data={chartData}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={60}
                            outerRadius={105}
                            cx="50%"
                            cy="50%"
                            strokeWidth={2}
                            stroke="var(--background)"
                            paddingAngle={2}
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Pie>
                        <ChartLegend content={<ChartLegendContent />} wrapperStyle={{ paddingTop: '10px' }} />
                    </PieChart>
                </ChartContainer>
            </AppCardContent>
        </AppCard>
    );
}

export function RequestCategoryBar({ data, title }) {
    const config = {
        count: { label: "Số lượng", color: "var(--info)" },
    };

    const chartData = data || [];

    return (
        <AppCard appVariant="default" className="border-border shadow-sm flex flex-col h-[400px]">
            <AppCardHeader className="pb-2 border-b border-border">
                <AppCardTitle className="text-lg font-bold text-foreground">{title}</AppCardTitle>
            </AppCardHeader>
            <AppCardContent className="pt-4 flex-1">
                <ChartContainer config={config} className="h-full w-full">
                    <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ left: 0, right: 24, top: 4, bottom: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                        <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                        <YAxis
                            type="category"
                            dataKey="label"
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 11 }}
                            width={130}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="count" name="Số lượng" fill="var(--info)" radius={[0, 4, 4, 0]} maxBarSize={28} />
                    </BarChart>
                </ChartContainer>
            </AppCardContent>
        </AppCard>
    );
}
