import React from "react";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/common/DataTable";
import { cn } from "@/lib/utils";

export default function InstructorStudentTable({ students, onActionClick, pagination, onPageChange }) {
    const columns = [
        {
            key: "stt",
            header: "STT",
            className: "w-[60px] text-center",
            render: (_, index) => (
                <span className="text-2xs font-bold text-muted-foreground font-sans tracking-tighter">
                    {(index + 1).toString().padStart(2, '0')}
                </span>
            ),
        },
        {
            key: "name",
            header: "Học viên",
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
            key: "course",
            header: "Khóa học",
            className: "min-w-[200px]",
            render: (student) => (
                <div className="group/course">
                    <span className="text-2xs font-bold text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-full group-hover/course:bg-white group-hover/course:shadow-sm group-hover/course:border group-hover/course:border-border transition-all duration-200">
                        {student.course}
                    </span>
                </div>
            ),
        },
        {
            key: "progress",
            header: () => (
                <div className="flex items-center gap-1.5 cursor-pointer hover:text-foreground transition-colors">
                    Tiến độ <ArrowUpDown className="w-3 h-3" />
                </div>
            ),
            className: "min-w-[150px]",
            render: (student) => (
                <div className="flex flex-col gap-2 w-full max-w-[140px]">
                    <div className="flex justify-between items-end">
                        <span className={cn(
                            "text-[10px] font-black uppercase tracking-tight",
                            student.progress === 100 ? "text-success" : "text-muted-foreground"
                        )}>
                            {student.progress === 100 ? "Hoàn thành" : "Đang học"}
                        </span>
                        <span className="text-xs font-black text-foreground">{student.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted/80 rounded-full overflow-hidden border border-border shadow-inner">
                        <div
                            className={cn(
                                "h-full rounded-full transition-all duration-1000 ease-out relative",
                                student.progress === 100 ? "bg-success" : "bg-primary"
                            )}
                            style={{ width: `${student.progress}%` }}
                        >
                            <div className="absolute inset-0 bg-white/20 animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
                        </div>
                    </div>
                </div>
            ),
        },
        {
            key: "joinedDate",
            header: "Ngày tham gia",
            className: "min-w-[140px]",
            render: (student) => (
                <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-bold text-foreground">{student.joinedDate}</span>
                    <div className="flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-muted" />
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{student.lastActive}</span>
                    </div>
                </div>
            ),
        },
        {
            key: "actions",
            header: "Thao tác",
            className: "w-[80px] text-center",
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
        <DataTable
            columns={columns}
            data={students}
            className="bg-white"
            pagination={pagination}
            onPageChange={onPageChange}
        />
    );
}
