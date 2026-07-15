import React, { useState, useEffect } from "react";
import AppSelect from "@/components/common/micro/AppSelect";
import { AppDateRangePicker } from "@/components/common/composite/DataFilter";

export default function ChartDateFilters({
    onDateChange,
    onPresetChange,
    defaultPreset = "6-months"
}) {
    const [dateRange, setDateRange] = useState({ from: undefined, to: undefined });
    const [selectedPreset, setSelectedPreset] = useState(defaultPreset);

    // Helpers for Date Calculation
    const getToday = () => new Date();
    const formatDateInput = (date) => {
        if (!date) return "";
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };
    const formatWithTime = (dateStr, isEnd) => {
        if (!dateStr) return "";
        const now = getToday();
        const todayStr = formatDateInput(now);

        if (isEnd) {
            if (dateStr === todayStr) {
                // Return current time if it's today
                return `${dateStr}T${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
            }
            return `${dateStr}T23:59:59`;
        }
        return `${dateStr}T00:00:00`;
    };

    const calculatePresetRange = (preset) => {
        const now = getToday();
        let start = new Date(now);
        let end = new Date(now);

        switch (preset) {
            case "yesterday":
                start.setDate(now.getDate() - 1);
                end.setDate(now.getDate() - 1);
                break;
            case "last-7-days":
                start.setDate(now.getDate() - 6);
                break;
            case "last-30-days":
                start.setDate(now.getDate() - 29);
                break;
            case "this-month":
                start = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case "last-month":
                start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                end = new Date(now.getFullYear(), now.getMonth(), 0);
                break;
            case "this-quarter":
                const quarter = Math.floor(now.getMonth() / 3);
                start = new Date(now.getFullYear(), quarter * 3, 1);
                break;
            case "6-months":
                start.setMonth(now.getMonth() - 6);
                break;
            case "this-year":
                start = new Date(now.getFullYear(), 0, 1);
                break;
            default:
                return null;
        }
        return { from: start, to: end };
    };

    // Initialize dates based on default preset
    useEffect(() => {
        const range = calculatePresetRange(defaultPreset);
        if (range) {
            setDateRange(range);
            notifyParent(range.from, range.to);
        }
    }, []);

    const notifyParent = (from, to) => {
        if (from) {
            onDateChange?.('start', formatWithTime(formatDateInput(from), false));
        }
        if (to) {
            onDateChange?.('end', formatWithTime(formatDateInput(to), true));
        }
    };

    const handlePresetSelect = (value) => {
        setSelectedPreset(value);
        onPresetChange?.(value);

        const range = calculatePresetRange(value);
        if (range) {
            setDateRange(range);
            notifyParent(range.from, range.to);
        }
    };

    const handleDateRangeSelect = (range) => {
        setDateRange(range);
        setSelectedPreset("custom"); // Set to custom when manually changed
        notifyParent(range?.from, range?.to);
    };

    return (
        <div className="flex flex-wrap items-center gap-3">
            {/* Date Range Selector */}
            <div className="w-[280px]">
                <AppDateRangePicker 
                    date={dateRange}
                    onSelect={handleDateRangeSelect}
                    placeholder="Khoảng thời gian"
                    className="!h-11 bg-card border border-border text-sm font-medium rounded-xl shadow-sm hover:bg-card/90"
                />
            </div>

            {/* Presets Selector */}
            <AppSelect 
                value={selectedPreset} 
                onValueChange={handlePresetSelect}
                options={[
                    ...(selectedPreset === "custom" ? [{ label: "Tùy chọn", value: "custom" }] : []),
                    { label: "Hôm qua", value: "yesterday" },
                    { label: "7 ngày qua", value: "last-7-days" },
                    { label: "30 ngày qua", value: "last-30-days" },
                    { label: "Tháng này", value: "this-month" },
                    { label: "Tháng trước", value: "last-month" },
                    { label: "Quý này", value: "this-quarter" },
                    { label: "6 tháng qua", value: "6-months" },
                    { label: "Năm nay", value: "this-year" },
                ]}
                placeholder="Chọn khoảng thời gian"
                className="!h-11 w-[140px] bg-card border border-border text-sm font-medium rounded-xl shadow-sm"
            />
        </div>
    );
}
