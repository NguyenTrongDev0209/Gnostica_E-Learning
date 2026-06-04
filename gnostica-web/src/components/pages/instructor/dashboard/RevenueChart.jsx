import React from "react";
import LineChart from "@/components/common/LineChart";
import ChartDateFilters from "@/components/common/ChartDateFilters";

export default function RevenueChart({ data }) {
    const subtitle = (
        <>
            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Tổng doanh thu:</span>
            <span className="text-2xl font-bold text-slate-900">112.800.000đ</span>
        </>
    );

    const handleDateChange = (type, value) => {
        console.log(`Date ${type} changed to:`, value);
    };

    const handlePresetChange = (value) => {
        console.log("Preset changed to:", value);
    };

    const headerExtra = (
        <ChartDateFilters
            onDateChange={handleDateChange}
            onPresetChange={handlePresetChange}
        />
    );

    return (
        <LineChart
            title="Thống kê Doanh thu"
            subtitle={subtitle}
            headerExtra={headerExtra}
            data={data}
            dataKey="revenue"
            strokeColor="#16a34a"
            fillColor="#166534"
            gradientId="colorRevenue"
            yAxisFormatter={(value) => `${value / 1000000}Tr`}
            tooltipFormatter={(value) => [`${value.toLocaleString()}đ`, "Doanh thu"]}
        />
    );
}
