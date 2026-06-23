import React, { useState, useEffect, useRef } from "react";
import { Server, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from "@/components/ui/chart";
import {
    AreaChart,
    Area,
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
} from "recharts";
import SockJS from "sockjs-client";
import Stomp from "stompjs";

const resourceConfig = {
    cpu: { label: "CPU Usage (%)", color: "hsl(221, 83%, 53%)" },
    ram: { label: "RAM Usage (%)", color: "hsl(38, 92%, 50%)" },
};

const ccuConfig = {
    active: { label: "Concurrent Users (CCU)", color: "hsl(271, 81%, 56%)" },
};

export default function InfrastructureMonitor() {
    const [history, setHistory] = useState([]);
    const [liveMetrics, setLiveMetrics] = useState({ cpu: 0, ram: 0, ccu: 0 });
    const [status, setStatus] = useState("Connecting...");
    const stompClientRef = useRef(null);

    useEffect(() => {
        const socket = new SockJS(import.meta.env.VITE_WS_URL || "http://localhost:8080/ws");
        const stompClient = Stomp.over(socket);
        stompClient.debug = null; // Disable logging to console

        stompClient.connect({}, () => {
            setStatus("OK");
            stompClient.subscribe("/topic/metrics", (message) => {
                try {
                    const data = JSON.parse(message.body);
                    setLiveMetrics({
                        cpu: data.cpu,
                        ram: data.ram,
                        ccu: data.ccu
                    });
                    setHistory((prev) => {
                        const newHistory = [...prev, {
                            time: data.time || new Date().toLocaleTimeString(),
                            cpu: data.cpu,
                            ram: data.ram,
                            active: data.ccu
                        }];
                        if (newHistory.length > 20) return newHistory.slice(1);
                        return newHistory;
                    });
                } catch (e) {
                    console.error("Error parsing metrics data", e);
                }
            });
        }, (error) => {
            console.warn("WebSocket Connection Error (will retry):", error);
            setStatus("Retrying...");
        });

        stompClientRef.current = stompClient;

        return () => {
            if (stompClientRef.current && stompClientRef.current.connected) {
                try {
                    stompClientRef.current.disconnect();
                } catch (e) {
                    console.warn("Error during WebSocket disconnect", e);
                }
            }
        };
    }, []);

    return (
        <div className="space-y-4 pt-10">
            <div>
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-muted rounded-full"></span>
                    Giám Sát Cơ Sở Hạ Tầng (Live)
                </h2>
                <p className="text-sm text-muted-foreground mt-1 pl-3.5">Quản lý sức khỏe máy chủ và lượng truy cập thực tế qua WebSocket</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-2">
                <Card className="lg:col-span-2 border-border shadow-sm flex flex-col">
                    <CardHeader className="pb-2 border-b border-border flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg font-bold text-foreground">Tài Nguyên Máy Chủ</CardTitle>
                            <CardDescription>Tiêu thụ CPU và RAM (Cập nhật thời gian thực)</CardDescription>
                        </div>
                        <Server className="w-5 h-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="pt-4 flex-1">
                        <ChartContainer config={resourceConfig} className="h-[240px] w-full">
                            <AreaChart data={history} margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="ramGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <ChartLegend content={<ChartLegendContent />} />
                                <Area type="monotone" dataKey="ram" stroke="hsl(38, 92%, 50%)" strokeWidth={2} fill="url(#ramGradient)" isAnimationActive={false} />
                                <Area type="monotone" dataKey="cpu" stroke="hsl(221, 83%, 53%)" strokeWidth={2} fill="url(#cpuGradient)" isAnimationActive={false} />
                            </AreaChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-1 border-border shadow-sm flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border">
                        <CardTitle className="text-lg font-bold text-foreground">Chi Tiết Hạ Tầng</CardTitle>
                        <Activity className="w-5 h-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="pt-6 flex-1 flex flex-col gap-6">
                        <div className="space-y-5">
                            {[
                                { label: "CPU Usage Hiện Tại", value: liveMetrics.cpu, color: "bg-info/10 text-info" },
                                { label: "RAM Usage Hiện Tại", value: liveMetrics.ram, color: "bg-amber-500" },
                            ].map((item) => (
                                <div key={item.label} className="space-y-1.5">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium text-muted-foreground">{item.label}</span>
                                        <span className="font-bold text-foreground">{item.value}%</span>
                                    </div>
                                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                        <div className={`h-full ${item.color} rounded-full transition-all duration-500`} style={{ width: `${item.value}%` }} />
                                    </div>
                                </div>
                            ))}
                            <div className="space-y-1.5">
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium text-muted-foreground">CCU (Online)</span>
                                    <span className="font-bold text-foreground">{liveMetrics.ccu}</span>
                                </div>
                                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                    <div className={`h-full bg-indigo-500 rounded-full transition-all duration-500`} style={{ width: `${(liveMetrics.ccu / 5000) * 100}%` }} />
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto p-4 bg-muted rounded-xl border border-border flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${status === "OK" ? "bg-success/10 text-success animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-error/10 text-error"}`} />
                                <div>
                                    <p className="text-sm font-bold text-foreground">System Status: {status}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">WebSocket Live Stream</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-border shadow-sm flex flex-col">
                <CardHeader className="pb-2 border-b border-border">
                    <CardTitle className="text-lg font-bold text-foreground">CCU (Concurrent Users) - Realtime</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 flex-1">
                    <ChartContainer config={ccuConfig} className="h-[240px] w-full">
                        <LineChart data={history} margin={{ left: 8, right: 8, top: 4, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Line type="monotone" dataKey="active" stroke="hsl(271, 81%, 56%)" strokeWidth={3} dot={false} isAnimationActive={false} />
                        </LineChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    );
}
