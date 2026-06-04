import React from "react";
import { ArrowUpRight } from "lucide-react";
import LineChart from "@/components/common/LineChart";
import ChartDateFilters from "@/components/common/ChartDateFilters";

export default function StudentGrowthChart({ data, onFilterChange }) {
    const subtitle = (
        <>
            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Tổng học viên:</span>
            <span className="text-2xl font-bold text-slate-900">4.330</span>
        </>
    );

    const headerExtra = (
        <ChartDateFilters
            onDateChange={(type, value) => onFilterChange?.({ type: 'date', dateType: type, value })}
            onPresetChange={(preset) => onFilterChange?.({ type: 'preset', value: preset })}
            defaultPreset="6-months"
        />
    );

    return (
        <LineChart
            title="Tăng trưởng Học Viên"
            subtitle={subtitle}
            headerExtra={headerExtra}
            data={data}
            dataKey="students"
            strokeColor="#3b82f6"
            fillColor="#3b82f6"
            gradientId="colorStudents"
            tooltipFormatter={(value) => [`${value.toLocaleString()} HV`, "Học viên"]}
            height={280}
        />
    );
}
