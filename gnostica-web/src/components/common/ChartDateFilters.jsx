import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function ChartDateFilters({
    onDateChange,
    onPresetChange,
    defaultPreset = "6-months"
}) {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [selectedPreset, setSelectedPreset] = useState(defaultPreset);

    // Helpers for Date Calculation
    const getToday = () => new Date();
    const formatDateInput = (date) => date.toISOString().split('T')[0];
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
        return { start: formatDateInput(start), end: formatDateInput(end) };
    };

    // Initialize dates based on default preset
    useEffect(() => {
        const range = calculatePresetRange(defaultPreset);
        if (range) {
            setStartDate(range.start);
            setEndDate(range.end);
            notifyParent(range.start, range.end);
        }
    }, []);

    const notifyParent = (start, end) => {
        onDateChange?.('start', formatWithTime(start, false));
        onDateChange?.('end', formatWithTime(end, true));
    };

    const handlePresetSelect = (value) => {
        setSelectedPreset(value);
        onPresetChange?.(value);

        const range = calculatePresetRange(value);
        if (range) {
            setStartDate(range.start);
            setEndDate(range.end);
            notifyParent(range.start, range.end);
        }
    };

    const handleDateInput = (type, value) => {
        setSelectedPreset("custom"); // Set to custom when manually changed
        let newStart = startDate;
        let newEnd = endDate;

        if (type === 'start') {
            setStartDate(value);
            newStart = value;
        } else {
            setEndDate(value);
            newEnd = value;
        }

        notifyParent(newStart, newEnd);
    };

    return (
        <div className="flex flex-wrap items-center gap-3">
            {/* Date Range Selector */}
            <div className="flex items-center h-[40px] gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2">
                <div className="relative h-full flex items-center">
                    <Input
                        type="date"
                        value={startDate}
                        className="h-full w-[130px] px-2 border-none bg-transparent text-xs font-bold focus-visible:ring-0 shadow-none py-0"
                        placeholder="Từ ngày"
                        onChange={(e) => handleDateInput('start', e.target.value)}
                    />
                </div>
                <div className="w-2 h-[1px] bg-slate-300"></div>
                <div className="relative h-full flex items-center">
                    <Input
                        type="date"
                        value={endDate}
                        className="h-full w-[130px] px-2 border-none bg-transparent text-xs font-bold focus-visible:ring-0 shadow-none py-0"
                        placeholder="Đến ngày"
                        onChange={(e) => handleDateInput('end', e.target.value)}
                    />
                </div>
            </div>

            {/* Presets Selector */}
            <Select value={selectedPreset} onValueChange={handlePresetSelect}>
                <SelectTrigger className="!h-[40px] w-[140px] bg-slate-50 border-slate-200 text-xs font-bold rounded-lg shadow-none">
                    <SelectValue placeholder="Chọn khoảng thời gian" />
                </SelectTrigger>
                <SelectContent className="rounded-lg border-slate-100 shadow-xl">
                    {selectedPreset === "custom" && (
                        <SelectItem value="custom" className="text-xs font-bold">Tùy chọn</SelectItem>
                    )}
                    <SelectItem value="yesterday" className="text-xs font-bold">Hôm qua</SelectItem>
                    <SelectItem value="last-7-days" className="text-xs font-bold">7 ngày qua</SelectItem>
                    <SelectItem value="last-30-days" className="text-xs font-bold">30 ngày qua</SelectItem>
                    <SelectItem value="this-month" className="text-xs font-bold">Tháng này</SelectItem>
                    <SelectItem value="last-month" className="text-xs font-bold">Tháng trước</SelectItem>
                    <SelectItem value="this-quarter" className="text-xs font-bold">Quý này</SelectItem>
                    <SelectItem value="6-months" className="text-xs font-bold">6 tháng qua</SelectItem>
                    <SelectItem value="this-year" className="text-xs font-bold">Năm nay</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}
