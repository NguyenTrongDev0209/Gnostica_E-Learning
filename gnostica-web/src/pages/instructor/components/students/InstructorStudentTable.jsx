import React from "react";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AppTable from "@/components/common/AppTable";
import { cn } from "@/lib/utils";

const formatDate = (dateValue) => {
    if (!dateValue) return "N/A";
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return dateValue;
    return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
};

export default function InstructorStudentTable({ students, onActionClick, onCoursesClick, pagination, onPageChange }) {
    const columns = [
        {
            header: "STT",
            className: "w-[60px] text-center",
            cellClassName: "text-center",
            render: (_, index) => (
                <span className="text-2xs font-bold text-muted-foreground font-sans tracking-tighter">
                    {(index + 1).toString().padStart(2, '0')}
                </span>
            ),
        },
        {
            header: () => <div className="text-center w-full">Học viên</div>,
            className: "min-w-[280px]",
            render: (student) => (
                <div className="flex items-center gap-3">
                    <div className="avatar-base w-10 h-10 avatar-ring ring-primary/20">
                        <img
                            src={student.avatar}
                            alt={student.name}
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                        />
                        {student.status === "active" && (
                            <span className="status-indicator bg-success shadow-sm" />
                        )}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-foreground group-hover:text-primary transition-colors duration-200 uppercase text-xs tracking-tight">
                            {student.name}
                        </span>
                        <span className="text-2xs text-muted-foreground font-medium">{student.email}</span>
                    </div>
                </div>
            ),
        },
        {
            header: "Khóa học tham gia",
            className: "text-center",
            cellClassName: "text-center",
            render: (student) => (
                <div className="flex justify-center">
                    <span
                        onClick={(e) => {
                            e.stopPropagation();
                            onCoursesClick?.(student);
                        }}
                        className="text-xs font-black text-primary bg-primary/5 border border-primary/10 px-3 py-1.5 rounded-xl whitespace-nowrap shadow-sm hover:bg-primary hover:text-white transition-all cursor-pointer group-hover:scale-105 active:scale-95"
                    >
                        {student.coursesCount} Khóa học
                    </span>
                </div>
            )
        },
        {
            header: () => (
                <div className="flex items-center gap-1.5 cursor-pointer hover:text-foreground transition-colors justify-center">
                    Tiến độ học tập <ArrowUpDown className="w-3 h-3" />
                </div>
            ),
            className: "text-center",
            cellClassName: "text-center",
            render: (student) => (
                <div className="w-[140px] mx-auto flex flex-col gap-2">
                    <div className="flex justify-between items-end">
                        <span className={cn(
                            "text-[10px] font-black uppercase tracking-tight",
                            student.progress === 100 ? "text-success" : "text-muted-foreground"
                        )}>
                            {student.progress === 100 ? "Hoàn thành" : "Đang học"}
                        </span>
                        <span className="text-xs font-black text-foreground">{student.progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden border border-border/50 p-[1px]">
                        <div
                            className={cn(
                                "h-full rounded-full transition-all duration-1000 ease-out relative shadow-sm",
                                student.progress === 100 ? "bg-success" : "bg-primary"
                            )}
                            style={{ width: `${student.progress}%` }}
                        >
                            <div className="absolute inset-0 bg-white/30 animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
                        </div>
                    </div>
                </div>
            ),
        },
        {
            header: () => <div className="text-center w-full">Ngày tham gia</div>,
            className: "min-w-[160px]",
            cellClassName: "text-center",
            render: (student) => (
                <div className="flex flex-col gap-1 items-center">
                    <span className="text-xs font-bold text-foreground bg-muted border border-border px-2.5 py-1 rounded-lg tabular-nums">
                        {formatDate(student.joinedDate)}
                    </span>
                    <div className="flex items-center gap-1.5">
                        <span className={cn(
                            "w-1.5 h-1.5 rounded-full shadow-sm",
                            student.lastActive.includes("giờ") || student.lastActive.includes("phút") ? "bg-success animate-pulse" : "bg-muted"
                        )} />
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-tight">{student.lastActive}</span>
                    </div>
                </div>
            ),
        },
        {
            header: "Thao tác",
            className: "w-[80px] text-center",
            cellClassName: "text-center",
            render: (student) => (
                <div className="flex justify-center">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-white hover:shadow-md hover:border hover:border-border transition-all duration-200 rounded-lg"
                        onClick={(e) => {
                            e.stopPropagation();
                            onActionClick?.(student);
                        }}
                    >
                        <MoreHorizontal className="w-5 h-5" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <AppTable 
            columns={columns} 
            data={students} 
            pagination={{
                currentPage: pagination.currentPage,
                totalPages: pagination.totalPages,
                totalElements: pagination.totalItems || pagination.totalElements,
                onPageChange: onPageChange,
                zeroIndexed: true
            }}
            emptyState="Bạn chưa có học viên nào."
            isLoading={isLoading}
        />
    );
}
