import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function StatsGrid({ stats }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => {
                const Icon = stat.icon;
                return (
                    <Card key={i} className="border-slate-200 shadow-sm border-b-4 border-b-green-500/10 hover:border-b-green-500/50 transition-all">
                        <CardContent className="p-5 flex flex-col gap-4">
                            <div className="flex justify-between items-start">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${stat.color}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className={`flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-full border ${stat.isPositive ? 'text-green-700 bg-green-50 border-green-200' : 'text-red-700 bg-red-50 border-red-200'}`}>
                                    {stat.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                    {stat.trend}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{stat.title}</h3>
                                <div className="text-2xl font-black text-slate-900">{stat.value}</div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
