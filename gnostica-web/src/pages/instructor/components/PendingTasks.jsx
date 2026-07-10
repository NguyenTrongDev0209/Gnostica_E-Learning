import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight, CheckCircle2 } from "lucide-react";

export default function PendingTasks({ tasks }) {
    return (
        <Card className="border-border shadow-sm flex flex-col">
            <CardHeader className="pb-3 border-b border-border">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold">Việc Cần Làm</CardTitle>
                    <span className="text-[10px] font-black text-white bg-error/10 text-error px-2 py-0.5 rounded-full">
                        {tasks.reduce((s, t) => s + t.count, 0)} chờ xử lý
                    </span>
                </div>
            </CardHeader>
            <CardContent className="p-0 flex-1">
                <div className="flex flex-col divide-y divide-slate-100">
                    {tasks.map((task) => {
                        const Icon = task.icon;
                        return (
                            <Link key={task.id} to={task.href} className="flex items-center gap-3 px-5 py-4 hover:bg-muted transition-colors group">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${task.color}`}>
                                    <Icon className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-foreground group-hover:text-foreground truncate">{task.label}</p>
                                    {task.urgent && (
                                        <p className="text-[10px] font-bold text-error uppercase tracking-wide">Cần xử lý ngay</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <span className={`text-sm font-black ${task.urgent ? 'text-error' : 'text-muted-foreground'}`}>{task.count}</span>
                                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-muted-foreground transition-colors" />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </CardContent>
            <div className="p-4 border-t border-border mt-auto">
                <Link to="/instructor/courses" className="flex items-center justify-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Xem tất cả nhiệm vụ
                </Link>
            </div>
        </Card>
    );
}
