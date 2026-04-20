import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function RecentOrders({ orders }) {
    return (
        <Card className="border-slate-200 shadow-sm flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-100">
                <div>
                    <CardTitle className="text-lg font-bold text-slate-900">Đơn Hàng Gần Đây</CardTitle>
                    <CardDescription>Giao dịch thực tế qua hệ thống</CardDescription>
                </div>
                <Link to="/admin/orders" className="text-sm text-primary font-medium hover:underline">
                    Xem tất cả
                </Link>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-auto max-h-[340px]">
                <Table>
                    <TableHeader className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                        <TableRow className="border-b border-slate-200">
                            <TableHead className="py-3 font-semibold text-slate-700">Mã đơn</TableHead>
                            <TableHead className="py-3 font-semibold text-slate-700">Khách hàng</TableHead>
                            <TableHead className="py-3 font-semibold text-slate-700">Khóa học</TableHead>
                            <TableHead className="py-3 font-semibold text-slate-700 text-right">Giá trị</TableHead>
                            <TableHead className="py-3 font-semibold text-slate-700 text-center">Trạng thái</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders && orders.length > 0 ? (
                            orders.map((order) => (
                                <TableRow key={order.id} className="hover:bg-slate-50/50 border-b border-slate-100 last:border-none">
                                    <TableCell className="font-medium text-slate-900 py-3">{order.id}</TableCell>
                                    <TableCell className="py-3">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold">{order.user}</span>
                                            <span className="text-xs text-slate-500 mt-0.5">{order.date}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm text-slate-600 truncate max-w-[150px] py-3">
                                        {order.course}
                                    </TableCell>
                                    <TableCell className="font-bold text-slate-900 text-right py-3">
                                        {order.price.toLocaleString()}đ
                                    </TableCell>
                                    <TableCell className="text-center py-3">
                                        {order.status === "completed" && <Badge className="bg-green-100 text-green-700 hover:bg-green-100 shadow-none border-green-200">Hoàn thành</Badge>}
                                        {order.status === "pending" && <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 shadow-none border-amber-200">Chờ xử lý</Badge>}
                                        {order.status === "failed" && <Badge className="bg-red-100 text-red-700 hover:bg-red-100 shadow-none border-red-200">Thất bại</Badge>}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                                    Chưa có đơn hàng nào
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
