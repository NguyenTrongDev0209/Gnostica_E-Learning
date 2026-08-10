import React from "react";
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, BarChart, Bar, ComposedChart, Line, PieChart, Pie, Cell } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/common/micro/AppChart";
import AppCard, { AppCardContent, AppCardHeader, AppCardTitle, AppCardDescription } from "@/components/common/micro/AppCard";
import AppSelect from "@/components/common/micro/AppSelect";

export function RequestTrendChart({ data, title, hasAmount = false, months = 12, onMonthsChange }) {
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

    const formatAmountAxis = (value) => {
        if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M`;
        if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
        return value;
    };

    const transformedData = data?.map(d => {
        const res = { ...d, ...d.statusCounts };
        return res;
    }) || [];

    const mainDataKey = hasAmount ? "amount" : "total";

    if (!data || data.length === 0) {
        return (
            <AppCard appVariant="default" className="border-border shadow-sm flex flex-col h-[400px]">
                <AppCardHeader className="pb-2">
                    <AppCardTitle className="text-lg font-semibold">{title}</AppCardTitle>
                </AppCardHeader>
                <AppCardContent className="w-full flex-1 flex items-center justify-center text-muted-foreground text-sm">
                    Chưa có dữ liệu biểu đồ
                </AppCardContent>
            </AppCard>
        );
    }

    return (
        <AppCard appVariant="default" className="border-border shadow-sm flex flex-col h-[400px]">
            <AppCardHeader className="pb-2">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <AppCardTitle className="text-lg font-semibold">{title}</AppCardTitle>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <AppSelect
                            value={String(months)}
                            onValueChange={(v) => onMonthsChange?.(Number(v))}
                            options={[
                                { label: "3 tháng", value: "3" },
                                { label: "6 tháng", value: "6" },
                                { label: "12 tháng", value: "12" },
                                { label: "24 tháng", value: "24" },
                            ]}
                            placeholder="Khoảng thời gian"
                            className="w-[140px]"
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
                            yAxisId="count"
                            axisLine={false} 
                            tickLine={false} 
                            allowDecimals={false}
                            tick={{ fontSize: 12, fontWeight: 500, fill: 'var(--muted-foreground)' }} 
                            dx={-10}
                        />
                        {hasAmount && (
                            <YAxis 
                                yAxisId="amount"
                                orientation="right"
                                axisLine={false} 
                                tickLine={false} 
                                tickFormatter={formatAmountAxis}
                                tick={{ fontSize: 12, fontWeight: 500, fill: 'var(--muted-foreground)' }} 
                                width={56}
                            />
                        )}
                        <ChartTooltip content={<ChartTooltipContent formatter={(val, name) => hasAmount && name === "amount" ? `${Number(val).toLocaleString('vi-VN')}đ` : val} />} />
                        <ChartLegend content={<ChartLegendContent />} />
                        
                        {statusKeys.map((status, idx) => (
                            <Bar key={status} yAxisId="count" dataKey={status} name={status} stackId="a" fill={config[status].color} maxBarSize={40} />
                        ))}
                        <Line type="monotone" yAxisId={hasAmount ? "amount" : "count"} dataKey={mainDataKey} name={config[mainDataKey].label} stroke="var(--primary)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
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

    if (!data || data.length === 0) {
        return (
            <AppCard appVariant="default" className="border-border shadow-sm flex flex-col h-[400px]">
                <AppCardHeader className="pb-2">
                    <AppCardTitle className="text-lg font-semibold">{title}</AppCardTitle>
                </AppCardHeader>
                <AppCardContent className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                    Chưa có dữ liệu biểu đồ
                </AppCardContent>
            </AppCard>
        );
    }

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

    if (!data || data.length === 0) {
        return (
            <AppCard appVariant="default" className="border-border shadow-sm flex flex-col h-[400px]">
                <AppCardHeader className="pb-2 border-b border-border">
                    <AppCardTitle className="text-lg font-bold text-foreground">{title}</AppCardTitle>
                </AppCardHeader>
                <AppCardContent className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                    Chưa có dữ liệu biểu đồ
                </AppCardContent>
            </AppCard>
        );
    }

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
